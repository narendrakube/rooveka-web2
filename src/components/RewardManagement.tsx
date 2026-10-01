import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift, Ticket, Trophy, BarChart3, Plus, Search, Loader, XCircle,
  AlertCircle, Trash2, Edit3, Power, Package, Hash, TrendingUp,
  Calendar, Eye, X,
} from 'lucide-react';
import { Product, Category } from '../types';
import { RewardProgram, ProductCode, RewardRedemption, RewardStats } from '../types/rewards';
import { ProgramsTab } from './rewards/ProgramsTab';
import { CodesTab } from './rewards/CodesTab';
import { RedemptionsTab } from './rewards/RedemptionsTab';
import { StatsTab } from './rewards/StatsTab';
import { RewardAdmin } from './rewards/RewardAdmin';
import { AdminLoginModal } from './rewards/AdminLoginModal';

const API = 'http://localhost:8000/api';

export const STATUS_COLORS: Record<string, string> = {
  generated: 'bg-stone-100 text-stone-600',
  active: 'bg-emerald-100 text-emerald-700',
  redeemed: 'bg-blue-100 text-blue-700',
  expired: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-600',
  qualified: 'bg-purple-100 text-purple-700',
  pending_choice: 'bg-yellow-100 text-yellow-700',
  pending_fulfillment: 'bg-blue-100 text-blue-700',
  fulfilled: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-teal-100 text-teal-700',
  shop_collection: 'bg-indigo-100 text-indigo-700',
  delivery: 'bg-cyan-100 text-cyan-700',
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${STATUS_COLORS[status] || 'bg-stone-100 text-stone-500'}`}>
      {label}
    </span>
  );
}

interface Props {
  onClose?: () => void;
  embedded?: boolean;
}

export const RewardManagement: React.FC<Props> = ({ onClose, embedded }) => {
  const [tab, setTab] = useState<'programs' | 'codes' | 'redemptions' | 'stats' | 'gift'>('programs');
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<RewardProgram[]>([]);
  const [codes, setCodes] = useState<ProductCode[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [editingProgram, setEditingProgram] = useState<RewardProgram | null>(null);
  const [showGenerateCodes, setShowGenerateCodes] = useState(false);
  const [showCodeDetails, setShowCodeDetails] = useState<ProductCode | null>(null);
  const [needAuth, setNeedAuth] = useState(() => !localStorage.getItem('rooveka_admin_token'));

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('rooveka_admin_token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }, []);

  const handleUnauthorized = () => setNeedAuth(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products.php?admin=1`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch { /* fallback */ }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories.php`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch { /* fallback */ }
  };

  const fetchPrograms = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API}/admin/rewards/programs.php?${params}`, { headers: authHeaders() });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
        setTotal(data.total || 0);
      }
    } catch { /* silent */ }
  };

  const fetchCodes = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API}/admin/codes/generate.php?${params}`, { headers: authHeaders() });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) {
        const data = await res.json();
        setCodes(data.codes || []);
        setTotal(data.total || 0);
      }
    } catch { /* silent */ }
  };

  const fetchRedemptions = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API}/admin/rewards/redemptions.php?${params}`, { headers: authHeaders() });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) {
        const data = await res.json();
        setRedemptions(data.redemptions || []);
        setTotal(data.total || 0);
      }
    } catch { /* silent */ }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/admin/rewards/stats.php`, { headers: authHeaders() });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (res.ok) { setStats(await res.json()); }
    } catch { /* silent */ }
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchCategories()]).then(() => {
      if (tab === 'programs') return fetchPrograms();
      if (tab === 'codes') return fetchCodes();
      if (tab === 'redemptions') return fetchRedemptions();
      if (tab === 'stats') return fetchStats();
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [tab, page, search, statusFilter]);

  useEffect(() => { setPage(1); }, [tab, search, statusFilter]);

  const sharedProps = { search, setSearch, statusFilter, setStatusFilter, page, setPage, total, loading, authHeaders };

  const content = (
    <>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {([
          { key: 'programs', label: 'Reward Programs', icon: Trophy },
          { key: 'codes', label: 'Coupon Codes', icon: Ticket },
          { key: 'redemptions', label: 'Redemptions', icon: Gift },
          { key: 'gift', label: 'Gift Pool', icon: Package },
          { key: 'stats', label: 'Dashboard', icon: BarChart3 },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-lg border-b-2 transition ${
              tab === t.key ? 'border-rooveka-gold text-rooveka-gold bg-rooveka-gold/10' : 'border-transparent text-rooveka-muted hover:text-rooveka-dark'
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-4">
        {tab === 'programs' && (
          <ProgramsTab {...sharedProps} programs={programs} onRefresh={fetchPrograms} products={products}
            showCreate={showCreateProgram} setShowCreate={setShowCreateProgram}
            editingProgram={editingProgram} setEditingProgram={setEditingProgram} />
        )}
        {tab === 'codes' && (
          <CodesTab {...sharedProps} codes={codes} onRefresh={fetchCodes} products={products}
            showGenerate={showGenerateCodes} setShowGenerate={setShowGenerateCodes}
            codeDetails={showCodeDetails} setCodeDetails={setShowCodeDetails} />
        )}
        {tab === 'redemptions' && (
          <RedemptionsTab {...sharedProps} redemptions={redemptions} onRefresh={fetchRedemptions} />
        )}
        {tab === 'gift' && (
          <RewardAdmin authHeaders={authHeaders} onUnauthorized={handleUnauthorized} products={products} />
        )}
        {tab === 'stats' && (
          <StatsTab stats={stats} loading={loading} onRefresh={fetchStats} authHeaders={authHeaders} />
        )}
      </div>

      {needAuth && (
        <AdminLoginModal onSuccess={() => { setNeedAuth(false); loadData(); }} />
      )}
    </>
  );

  if (embedded) {
    return <div className="animate-fade-in">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-rooveka-cream">
      <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Gift size={20} className="text-stone-900" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">Reward & Coupon Management</h1>
            <p className="text-xs text-stone-400">Manage reward programs, generate codes, track redemptions</p>
          </div>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-white transition p-2 rounded-lg hover:bg-stone-800">
          <XCircle size={22} />
        </button>
      </div>

      <div className="flex items-center gap-1 px-6 bg-stone-900 border-b border-stone-700 flex-shrink-0">
        {([
          { key: 'programs', label: 'Reward Programs', icon: Trophy },
          { key: 'codes', label: 'Coupon Codes', icon: Ticket },
          { key: 'redemptions', label: 'Redemptions', icon: Gift },
          { key: 'gift', label: 'Gift Pool', icon: Package },
          { key: 'stats', label: 'Dashboard', icon: BarChart3 },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              tab === t.key ? 'border-amber-400 text-amber-400' : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {content}
      </div>
    </div>
  );
};
