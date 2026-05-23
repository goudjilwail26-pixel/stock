import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password,
          company_name: companyName,
          business_type: businessType,
          phone_number: phoneNumber,
        }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stokiloo-black p-4 text-stokiloo-white">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-stokiloo-gold flex items-center justify-center">
              <span className="text-stokiloo-black font-bold text-xl">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-display tracking-wider text-stokiloo-white">Stokiloo</CardTitle>
          <p className="text-sm text-stokiloo-grey">Create a wholesale buyer account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-stokiloo-silver" htmlFor="email">Email *</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-stokiloo-black border-stokiloo-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-stokiloo-silver" htmlFor="password">Password *</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-stokiloo-black border-stokiloo-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-stokiloo-silver" htmlFor="companyName">Company Name *</label>
              <Input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="bg-stokiloo-black border-stokiloo-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-stokiloo-silver" htmlFor="businessType">Business Type</label>
              <Input id="businessType" type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. café, restaurant, hotel" className="bg-stokiloo-black border-stokiloo-border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-stokiloo-silver" htmlFor="phoneNumber">Phone Number</label>
              <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-stokiloo-black border-stokiloo-border" />
            </div>
            {error && <p className="text-sm text-stokiloo-rose font-medium">{error}</p>}
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 border-t border-stokiloo-border pt-4 text-center">
            <p className="text-sm text-stokiloo-grey">
              Already have an account?{' '}
              <Link to="/login" className="text-stokiloo-gold hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
