import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Za-z]/, 'Must contain a letter').regex(/[0-9]/, 'Must contain a number'),
  company_name: z.string().min(1, 'Company name required'),
  business_type: z.string().optional().default(''),
  phone_number: z.string().optional().default(''),
  wilaya: z.string().optional().default(''),
})

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})

export const createOrderSchema = z.object({
  total_price: z.number().positive(),
  wilaya: z.string().min(1),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    price_at_purchase: z.number().positive(),
  })).min(1, 'At least one item required'),
})

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled']),
})

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0),
  image_url: z.string().optional().default(''),
  wholesaler_id: z.string().optional().default('00000000-0000-0000-0000-000000000010'),
  description: z.string().optional().default(''),
})

export const createWholesalerSchema = z.object({
  name: z.string().min(1),
  phone_number: z.string().min(1),
  provides_category: z.string().min(1),
})

export function validate(schema: z.ZodSchema, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const error = result.error.errors[0]?.message || 'Validation error'
    return { valid: false, error }
  }
  return { valid: true, data: result.data }
}
