-- Run this in your Supabase SQL Editor to set up the schema

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  company_name TEXT NOT NULL,
  business_type TEXT,
  phone_number TEXT,
  wilaya TEXT,
  role TEXT DEFAULT 'buyer'
);

CREATE TABLE IF NOT EXISTS wholesalers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT,
  provides_category TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id UUID REFERENCES wholesalers(id),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sku TEXT,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL,
  in_stock BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  total_price NUMERIC NOT NULL,
  delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  wilaya TEXT,
  payment_method TEXT DEFAULT 'Cash on Delivery / Bank Transfer Validation'
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC NOT NULL
);
