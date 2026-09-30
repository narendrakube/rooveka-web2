import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgramsTab } from '../components/rewards/ProgramsTab';
import { RewardProgram } from '../types/rewards';
import { Product } from '../types';

const baseProps = {
  programs: [] as RewardProgram[],
  search: '',
  setSearch: vi.fn(),
  statusFilter: '',
  setStatusFilter: vi.fn(),
  page: 1,
  setPage: vi.fn(),
  total: 0,
  loading: false,
  onRefresh: vi.fn(),
  products: [] as Product[],
  showCreate: false,
  setShowCreate: vi.fn(),
  editingProgram: null as RewardProgram | null,
  setEditingProgram: vi.fn(),
  authHeaders: () => ({ 'Content-Type': 'application/json' }),
};

const sampleProgram: RewardProgram = {
  id: 1,
  name: 'Hot Chocolate Loyalty',
  description: 'Buy 3, get 1 free',
  triggerProductId: 'p1',
  triggerProductName: 'Hot Chocolate',
  requiredQuantity: 3,
  rewardProductName: 'Free Hot Chocolate',
  rewardDescription: 'One free drink',
  expiryDate: null,
  maxTotalRedemptions: null,
  currentRedemptions: 12,
  isActive: true,
  createdAt: '2026-01-01',
};

const sampleProduct = { id: 'p1', name: 'Hot Chocolate' } as Product;

function openCreateModal() {
  render(<ProgramsTab {...baseProps} showCreate={true} setShowCreate={vi.fn()} products={[sampleProduct]} />);
}

function submitEmptyForm() {
  fireEvent.click(submitButton());
}

function submitButton() {
  return screen.getAllByRole('button', { name: /create program/i }).find(b => b.getAttribute('type') === 'submit')!;
}


describe('ProgramsTab', () => {
  it('shows empty state when there are no programs', () => {
    render(<ProgramsTab {...baseProps} />);
    expect(screen.getByText('No reward programs yet')).toBeInTheDocument();
  });

  it('shows a loading spinner while loading', () => {
    render(<ProgramsTab {...baseProps} loading={true} />);
    expect(screen.queryByText('No reward programs yet')).not.toBeInTheDocument();
  });

  it('renders program name, trigger and reward details', () => {
    render(<ProgramsTab {...baseProps} programs={[sampleProgram]} total={1} />);
    expect(screen.getByText('Hot Chocolate Loyalty')).toBeInTheDocument();
    expect(screen.getByText('Hot Chocolate')).toBeInTheDocument();
    expect(screen.getByText('Free Hot Chocolate')).toBeInTheDocument();
    expect(screen.getByText(/12 redeemed/)).toBeInTheDocument();
  });

  it('renders pagination only when total exceeds page size (20)', () => {
    const { rerender } = render(<ProgramsTab {...baseProps} programs={[sampleProgram]} total={5} />);
    expect(screen.queryByText(/Page 1 of/)).not.toBeInTheDocument();
    rerender(<ProgramsTab {...baseProps} programs={[sampleProgram]} total={45} />);
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('calls setPage(2) when Next is clicked on page 1 of 3', () => {
    const setPage = vi.fn();
    render(<ProgramsTab {...baseProps} setPage={setPage} total={45} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it('disables Previous on the first page', () => {
    render(<ProgramsTab {...baseProps} page={1} total={45} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });
});

describe('CreateProgramModal validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a reward name', () => {
    openCreateModal();
    submitEmptyForm();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('requires a trigger product', () => {
    openCreateModal();
    submitEmptyForm();
    expect(screen.getByText('Select a trigger product')).toBeInTheDocument();
  });

  it('requires required quantity of at least 1', () => {
    openCreateModal();
    fireEvent.change(screen.getByLabelText(/required quantity/i), { target: { value: '0' } });
    fireEvent.submit(screen.getByLabelText(/required quantity/i).closest('form')!);
    expect(screen.getByText('Must be at least 1')).toBeInTheDocument();
  });

  it('requires a reward product name', () => {
    openCreateModal();
    submitEmptyForm();
    expect(screen.getByText('Reward name is required')).toBeInTheDocument();
  });

  it('submits a valid form without showing errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ProgramsTab
        {...baseProps}
        showCreate
        setShowCreate={vi.fn()}
        products={[sampleProduct]}
      />,
    );

    fireEvent.change(screen.getByLabelText(/reward name/i), { target: { value: 'Loyalty Reward' } });
    fireEvent.change(screen.getByLabelText(/trigger product/i), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText(/required quantity/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/free gift \/ reward product/i), { target: { value: 'Free Chocolate' } });

    fireEvent.click(submitButton());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/admin/rewards/programs.php');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.name).toBe('Loyalty Reward');
    expect(body.requiredQuantity).toBe(3);
    expect(body.triggerProductId).toBe('p1');
    expect(body.rewardProductName).toBe('Free Chocolate');
    vi.unstubAllGlobals();
  });

  it('trims whitespace from name fields before submit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ProgramsTab {...baseProps} showCreate setShowCreate={vi.fn()} products={[sampleProduct]} />,
    );

    fireEvent.change(screen.getByLabelText(/reward name/i), { target: { value: '  Padded Name  ' } });
    fireEvent.change(screen.getByLabelText(/trigger product/i), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText(/required quantity/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/free gift \/ reward product/i), { target: { value: '  Gift  ' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.name).toBe('Padded Name');
    expect(body.rewardProductName).toBe('Gift');
    vi.unstubAllGlobals();
  });

  it('surfaces the server error and does not report success when creation fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid trigger product' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ProgramsTab {...baseProps} showCreate setShowCreate={vi.fn()} products={[sampleProduct]} />);

    fireEvent.change(screen.getByLabelText(/reward name/i), { target: { value: 'Loyalty Reward' } });
    fireEvent.change(screen.getByLabelText(/trigger product/i), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText(/required quantity/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/free gift \/ reward product/i), { target: { value: 'Free Choc' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid trigger product'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('shows a network error when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<ProgramsTab {...baseProps} showCreate setShowCreate={vi.fn()} products={[sampleProduct]} />);

    fireEvent.change(screen.getByLabelText(/reward name/i), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText(/trigger product/i), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText(/required quantity/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/free gift \/ reward product/i), { target: { value: 'Y' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Network error'));
    vi.unstubAllGlobals();
  });
});
