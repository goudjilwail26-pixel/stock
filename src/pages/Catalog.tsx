import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Button, Card, CardContent, Input } from '../components/ui';
import { Product } from '../types';

export default function Catalog() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="py-20 text-center text-stokiloo-grey font-display text-2xl">Curating catalog...</div>;
  if (error) return <div className="py-20 text-center text-stokiloo-rose font-medium">Error loading products</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display tracking-wider text-stokiloo-white mb-2">Our Collection</h1>
          <p className="text-stokiloo-grey text-lg">Carefully sourced wholesale supplies for your business.</p>
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-stokiloo-grey" />
          <Input 
            placeholder="Search products by name..." 
            className="pl-12 h-12 w-full bg-stokiloo-dim border-stokiloo-border text-stokiloo-white focus-visible:ring-stokiloo-gold text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
  
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
        {filteredProducts?.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="block group">
            <Card className="overflow-hidden flex flex-col border-stokiloo-border hover:border-stokiloo-gold/30 transition-all duration-300 bg-stokiloo-dim h-full">
              <div className="aspect-[4/5] bg-stokiloo-black relative overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  crossOrigin="anonymous"
                />
                {product.stock_quantity <= 0 && (
                  <div className="absolute inset-0 bg-stokiloo-black/80 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-stokiloo-gold text-stokiloo-black text-xs font-bold px-3 py-1.5 tracking-wider uppercase">Sold Out</span>
                  </div>
                )}
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-stokiloo-grey uppercase tracking-wider mb-2 font-mono">SKU: {product.sku}</p>
                  <h3 className="font-medium text-base md:text-lg text-stokiloo-white leading-snug line-clamp-2 group-hover:text-stokiloo-gold transition-colors">{product.name}</h3>
                  <div className="text-lg md:text-xl font-mono text-stokiloo-gold mt-3">
                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(product.price)}
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-stokiloo-border flex items-center justify-between">
                  <Button 
                    size="default" 
                    variant={product.stock_quantity > 0 ? "default" : "secondary"}
                    onClick={(e) => { e.preventDefault(); addToCart(product); toast(`${product.name} added`, 'success'); }}
                    disabled={product.stock_quantity <= 0}
                    className="w-full font-medium"
                  >
                    {product.stock_quantity > 0 ? 'Add to bag' : 'Unavailable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}