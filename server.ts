import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { supabase } from './src/lib/supabase/client';
import { ensureDatabase, seedDatabase } from './src/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const dbReady = await ensureDatabase();
  if (dbReady) {
    await seedDatabase();
  }

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, company_name, role, wilaya')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (data) {
      res.json({ success: true, user: data });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.get("/api/products", async (req, res) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get("/api/orders", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const ordersWithItems = await Promise.all((orders || []).map(async (order: any) => {
      const { data: items } = await supabase
        .from('order_items')
        .select('*, products(name, image_url)')
        .eq('order_id', order.id);

      order.items = (items || []).map((i: any) => ({
        ...i,
        name: i.products?.name,
        image_url: i.products?.image_url,
        product_id: i.product_id,
      }));
      return order;
    }));

    res.json(ordersWithItems);
  });

  app.post("/api/orders", async (req, res) => {
    const { buyer_id, total_price, wilaya, items } = req.body;
    if (!buyer_id || !items || !items.length) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ buyer_id, status: 'pending', total_price, wilaya })
      .select()
      .single();

    if (orderError) return res.status(500).json({ error: orderError.message });

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) return res.status(500).json({ error: itemsError.message });

    res.json({ success: true, orderId: order.id });
  });

  app.get("/api/admin/orders", async (req, res) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(company_name)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const ordersWithItems = await Promise.all((data || []).map(async (order: any) => {
      const orderData = { ...order, buyer_name: order.profiles?.company_name };
      delete orderData.profiles;

      const { data: items } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', order.id);

      orderData.items = (items || []).map((i: any) => ({
        ...i,
        name: i.products?.name,
      }));
      return orderData;
    }));

    res.json(ordersWithItems);
  });

  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/admin/metrics", async (req, res) => {
    const { data: salesData } = await supabase
      .from('orders')
      .select('total_price')
      .neq('status', 'cancelled');

    const totalSales = (salesData || []).reduce((sum: number, o: any) => sum + Number(o.total_price), 0);

    const { count: activeOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: outForDelivery } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'out_for_delivery');

    const { count: outOfStock } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock_quantity', 0);

    res.json({
      totalSales,
      activeOrders: activeOrders || 0,
      outForDelivery: outForDelivery || 0,
      outOfStock: outOfStock || 0
    });
  });

  app.get("/api/admin/products", async (req, res) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/admin/products", async (req, res) => {
    const { wholesaler_id, name, description, image_url, sku, price, stock_quantity } = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert({
        wholesaler_id: wholesaler_id || '00000000-0000-0000-0000-000000000010',
        name: name || '',
        description: description || '',
        image_url: image_url || '',
        sku: sku || '',
        price: price || 0,
        stock_quantity: stock_quantity || 0,
        in_stock: (stock_quantity || 0) > 0,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id: data.id });
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    const { id } = req.params;
    const { price, stock_quantity } = req.body;
    const { error } = await supabase
      .from('products')
      .update({ price, stock_quantity, in_stock: stock_quantity > 0 })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.get("/api/admin/wholesalers", async (req, res) => {
    const { data, error } = await supabase
      .from('wholesalers')
      .select('*')
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/admin/wholesalers", async (req, res) => {
    const { name, phone_number, provides_category } = req.body;
    const { data, error } = await supabase
      .from('wholesalers')
      .insert({ name, phone_number, provides_category })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id: data.id });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
