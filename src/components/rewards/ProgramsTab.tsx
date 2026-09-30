import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle, Trash2, Edit3, Power, Package, Hash, Gift, TrendingUp, Calendar, X } from 'lucide-react';
import { RewardProgram } from '../../types/rewards';
import { Product } from '../../types';
import { StatusBadge } from '../RewardManagement';

const API = 'http://localhost:8000/api';

interface Props {
  programs: RewardProgram[]; search: string; setSearch: (s: string) => void;
  statusFilter: string; setStatusFilter: (s: string) => void;
  page: number; setPage: (p: number) => void; total: number; loading: boolean;
  onRefresh: () => void; products: Product[];
  showCreate: boolean; setShowCreate: (v: boolean) => void;
  editingProgram: RewardProgram | null; setEditingProgram: (p: RewardProgram | null) => void;
  authHeaders: () => Record<string, string>;
}

export function ProgramsTab({ programs, search, setSearch, statusFilter, setStatusFilter, page, setPage, total, loading, onRefresh, products, showCreate, setShowCreate, editingProgram, setEditingProgram, authHeaders }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const toggleActive = async (prog: RewardProgram) => {
    await fetch(`${API}/admin/rewards/programs.php`, {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ id: prog.id, isActive: !prog.isActive }),
    });
    onRefresh();
  };

  const deleteProgram = async (id: number) => {
    await fetch(`${API}/admin/rewards/programs.php`, {
      method: 'DELETE', headers: authHeaders(),
      body: JSON.stringify({ id }),
    });
    setConfirmDelete(null);
    onRefresh();
  };

  const inputCls = (err?: string) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border ${err ? 'border-red-400 bg-red-50' : 'border-stone-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-amber-300 transition`;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-rooveka-dark">Reward Programs</h2>
          <p className="text-sm text-rooveka-muted mt-1">{total} program(s) configured</p>
        </div>
        <button onClick={() => { setEditingProgram(null); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold text-sm rounded-xl transition">
          <Plus size={15} /> Create Program
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-amber-500" /></div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-rooveka-border">
          <Gift size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 font-medium">No reward programs yet</p>
          <p className="text-sm text-stone-400 mt-1">Create your first program to start rewarding customers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-rooveka-border p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif font-bold text-rooveka-dark">{prog.name}</h3>
                    <StatusBadge status={prog.isActive ? 'active' : 'cancelled'} />
                  </div>
                  <p className="text-sm text-rooveka-muted mb-3">{prog.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-stone-600">
                    <span className="flex items-center gap-1"><Package size={13} /> Trigger: <strong>{prog.triggerProductName}</strong></span>
                    <span className="flex items-center gap-1"><Hash size={13} /> Buy {prog.requiredQuantity}x</span>
                    <span className="flex items-center gap-1"><Gift size={13} /> Get: <strong>{prog.rewardProductName}</strong></span>
                    <span className="flex items-center gap-1"><TrendingUp size={13} /> {prog.currentRedemptions} redeemed</span>
                    {prog.expiryDate && <span className="flex items-center gap-1"><Calendar size={13} /> Expires: {prog.expiryDate}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => toggleActive(prog)} title={prog.isActive ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition ${prog.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'}`}>
                    <Power size={15} />
                  </button>
                  <button onClick={() => { setEditingProgram(prog); setShowCreate(true); }} title="Edit"
                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition"><Edit3 size={15} /></button>
                  {confirmDelete === prog.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => deleteProgram(prog.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg">Delete</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 text-xs bg-stone-200 rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(prog.id)} title="Delete"
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 text-sm border border-stone-300 rounded-xl hover:bg-stone-50 disabled:opacity-40">Previous</button>
          <span className="text-sm text-stone-500">Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(page + 1)}
            className="px-4 py-2 text-sm border border-stone-300 rounded-xl hover:bg-stone-50 disabled:opacity-40">Next</button>
        </div>
      )}

      {showCreate && (
        <CreateProgramModal products={products} editProgram={editingProgram}
          onClose={() => { setShowCreate(false); setEditingProgram(null); }}
          onSaved={() => { setShowCreate(false); setEditingProgram(null); onRefresh(); }}
          authHeaders={authHeaders} />
      )}
    </div>
  );
}

function CreateProgramModal({ products, editProgram, onClose, onSaved, authHeaders }: {
  products: Product[]; editProgram: RewardProgram | null;
  onClose: () => void; onSaved: () => void; authHeaders: () => Record<string, string>;
}) {
  const [form, setForm] = useState({
    name: editProgram?.name || '',
    description: editProgram?.description || '',
    triggerProductId: editProgram?.triggerProductId || '',
    requiredQuantity: String(editProgram?.requiredQuantity || '3'),
    rewardProductName: editProgram?.rewardProductName || '',
    rewardDescription: editProgram?.rewardDescription || '',
    expiryDate: editProgram?.expiryDate || '',
    maxTotalRedemptions: editProgram?.maxTotalRedemptions ? String(editProgram.maxTotalRedemptions) : '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.triggerProductId) e.triggerProductId = 'Select a trigger product';
    if (!form.requiredQuantity || parseInt(form.requiredQuantity) < 1) e.requiredQuantity = 'Must be at least 1';
    if (!form.rewardProductName.trim()) e.rewardProductName = 'Reward name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError('');
    const body: any = {
      name: form.name.trim(), description: form.description.trim(),
      triggerProductId: form.triggerProductId, requiredQuantity: parseInt(form.requiredQuantity),
      rewardProductName: form.rewardProductName.trim(), rewardDescription: form.rewardDescription.trim(),
      expiryDate: form.expiryDate || null,
      maxTotalRedemptions: form.maxTotalRedemptions ? parseInt(form.maxTotalRedemptions) : null,
    };
    if (editProgram) body.id = editProgram.id;
    try {
      const res = await fetch(`${API}/admin/rewards/programs.php`, {
        method: editProgram ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error || `Failed to save program (${res.status})`);
        setSaving(false);
        return;
      }
    } catch {
      setSubmitError('Network error');
      setSaving(false);
      return;
    }
    setSaving(false);
    onSaved();
  };

  const ic = (err?: string) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border ${err ? 'border-red-400 bg-red-50' : 'border-stone-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-amber-300 transition`;

  const field = (key: string, label: string, type = 'text', opts?: any) => (
    <div>
      <label htmlFor={`rp-${key}`} className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">{label} *</label>
      {type === 'select' ? (
        <select id={`rp-${key}`} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={ic(errors[key])}>
          <option value="">Select...</option>
          {opts?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea id={`rp-${key}`} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={3} className={`${ic(errors[key])} resize-none`} placeholder={opts?.placeholder} />
      ) : (
        <input id={`rp-${key}`} type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={ic(errors[key])} placeholder={opts?.placeholder} min={opts?.min} />
      )}
      {errors[key] && <p role="alert" className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-stone-900 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">
              {editProgram ? 'Edit Reward Program' : 'Create Reward Program'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">Define the trigger, requirement, and reward</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition p-1"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {field('name', 'Reward Name')}
          {field('description', 'Description', 'textarea', { placeholder: 'Describe this reward program...' })}
          {field('triggerProductId', 'Trigger Product', 'select',
            products.map(p => ({ value: p.id, label: p.name })))}
          {field('requiredQuantity', 'Required Quantity', 'number', { min: '1' })}
          {field('rewardProductName', 'Free Gift / Reward Product')}
          {field('rewardDescription', 'Reward Description', 'textarea', { placeholder: 'What the customer receives...' })}
          {field('expiryDate', 'Expiry Date', 'date')}
          {field('maxTotalRedemptions', 'Max Total Redemptions', 'number', { min: '1', placeholder: 'Unlimited' })}
          {submitError && (
            <p role="alert" className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} />{submitError}</p>
          )}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition flex items-center gap-2 disabled:opacity-60 uppercase tracking-wider">
              {saving ? <><Loader size={15} className="animate-spin" /> Saving...</> : editProgram ? 'Update Program' : 'Create Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
