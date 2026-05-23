import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Store, ShoppingCart, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { Button } from './components/ui';

import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import QuickReorder from './pages/QuickReorder';
import Checkout from './pages/Checkout';
import OrderConfirm from './pages/OrderConfirm';
import AdminDashboard from './pages/AdminDashboard';

const queryClient = new QueryClient();

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stokiloo-border bg-stokiloo-black/95 backdrop-blur-sm shrink-0">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 flex h-16 items-center justify-between">
        
        <nav className="flex-1 flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="text-stokiloo-silver hover:text-stokiloo-white flex items-center gap-2">
            <Package className="h-5 w-5" />
          </Link>
          
          {user && user.role !== 'admin' && (
            <Link to="/reorder" className="text-stokiloo-silver hover:text-stokiloo-white hidden sm:flex items-center gap-2" title="Past Orders">
              <Store className="h-5 w-5" />
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" className="text-stokiloo-silver hover:text-stokiloo-white flex items-center gap-2" title="Admin">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}

          {(!user || user.role !== 'admin') && (
            <Link to="/checkout" className="text-stokiloo-silver hover:text-stokiloo-white flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-stokiloo-gold text-stokiloo-black text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          )}
        </nav>

        <Link to={user?.role === 'admin' ? '/admin' : '/'} className="flex flex-1 justify-center items-center gap-3">
          <div className="w-8 h-8 bg-stokiloo-gold rounded-lg flex items-center justify-center">
            <span className="text-stokiloo-black font-bold text-sm">S</span>
          </div>
          <span className="font-display text-xl tracking-wider text-stokiloo-white hidden sm:block">Stokiloo</span>
        </Link>
        
        <div className="flex-1 flex justify-end items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-stokiloo-white">{user.email}</div>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" className="text-stokiloo-grey hover:text-stokiloo-white">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="outline" className="text-xs h-8">Sign In</Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen bg-stokiloo-black text-stokiloo-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-stokiloo-grey">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Catalog />} />
                    <Route path="/order-confirmed" element={<OrderConfirm />} />
                    <Route element={<ProtectedRoute allowedRoles={['buyer', 'admin']} />}>
                      <Route path="/reorder" element={<QuickReorder />} />
                      <Route path="/checkout" element={<Checkout />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
