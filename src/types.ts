export type Role = 'buyer' | 'admin' | 'supplier';

export interface User {
  id: string;
  email: string;
  company_name: string;
  role: Role;
  wilaya: string;
}

export interface Wholesaler {
  id: string;
  name: string;
  phone_number: string;
  provides_category: string;
}

export interface Product {
  id: string;
  wholesaler_id: string;
  name: string;
  description: string;
  image_url: string;
  sku: string;
  price: number;
  stock_quantity: number;
  in_stock: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  name?: string;
  image_url?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_price: number;
  delivery_date: string | null;
  created_at: string;
  wilaya: string;
  payment_method: string;
  items?: OrderItem[];
  buyer_name?: string; // For admin view
}

export interface Metrics {
  totalSales: number;
  activeOrders: number;
  outForDelivery: number;
  outOfStock: number;
}
