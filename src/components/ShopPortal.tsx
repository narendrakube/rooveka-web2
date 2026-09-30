import React, { useState } from 'react';
import { Store, LogIn as Login, Loader, AlertCircle, CheckCircle2, XCircle, Gift, Search, X } from 'lucide-react';
import { StatusBadge } from './RewardManagement';

const API = 'http://localhost:8000/api';

interface ShopUser {
  id: number; name: string; email: string; role: string; shopName: string;
}

interface RedemptionDetail {
  id: number; customerName: string; customerEmail: string;
  programName: string; rewardProductName: string; rewardDescription: string;
  status: string; createdAt: string;
}

export const ShopPortal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [user, setUser] = useState<ShopUser | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [logging, setLogging] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogging(true);
    setLoginError('');
    try {
      const res = await fetch(`${API}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Login failed');
      } else if (data.user.role !== 'shopkeeper') {
        setLoginError('This account is not authorized for shop access');
      } else {
        localStorage.setItem('rooveka_shop_token', data.token);
        setUser(data.user);
      }
    } catch { setLoginError('Network error'); }
    setLogging(false);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-rooveka-cream">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-stone-900 px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4">
              <Store size={24} className="text-stone-900" />
            </div>
            <h1 className="text-xl font-serif font-bold text-amber-400 uppercase tracking-wider">Rooveka Shop Portal</h1>
            <p className="text-xs text-stone-400 mt-1">Verify reward codes and confirm gift handovers</p>
          </div>
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300" required />
            </div>
            {loginError && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} />{loginError}</p>}
            <button type="submit" disabled={logging}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
              {logging ? <><Loader size={16} className="animate-spin" /> Signing in...</> : <><Login size={16} /> Sign In</>}
            </button>
            <button type="button" onClick={onClose}
              className="w-full py-2 text-sm text-stone-500 hover:text-stone-700 transition">Back to Store</button>
          </form>
        </div>
      </div>
    );
  }

  return <ShopDashboard user={user} onLogout={() => { setUser(null); localStorage.removeItem('rooveka_shop_token'); }} onClose={onClose} />;
};

function ShopDashboard({ user, onLogout, onClose }: { user: ShopUser; onLogout: () => void; onClose: () => void }) {
  const [tab, setTab] = useState<'verify' | 'history'>('verify');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<RedemptionDetail | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState('today');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const shopHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('rooveka_shop_token') || user.id}`,
  });

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    setVerifying(true);
    setVerifyError('');
    setVerifyResult(null);
    try {
      const res = await fetch(`${API}/shop/verify.php`, {
        method: 'POST', headers: shopHeaders(),
        body: JSON.stringify({ verificationCode: verifyCode.trim(), action: 'verify' }),
      });
      const data = await res.json();
      if (!res.ok) { setVerifyError(data.error || 'Verification failed'); }
      else { setVerifyResult(data.redemption); }
    } catch { setVerifyError('Network error'); }
    setVerifying(false);
  };

  const handleConfirmHandover = async () => {
    if (!verifyResult) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API}/shop/verify.php`, {
        method: 'POST', headers: shopHeaders(),
        body: JSON.stringify({ verificationCode: verifyCode.trim(), action: 'confirm_handover' }),
      });
      const data = await res.json();
      if (!res.ok) { setVerifyError(data.error || 'Failed'); }
      else {
        setVerifyResult(null);
        setVerifyCode('');
        alert('Gift handover confirmed successfully!');
      }
    } catch { setVerifyError('Network error'); }
    setConfirming(false);
  };

  const fetchHistory = async (filter: string) => {
    setHistoryFilter(filter);
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/shop/verify.php?filter=${filter}`, { headers: shopHeaders() });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.redemptions || []);
      }
    } catch { /* silent */ }
    setLoadingHistory(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-rooveka-cream">
      <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Store size={20} className="text-stone-900" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">Shop Portal</h1>
            <p className="text-xs text-stone-400">{user.shopName || user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLogout} className="text-xs text-stone-400 hover:text-white transition">Logout</button>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition p-2 rounded-lg hover:bg-stone-800">
            <XCircle size={22} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-6 bg-stone-900 border-b border-stone-700 flex-shrink-0">
        {([
          { key: 'verify', label: 'Verify Code', icon: Search },
          { key: 'history', label: 'Redemption History', icon: Gift },
        ] as const).map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); if (t.key === 'history' && history.length === 0) fetchHistory('today'); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              tab === t.key ? 'border-amber-400 text-amber-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'verify' && (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl border border-rooveka-border p-6">
              <h2 className="text-lg font-serif font-bold text-rooveka-dark mb-4">Verify Reward Code</h2>
              <p className="text-sm text-rooveka-muted mb-4">Enter or scan the customer's shop verification code to validate and confirm gift handover.</p>
              <div className="flex gap-3">
                <input value={verifyCode} onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                  placeholder="Enter verification code"
                  className="flex-1 px-4 py-3 font-mono text-sm font-semibold tracking-widest border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase" />
                <button onClick={handleVerify} disabled={verifying || !verifyCode.trim()}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition flex items-center gap-2 disabled:opacity-50">
                  {verifying ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                  Verify
                </button>
              </div>
              {verifyError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{verifyError}</p>
                </div>
              )}
            </div>

            {verifyResult && (
              <div className="bg-white rounded-2xl border border-rooveka-border p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <h3 className="font-serif font-bold text-rooveka-dark">Reward Verified</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-stone-50 rounded-xl p-3">
                      <span className="text-xs text-stone-400">Customer</span>
                      <p className="font-medium">{verifyResult.customerName}</p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <span className="text-xs text-stone-400">Email</span>
                      <p className="font-medium">{verifyResult.customerEmail}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <span className="text-xs text-amber-500">Program</span>
                      <p className="font-medium text-amber-700">{verifyResult.programName}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <span className="text-xs text-emerald-500">Free Gift</span>
                      <p className="font-medium text-emerald-700">{verifyResult.rewardProductName}</p>
                    </div>
                  </div>
                  <button onClick={handleConfirmHandover} disabled={confirming}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {confirming ? <Loader size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Confirm Gift Handover
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              {['today', 'pending', 'redeemed', 'expired'].map(f => (
                <button key={f} onClick={() => fetchHistory(f)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
                    historyFilter === f ? 'bg-amber-400 text-stone-900' : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-50'
                  }`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-amber-500" /></div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-rooveka-border">
                <Gift size={40} className="mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 font-medium">No redemptions found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-rooveka-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Reward</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {history.map((r: any) => (
                      <tr key={r.id} className="hover:bg-stone-50/50 transition">
                        <td className="px-4 py-3">
                          <p className="font-medium">{r.customerName}</p>
                          <p className="text-xs text-stone-400">{r.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3">{r.rewardProductName}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3 text-stone-400 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
