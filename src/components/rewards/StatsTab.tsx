import React from 'react';
import { Trophy, Ticket, Gift, TrendingUp, Truck, ShoppingBag, Clock, CheckCircle2, XCircle, Ban, RefreshCw } from 'lucide-react';
import { RewardStats } from '../../types/rewards';

interface Props {
  stats: RewardStats | null;
  loading: boolean;
  onRefresh: () => void;
  authHeaders: () => Record<string, string>;
}

interface StatCard {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  badge: string;
  badgeBg: string;
}

export function StatsTab({ stats, loading, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-rooveka-border">
        <Trophy size={40} className="mx-auto text-stone-300 mb-3" />
        <p className="text-stone-500 font-medium">No stats available</p>
        <p className="text-sm text-stone-400 mt-1">Stats will appear once you have reward data</p>
      </div>
    );
  }

  const cards: StatCard[] = [
    {
      label: 'Reward Programs',
      value: stats.programs.total,
      sub: `${stats.programs.active} active`,
      icon: <Trophy size={20} />,
      iconBg: 'bg-amber-100 text-amber-600',
      badge: `${stats.programs.active} active`,
      badgeBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Product Codes',
      value: stats.codes.total,
      sub: `${stats.codes.active} active, ${stats.codes.redeemed} redeemed`,
      icon: <Ticket size={20} />,
      iconBg: 'bg-blue-100 text-blue-600',
      badge: `${stats.codes.active} active`,
      badgeBg: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Rewards Generated',
      value: stats.redemptions.total,
      sub: `${stats.redemptions.qualified} qualified`,
      icon: <Gift size={20} />,
      iconBg: 'bg-purple-100 text-purple-600',
      badge: `${stats.redemptions.total} total`,
      badgeBg: 'bg-purple-100 text-purple-700',
    },
    {
      label: 'Rewards Pending',
      value: stats.redemptions.pendingFulfillment + stats.redemptions.pendingChoice,
      sub: `${stats.redemptions.pendingFulfillment} fulfillment, ${stats.redemptions.pendingChoice} choice`,
      icon: <Clock size={20} />,
      iconBg: 'bg-orange-100 text-orange-600',
      badge: `${stats.redemptions.pendingFulfillment + stats.redemptions.pendingChoice} pending`,
      badgeBg: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Rewards Fulfilled',
      value: stats.redemptions.fulfilled + stats.redemptions.redeemed,
      sub: `${stats.redemptions.fulfilled} fulfilled, ${stats.redemptions.redeemed} redeemed`,
      icon: <CheckCircle2 size={20} />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      badge: `${stats.redemptions.fulfilled + stats.redemptions.redeemed} done`,
      badgeBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Shop Redemptions',
      value: stats.shop.total,
      sub: `${stats.shop.completed} completed, ${stats.shop.pending} pending`,
      icon: <ShoppingBag size={20} />,
      iconBg: 'bg-teal-100 text-teal-600',
      badge: `${stats.shop.completed} completed`,
      badgeBg: 'bg-teal-100 text-teal-700',
    },
    {
      label: 'Delivery Redemptions',
      value: stats.redemptions.deliveryCount,
      sub: `${stats.redemptions.deliveryCount} deliveries`,
      icon: <Truck size={20} />,
      iconBg: 'bg-indigo-100 text-indigo-600',
      badge: `${stats.redemptions.deliveryCount} deliveries`,
      badgeBg: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Expired / Cancelled',
      value: stats.redemptions.expired + stats.redemptions.cancelled,
      sub: `${stats.redemptions.expired} expired, ${stats.redemptions.cancelled} cancelled`,
      icon: <Ban size={20} />,
      iconBg: 'bg-red-100 text-red-600',
      badge: `${stats.redemptions.expired + stats.redemptions.cancelled} closed`,
      badgeBg: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-rooveka-dark">Rewards Overview</h2>
          <p className="text-sm text-rooveka-muted mt-1">Key metrics across all reward programs</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-sm rounded-xl transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-rooveka-border p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${card.badgeBg}`}>
                {card.badge}
              </span>
            </div>
            <p className="text-2xl font-bold text-rooveka-dark font-serif">{card.value}</p>
            <p className="text-sm font-medium text-stone-600 mt-1">{card.label}</p>
            {card.sub && <p className="text-xs text-stone-400 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-rooveka-border p-5">
        <h3 className="font-serif font-bold text-rooveka-dark mb-4">Fulfillment Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Qualified</p>
            <p className="text-lg font-bold text-rooveka-dark">{stats.redemptions.qualified}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Pending Choice</p>
            <p className="text-lg font-bold text-orange-600">{stats.redemptions.pendingChoice}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Pending Fulfillment</p>
            <p className="text-lg font-bold text-amber-600">{stats.redemptions.pendingFulfillment}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Fulfilled</p>
            <p className="text-lg font-bold text-emerald-600">{stats.redemptions.fulfilled}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
