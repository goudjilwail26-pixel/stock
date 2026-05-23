import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../src/lib/supabase/client.js';
import { seedDatabase } from '../src/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'stokiloo-dev-secret-change-in-production';

function signToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

const app = express();
app.use(express.json());

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

let initialized = false
app.use(async (req, res, next) => {
  if (!initialized) {
    initialized = true
    await seedDatabase()
  }
  next()
})

function authRequired(req: any, res: any, next: any) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const payload = verifyToken(header.slice(7))
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  req.user = payload
  next()
}

function adminRequired(req: any, res: any, next: any) {
  authRequired(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  })
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password, company_name, business_type, phone_number, wilaya } = req.body
  if (!email || !password || !company_name) {
    return res.status(400).json({ error: 'Email, password, and company name are required' })
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const hashed = await bcrypt.hash(password, 10)
  const role = email === ADMIN_EMAIL ? 'admin' : 'buyer'

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      email,
      password: hashed,
      company_name,
      business_type: business_type || '',
      phone_number: phone_number || '',
      wilaya: wilaya || '',
      role,
    })
    .select('id, email, company_name, role, wilaya')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  const token = signToken({ userId: data.id, email: data.email, role: data.role })
  res.json({ success: true, user: data, token })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (!user || error) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const payload = { id: user.id, email: user.email, company_name: user.company_name, role: user.role, wilaya: user.wilaya }
  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  res.json({ success: true, user: payload, token })
})

app.get('/api/me', authRequired, async (req: any, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, company_name, role, wilaya')
    .eq('id', req.user.userId)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/orders', authRequired, async (req: any, res) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', req.user.userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const ordersWithItems = await Promise.all((orders || []).map(async (order: any) => {
    const { data: items } = await supabase
      .from('order_items')
      .select('*, products(name, image_url)')
      .eq('order_id', order.id)

    order.items = (items || []).map((i: any) => ({
      ...i,
      name: i.products?.name,
      image_url: i.products?.image_url,
      product_id: i.product_id,
    }))
    return order
  }))

  res.json(ordersWithItems)
})

app.post('/api/orders', authRequired, async (req: any, res) => {
  const { total_price, wilaya, items } = req.body
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Invalid order data' })
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ buyer_id: req.user.userId, status: 'pending', total_price, wilaya })
    .select()
    .single()

  if (orderError) return res.status(500).json({ error: orderError.message })

  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return res.status(500).json({ error: itemsError.message })

  res.json({ success: true, orderId: order.id })
})

app.get('/api/admin/orders', adminRequired, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(company_name)')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const ordersWithItems = await Promise.all((data || []).map(async (order: any) => {
    const orderData = { ...order, buyer_name: order.profiles?.company_name }
    delete orderData.profiles

    const { data: items } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order.id)

    orderData.items = (items || []).map((i: any) => ({ ...i, name: i.products?.name }))
    return orderData
  }))

  res.json(ordersWithItems)
})

app.patch('/api/admin/orders/:id/status', adminRequired, async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

app.get('/api/admin/metrics', adminRequired, async (req, res) => {
  const { data: salesData } = await supabase.from('orders').select('total_price').neq('status', 'cancelled')
  const totalSales = (salesData || []).reduce((sum: number, o: any) => sum + Number(o.total_price), 0)

  const { count: activeOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const { count: outForDelivery } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'out_for_delivery')
  const { count: outOfStock } = await supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 0)

  res.json({ totalSales, activeOrders: activeOrders || 0, outForDelivery: outForDelivery || 0, outOfStock: outOfStock || 0 })
})

app.get('/api/admin/products', adminRequired, async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.post('/api/admin/products', adminRequired, async (req, res) => {
  const { wholesaler_id, name, description, image_url, sku, price, stock_quantity } = req.body
  const { data, error } = await supabase.from('products').insert({
    wholesaler_id: wholesaler_id || '00000000-0000-0000-0000-000000000010',
    name, description, image_url, sku,
    price: price || 0,
    stock_quantity: stock_quantity || 0,
    in_stock: (stock_quantity || 0) > 0,
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true, id: data.id })
})

app.put('/api/admin/products/:id', adminRequired, async (req, res) => {
  const { id } = req.params
  const { price, stock_quantity } = req.body
  const { error } = await supabase.from('products').update({ price, stock_quantity, in_stock: stock_quantity > 0 }).eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

app.get('/api/admin/wholesalers', adminRequired, async (req, res) => {
  const { data, error } = await supabase.from('wholesalers').select('*').order('name', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.post('/api/admin/wholesalers', adminRequired, async (req, res) => {
  const { name, phone_number, provides_category } = req.body
  const { data, error } = await supabase.from('wholesalers').insert({ name, phone_number, provides_category }).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true, id: data.id })
})

export default app
