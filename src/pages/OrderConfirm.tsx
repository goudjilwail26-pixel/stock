import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { CheckCircle, ShoppingBag } from 'lucide-react'

export default function OrderConfirm() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orderId = params.get('orderId')

  return (
    <div className="max-w-lg mx-auto py-20 text-center">
      <div className="w-16 h-16 bg-stokiloo-emerald/10 border border-stokiloo-emerald/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-stokiloo-emerald" />
      </div>
      <h1 className="text-3xl font-display tracking-wider text-stokiloo-white mb-3">Order Confirmed</h1>
      <p className="text-stokiloo-grey mb-2">Your order has been placed successfully.</p>
      {orderId && (
        <p className="text-xs font-mono text-stokiloo-indigo mb-8">Ref: {orderId}</p>
      )}
      <p className="text-sm text-stokiloo-silver mb-8 max-w-md mx-auto">
        Our sales team will contact you shortly to confirm payment and arrange delivery.
      </p>
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => navigate('/')}>Continue Shopping</Button>
        <Button onClick={() => navigate('/reorder')}>View Orders</Button>
      </div>
    </div>
  )
}
