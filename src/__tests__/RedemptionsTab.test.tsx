import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RedemptionsTab } from '../components/rewards/RedemptionsTab';
import { RewardRedemption } from '../types/rewards';

const baseProps = {
  redemptions: [] as RewardRedemption[],
  search: '',
  setSearch: vi.fn(),
  statusFilter: '',
  setStatusFilter: vi.fn(),
  page: 1,
  setPage: vi.fn(),
  total: 0,
  loading: false,
  onRefresh: vi.fn(),
  authHeaders: () => ({ 'Content-Type': 'application/json' }),
};

const sample: RewardRedemption = {
  id: 10,
  redemptionUid: 'uid-10',
  customerId: 1,
  customerName: 'Priya Sharma',
  customerEmail: 'priya@example.com',
  rewardProgramId: 1,
  programName: 'Hot Chocolate Loyalty',
  rewardProductName: 'Free Hot Chocolate',
  customerRewardCode: 'RWCR-ABC123',
  shopVerificationCode: 'SHOP-XYZ789',
  fulfillmentType: 'shop_collection',
  status: 'pending_choice',
  shopName: '',
  verifiedAt: null,
  handoverAt: null,
  createdAt: '2026-02-10T12:00:00Z',
};

describe('RedemptionsTab', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows empty state when there are no redemptions', () => {
    render(<RedemptionsTab {...baseProps} />);
    expect(screen.getByText('No redemptions found')).toBeInTheDocument();
  });

  it('renders redemption row with code, customer and program', () => {
    render(<RedemptionsTab {...baseProps} redemptions={[sample]} total={1} />);
    expect(screen.getByText('RWCR-ABC123')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('priya@example.com')).toBeInTheDocument();
    expect(screen.getByText('Hot Chocolate Loyalty')).toBeInTheDocument();
    const row = screen.getByText('RWCR-ABC123').closest('tr')!;
    expect(within(row).getByText('Pending Choice')).toBeInTheDocument();
  });

  it('opens details modal with reward and shop codes when a row is clicked', () => {
    render(<RedemptionsTab {...baseProps} redemptions={[sample]} total={1} />);
    fireEvent.click(screen.getByText('RWCR-ABC123').closest('tr')!);
    const modal = screen.getByText('Redemption Details').closest('div.bg-white') as HTMLElement;
    expect(within(modal).getByText('SHOP-XYZ789')).toBeInTheDocument();
    expect(within(modal).getByText('Free Hot Chocolate')).toBeInTheDocument();
  });

  it('hides the shop verification code block when none exists', () => {
    render(
      <RedemptionsTab
        {...baseProps}
        redemptions={[{ ...sample, shopVerificationCode: null, fulfillmentType: null }]}
        total={1}
      />,
    );
    fireEvent.click(screen.getByText('RWCR-ABC123').closest('tr')!);
    expect(screen.queryByText('SHOP VERIFICATION CODE')).not.toBeInTheDocument();
  });

  it('offers Cancel Reward only for cancellable statuses (qualified/pending_choice)', () => {
    const first = render(<RedemptionsTab {...baseProps} redemptions={[sample]} total={1} />);
    fireEvent.click(screen.getByText('RWCR-ABC123').closest('tr')!);
    expect(screen.getByRole('button', { name: /cancel reward/i })).toBeInTheDocument();
    first.unmount();

    render(<RedemptionsTab {...baseProps} redemptions={[{ ...sample, status: 'fulfilled' }]} total={1} />);
    fireEvent.click(screen.getByText('RWCR-ABC123').closest('tr')!);
    expect(screen.getByText('Redemption Details')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel reward/i })).not.toBeInTheDocument();
  });

  it('PATCHes status cancelled and refreshes on cancel confirm', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);
    const onRefresh = vi.fn();

    render(<RedemptionsTab {...baseProps} redemptions={[sample]} total={1} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByText('RWCR-ABC123').closest('tr')!);
    fireEvent.click(screen.getByRole('button', { name: /cancel reward/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/admin/rewards/redemptions.php');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ id: 10, status: 'cancelled' });
    await waitFor(() => expect(onRefresh).toHaveBeenCalled());
    vi.unstubAllGlobals();
  });

  it('keeps the modal open when the cancel request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);
    const onRefresh = vi.fn();

    render(<RedemptionsTab {...baseProps} redemptions={[sample]} total={1} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByText('RWCR-ABC123').closest('tr')!);
    fireEvent.click(screen.getByRole('button', { name: /cancel reward/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(onRefresh).not.toHaveBeenCalled();
    expect(screen.getByText('Redemption Details')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
