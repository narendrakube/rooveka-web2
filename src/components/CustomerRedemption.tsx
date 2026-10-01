import React, { useState, useEffect } from 'react';
import { Gift, Loader, AlertCircle, CheckCircle2, XCircle, Package, MapPin, Store, Truck, X, ShoppingBag } from 'lucide-react';
import { StatusBadge } from './RewardManagement';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const API = 'http://localhost:8000/api';

interface CustomerUser {
  id: number; name: string; email: string; role: string;
}

interface RedemptionItem {
  id: number; redemptionUid: string; programName: string;
  rewardProductName: string; rewardDescription: string;
  customerRewardCode: string; shopVerificationCode: string | null;
  fulfillmentType: string | null; status: string; createdAt: string;
}

interface ProgramOption {
  programId: number; programName: string; productId: string; productName: string;
  subtitle: string | null; imageTag: string | null; category: string | null;
  requiredQuantity: number; rewardName: string; rewardDescription: string; description: string;
}

interface RewardCart {
  productId: string; name: string; price: number; sizeLabel: string;
}

export const CustomerRedemption: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addToCart, products: catalogProducts } = useCart();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [tab, setTab] = useState<'login' | 'register' | 'redeem' | 'rewards'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [authError, setAuthError] = useState('');
  const [authing, setAuthing] = useState(false);

  const [codes, setCodes] = useState<string[]>(['']);
  const [programList, setProgramList] = useState<ProgramOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [myRedemptions, setMyRedemptions] = useState<RedemptionItem[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [showFulfillment, setShowFulfillment] = useState<RedemptionItem | null>(null);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('rooveka_customer_token') || ''}`,
  });

  useEffect(() => {
    const saved = localStorage.getItem('rooveka_customer_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); setTab('redeem'); } catch { /* ignore */ }
    }
  }, []);

  // Load products that have an active reward program (dropdown options)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/customer/programs.php`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setProgramList(Array.isArray(data.programs) ? data.programs : []);
        }
      } catch { /* offline — dropdown stays empty */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const selectedProgram = programList.find(p => p.productId === selectedProductId);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthing(true);
    setAuthError('');
    try {
      const res = await fetch(`${API}/auth/login.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setAuthError(data.error || 'Login failed'); }
      else {
        localStorage.setItem('rooveka_customer_token', data.token);
        localStorage.setItem('rooveka_customer_user', JSON.stringify(data.user));
        setUser(data.user);
        setTab('redeem');
      }
    } catch { setAuthError('Network error'); }
    setAuthing(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthing(true);
    setAuthError('');
    try {
      const res = await fetch(`${API}/auth/register.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setAuthError(data.error || 'Registration failed'); }
      else {
        localStorage.setItem('rooveka_customer_token', data.token);
        localStorage.setItem('rooveka_customer_user', JSON.stringify(data.user));
        setUser(data.user);
        setTab('redeem');
      }
    } catch { setAuthError('Network error'); }
    setAuthing(false);
  };

  // Auto-add the unlocked gift to the cart at ₹0 so the customer can check out immediately
  const autoAddRewardToCart = (rc: RewardCart) => {
    const existing = catalogProducts.find(p => p.id === rc.productId);
    const giftProduct: Product = existing ?? {
      id: rc.productId,
      name: rc.name,
      subtitle: 'Complimentary reward gift',
      shortDescription: 'Unlocked with qualifying product codes on Rooveka Rewards.',
      fullDescription: 'Unlocked with qualifying product codes on Rooveka Rewards.',
      category: 'Gifts',
      sizes: [],
      ingredients: [],
      tastingNotes: [],
      bgTheme: 'cream-beige',
      imageTag: 'gift-whisker',
    };
    addToCart(giftProduct, rc.sizeLabel || 'Reward Gift', 0, 1);
  };

  const handleRedeem = async () => {
    const validCodes = codes.filter(c => c.trim());
    if (!selectedProductId) { setSubmitError('Please select the product you purchased'); return; }
    if (validCodes.length === 0) { setSubmitError('Enter at least one code'); return; }
    setSubmitting(true);
    setSubmitError('');
    setSubmitResult(null);
    try {
      const res = await fetch(`${API}/customer/redeem.php`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ productId: selectedProductId, codes: validCodes }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || 'Redemption failed'); }
      else {
        setSubmitResult(data);
        setCodes(['']);
        (data.rewardsEarned || []).forEach((r: any) => {
          if (r.rewardCart) autoAddRewardToCart(r.rewardCart);
        });
      }
    } catch { setSubmitError('Network error'); }
    setSubmitting(false);
  };

  const handleChooseFulfillment = async (redemptionId: number, type: 'delivery' | 'shop_collection', address?: string) => {
    try {
      const res = await fetch(`${API}/customer/fulfillment.php`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ redemptionId, fulfillmentType: type, shippingAddress: address }),
      });
      const data = await res.json();
      if (data.success) {
        setShowFulfillment(null);
        fetchMyRewards();
        alert(type === 'delivery' ? 'Reward will be delivered!' : `Shop code: ${data.shopVerificationCode}`);
      }
    } catch { /* silent */ }
  };

  const fetchMyRewards = async () => {
    setLoadingRewards(true);
    try {
      const res = await fetch(`${API}/customer/redeem.php`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMyRedemptions(data.redemptions || []);
      }
    } catch { /* silent */ }
    setLoadingRewards(false);
  };

  useEffect(() => { if (tab === 'rewards' && user) fetchMyRewards(); }, [tab, user]);

  const logout = () => {
    localStorage.removeItem('rooveka_customer_token');
    localStorage.removeItem('rooveka_customer_user');
    setUser(null);
    setTab('login');
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-rooveka-cream">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-stone-900 px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4">
              <Gift size={24} className="text-stone-900" />
            </div>
            <h1 className="text-xl font-serif font-bold text-amber-400 uppercase tracking-wider">Rooveka Rewards</h1>
            <p className="text-xs text-stone-400 mt-1">Enter your product codes and earn free gifts</p>
          </div>
          <div className="flex border-b border-stone-200">
            <button onClick={() => setTab('login')}
              className={`flex-1 py-3 text-sm font-semibold ${tab === 'login' ? 'text-amber-600 border-b-2 border-amber-400' : 'text-stone-400'}`}>Sign In</button>
            <button onClick={() => setTab('register')}
              className={`flex-1 py-3 text-sm font-semibold ${tab === 'register' ? 'text-amber-600 border-b-2 border-amber-400' : 'text-stone-400'}`}>Register</button>
          </div>
          <div className="p-6">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
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
                {authError && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} />{authError}</p>}
                <button type="submit" disabled={authing}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {authing ? <Loader size={16} className="animate-spin" /> : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Name</label>
                  <input type="text" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Phone</label>
                  <input type="tel" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="+91 ..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Password</label>
                  <input type="password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300" required minLength={6} />
                </div>
                {authError && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} />{authError}</p>}
                <button type="submit" disabled={authing}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {authing ? <Loader size={16} className="animate-spin" /> : 'Create Account'}
                </button>
              </form>
            )}
          </div>
          <button onClick={onClose} className="w-full py-3 text-sm text-stone-500 hover:text-stone-700 border-t border-stone-100 transition">Back to Store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-rooveka-cream">
      <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Gift size={20} className="text-stone-900" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">My Rewards</h1>
            <p className="text-xs text-stone-400">Welcome, {user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="text-xs text-stone-400 hover:text-white transition">Logout</button>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition p-2 rounded-lg hover:bg-stone-800"><XCircle size={22} /></button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-6 bg-stone-900 border-b border-stone-700 flex-shrink-0">
        {([
          { key: 'redeem', label: 'Enter Codes' },
          { key: 'rewards', label: 'My Rewards' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
              tab === t.key ? 'border-amber-400 text-amber-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'redeem' && (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl border border-rooveka-border p-6">
              <h2 className="text-lg font-serif font-bold text-rooveka-dark mb-2">Enter Product Codes</h2>
              <p className="text-sm text-rooveka-muted mb-4">Enter the unique codes found inside your Rooveka chocolate packages. Earn enough codes to qualify for a free reward!</p>

              {/* Product selector — codes must belong to the selected product */}
              <div className="mb-5">
                <label htmlFor="reward-product" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  Select the product you purchased
                </label>
                <select
                  id="reward-product"
                  value={selectedProductId}
                  onChange={e => { setSelectedProductId(e.target.value); setSubmitError(''); }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <option value="">Choose a product...</option>
                  {programList.map(p => (
                    <option key={p.productId} value={p.productId}>{p.productName}</option>
                  ))}
                </select>
                {selectedProgram ? (
                  <p className="text-xs text-stone-500 mt-2">
                    Enter <strong>{selectedProgram.requiredQuantity}</strong> codes from <strong>{selectedProgram.productName}</strong> to unlock a free <strong>{selectedProgram.rewardName}</strong>.
                  </p>
                ) : programList.length === 0 ? (
                  <p className="text-xs text-stone-400 mt-2">Loading reward products...</p>
                ) : null}
              </div>

              <div className="space-y-3">
                {codes.map((code, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={code} onChange={e => { const n = [...codes]; n[i] = e.target.value.toUpperCase(); setCodes(n); }}
                      placeholder={`Code ${i + 1}`}
                      className="flex-1 px-4 py-3 font-mono text-sm font-semibold tracking-wider border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase" />
                    {codes.length > 1 && (
                      <button onClick={() => setCodes(codes.filter((_, idx) => idx !== i))}
                        className="p-2 text-stone-400 hover:text-red-500 transition"><XCircle size={18} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setCodes([...codes, ''])}
                  className="w-full py-2.5 border-2 border-dashed border-stone-300 rounded-xl text-sm text-stone-400 hover:border-amber-400 hover:text-amber-500 transition">
                  + Add another code
                </button>
              </div>
              {submitError && <p className="text-red-500 text-sm mt-3 flex items-center gap-1"><AlertCircle size={14} />{submitError}</p>}
              {submitResult && (
                <div className="mt-4 space-y-3">
                  {submitResult.processed?.map((p: any, i: number) => (
                    <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span><strong>{p.code}</strong> - {p.product} accepted</span>
                    </div>
                  ))}
                  {submitResult.errors?.map((e: any, i: number) => (
                    <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                      <XCircle size={16} className="text-red-500" />
                      <span><strong>{e.code}</strong> - {e.error}</span>
                    </div>
                  ))}
                  {submitResult.rewardsEarned?.map((r: any, i: number) => (
                    <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift size={18} className="text-amber-500" />
                        <span className="font-semibold text-amber-700">Reward Earned!</span>
                      </div>
                      <p className="text-sm text-amber-800">{r.rewardProduct}</p>
                      {r.rewardCart ? (
                        <div className="mt-2 bg-white border border-emerald-300 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <ShoppingBag size={13} />
                            <p className="text-[10px] uppercase tracking-wider font-semibold">Added to your cart — ₹0.00</p>
                          </div>
                          <p className="text-sm font-bold text-rooveka-dark mt-0.5">{r.rewardCart.name} ×1</p>
                          <button
                            onClick={onClose}
                            className="mt-2.5 w-full py-2 bg-rooveka-dark text-rooveka-cream text-xs font-semibold tracking-widest uppercase rounded-lg hover:bg-rooveka-brown transition"
                          >
                            View Cart &amp; Checkout
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600 mt-1">Code: {r.customerRewardCode}</p>
                      )}
                      {r.warning && (
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1"><AlertCircle size={11} /> {r.warning}</p>
                      )}
                    </div>
                  ))}
                  {submitResult.warnings?.map((w: string, i: number) => (
                    <div key={`w-${i}`} className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                      <AlertCircle size={16} className="text-orange-500" />
                      <span className="text-orange-700">{w}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={handleRedeem} disabled={submitting}
                className="w-full mt-4 py-3 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting ? <><Loader size={16} className="animate-spin" /> Submitting...</> : 'Submit Codes'}
              </button>
            </div>
          </div>
        )}

        {tab === 'rewards' && (
          <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
            <h2 className="text-xl font-serif font-bold text-rooveka-dark">My Rewards</h2>
            {loadingRewards ? (
              <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-amber-500" /></div>
            ) : myRedemptions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-rooveka-border">
                <Gift size={40} className="mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 font-medium">No rewards yet</p>
                <p className="text-sm text-stone-400 mt-1">Enter product codes to start earning rewards</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRedemptions.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-rooveka-border p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif font-bold text-rooveka-dark">{r.programName}</h3>
                        <p className="text-sm text-rooveka-muted">{r.rewardProductName}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-xs text-stone-400 mb-3">Created: {new Date(r.createdAt).toLocaleString()}</div>
                    {r.status === 'qualified' && (
                      <button onClick={() => setShowFulfillment(r)}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold text-sm rounded-xl transition">
                        Choose Delivery Method
                      </button>
                    )}
                    {r.shopVerificationCode && (
                      <div className="bg-indigo-50 rounded-xl p-3 mt-2">
                        <p className="text-xs text-indigo-400 mb-1">Shop Verification Code</p>
                        <p className="font-mono font-bold text-indigo-700 tracking-wider">{r.shopVerificationCode}</p>
                        <p className="text-xs text-indigo-500 mt-1">Show this at any Rooveka shop for gift collection</p>
                      </div>
                    )}
                    {r.fulfillmentType && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                        {r.fulfillmentType === 'delivery' ? <Truck size={13} /> : <Store size={13} />}
                        {r.fulfillmentType === 'delivery' ? 'Delivery' : 'Shop Collection'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showFulfillment && (
        <FulfillmentModal redemption={showFulfillment} onClose={() => setShowFulfillment(null)} onChoose={handleChooseFulfillment} />
      )}
    </div>
  );
};

function FulfillmentModal({ redemption, onClose, onChoose }: {
  redemption: RedemptionItem; onClose: () => void;
  onChoose: (id: number, type: 'delivery' | 'shop_collection', address?: string) => void;
}) {
  const [type, setType] = useState<'delivery' | 'shop_collection'>('delivery');
  const [address, setAddress] = useState('');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif font-bold text-rooveka-dark text-lg mb-4">Choose How to Get Your Reward</h3>
        <div className="space-y-3 mb-4">
          <button onClick={() => setType('delivery')}
            className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center gap-4 ${
              type === 'delivery' ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-300'
            }`}>
            <Truck size={24} className={type === 'delivery' ? 'text-amber-500' : 'text-stone-400'} />
            <div>
              <p className="font-semibold">Home Delivery</p>
              <p className="text-sm text-stone-500">Free gift shipped to your address</p>
            </div>
          </button>
          <button onClick={() => setType('shop_collection')}
            className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center gap-4 ${
              type === 'shop_collection' ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-300'
            }`}>
            <Store size={24} className={type === 'shop_collection' ? 'text-amber-500' : 'text-stone-400'} />
            <div>
              <p className="font-semibold">Shop Collection</p>
              <p className="text-sm text-stone-500">Collect from a participating Rooveka shop</p>
            </div>
          </button>
        </div>
        {type === 'delivery' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Shipping Address *</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              placeholder="Full delivery address including pincode..." />
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition">Cancel</button>
          <button onClick={() => onChoose(redemption.id, type, type === 'delivery' ? address : undefined)}
            disabled={type === 'delivery' && !address.trim()}
            className="flex-1 py-2.5 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition disabled:opacity-50">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
