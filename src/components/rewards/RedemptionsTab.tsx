import React, { useState } from 'react';
import { Search, Loader, Gift, X } from 'lucide-react';
import { RewardRedemption } from '../../types/rewards';
import { StatusBadge } from '../RewardManagement';

const API = 'http://localhost:8000/api';

interface Props {
  redemptions: RewardRedemption[];
  search: string; setSearch: (s: string) => void;
  statusFilter: string; setStatusFilter: (s: string) => void;
  page: number; setPage: (p: number) => void;
  total: number; loading: boolean;
  onRefresh: () => void;
  authHeaders: () => Record<string, string>;
}

export function RedemptionsTab({ redemptions, search, setSearch, statusFilter, setStatusFilter, page, setPage, total, loading, onRefresh, authHeaders }: Props) {
  const [selected, setSelected] = useState<RewardRedemption | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async (id: number) => {
    setCancelling(true);
    try {
      const res = await fetch(`${API}/admin/rewards/redemptions.php`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ id, status: 'cancelled' }),
      });
      if (res.ok) {
        onRefresh();
        setSelected(null);
      }
    } catch {}
    setCancelling(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-rooveka-dark">Reward Redemptions</h2>
          <p className="text-sm text-rooveka-muted mt-1">{total} redemption(s) total</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, customer, program..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300">
          <option value="">All Status</option>
          <option value="qualified">Qualified</option>
          <option value="pending_choice">Pending Choice</option>
          <option value="pending_fulfillment">Pending Fulfillment</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="redeemed">Redeemed</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-amber-500" /></div>
      ) : redemptions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-rooveka-border">
          <Gift size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 font-medium">No redemptions found</p>
          <p className="text-sm text-stone-400 mt-1">Redemptions will appear here when customers redeem rewards</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rooveka-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Reward Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Program</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Reward</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50 transition cursor-pointer" onClick={() => setSelected(r)}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-rooveka-dark">{r.customerRewardCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-700">{r.customerName}</p>
                      <p className="text-xs text-stone-400">{r.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{r.programName}</td>
                    <td className="px-4 py-3 text-stone-600">{r.rewardProductName}</td>
                    <td className="px-4 py-3 text-xs text-stone-500">{r.fulfillmentType ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-stone-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
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

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-rooveka-dark">Redemption Details</h3>
              <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-xs text-stone-400 mb-1">CUSTOMER REWARD CODE</p>
                <p className="font-mono text-lg font-bold text-rooveka-dark tracking-widest">{selected.customerRewardCode}</p>
              </div>
              {selected.shopVerificationCode && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs text-amber-600 mb-1">SHOP VERIFICATION CODE</p>
                  <p className="font-mono text-lg font-bold text-amber-700 tracking-widest">{selected.shopVerificationCode}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-stone-400 text-xs">Customer</span><p className="font-medium">{selected.customerName}</p></div>
                <div><span className="text-stone-400 text-xs">Email</span><p className="font-medium">{selected.customerEmail}</p></div>
                <div><span className="text-stone-400 text-xs">Program</span><p className="font-medium">{selected.programName}</p></div>
                <div><span className="text-stone-400 text-xs">Reward</span><p className="font-medium">{selected.rewardProductName}</p></div>
                <div><span className="text-stone-400 text-xs">Fulfillment Type</span><p className="font-medium">{selected.fulfillmentType ?? '—'}</p></div>
                <div><span className="text-stone-400 text-xs">Shop</span><p className="font-medium">{selected.shopName || '—'}</p></div>
                <div><span className="text-stone-400 text-xs">Status</span><p><StatusBadge status={selected.status} /></p></div>
                <div><span className="text-stone-400 text-xs">Created</span><p className="font-medium">{new Date(selected.createdAt).toLocaleString()}</p></div>
                {selected.verifiedAt && <div><span className="text-stone-400 text-xs">Verified</span><p className="font-medium">{new Date(selected.verifiedAt).toLocaleString()}</p></div>}
                {selected.handoverAt && <div><span className="text-stone-400 text-xs">Handed Over</span><p className="font-medium">{new Date(selected.handoverAt).toLocaleString()}</p></div>}
              </div>
              {(selected.status === 'qualified' || selected.status === 'pending_choice') && (
                <div className="pt-3 border-t border-stone-100">
                  <button disabled={cancelling} onClick={() => handleCancel(selected.id)}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {cancelling ? <><Loader size={14} className="animate-spin" /> Cancelling...</> : 'Cancel Reward'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
