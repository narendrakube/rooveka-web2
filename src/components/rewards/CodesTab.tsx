import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle, X, Ticket, Copy, Eye } from 'lucide-react';
import { ProductCode } from '../../types/rewards';
import { Product } from '../../types';
import { StatusBadge } from '../RewardManagement';

const API = 'http://localhost:8000/api';

interface Props {
  codes: ProductCode[]; search: string; setSearch: (s: string) => void;
  statusFilter: string; setStatusFilter: (s: string) => void;
  page: number; setPage: (p: number) => void; total: number; loading: boolean;
  onRefresh: () => void; products: Product[];
  showGenerate: boolean; setShowGenerate: (v: boolean) => void;
  codeDetails: ProductCode | null; setCodeDetails: (c: ProductCode | null) => void;
  authHeaders: () => Record<string, string>;
}

export function CodesTab({ codes, search, setSearch, statusFilter, setStatusFilter, page, setPage, total, loading, onRefresh, products, showGenerate, setShowGenerate, codeDetails, setCodeDetails, authHeaders }: Props) {
  const copyCode = (code: string) => navigator.clipboard.writeText(code);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-rooveka-dark">Coupon / Product Codes</h2>
          <p className="text-sm text-rooveka-muted mt-1">{total} code(s) generated</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold text-sm rounded-xl transition">
          <Plus size={15} /> Generate Codes
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search codes, batches..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="generated">Generated</option>
          <option value="redeemed">Redeemed</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-amber-500" /></div>
      ) : codes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-rooveka-border">
          <Ticket size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 font-medium">No codes generated yet</p>
          <p className="text-sm text-stone-400 mt-1">Generate product codes for physical packages</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rooveka-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-stone-50/50 transition">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-rooveka-dark">{code.code}</td>
                    <td className="px-4 py-3 text-stone-600">{code.productName}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{code.batchLabel}</td>
                    <td className="px-4 py-3"><StatusBadge status={code.status} /></td>
                    <td className="px-4 py-3 text-stone-400 text-xs">{new Date(code.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => copyCode(code.code)} title="Copy code"
                          className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Copy size={13} /></button>
                        <button onClick={() => setCodeDetails(code)} title="Details"
                          className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {total > 30 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 text-sm border border-stone-300 rounded-xl hover:bg-stone-50 disabled:opacity-40">Previous</button>
          <span className="text-sm text-stone-500">Page {page} of {Math.ceil(total / 30)}</span>
          <button disabled={page * 30 >= total} onClick={() => setPage(page + 1)}
            className="px-4 py-2 text-sm border border-stone-300 rounded-xl hover:bg-stone-50 disabled:opacity-40">Next</button>
        </div>
      )}

      {showGenerate && (
        <GenerateCodesModal products={products}
          onClose={() => setShowGenerate(false)}
          onSaved={() => { setShowGenerate(false); onRefresh(); }}
          authHeaders={authHeaders} />
      )}

      {codeDetails && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setCodeDetails(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-rooveka-dark">Code Details</h3>
              <button onClick={() => setCodeDetails(null)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-stone-50 rounded-xl p-4 text-center">
                <p className="text-xs text-stone-400 mb-1">PRODUCT CODE</p>
                <p className="font-mono text-lg font-bold text-rooveka-dark tracking-widest">{codeDetails.code}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-stone-400 text-xs">Product</span><p className="font-medium">{codeDetails.productName}</p></div>
                <div><span className="text-stone-400 text-xs">Batch</span><p className="font-medium">{codeDetails.batchLabel}</p></div>
                <div><span className="text-stone-400 text-xs">Status</span><p><StatusBadge status={codeDetails.status} /></p></div>
                <div><span className="text-stone-400 text-xs">Created</span><p className="font-medium">{new Date(codeDetails.createdAt).toLocaleString()}</p></div>
                {codeDetails.redeemedAt && <div><span className="text-stone-400 text-xs">Redeemed</span><p className="font-medium">{new Date(codeDetails.redeemedAt).toLocaleString()}</p></div>}
                {codeDetails.expiresAt && <div><span className="text-stone-400 text-xs">Expires</span><p className="font-medium">{codeDetails.expiresAt}</p></div>}
              </div>
              <button onClick={() => copyCode(codeDetails.code)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                <Copy size={14} /> Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GenerateCodesModal({ products, onClose, onSaved, authHeaders }: {
  products: Product[]; onClose: () => void; onSaved: () => void; authHeaders: () => Record<string, string>;
}) {
  const [form, setForm] = useState({ productId: '', batchLabel: '', quantity: '50', status: 'active', expiresAt: '' });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) { setError('Select a product'); return; }
    if (parseInt(form.quantity) < 1) { setError('Quantity must be at least 1'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/codes/generate.php`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          productId: form.productId, batchLabel: form.batchLabel || undefined,
          quantity: parseInt(form.quantity), status: form.status,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); }
      else { setResult(data); }
    } catch { setError('Network error'); }
    setSaving(false);
  };

  const ic = (err?: string) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border ${err ? 'border-red-400 bg-red-50' : 'border-stone-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-amber-300 transition`;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-stone-900 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">Generate Product Codes</h2>
            <p className="text-xs text-stone-400 mt-0.5">Bulk generate unique codes for physical packages</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition p-1"><X size={22} /></button>
        </div>

        {result ? (
          <div className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-emerald-700 font-semibold">{result.generated} codes generated!</p>
              <p className="text-sm text-emerald-600 mt-1">Batch: {result.batchLabel}</p>
            </div>
            <div className="max-h-60 overflow-y-auto bg-stone-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-500">Generated Codes</span>
                <button onClick={() => navigator.clipboard.writeText(result.codes.map((c: any) => c.code).join('\n'))}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"><Copy size={12} /> Copy All</button>
              </div>
              <div className="space-y-1">
                {result.codes.map((c: any, i: number) => (
                  <div key={i} className="font-mono text-xs text-stone-700 bg-white rounded-lg px-3 py-1.5 border border-stone-200">{c.code}</div>
                ))}
              </div>
            </div>
            <button onClick={onSaved}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="gc-productId" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Product *</label>
              <select id="gc-productId" value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} className={ic()}>
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gc-batchLabel" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Batch Label</label>
                <input id="gc-batchLabel" value={form.batchLabel} onChange={e => setForm(f => ({ ...f, batchLabel: e.target.value }))}
                  placeholder="Auto-generated if empty" className={ic()} />
              </div>
              <div>
                <label htmlFor="gc-quantity" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Quantity *</label>
                <input id="gc-quantity" type="number" min="1" max="10000" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={ic()} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gc-status" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Initial Status</label>
                <select id="gc-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={ic()}>
                  <option value="active">Active</option>
                  <option value="generated">Generated (inactive)</option>
                </select>
              </div>
              <div>
                <label htmlFor="gc-expiresAt" className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Expiry Date</label>
                <input id="gc-expiresAt" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className={ic()} />
              </div>
            </div>
            {error && <p role="alert" className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition flex items-center gap-2 disabled:opacity-60 uppercase tracking-wider">
                {saving ? <><Loader size={15} className="animate-spin" /> Generating...</> : 'Generate Codes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
