import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../components/ui';
import { Trash2, ShieldCheck, MapPin, ShoppingCart } from 'lucide-react';

const WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna",
  "06 - Bejaia", "07 - Biskra", "08 - Bechar", "09 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tebessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou",
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Setif", "20 - Saida",
  "21 - Skikda", "22 - Sidi Bel Abbes", "23 - Annaba", "24 - Guelma", "25 - Constantine",
  "26 - Medea", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdes",
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Ain Defla", "45 - Naama",
  "46 - Ain Temouchent", "47 - Ghardaia", "48 - Relizane", "49 - El M'ghair", "50 - El Meniaa",
  "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Beni Abbes", "54 - Timimoun", "55 - Touggourt",
  "56 - Djanet", "57 - In Salah", "58 - In Guezzam"
];

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [wilaya, setWilaya] = useState(user?.wilaya || WILAYAS[15]);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const payload = {
        buyer_id: user?.id,
        total_price: totalPrice,
        wilaya,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, price_at_purchase: i.price }))
      };
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        clearCart();
        navigate('/');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center">
        <ShoppingCart className="h-16 w-16 text-stokiloo-border mb-6" />
        <h2 className="text-3xl font-display tracking-wider text-stokiloo-white mb-3">Your bag is empty</h2>
        <p className="text-stokiloo-grey mb-8 max-w-md">Looks like you haven't added any products to your bag yet. Browse our collection to find what you need.</p>
        <Button onClick={() => navigate('/')} size="lg">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        <h1 className="text-4xl font-display tracking-wider text-stokiloo-white mb-8">Checkout</h1>
        
        <Card className={step === 1 ? 'border-stokiloo-gold' : 'border-stokiloo-border opacity-60'}>
          <CardHeader className="bg-stokiloo-dim border-b border-stokiloo-border">
            <CardTitle className="text-lg font-medium flex items-center justify-between text-stokiloo-white">
              <span className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-stokiloo-gold text-stokiloo-black text-xs font-bold">1</span>
                Order Review
              </span>
              {step > 1 && <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="font-medium">Edit</Button>}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {step === 1 ? (
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b border-stokiloo-border last:border-0 last:pb-0">
                    <img src={item.image_url} alt={item.name} className="h-20 w-20 object-cover bg-stokiloo-black" crossOrigin="anonymous"/>
                    <div className="flex-1">
                      <h4 className="font-medium text-stokiloo-white text-base">{item.name}</h4>
                      <p className="text-stokiloo-grey mt-1 font-mono">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-20 text-center font-medium bg-stokiloo-black border-stokiloo-border text-stokiloo-white"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-stokiloo-rose hover:text-red-400 hover:bg-stokiloo-border h-10 w-10">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-6 flex justify-end">
                  <Button onClick={() => setStep(2)} size="lg">Continue to Delivery</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm font-medium text-stokiloo-grey">{items.length} items confirmed.</div>
            )}
          </CardContent>
        </Card>

        <Card className={step === 2 ? 'border-stokiloo-gold mt-6' : 'border-stokiloo-border opacity-60 mt-6'}>
          <CardHeader className="bg-stokiloo-dim border-b border-stokiloo-border">
            <CardTitle className="text-lg font-medium text-stokiloo-white flex items-center gap-3">
              <span className={`flex items-center justify-center w-6 h-6 text-xs font-bold ${step === 2 ? 'bg-stokiloo-gold text-stokiloo-black' : 'bg-stokiloo-border text-stokiloo-grey'}`}>2</span>
              Delivery & Payment
            </CardTitle>
          </CardHeader>
          {step === 2 && (
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2 text-stokiloo-white">
                  <MapPin className="h-4 w-4 text-stokiloo-grey" /> Deliver to Province
                </label>
                <select 
                  className="flex h-12 w-full bg-stokiloo-dim border border-stokiloo-border px-4 py-2 text-base text-stokiloo-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stokiloo-gold"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                >
                  <option value="" disabled>Select your Wilaya</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div className="p-6 bg-stokiloo-dim border border-stokiloo-border">
                <h4 className="font-medium text-stokiloo-white flex items-center gap-2 mb-2 text-base">
                  <ShieldCheck className="h-5 w-5 text-stokiloo-emerald" /> Secure Payment Handover
                </h4>
                <p className="text-stokiloo-silver">Cash on Delivery / Bank Transfer Validation</p>
                <p className="text-sm text-stokiloo-grey mt-2">Our sales team will contact you shortly to confirm the purchase and finalize the payment handover securely.</p>
              </div>

              <div className="pt-6 flex items-center justify-end gap-4 border-t border-stokiloo-border">
                <Button variant="ghost" onClick={() => setStep(1)}>Back to Cart</Button>
                <Button onClick={handleCheckout} disabled={loading} size="lg" className="min-w-[200px]">
                  {loading ? 'Processing...' : 'Confirm Order'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">
        <Card className="sticky top-28 bg-stokiloo-black border-stokiloo-gold/20">
          <CardHeader className="bg-stokiloo-dim border-b border-stokiloo-border pb-5">
            <CardTitle className="text-xl font-display tracking-wider text-stokiloo-white">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex justify-between text-stokiloo-grey text-base">
              <span>Subtotal ({items.length} items)</span>
              <span className="text-stokiloo-white font-mono">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-stokiloo-grey text-base">
              <span>Delivery Cost</span>
              <span className="text-stokiloo-emerald font-medium">Free</span>
            </div>
            <div className="pt-6 border-t border-stokiloo-border flex justify-between items-center">
              <span className="text-lg text-stokiloo-white">Total</span>
              <span className="text-2xl font-bold text-stokiloo-gold font-mono">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(totalPrice)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}