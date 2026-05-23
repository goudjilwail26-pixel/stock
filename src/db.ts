import { supabase } from './lib/supabase/client'
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'

export async function ensureDatabase() {
  const hasEmail = await supabase.from('profiles').select('email').limit(1).maybeSingle()

  if (!hasEmail.error) return true

  if (hasEmail.error?.message?.includes('column')) {
    console.log('')
    console.log('  Existing tables need migration.')
    console.log('')
  }

  if (hasEmail.error?.message?.includes('table')) {
    console.log('')
    console.log('  Tables not found in Supabase.')
    console.log('')
  }

  const projectRef = process.env.VITE_SUPABASE_URL?.match(/https:\/\/(.+)\.supabase/)?.[1] || 'gubrmrlqzozqwpcfjeez'
  const sqlUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`

  console.log('  To fix, run this SQL in your Supabase dashboard:')
  console.log('  ' + sqlUrl)
  console.log('')
  console.log('  SQL to execute:')
  console.log('  ' + '─'.repeat(50))

  const sql = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/001_schema.sql'),
    'utf-8'
  )
  console.log(sql)
  console.log('  ' + '─'.repeat(50))
  console.log('  Then restart the server.')
  console.log('')

  return false
}

export async function seedDatabase() {
  const profiles = [
    { id: '00000000-0000-0000-0000-000000000001', email: 'admin@b2b.com', password: 'admin123', company_name: 'Super Admin Corp', business_type: 'admin', phone_number: '0000000000', wilaya: '16 - Alger', role: 'admin' },
    { id: '00000000-0000-0000-0000-000000000002', email: 'buyer@b2b.com', password: 'buyer123', company_name: 'City Cafe', business_type: 'café', phone_number: '0555123456', wilaya: '16 - Alger', role: 'buyer' },
  ]

  const wholesalers = [
    { id: '00000000-0000-0000-0000-000000000010', name: 'Wholesale Foods Ltd', phone_number: '0555000111', provides_category: 'Coffee, Tea, Baking Supplies' },
    { id: '00000000-0000-0000-0000-000000000011', name: 'Global Produce DZ', phone_number: '0555000222', provides_category: 'Fresh Produce, Dairy' },
  ]

  const products = [
    { id: '00000000-0000-0000-0000-000000000020', wholesaler_id: '00000000-0000-0000-0000-000000000010', name: 'Premium Coffee Beans 1kg', description: 'High-quality roasted coffee beans suitable for espresso.', image_url: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop', sku: 'COF-1KG-001', price: 2500, stock_quantity: 100, in_stock: true },
    { id: '00000000-0000-0000-0000-000000000021', wholesaler_id: '00000000-0000-0000-0000-000000000010', name: 'Organic Matcha Powder 500g', description: 'Ceremonial grade matcha from Japan.', image_url: 'https://images.unsplash.com/photo-1563630282467-37a507849cb3?q=80&w=400&auto=format&fit=crop', sku: 'MAT-500G-002', price: 4500, stock_quantity: 50, in_stock: true },
    { id: '00000000-0000-0000-0000-000000000022', wholesaler_id: '00000000-0000-0000-0000-000000000011', name: 'Almond Milk Barista Edition 1L', description: 'Specially formulated for latte art and creamy texture.', image_url: 'https://images.unsplash.com/photo-1563630381190-77c336ea545a?q=80&w=400&auto=format&fit=crop', sku: 'ALM-1L-003', price: 450, stock_quantity: 200, in_stock: true },
    { id: '00000000-0000-0000-0000-000000000023', wholesaler_id: '00000000-0000-0000-0000-000000000010', name: 'Croissant Dough (Frozen) x50', description: 'Ready to bake classic butter croissants.', image_url: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?q=80&w=400&auto=format&fit=crop', sku: 'CRO-FZ-004', price: 3500, stock_quantity: 30, in_stock: true },
  ]

  const now = new Date().toISOString()
  const orders = [
    { id: '00000000-0000-0000-0000-000000000030', buyer_id: '00000000-0000-0000-0000-000000000002', status: 'delivered', total_price: 8400, delivery_date: '2023-10-01', created_at: '2023-09-28T10:00:00Z', wilaya: '16 - Alger' },
    { id: '00000000-0000-0000-0000-000000000031', buyer_id: '00000000-0000-0000-0000-000000000002', status: 'pending', total_price: 4500, delivery_date: null, created_at: now, wilaya: '16 - Alger' },
  ]

  const orderItems = [
    { id: '00000000-0000-0000-0000-000000000040', order_id: '00000000-0000-0000-0000-000000000030', product_id: '00000000-0000-0000-0000-000000000020', quantity: 2, price_at_purchase: 2500 },
    { id: '00000000-0000-0000-0000-000000000041', order_id: '00000000-0000-0000-0000-000000000030', product_id: '00000000-0000-0000-0000-000000000023', quantity: 1, price_at_purchase: 3400 },
    { id: '00000000-0000-0000-0000-000000000042', order_id: '00000000-0000-0000-0000-000000000031', product_id: '00000000-0000-0000-0000-000000000022', quantity: 10, price_at_purchase: 450 },
  ]

  for (const profile of profiles) {
    const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' })
    if (error) console.error('Seed profile error:', error.message)
  }

  for (const w of wholesalers) {
    const { error } = await supabase.from('wholesalers').upsert(w, { onConflict: 'id' })
    if (error) console.error('Seed wholesaler error:', error.message)
  }

  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'id' })
    if (error) console.error('Seed product error:', error.message)
  }

  for (const o of orders) {
    const { error } = await supabase.from('orders').upsert(o, { onConflict: 'id' })
    if (error) console.error('Seed order error:', error.message)
  }

  for (const oi of orderItems) {
    const { error } = await supabase.from('order_items').upsert(oi, { onConflict: 'id' })
    if (error) console.error('Seed order_item error:', error.message)
  }

  console.log('Supabase seeded successfully')
}
