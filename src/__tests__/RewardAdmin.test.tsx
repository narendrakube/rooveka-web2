import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RewardAdmin } from '../components/rewards/RewardAdmin';
import { Product } from '../types';

const baseProps = {
  authHeaders: () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer 1' }),
  onUnauthorized: vi.fn(),
  products: [
    { id: 'rooveka-70-dark', name: '70% Dark Chocolate', subtitle: '', shortDescription: 'x', fullDescription: 'x', category: 'Dark', sizes: [], ingredients: [], tastingNotes: [], bgTheme: 'cream', imageTag: 'dark' },
    { id: 'rooveka-50-dark', name: '50% Dark Chocolate', subtitle: '', shortDescription: 'x', fullDescription: 'x', category: 'Dark', sizes: [], ingredients: [], tastingNotes: [], bgTheme: 'cream', imageTag: 'dark' },
  ] as Product[],
};

const dashPayload = {
  success: true,
  reward: { id: 1, rewardName: 'Coffee Whisker', status: 'active', createdAt: '2026-01-01' },
  activeCoupons: 5,
  inactiveCoupons: 2,
  expiredCoupons: 1,
  totalCoupons: 8,
};

function makeFetch(overrides: Record<string, (body: any) => { ok: boolean; status: number; json: () => Promise<any> }> = {}) {
  return vi.fn(async (_url: any, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const handler = overrides[body.action];
    if (handler) return handler(body);
    return { ok: true, status: 200, json: () => Promise.resolve(dashPayload) };
  });
}

describe('RewardAdmin — status widget', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('shows a loading spinner before data arrives', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<RewardAdmin {...baseProps} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the active reward name and coupon status counts', async () => {
    vi.stubGlobal('fetch', makeFetch());
    render(<RewardAdmin {...baseProps} />);
    expect(await screen.findByText('Coffee Whisker')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2 redeemed · 1 expired · 8 total')).toBeInTheDocument();
  });

  it('shows an alert when no active coupons remain', async () => {
    vi.stubGlobal('fetch', makeFetch({
      get_dashboard_data: () => ({
        ok: true, status: 200,
        json: () => Promise.resolve({ ...dashPayload, activeCoupons: 0 }),
      }),
    }));
    render(<RewardAdmin {...baseProps} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Pool empty');
  });

  it('shows a fallback when no reward is configured', async () => {
    vi.stubGlobal('fetch', makeFetch({
      get_dashboard_data: () => ({
        ok: true, status: 200,
        json: () => Promise.resolve({ ...dashPayload, reward: null }),
      }),
    }));
    render(<RewardAdmin {...baseProps} />);
    expect(await screen.findByText('No reward configured yet')).toBeInTheDocument();
  });

  it('calls onUnauthorized when the API returns 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Authentication required' }) }));
    render(<RewardAdmin {...baseProps} onUnauthorized={baseProps.onUnauthorized} />);
    await waitFor(() => expect(baseProps.onUnauthorized).toHaveBeenCalled());
  });

  it('surfaces a fetch error as an alert', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({ error: 'DB down' }) }));
    render(<RewardAdmin {...baseProps} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('DB down');
  });
});

