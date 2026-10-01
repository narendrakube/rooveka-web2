import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCatalogTab } from '../components/ProductCatalogTab';
import { Product } from '../types';

const makeProduct = (overrides: Partial<Product>): Product => ({
  id: 'p1',
  name: 'Dark Chocolate 70%',
  subtitle: 'Single origin',
  shortDescription: 'Rich dark bar',
  fullDescription: 'Rich dark bar',
  category: 'Dark Chocolate',
  sizes: [{ label: '100g', price: 250 }],
  ingredients: [],
  tastingNotes: [],
  bgTheme: 'cream-beige',
  imageTag: 'dark',
  sku: 'SKU-1',
  status: 'Active',
  tags: [],
  ...overrides,
});

const activeProd = makeProduct({ id: 'p1', name: 'Active Bar' });
const inactiveProd = makeProduct({ id: 'p2', name: 'Retired Bar', status: 'Inactive', sku: 'SKU-2' });

const baseProps = {
  loading: false,
  onRefresh: vi.fn(),
  onAddProduct: vi.fn(),
};

describe('ProductCatalogTab', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all products when status filter is All', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    expect(screen.getByText('Active Bar')).toBeInTheDocument();
    expect(screen.getByText('Retired Bar')).toBeInTheDocument();
    expect(screen.getByText(/2 products in the store/)).toBeInTheDocument();
  });

  it('shows the inactive count in the header', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    expect(screen.getByText(/· 1 inactive/)).toBeInTheDocument();
  });

  it('filters to inactive products only', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'Inactive' } });
    expect(screen.getByText('Retired Bar')).toBeInTheDocument();
    expect(screen.queryByText('Active Bar')).not.toBeInTheDocument();
  });

  it('filters to active products only', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'Active' } });
    expect(screen.getByText('Active Bar')).toBeInTheDocument();
    expect(screen.queryByText('Retired Bar')).not.toBeInTheDocument();
  });

  it('shows empty state when a status filter matches nothing', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd]} />);
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'Inactive' } });
    expect(screen.getByText('No inactive products')).toBeInTheDocument();
  });

  it('disables Delete Inactive when there are no inactive products', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd]} />);
    expect(screen.getByRole('button', { name: /delete inactive/i })).toBeDisabled();
  });

  it('shows loading spinner instead of grid', () => {
    render(<ProductCatalogTab {...baseProps} products={[]} loading={true} />);
    expect(screen.queryByText(/products in the store/)).toBeInTheDocument();
    expect(screen.queryByText('No products yet')).not.toBeInTheDocument();
  });

  it('opens the confirmation modal showing the inactive count', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    fireEvent.click(screen.getByRole('button', { name: /delete inactive/i }));
    expect(screen.getByText('Delete Inactive Products')).toBeInTheDocument();
    expect(screen.getByText(/Permanently delete/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete 1 product/i })).toBeInTheDocument();
  });

  it('cancel closes the modal without any request', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    fireEvent.click(screen.getByRole('button', { name: /delete inactive/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Delete Inactive Products')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('sends DELETE with inactiveOnly and admin token on confirm', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ success: true, deleted: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
    const onRefresh = vi.fn();

    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: /delete inactive/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete 1 product/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/products.php');
    expect(options.method).toBe('DELETE');
    expect(options.headers.Authorization).toBe('Bearer 1');
    expect(JSON.parse(options.body)).toEqual({ inactiveOnly: true });

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 inactive product deleted'));
    expect(onRefresh).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('pluralizes the success message for multiple deletions', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ success: true, deleted: 3 }) }));

    render(<ProductCatalogTab {...baseProps} products={[inactiveProd, { ...inactiveProd, id: 'p3' }, { ...inactiveProd, id: 'p4' }]} />);
    fireEvent.click(screen.getByRole('button', { name: /delete inactive/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete 3 products/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('3 inactive products deleted'));
    vi.unstubAllGlobals();
  });

  it('opens the admin login gate when the request returns 401', async () => {
    localStorage.removeItem('rooveka_admin_token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Authentication required' }) }));

    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    fireEvent.click(screen.getByRole('button', { name: /delete inactive/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete 1 product/i }));

    expect(await screen.findByText('Admin Sign In')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('shows the server error and keeps the modal open on failure', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({ error: 'Failed to delete products' }) }));

    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    fireEvent.click(screen.getByRole('button', { name: /delete inactive/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete 1 product/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to delete products'));
    expect(screen.getByText('Delete Inactive Products')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('shows a network error when the API is unreachable', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    fireEvent.click(screen.getByRole('button', { name: /delete inactive/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete 1 product/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Network error'));
    vi.unstubAllGlobals();
  });

  it('calls onAddProduct when Add Product is clicked', () => {
    const onAddProduct = vi.fn();
    render(<ProductCatalogTab {...baseProps} products={[]} onAddProduct={onAddProduct} />);
    fireEvent.click(screen.getByRole('button', { name: /add product/i }));
    expect(onAddProduct).toHaveBeenCalledTimes(1);
  });
});

describe('ProductCatalogTab — status toggle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows Mark Inactive on active products and Mark Active on inactive ones', () => {
    render(<ProductCatalogTab {...baseProps} products={[activeProd, inactiveProd]} />);
    expect(screen.getByRole('button', { name: /mark inactive/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark active/i })).toBeInTheDocument();
  });

  it('toggles an active product to Inactive with admin token', async () => {
    localStorage.setItem('rooveka_admin_token', '7');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ success: true, id: 'p1', status: 'Inactive' }) });
    vi.stubGlobal('fetch', fetchMock);
    const onRefresh = vi.fn();

    render(<ProductCatalogTab {...baseProps} products={[activeProd]} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: /mark inactive/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/products.php');
    expect(options.method).toBe('PUT');
    expect(options.headers.Authorization).toBe('Bearer 7');
    expect(JSON.parse(options.body)).toEqual({ id: 'p1', status: 'Inactive' });

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Active Bar is now Inactive'));
    expect(onRefresh).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('toggles an inactive product back to Active', async () => {
    localStorage.setItem('rooveka_admin_token', '7');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ success: true, id: 'p2', status: 'Active' }) });
    vi.stubGlobal('fetch', fetchMock);
    const onRefresh = vi.fn();

    render(<ProductCatalogTab {...baseProps} products={[inactiveProd]} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: /mark active/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ id: 'p2', status: 'Active' });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Retired Bar is now Active'));
    expect(onRefresh).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('opens the admin login gate on 401 while toggling', async () => {
    localStorage.removeItem('rooveka_admin_token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Authentication required' }) }));

    render(<ProductCatalogTab {...baseProps} products={[activeProd]} />);
    fireEvent.click(screen.getByRole('button', { name: /mark inactive/i }));

    expect(await screen.findByText('Admin Sign In')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('shows the server error when the status update fails', async () => {
    localStorage.setItem('rooveka_admin_token', '7');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({ error: 'Failed to update status' }) }));

    render(<ProductCatalogTab {...baseProps} products={[activeProd]} />);
    fireEvent.click(screen.getByRole('button', { name: /mark inactive/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to update status'));
    vi.unstubAllGlobals();
  });
});
