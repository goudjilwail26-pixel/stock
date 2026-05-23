import { supabase } from './lib/supabase/client'

export async function seedDatabase() {
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

  for (const w of wholesalers) {
    await supabase.from('wholesalers').upsert(w, { onConflict: 'id' })
  }
  for (const p of products) {
    await supabase.from('products').upsert(p, { onConflict: 'id' })
  }
}
