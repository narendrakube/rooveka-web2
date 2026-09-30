import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CodesTab } from '../components/rewards/CodesTab';
import { ProductCode } from '../types/rewards';
import { Product } from '../types';

const baseProps = {
  codes: [] as ProductCode[],
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
  showGenerate: false,
  setShowGenerate: vi.fn(),
  codeDetails: null as ProductCode | null,
  setCodeDetails: vi.fn(),
  authHeaders: () => ({ 'Content-Type': 'application/json' }),
};

const sampleCode: ProductCode = {
  id: 1,
  code: 'ABCD2345EFGH',
  productId: 'p1',
  productName: 'Dark Chocolate Bar',
  batchLabel: 'JAN-2026',
  status: 'active',
  assignedCustomerId: null,
  redeemedAt: null,
  expiresAt: null,
  createdAt: '2026-01-15T10:00:00Z',
};

const products = [{ id: 'p1', name: 'Dark Chocolate Bar' }] as Product[];


function submitButton() {
  return screen.getAllByRole('button', { name: /generate codes/i }).find(b => b.getAttribute('type') === 'submit')!;
}

describe('CodesTab', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows empty state when no codes exist', () => {
    render(<CodesTab {...baseProps} />);
    expect(screen.getByText('No codes generated yet')).toBeInTheDocument();
  });

  it('renders code, product, batch and status in the table', () => {
    render(<CodesTab {...baseProps} codes={[sampleCode]} total={1} />);
    expect(screen.getByText('ABCD2345EFGH')).toBeInTheDocument();
    expect(screen.getByText('Dark Chocolate Bar')).toBeInTheDocument();
    expect(screen.getByText('JAN-2026')).toBeInTheDocument();
    const row = screen.getByText('ABCD2345EFGH').closest('tr')!;
    expect(within(row).getByText('Active')).toBeInTheDocument();
  });

  it('opens the details modal when Details is clicked', () => {
    const setCodeDetails = vi.fn();
    render(<CodesTab {...baseProps} codes={[sampleCode]} total={1} setCodeDetails={setCodeDetails} />);
    fireEvent.click(screen.getByTitle('Details'));
    expect(setCodeDetails).toHaveBeenCalledWith(sampleCode);
  });

  it('copies the code to clipboard when Copy is clicked', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodesTab {...baseProps} codes={[sampleCode]} total={1} />);
    fireEvent.click(screen.getByTitle('Copy code'));
    expect(writeText).toHaveBeenCalledWith('ABCD2345EFGH');
  });
});

describe('GenerateCodesModal validation', () => {
  beforeEach(() => vi.clearAllMocks());

  function openModal() {
    render(<CodesTab {...baseProps} showGenerate products={products} />);
  }

  it('rejects submission when no product is selected', () => {
    openModal();
    fireEvent.click(submitButton());
    expect(screen.getByRole('alert')).toHaveTextContent('Select a product');
  });

  it('rejects quantity below 1', () => {
    openModal();
    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '0' } });
    fireEvent.submit(screen.getByLabelText(/quantity/i).closest('form')!);
    expect(screen.getByRole('alert')).toHaveTextContent('Quantity must be at least 1');
  });

  it('posts correct payload on valid submission', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ generated: 2, batchLabel: 'FEB-2026', codes: [{ code: 'AAA1' }, { code: 'BBB2' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    openModal();

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText(/batch label/i), { target: { value: 'FEB-2026' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '2' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/admin/codes/generate.php');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({
      productId: 'p1',
      batchLabel: 'FEB-2026',
      quantity: 2,
      status: 'active',
    });
    await waitFor(() => expect(screen.getByText('2 codes generated!')).toBeInTheDocument());
    vi.unstubAllGlobals();
  });

  it('surfaces a server error message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Product not found' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    openModal();

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: 'p1' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Product not found'));
    vi.unstubAllGlobals();
  });

  it('shows network error when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    openModal();

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: 'p1' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Network error'));
    vi.unstubAllGlobals();
  });
});
