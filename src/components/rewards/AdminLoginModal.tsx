import React, { useState } from 'react';
import { Loader, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

const API = 'http://localhost:8000/api';

export function AdminLoginModal({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('admin@rooveka.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setSaving(false);
        return;
      }
      if (data.user?.role !== 'admin') {
        setError('Admin access required');
        setSaving(false);
        return;
      }
      localStorage.setItem('rooveka_admin_token', data.token);
      localStorage.setItem('rooveka_admin_user', JSON.stringify(data.user));
      onSuccess();
    } catch {
      setError('Network error');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-stone-900 px-6 py-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Lock size={22} className="text-stone-900" />
          </div>
          <h2 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">Admin Sign In</h2>
          <p className="text-xs text-stone-400 mt-1">Required to manage rewards & coupons</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
            />
          </div>
          {error && (
            <p role="alert" className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving || !email.trim() || !password}
            className="w-full py-2.5 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 uppercase tracking-wider"
          >
            {saving ? <><Loader size={15} className="animate-spin" /> Signing in...</> : <><ShieldCheck size={15} /> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}