describe('RewardAdmin — generate coupon codes', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('lists existing products in the dropdown', async () => {
    vi.stubGlobal('fetch', makeFetch());
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');
    const select = screen.getByLabelText(/^Product Name/);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '70% Dark Chocolate' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50% Dark Chocolate' })).toBeInTheDocument();
  });

  it('sends generate_coupons with product, quantity and expiry, then shows success + codes', async () => {
    const fetchMock = makeFetch({
      generate_coupons: (body) => ({
        ok: true, status: 200,
        json: () => Promise.resolve({
          success: true, inserted: body.quantity, product: '70% Dark Chocolate',
          expiresAt: body.expiresAt, codes: ['CODEAAA00001', 'CODEAAA00002'],
          message: `Successfully generated ${body.quantity} codes for 70% Dark Chocolate!`,
        }),
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');

    fireEvent.change(screen.getByLabelText(/^Product Name/), { target: { value: 'rooveka-70-dark' } });
    fireEvent.change(screen.getByLabelText(/^Quantity/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/^Code Expiration Date/), { target: { value: '2026-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: /generate codes/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Successfully generated 2 codes for 70% Dark Chocolate!'));
    const call = fetchMock.mock.calls.find(([, init]: any[]) => (init?.body as string)?.includes?.('generate_coupons'));
    expect(call).toBeTruthy();
    expect(JSON.parse(call![1].body as string)).toEqual({
      action: 'generate_coupons', productId: 'rooveka-70-dark', quantity: 2, expiresAt: '2026-12-31',
    });

    // codes hidden until toggled
    expect(screen.queryByText('CODEAAA00001')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /show codes/i }));
    expect(screen.getByText('CODEAAA00001')).toBeInTheDocument();
    expect(screen.getByText('CODEAAA00002')).toBeInTheDocument();
  });

  it('blocks generation without a product selection', async () => {
    const fetchMock = makeFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');

    fireEvent.click(screen.getByRole('button', { name: /generate codes/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Select a product');
    expect(fetchMock.mock.calls.some(([, init]: any[]) => (init?.body as string)?.includes?.('generate_coupons'))).toBe(false);
  });

  it('blocks generation with an out-of-range quantity', async () => {
    vi.stubGlobal('fetch', makeFetch());
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');

    fireEvent.change(screen.getByLabelText(/^Product Name/), { target: { value: 'rooveka-70-dark' } });
    fireEvent.change(screen.getByLabelText(/^Quantity/), { target: { value: '0' } });
    const form = screen.getByRole('button', { name: /generate codes/i }).closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByRole('alert')).toHaveTextContent('Quantity must be between 1 and 500');
  });

  it('shows the server error when generation fails', async () => {
    vi.stubGlobal('fetch', makeFetch({
      generate_coupons: () => ({ ok: false, status: 400, json: () => Promise.resolve({ error: 'Unknown product: nope' }) }),
    }));
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');

    fireEvent.change(screen.getByLabelText(/^Product Name/), { target: { value: 'rooveka-70-dark' } });
    fireEvent.click(screen.getByRole('button', { name: /generate codes/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unknown product: nope');
  });
});

describe('RewardAdmin — set active reward', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('disables Update Item when the name is cleared', async () => {
    vi.stubGlobal('fetch', makeFetch());
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');
    const btn = screen.getByRole('button', { name: /update item/i });
    expect(btn).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Active reward name'), { target: { value: '   ' } });
    expect(btn).toBeDisabled();
  });

  it('sends update_reward with the new name and shows success', async () => {
    const fetchMock = makeFetch({
      update_reward: (body) => ({
        ok: true, status: 200,
        json: () => Promise.resolve({ success: true, message: `Active reward set to "${body.reward_name}"` }),
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');

    fireEvent.change(screen.getByLabelText('Active reward name'), { target: { value: 'Golden Spoon' } });
    fireEvent.click(screen.getByRole('button', { name: /update item/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Active reward set to "Golden Spoon"'));
    const updateCall = fetchMock.mock.calls.find(([, init]: any[]) => (init?.body as string)?.includes?.('update_reward'));
    expect(JSON.parse(updateCall![1].body as string)).toEqual({ action: 'update_reward', reward_name: 'Golden Spoon' });
  });

  it('shows the server error when update fails', async () => {
    vi.stubGlobal('fetch', makeFetch({
      update_reward: () => ({ ok: false, status: 400, json: () => Promise.resolve({ error: 'reward_name is required' }) }),
    }));
    render(<RewardAdmin {...baseProps} />);
    await screen.findByText('Coffee Whisker');

    fireEvent.change(screen.getByLabelText('Active reward name'), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: /update item/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('reward_name is required');
  });
});
