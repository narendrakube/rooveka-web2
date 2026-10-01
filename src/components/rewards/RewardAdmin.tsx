import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Loader, AlertCircle, CheckCircle2, RefreshCw, Ticket, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { GiftPoolData } from '../../types/rewards';
import { Product } from '../../types';

const API = 'http://localhost:8000/api';

const today = () => new Date().toISOString().slice(0, 10);

interface Props {
  authHeaders: () => Record<string, string>;
  onUnauthorized: () => void;
  products: Product[];
}

export function RewardAdmin({ authHeaders, onUnauthorized, products }: Props) {
  const [data, setData] = useState<GiftPoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [rewardName, setRewardName] = useState('');
  const [nameDirty, setNameDirty] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  const [genProduct, setGenProduct] = useState('');
  const [genQuantity, setGenQuantity] = useState('10');
  const [genExpiry, setGenExpiry] = useState(today());
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{ message: string; codes: string[]; product: string; expiresAt: string } | null>(null);
  const [genError, setGenError] = useState('');
  const [showCodes, setShowCodes] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${API}/admin_rewards.php`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action: 'get_dashboard_data' }),
      });
      if (res.status === 401 || res.status === 403) { onUnauthorized(); return; }
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFetchError(d.error || `Failed to load gift pool (${res.status})`);
        return;
      }
      setData(d);
      if (d.reward && !nameDirty) setRewardName(d.reward.rewardName);
    } catch {
      setFetchError('Network error');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, onUnauthorized, nameDirty]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch(`${API}/admin_rewards.php`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (res.status === 401 || res.status === 403) { onUnauthorized(); return { unauthorized: true }; }
    const d = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: d };
  };

  const handleUpdateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardName.trim()) { setUpdateError('Reward name is required'); return; }
    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');
    const r = await post({ action: 'update_reward', reward_name: rewardName.trim() });
    if ('unauthorized' in r) { setUpdating(false); return; }
    if (!r.ok) {
      setUpdateError(r.data?.error || `Failed to update reward (${r.status})`);
      setUpdating(false);
      return;
    }
    setUpdateSuccess(r.data?.message || 'Reward updated');
    setNameDirty(false);
    setUpdating(false);
    fetchData();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(genQuantity, 10);
    if (!genProduct) { setGenError('Select a product'); return; }
    if (!qty || qty < 1 || qty > 500) { setGenError('Quantity must be between 1 and 500'); return; }
    if (!genExpiry) { setGenError('Set an expiration date'); return; }
    setGenerating(true);
    setGenError('');
    setGenResult(null);
    setShowCodes(false);
    const r = await post({ action: 'generate_coupons', productId: genProduct, quantity: qty, expiresAt: genExpiry });
    if ('unauthorized' in r) { setGenerating(false); return; }
    if (!r.ok) {
      setGenError(r.data?.error || `Failed to generate codes (${r.status})`);
      setGenerating(false);
      return;
    }
    setGenResult({
      message: r.data?.message || `Successfully generated ${r.data?.inserted} codes!`,
      codes: r.data?.codes || [],
      product: r.data?.product || '',
      expiresAt: r.data?.expiresAt || genExpiry,
    });
    setGenerating(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="animate-spin text-amber-500" />
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-rooveka-dark">Gift Pool</h2>
          <p className="text-sm text-rooveka-muted mt-1">Generate product coupon codes &amp; manage the active reward gift</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-stone-300 rounded-xl hover:bg-stone-50 transition disabled:opacity-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {fetchError && (
        <p role="alert" className="text-red-500 text-sm flex items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} /> {fetchError}
        </p>
      )}

      {/* ── Current Status Widget ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-rooveka-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rooveka-muted mb-2">
            <Gift size={14} className="text-amber-500" /> Current Reward
          </div>
          <p className="font-serif text-xl font-bold text-rooveka-dark">
            {data?.reward?.rewardName || <span className="text-stone-400">No reward configured yet</span>}
          </p>
        </div>
        <div className={`bg-white rounded-2xl border p-5 shadow-sm ${data && data.activeCoupons === 0 ? 'border-red-300 bg-red-50/50' : 'border-rooveka-border'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rooveka-muted mb-2">
            <Ticket size={14} className="text-amber-500" /> Coupons Available to Issue
          </div>
          <p className={`font-serif text-xl font-bold ${data && data.activeCoupons === 0 ? 'text-red-600' : 'text-rooveka-dark'}`}>
            {data ? data.activeCoupons : '—'}
          </p>
          {data && (
            <p className="text-xs text-rooveka-muted mt-1">
              {data.inactiveCoupons} redeemed · {data.expiredCoupons} expired · {data.totalCoupons} total
            </p>
          )}
          {data && data.activeCoupons === 0 && (
            <p role="alert" className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} /> Pool empty — qualifying customers cannot be issued a coupon
            </p>
          )}
        </div>
      </div>

      {/* ── Generate Coupon Codes ─────────────────────────────────────────── */}
      <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-rooveka-border p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-serif font-bold text-rooveka-dark">Generate Coupon Codes</h3>
          <p className="text-xs text-rooveka-muted mt-1">Codes start as <strong>active</strong> and become <strong>inactive</strong> once a customer redeems them</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="gift-product" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Product Name *</label>
            <select id="gift-product" value={genProduct} onChange={e => { setGenProduct(e.target.value); setGenError(''); }}
              className={inputCls}>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="gift-quantity" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Quantity *</label>
            <input id="gift-quantity" type="number" min={1} max={500} value={genQuantity}
              onChange={e => { setGenQuantity(e.target.value); setGenError(''); }}
              className={inputCls} />
          </div>
          <div>
            <label htmlFor="gift-expiry" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Code Expiration Date *</label>
            <input id="gift-expiry" type="date" value={genExpiry}
              onChange={e => { setGenExpiry(e.target.value); setGenError(''); }}
              className={inputCls} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-rooveka-muted">Codes are unique and active until redeemed or expired</span>
          <button type="submit" disabled={generating}
            className="px-5 py-2.5 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
            {generating ? <><Loader size={15} className="animate-spin" /> Generating...</> : <><Package size={15} /> Generate Codes</>}
          </button>
        </div>

        {genError && (
          <p role="alert" className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} /> {genError}</p>
        )}
        {genResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <p role="status" className="text-emerald-700 text-sm font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} /> {genResult.message}
            </p>
            <p className="text-xs text-emerald-600">Expires {genResult.expiresAt} · {genResult.codes.length} code(s)</p>
            <button type="button" onClick={() => setShowCodes(v => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              {showCodes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showCodes ? 'Hide codes' : 'Show codes'}
            </button>
            {showCodes && (
              <div className="bg-white border border-emerald-200 rounded-lg p-2.5 max-h-40 overflow-y-auto">
                {genResult.codes.map((c, i) => (
                  <p key={i} className="font-mono text-xs text-rooveka-dark py-0.5 select-all">{c}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {/* ── Set Active Reward Form ────────────────────────────────────────── */}
      <form onSubmit={handleUpdateReward} className="bg-white rounded-2xl border border-rooveka-border p-5 shadow-sm space-y-3">
        <h3 className="font-serif font-bold text-rooveka-dark">Set Active Reward</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="gift-reward-name"
            type="text"
            aria-label="Active reward name"
            value={rewardName}
            onChange={e => { setRewardName(e.target.value); setNameDirty(true); setUpdateError(''); setUpdateSuccess(''); }}
            placeholder='e.g. "Coffee Whisker"'
            maxLength={150}
            className={`flex-1 ${inputCls}`}
          />
          <button type="submit" disabled={updating || !rewardName.trim()}
            className="px-5 py-2.5 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider">
            {updating ? <><Loader size={15} className="animate-spin" /> Updating...</> : 'Update Item'}
          </button>
        </div>
        {updateError && (
          <p role="alert" className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} /> {updateError}</p>
        )}
        {updateSuccess && (
          <p role="status" className="text-emerald-600 text-sm flex items-center gap-1"><CheckCircle2 size={14} /> {updateSuccess}</p>
        )}
      </form>
    </div>
  );
}
