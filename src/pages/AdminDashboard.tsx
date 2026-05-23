import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart, PackageSearch, Truck, AlertOctagon,
  Search, Plus, CheckCircle, PackageOpen, Building2, Phone, Briefcase
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '../components/ui';
import { Order, Metrics, Product, Wholesaler } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'wholesalers'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: 0, stock_quantity: 0, image_url: '', images: [] as string[], wholesaler_id: '' });
  const [showProductForm, setShowProductForm] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [newWholesaler, setNewWholesaler] = useState({ name: '', phone_number: '', provides_category: '' });
  const [showWholesalerForm, setShowWholesalerForm] = useState(false);

  const { data: metrics } = useQuery<Metrics>({
    queryKey: ['adminMetrics'],
    queryFn: async () => (await api('/api/admin/metrics')).json()
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: async () => (await api('/api/admin/orders')).json()
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['adminProducts'],
    queryFn: async () => (await api('/api/admin/products')).json()
  });

  const { data: wholesalers } = useQuery<Wholesaler[]>({
    queryKey: ['adminWholesalers'],
    queryFn: async () => (await api('/api/admin/wholesalers')).json()
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      toast('Order status updated', 'success');
    }
  });

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      await api('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      setShowProductForm(false);
      setNewProduct({ name: '', sku: '', price: 0, stock_quantity: 0, image_url: '', images: [], wholesaler_id: '' });
      toast('Product published', 'success');
    }
  });

  const createWholesaler = useMutation({
    mutationFn: async (data: any) => {
      await api('/api/admin/wholesalers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWholesalers'] });
      setShowWholesalerForm(false);
      setNewWholesaler({ name: '', phone_number: '', provides_category: '' });
      toast('Supplier saved', 'success');
    }
  });

  const filteredOrders = orders?.filter(o => 
    o.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
      <div className="shrink-0 flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl font-display tracking-wider text-stokiloo-white">Operations Control</h1>
          <p className="text-stokiloo-grey mt-1 text-sm">Manage orders, financial metrics, and active inventory</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-stokiloo-emerald/10 border border-stokiloo-emerald/20">
          <div className="w-2 h-2 bg-stokiloo-emerald rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-stokiloo-emerald">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Total Revenue', value: new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(metrics?.totalSales || 0), icon: BarChart, color: 'text-stokiloo-emerald', subText: '+12.4% vs last month' },
          { label: 'Active Orders', value: metrics?.activeOrders || 0, icon: PackageOpen, color: 'text-stokiloo-indigo', subText: `${metrics?.outForDelivery || 0} in delivery route` },
          { label: 'Pending Validation', value: (orders?.filter(o => o.status === 'pending').length) || 0, icon: Truck, color: 'text-stokiloo-amber', subText: 'Bank transfers awaiting' },
          { label: 'Low Stock SKUs', value: metrics?.outOfStock || 0, icon: AlertOctagon, color: 'text-stokiloo-rose', subText: 'Action required immediately' }
        ].map((stat, i) => (
          <div key={i} className="bg-stokiloo-dim border border-stokiloo-border p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="text-stokiloo-grey text-[11px] font-bold uppercase tracking-wider">{stat.label}</div>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-stokiloo-white mb-1">{stat.value}</div>
            <div className={`text-xs font-medium ${i === 0 ? 'text-stokiloo-emerald' : 'text-stokiloo-grey'}`}>
              {stat.subText}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 shrink-0 overflow-x-auto bg-stokiloo-dim border border-stokiloo-border p-1 inline-flex self-start">
        <button 
          className={`py-1.5 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-stokiloo-gold text-stokiloo-black' : 'text-stokiloo-grey hover:text-stokiloo-white'}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`py-1.5 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'bg-stokiloo-gold text-stokiloo-black' : 'text-stokiloo-grey hover:text-stokiloo-white'}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`py-1.5 px-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'wholesalers' ? 'bg-stokiloo-gold text-stokiloo-black' : 'text-stokiloo-grey hover:text-stokiloo-white'}`}
          onClick={() => setActiveTab('wholesalers')}
        >
          Wholesalers
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="bg-stokiloo-dim border border-stokiloo-border flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 border-b border-stokiloo-border flex items-center justify-between shrink-0">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stokiloo-grey" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-9 h-9 w-full bg-stokiloo-black border-stokiloo-border text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">Export CSV</Button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stokiloo-black text-stokiloo-grey text-[10px] font-bold uppercase tracking-wider sticky top-0 border-b border-stokiloo-border">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Buyer Entity</th>
                    <th className="px-4 py-3">Province</th>
                    <th className="px-4 py-3 text-right">Value (DA)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-stokiloo-border">
                  {filteredOrders?.map(order => (
                    <tr key={order.id} className="hover:bg-stokiloo-black/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-stokiloo-indigo">{order.id}</td>
                      <td className="px-4 py-3 font-medium text-stokiloo-white">{order.buyer_name}</td>
                      <td className="px-4 py-3 text-stokiloo-grey text-xs">{order.wilaya}</td>
                      <td className="px-4 py-3 font-bold text-right text-stokiloo-white font-mono">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(order.total_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                          ${order.status === 'pending' ? 'bg-stokiloo-amber/10 text-stokiloo-amber border border-stokiloo-amber/20' : ''}
                          ${order.status === 'processing' ? 'bg-stokiloo-indigo/10 text-stokiloo-indigo border border-stokiloo-indigo/20' : ''}
                          ${order.status === 'out_for_delivery' ? 'bg-blue-900/20 text-blue-400 border border-blue-800/30' : ''}
                          ${order.status === 'delivered' ? 'bg-stokiloo-emerald/10 text-stokiloo-emerald border border-stokiloo-emerald/20' : ''}
                          ${order.status === 'cancelled' ? 'bg-stokiloo-rose/10 text-stokiloo-rose border border-stokiloo-rose/20' : ''}
                        `}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex items-center justify-end gap-2 text-right">
                        {order.status === 'pending' && (
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: order.id, status: 'processing' })}>Process</Button>
                        )}
                        {order.status === 'processing' && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: order.id, status: 'out_for_delivery' })}>Dispatch</Button>
                        )}
                        {order.status === 'out_for_delivery' && (
                          <Button variant="secondary" size="sm" className="h-7 text-xs text-stokiloo-emerald bg-stokiloo-emerald/10 hover:bg-stokiloo-emerald/20" onClick={() => updateStatus.mutate({ id: order.id, status: 'delivered' })}>Finish</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-4 flex-1 overflow-auto">
          <div className="flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-lg text-stokiloo-white">Inventory Catalog</h3>
            <Button size="sm" onClick={() => setShowProductForm(!showProductForm)}>
              {showProductForm ? 'Cancel' : <><Plus className="h-4 w-4 mr-1"/> Add Item</>}
            </Button>
          </div>
          
          {showProductForm && (
            <div className="bg-stokiloo-dim border border-stokiloo-border p-5">
              <h4 className="font-medium text-sm mb-4 text-stokiloo-white border-b border-stokiloo-border pb-2">New Product Record</h4>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newProduct.name || !newProduct.price) return;
                  createProduct.mutate({ ...newProduct, image_url: newProduct.images[0] || newProduct.image_url, images: newProduct.images });
                }} 
                className="space-y-4 max-w-xl"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">Product Name</label>
                    <Input 
                      value={newProduct.name} 
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                      required 
                      className="bg-stokiloo-black border-stokiloo-border h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">SKU</label>
                    <Input 
                      value={newProduct.sku} 
                      onChange={e => setNewProduct({...newProduct, sku: e.target.value})} 
                      required 
                      className="bg-stokiloo-black border-stokiloo-border h-9 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">Price (DA)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={newProduct.price || ''} 
                      onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})} 
                      required 
                      className="bg-stokiloo-black border-stokiloo-border h-9 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">Stock Level</label>
                    <Input 
                      type="number"
                      min="0"
                      value={newProduct.stock_quantity || ''} 
                      onChange={e => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value) || 0})} 
                      required 
                      className="bg-stokiloo-black border-stokiloo-border h-9 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">Supplier</label>
                    <select 
                      className="flex h-9 w-full bg-stokiloo-black border border-stokiloo-border px-3 py-1 text-sm text-stokiloo-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stokiloo-gold"
                      value={newProduct.wholesaler_id}
                      onChange={e => setNewProduct({...newProduct, wholesaler_id: e.target.value})}
                      required
                    >
                      <option value="">-- Choose Supplier --</option>
                      {wholesalers?.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">Images</label>
                    <div className="flex items-center gap-2">
                      <label className="flex h-9 w-full bg-stokiloo-black border border-stokiloo-border px-3 py-1 text-sm text-stokiloo-grey cursor-pointer hover:border-stokiloo-gold/50 transition-colors">
                        <span className="truncate">{uploadingImages ? 'Uploading...' : newProduct.images.length > 0 ? `${newProduct.images.length} image(s) selected` : 'Choose files'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden"
                          disabled={uploadingImages}
                          onChange={async (e) => {
                            const files = e.target.files
                            if (!files || files.length === 0) return
                            setUploadingImages(true)
                            try {
                              const formData = new FormData()
                              for (const f of files) formData.append('files', f)
                              const res = await api('/api/admin/upload', { method: 'POST', body: formData })
                              const data = await res.json()
                              if (data.success) {
                                setNewProduct(prev => ({ ...prev, images: [...prev.images, ...data.urls] }))
                                toast(`${data.urls.length} image(s) uploaded`, 'success')
                              } else {
                                toast(data.error || 'Upload failed', 'error')
                              }
                            } catch {
                              toast('Upload failed', 'error')
                            } finally {
                              setUploadingImages(false)
                              e.target.value = ''
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {newProduct.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {newProduct.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="h-16 w-16 object-cover border border-stokiloo-border" />
                        <button 
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stokiloo-rose text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2">
                  <Button type="submit" size="sm" disabled={createProduct.isPending || uploadingImages} className="w-full sm:w-auto px-6">
                    {createProduct.isPending ? 'Saving...' : 'Publish Item'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {products?.map(p => (
              <div key={p.id} className="bg-stokiloo-dim border border-stokiloo-border p-2 flex flex-col">
                <div className="aspect-[3/2] bg-stokiloo-black border border-stokiloo-border overflow-hidden mb-1">
                  {p.image_url ? (
                     <img src={p.image_url} alt="" className="w-full h-full object-cover opacity-80" crossOrigin="anonymous"/>
                  ) : (
                     <div className="w-full h-full bg-stokiloo-black flex items-center justify-center text-[9px] text-stokiloo-grey">IMG</div>
                  )}
                </div>
                <div className="min-w-0 mb-1">
                  <h4 className="font-bold text-[11px] text-stokiloo-white truncate leading-tight" title={p.name}>{p.name}</h4>
                  <p className="text-[8px] font-mono text-stokiloo-grey truncate">{p.sku}</p>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="font-bold text-[11px] text-stokiloo-gold font-mono truncate">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(p.price)}</div>
                  <div className={`text-[8px] font-bold px-1 py-0.5 shrink-0 ${p.stock_quantity > 0 ? 'bg-stokiloo-emerald/10 text-stokiloo-emerald' : 'bg-stokiloo-rose/10 text-stokiloo-rose'}`}>
                    {p.stock_quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wholesalers' && (
        <div className="space-y-4 flex-1 overflow-auto">
          <div className="flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-lg text-stokiloo-white">Supplier Directory</h3>
            <Button size="sm" onClick={() => setShowWholesalerForm(!showWholesalerForm)}>
              {showWholesalerForm ? 'Cancel' : <><Plus className="h-4 w-4 mr-1"/> Add Supplier</>}
            </Button>
          </div>

          {showWholesalerForm && (
            <div className="bg-stokiloo-dim border border-stokiloo-border p-5">
              <h4 className="font-medium text-sm mb-4 text-stokiloo-white border-b border-stokiloo-border pb-2">New Supplier Record</h4>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newWholesaler.name) return;
                  createWholesaler.mutate(newWholesaler);
                }} 
                className="space-y-4 max-w-xl"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">Entity Name</label>
                    <Input 
                      value={newWholesaler.name} 
                      onChange={e => setNewWholesaler({...newWholesaler, name: e.target.value})} 
                      required 
                      className="bg-stokiloo-black border-stokiloo-border h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stokiloo-grey uppercase">Contact Number</label>
                    <Input 
                      value={newWholesaler.phone_number} 
                      onChange={e => setNewWholesaler({...newWholesaler, phone_number: e.target.value})} 
                      required 
                      className="bg-stokiloo-black border-stokiloo-border h-9 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stokiloo-grey uppercase">Domain / Categories</label>
                  <Input 
                    value={newWholesaler.provides_category} 
                    onChange={e => setNewWholesaler({...newWholesaler, provides_category: e.target.value})} 
                    required 
                    className="bg-stokiloo-black border-stokiloo-border h-9"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" size="sm" disabled={createWholesaler.isPending} className="px-6">
                    {createWholesaler.isPending ? 'Saving...' : 'Save Record'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wholesalers?.map((w) => (
              <div key={w.id} className="bg-stokiloo-dim border border-stokiloo-border p-4 hover:border-stokiloo-gold/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-sm text-stokiloo-white leading-tight">{w.name}</h4>
                  <div className="text-[10px] font-mono text-stokiloo-grey">ID: {w.id.split('-').pop()}</div>
                </div>
                <div className="space-y-2 mt-2 pt-2 border-t border-stokiloo-border">
                  <div className="flex items-center gap-2 text-xs text-stokiloo-grey font-mono">
                    <Phone className="h-3 w-3 text-stokiloo-grey" />
                    {w.phone_number}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stokiloo-grey truncate">
                    <Briefcase className="h-3 w-3 text-stokiloo-grey shrink-0" />
                    <span className="truncate">{w.provides_category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
