import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, CardContent } from '../components/ui';
import { Order, OrderItem } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function QuickReorder() {
  const { user } = useAuth();
  const { addToCart, items: cartItems } = useCart();
  const { toast } = useToast();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const res = await api(`/api/orders?userId=${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id
  });

  const uniqueHistoryItems = useMemo(() => {
    if (!orders) return [];
    
    const map = new Map<string, OrderItem>();
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!map.has(item.product_id)) {
          map.set(item.product_id, item);
        }
      });
    });
    
    return Array.from(map.values());
  }, [orders]);

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-stokiloo-grey" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display tracking-wider text-stokiloo-white">Quick Reorder</h1>
        <p className="text-stokiloo-grey mt-1">Historically purchased items ready for 1-click reorder</p>
      </div>

      {uniqueHistoryItems.length === 0 ? (
        <Card className="border-dashed border-stokiloo-border py-12">
          <div className="flex flex-col items-center justify-center text-stokiloo-grey text-center">
            <Clock className="h-12 w-12 mb-4 text-stokiloo-border" />
            <p>You have no purchase history yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {uniqueHistoryItems.map((item) => {
            const inCartCount = cartItems.find(c => c.id === item.product_id)?.quantity || 0;
            
            return (
              <Card key={item.product_id} className="flex flex-col sm:flex-row items-center p-4 gap-6 group hover:border-stokiloo-gold/30 transition-colors">
                <div className="h-24 w-24 overflow-hidden bg-stokiloo-black flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover opacity-80" crossOrigin="anonymous"/>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-stokiloo-grey font-bold text-xs uppercase bg-stokiloo-dim">No Img</div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-medium text-lg text-stokiloo-white">{item.name || 'Unknown Product'}</h3>
                  <p className="text-sm text-stokiloo-grey mb-1 font-mono">Last ordered: {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(item.price_at_purchase)}</p>
                  {inCartCount > 0 && <p className="text-xs font-medium text-stokiloo-gold">{inCartCount} in current cart</p>}
                </div>
                <div className="w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto min-w-[120px] gap-2" 
                    onClick={() => { 
                      addToCart({ 
                        id: item.product_id, 
                        name: item.name || '', 
                        price: item.price_at_purchase, 
                        image_url: item.image_url || '',
                        supplier_id: '',
                        description: '',
                        sku: '',
                        stock_quantity: 999,
                        status: 'active'
                      });
                      toast(`${item.name || 'Item'} added`, 'success');
                    }}
                  >
                    <Plus className="h-4 w-4" /> Add 1
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
