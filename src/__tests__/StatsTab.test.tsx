import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsTab } from '../components/rewards/StatsTab';
import { RewardStats } from '../types/rewards';

const sampleStats: RewardStats = {
  programs: { total: 5, active: 3 },
  codes: { total: 500, active: 400, redeemed: 60, expired: 30, cancelled: 10 },
  redemptions: {
    total: 42,
    qualified: 10,
    pendingChoice: 5,
    pendingFulfillment: 7,
    fulfilled: 12,
    redeemed: 6,
    cancelled: 1,
    expired: 1,
    deliveryCount: 25,
    shopCount: 17,
  },
  shop: { total: 17, completed: 9, pending: 8 },
};

const noop = { onRefresh: vi.fn(), authHeaders: () => ({}) };

describe('StatsTab', () => {
  it('shows loading state', () => {
    render(<StatsTab stats={null} loading={true} {...noop} />);
    expect(screen.queryByText('No stats available')).not.toBeInTheDocument();
  });

  it('shows empty state when stats are null', () => {
    render(<StatsTab stats={null} loading={false} {...noop} />);
    expect(screen.getByText('No stats available')).toBeInTheDocument();
  });

  it('renders overview heading when stats exist', () => {
    render(<StatsTab stats={sampleStats} loading={false} {...noop} />);
    expect(screen.getByText('Rewards Overview')).toBeInTheDocument();
  });

  it('renders aggregate card values', () => {
    render(<StatsTab stats={sampleStats} loading={false} {...noop} />);
    const cardValue = (label: string) =>
      screen.getByText(label).closest('div.bg-white')!.querySelector('p.text-2xl')!.textContent;

    expect(cardValue('Reward Programs')).toBe('5');
    expect(cardValue('Product Codes')).toBe('500');
    // Rewards Pending = pendingFulfillment(7) + pendingChoice(5)
    expect(cardValue('Rewards Pending')).toBe('12');
    // Rewards Fulfilled = fulfilled(12) + redeemed(6)
    expect(cardValue('Rewards Fulfilled')).toBe('18');
    // Expired / Cancelled = expired(1) + cancelled(1)
    expect(cardValue('Expired / Cancelled')).toBe('2');
    expect(cardValue('Shop Redemptions')).toBe('17');
  });

  it('renders fulfillment breakdown section', () => {
    render(<StatsTab stats={sampleStats} loading={false} {...noop} />);
    expect(screen.getByText('Fulfillment Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('Pending Choice')).toBeInTheDocument();
    expect(screen.getByText('Pending Fulfillment')).toBeInTheDocument();
    expect(screen.getByText('Fulfilled')).toBeInTheDocument();
  });

  it('calls onRefresh when Refresh is clicked', () => {
    render(<StatsTab stats={sampleStats} loading={false} {...noop} />);
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(noop.onRefresh).toHaveBeenCalledTimes(1);
  });
});
