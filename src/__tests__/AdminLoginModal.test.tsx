import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminLoginModal } from '../components/rewards/AdminLoginModal';

describe('AdminLoginModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email and password fields with admin email prefilled', () => {
    render(<AdminLoginModal onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toHaveValue('admin@rooveka.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
  });

  it('disables submit while password is empty', () => {
    render(<AdminLoginModal onSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('stores admin token and calls onSuccess on valid admin login', async () => {
    const onSuccess = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, token: '1', user: { id: 1, role: 'admin', name: 'Admin' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AdminLoginModal onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('rooveka_admin_token')).toBe('1');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/auth/login.php');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'admin@rooveka.com', password: 'admin123' });
    vi.unstubAllGlobals();
  });

  it('rejects non-admin accounts', async () => {
    const onSuccess = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, token: '5', user: { id: 5, role: 'shop' } }),
    }));

    render(<AdminLoginModal onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'shop123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Admin access required'));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(localStorage.getItem('rooveka_admin_token')).toBeNull();
    vi.unstubAllGlobals();
  });

  it('shows server error for invalid credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid email or password' }),
    }));

    render(<AdminLoginModal onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password'));
    vi.unstubAllGlobals();
  });

  it('shows network error when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<AdminLoginModal onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Network error'));
    vi.unstubAllGlobals();
  });
});
