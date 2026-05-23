import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        login(data.user);
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stokiloo-black p-4 text-stokiloo-white">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-stokiloo-gold flex items-center justify-center">
              <span className="text-stokiloo-black font-bold text-xl">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-display tracking-wider text-stokiloo-white">Stokiloo</CardTitle>
          <p className="text-sm text-stokiloo-grey">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-stokiloo-silver" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="buyer@b2b.com or admin@b2b.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-stokiloo-silver" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="password (e.g. buyer123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-stokiloo-rose font-medium">{error}</p>}
            <Button type="submit" className="w-full h-11 text-base">
              Sign In
            </Button>
          </form>
          <div className="mt-6 border-t border-stokiloo-border pt-4 text-xs text-stokiloo-grey space-y-1 text-center">
            <p>Mock accounts:</p>
            <p>buyer@b2b.com / buyer123</p>
            <p>admin@b2b.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
