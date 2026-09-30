import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RewardManagement } from '../components/RewardManagement';

const okJson = (data: any) => ({ ok: true, status: 200, json: () => Promise.resolve(data) });

describe('RewardManagement auth gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows the admin login gate when no token is stored', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({}));
    vi.stubGlobal('fetch', fetchMock);

    render(<RewardManagement embedded />);
    expect(await screen.findByText('Admin Sign In')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('does not show the login gate when a token exists', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    const fetchMock = vi.fn().mockResolvedValue(okJson({ programs: [], total: 0 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<RewardManagement embedded />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText('Admin Sign In')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('opens the login gate when the API returns 401 (stale token)', async () => {
    localStorage.setItem('rooveka_admin_token', '999');
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Authentication required' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<RewardManagement embedded />);
    expect(await screen.findByText('Admin Sign In')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
