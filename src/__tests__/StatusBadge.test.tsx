import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, STATUS_COLORS } from '../components/RewardManagement';

describe('STATUS_COLORS', () => {
  it('contains a color mapping for every reward/coupon status used by the module', () => {
    const expectedStatuses = [
      'generated', 'active', 'redeemed', 'expired', 'cancelled',
      'qualified', 'pending_choice', 'pending_fulfillment',
      'fulfilled', 'delivered', 'shop_collection', 'delivery',
    ];
    for (const status of expectedStatuses) {
      expect(STATUS_COLORS[status], `missing color for "${status}"`).toBeTruthy();
    }
  });

});

describe('StatusBadge', () => {
  it('renders snake_case status as title case', () => {
    render(<StatusBadge status="pending_fulfillment" />);
    expect(screen.getByText('Pending Fulfillment')).toBeInTheDocument();
  });

  it('applies the mapped color classes for a known status', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText('Active');
    expect(badge.className).toContain('bg-emerald-100');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('falls back to default stone colors for an unknown status', () => {
    render(<StatusBadge status="mystery_status" />);
    const badge = screen.getByText('Mystery Status');
    expect(badge.className).toContain('bg-stone-100');
    expect(badge.className).toContain('text-stone-500');
  });

  it('capitalizes every word in a multi-word status', () => {
    render(<StatusBadge status="shop_collection" />);
    expect(screen.getByText('Shop Collection')).toBeInTheDocument();
  });

  it('renders a single-word status unchanged', () => {
    render(<StatusBadge status="qualified" />);
    expect(screen.getByText('Qualified')).toBeInTheDocument();
  });

  it('renders a cancelled status with red styling', () => {
    render(<StatusBadge status="cancelled" />);
    const badge = screen.getByText('Cancelled');
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-600');
  });
});
