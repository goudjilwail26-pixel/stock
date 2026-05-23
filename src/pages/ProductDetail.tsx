import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { Product } from '../types';
import { Minus, Plus, ArrowLeft, ShoppingCart, Package } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const all: Product[] = await (await fetch('/api/products')).json();
      const found = all.find(p => p.id === id);
      if (!found) throw new Error('Product not found');
      return found;
    },
  });

  if (isLoading) return <div className="py-20 text-center text-stokiloo-grey font-display text-2xl">Loading...</div>;
  if (!product) return <div className="py-20 text-center text-stokiloo-rose font-medium">Product not found</div>;

  const images = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];
  const currentImage = images[imageIndex] || product.image_url;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-stokiloo-grey hover:text-stokiloo-gold text-sm mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-stokiloo-dim border border-stokiloo-border overflow-hidden">
            {currentImage ? (
              <img src={currentImage} alt={product.name} className="w-full h-full object-cover opacity-90" crossOrigin="anonymous"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stokiloo-grey">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`h-16 w-16 shrink-0 border-2 overflow-hidden transition-colors ${i === imageIndex ? 'border-stokiloo-gold' : 'border-stokiloo-border hover:border-stokiloo-grey'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover opacity-80" crossOrigin="anonymous"/>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[11px] font-mono text-stokiloo-grey uppercase tracking-wider mb-2">{product.sku}</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-wider text-stokiloo-white leading-tight">{product.name}</h1>
          </div>

          <div className="text-3xl font-bold font-mono text-stokiloo-gold">
            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(product.price)}
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-stokiloo-silver uppercase tracking-wider mb-2">Description</h3>
              <p className="text-stokiloo-grey leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-stokiloo-emerald' : 'bg-stokiloo-rose'}`} />
            <span className={product.stock_quantity > 0 ? 'text-stokiloo-emerald' : 'text-stokiloo-rose'}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </span>
          </div>

          {product.stock_quantity > 0 && (
            <>
              <div className="flex items-center gap-4">
                <span className="text-sm text-stokiloo-silver">Quantity</span>
                <div className="flex items-center border border-stokiloo-border">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="h-11 w-11 flex items-center justify-center text-stokiloo-white hover:bg-stokiloo-dim transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-11 w-16 flex items-center justify-center text-stokiloo-white font-medium border-x border-stokiloo-border text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="h-11 w-11 flex items-center justify-center text-stokiloo-white hover:bg-stokiloo-dim transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button
                  size="lg"
                  className="flex-1 gap-3 text-base h-13"
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) addToCart(product);
                    toast(`${quantity} × ${product.name} added`, 'success');
                    setQuantity(1);
                  }}
                >
                  <ShoppingCart className="h-5 w-5" /> Add to bag — {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(product.price * quantity)}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
