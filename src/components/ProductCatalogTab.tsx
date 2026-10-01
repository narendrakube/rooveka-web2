import React, { useState, useRef } from 'react';
import { Plus, Loader, AlertCircle, Trash2, X, Package, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { Product } from '../types';
import { ProductImageGraphic } from './ProductImageGraphic';
import { AdminLoginModal } from './rewards/AdminLoginModal';

const API = 'http://localhost:8000/api';

interface Props {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
  onAddProduct: () => void;
}

export function ProductCatalogTab({ products, loading, onRefresh, onAddProduct }: Props) {
  const [statusFilter, setStatusFilter] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const retryRef = useRef<(() => void) | null>(null);

  const inactiveCount = products.filter(p => (p.status ?? 'Active') === 'Inactive').length;
  const filtered = statusFilter
    ? products.filter(p => (p.status ?? 'Active') === statusFilter)
    : products;

  // Fetch with admin token; on 401/403 open the login gate and return null.
  const authedFetch = async (init: RequestInit): Promise<Response | null> => {
    const token = localStorage.getItem('rooveka_admin_token');
    const res = await fetch(`${API}/products.php`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
    if (res.status === 401 || res.status === 403) {
      setShowLogin(true);
      return null;
    }
    return res;
  };

  const handleDeleteInactive = async () => {
    retryRef.current = handleDeleteInactive;
    setDeleting(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authedFetch({
        method: 'DELETE',
        body: JSON.stringify({ inactiveOnly: true }),
      });
      if (!res) { setDeleting(false); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Failed to delete products (${res.status})`);
        setDeleting(false);
        return;
      }
      const n = data.deleted ?? 0;
      setSuccessMsg(`${n} inactive product${n === 1 ? '' : 's'} deleted`);
      setShowConfirmDelete(false);
      setDeleting(false);
      onRefresh();
    } catch {
      setError('Network error');
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (prod: Product) => {
    const next = (prod.status ?? 'Active') === 'Inactive' ? 'Active' : 'Inactive';
    retryRef.current = () => handleToggleStatus(prod);
    setTogglingId(prod.id);
    setError('');
    setSuccessMsg('');
    try {
      const res = await authedFetch({
        method: 'PUT',
        body: JSON.stringify({ id: prod.id, status: next }),
      });
      if (!res) { setTogglingId(null); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Failed to update ${prod.name} (${res.status})`);
        setTogglingId(null);
        return;
      }
      setSuccessMsg(`${prod.name} is now ${next}`);
      setTogglingId(null);
      onRefresh();
    } catch {
      setError('Network error');
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-serif font-bold text-rooveka-dark">Products Catalog</h2>
          <p className="text-xs text-rooveka-muted mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} in the store
            {inactiveCount > 0 && ` · ${inactiveCount} inactive`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={() => { setError(''); setSuccessMsg(''); setShowConfirmDelete(true); }}
            disabled={inactiveCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
            Delete Inactive{inactiveCount > 0 ? ` (${inactiveCount})` : ''}
          </button>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-5 py-2.5 bg-rooveka-dark hover:bg-rooveka-brown text-rooveka-cream text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>
      </div>

      {/* Status messages */}
      {error && !showConfirmDelete && (
        <p role="alert" className="text-red-600 text-sm flex items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      {successMsg && (
        <p role="status" className="text-emerald-700 text-sm flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <CheckCircle2 size={14} /> {successMsg}
        </p>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-rooveka-border">
          <Package size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 font-medium">
            {statusFilter ? `No ${statusFilter.toLowerCase()} products` : 'No products yet'}
          </p>
          <p className="text-sm text-stone-400 mt-1">
            {statusFilter ? 'Try a different status filter' : 'Add your first product to the store'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prod) => (
            <div key={prod.id} className="bg-white rounded-2xl border border-rooveka-border shadow-sm overflow-hidden">
              {/* Image / graphic area */}
              <div className="h-40 bg-rooveka-cream-soft flex items-center justify-center relative">
                {prod.images && prod.images.length > 0 ? (
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-24 h-24">
                    <ProductImageGraphic tag={prod.imageTag} aspect="aspect-square" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  (prod.status ?? 'Active') === 'Inactive'
                    ? 'bg-stone-200 text-stone-500'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {prod.status ?? 'Active'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-rooveka-dark text-sm leading-tight">{prod.name}</h3>
                    <p className="text-[11px] text-rooveka-muted mt-0.5">{prod.category}</p>
                  </div>
                  {prod.sku && (
                    <span className="text-[10px] font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded flex-shrink-0">{prod.sku}</span>
                  )}
                </div>
                <p className="text-xs text-rooveka-muted line-clamp-2">{prod.shortDescription}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1">
                    {prod.sizes.map(s => (
                      <span key={s.label} className="text-[11px] bg-rooveka-cream-soft border border-rooveka-border rounded px-2 py-0.5 font-mono font-semibold text-rooveka-dark">
                        {s.label} — ₹{s.price}
                      </span>
                    ))}
                  </div>
                  {typeof prod.stockQuantity === 'number' && (
                    <span className={`text-[10px] font-semibold ml-2 flex-shrink-0 ${prod.stockQuantity === 0 ? 'text-red-500' : 'text-rooveka-muted'}`}>
                      Stock: {prod.stockQuantity}
                    </span>
                  )}
                </div>
                {prod.tags && prod.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {prod.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-rooveka-gold/10 text-rooveka-brown border border-rooveka-gold/30 rounded px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleToggleStatus(prod)}
                  disabled={togglingId === prod.id}
                  className={`w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-xl border transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    (prod.status ?? 'Active') === 'Inactive'
                      ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'border-stone-200 text-stone-500 bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  {togglingId === prod.id ? (
                    <><Loader size={12} className="animate-spin" /> Saving...</>
                  ) : (prod.status ?? 'Active') === 'Inactive' ? (
                    <><Eye size={12} /> Mark Active</>
                  ) : (
                    <><EyeOff size={12} /> Mark Inactive</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-stone-900 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">Delete Inactive Products</h2>
                <p className="text-xs text-stone-400 mt-0.5">This action cannot be undone</p>
              </div>
              <button onClick={() => setShowConfirmDelete(false)} className="text-stone-400 hover:text-white transition p-1" aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-stone-600">
                Permanently delete <strong>{inactiveCount}</strong> inactive product{inactiveCount === 1 ? '' : 's'}?
                Their images, sizes, and any product codes will also be removed.
              </p>
              {error && (
                <p role="alert" className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} /> {error}</p>
              )}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteInactive}
                  disabled={deleting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition flex items-center gap-2 disabled:opacity-60 uppercase tracking-wider"
                >
                  {deleting ? <><Loader size={15} className="animate-spin" /> Deleting...</> : <><Trash2 size={15} /> Delete {inactiveCount} Product{inactiveCount === 1 ? '' : 's'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <AdminLoginModal
          onSuccess={() => {
            setShowLogin(false);
            retryRef.current?.();
          }}
        />
      )}
    </div>
  );
}
