import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act, cleanup } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../context/CartContext';
import { INITIAL_SAMPLE_ORDERS } from '../data/sampleOrders';
import { OrderRecord } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const DB_ORDER: OrderRecord = {
  orderId: 'ROOV-555111',
  createdAt: '30 Sep 2026, 08:00 PM',
  customerName: 'DB Customer',
  email: 'db@rooveka.com',
  phone: '9848012345',
  address: '12 Main Road',
  city: 'Vijayawada',
  pincode: '530001',
  state: 'Andhra Pradesh',
  paymentMethod: 'cod',
  items: [],
  subtotal: 100,
  shippingCost: 99,
  totalAmount: 199,
  status: 'Pending',
};

type FetchCall = { url: string; init?: RequestInit };

let calls: FetchCall[] = [];

const stubFetch = (ordersHandler: (init?: RequestInit) => { ok: boolean; status: number; json: () => Promise<unknown> }) => {
  calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown, init?: RequestInit) => {
      const u = String(url);
      calls.push({ url: u, init });
      if (u.includes('/orders.php')) {
        return ordersHandler(init) as Response;
      }
      if (u.includes('/products.php')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      return { ok: true, status: 200, json: async () => [] } as Response;
    })
  );
};

const orderCalls = () => calls.filter((c) => c.url.includes('/orders.php'));

describe('CartContext — orders backend sync', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('fetches DB orders with the admin token on mount', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    stubFetch(() => ({ ok: true, status: 200, json: async () => [DB_ORDER] }));

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.orders).toHaveLength(1));
    expect(result.current.orders[0].orderId).toBe('ROOV-555111');

    const ordersCall = orderCalls()[0];
    expect((ordersCall.init?.headers as Record<string, string>).Authorization).toBe('Bearer 1');
  });

  it('keeps local sample orders when no admin token exists', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => [DB_ORDER] }));

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(calls.some((c) => c.url.includes('products.php'))).toBe(true));
    expect(orderCalls()).toHaveLength(0);
    expect(result.current.orders).toEqual(INITIAL_SAMPLE_ORDERS);
  });

  it('does not replace local orders when the API returns 401', async () => {
    localStorage.setItem('rooveka_admin_token', '999');
    stubFetch(() => ({ ok: false, status: 401, json: async () => ({ error: 'Authentication required' }) }));

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(orderCalls().length).toBeGreaterThan(0));
    expect(result.current.orders).toEqual(INITIAL_SAMPLE_ORDERS);
    await expect(result.current.refreshOrders()).resolves.toBe('unauthorized');
  });

  it('addOrder posts to the API and returns false on server failure', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    stubFetch(() => ({ ok: false, status: 500, json: async () => ({ error: 'Failed to create order' }) }));

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(orderCalls().length).toBeGreaterThan(0));

    let saved = true;
    await act(async () => {
      saved = await result.current.addOrder(DB_ORDER);
    });

    expect(saved).toBe(false);
    const postCalls = orderCalls().filter((c) => c.init?.method === 'POST');
    expect(postCalls).toHaveLength(1);
    expect(JSON.parse(postCalls[0].init!.body as string).orderId).toBe('ROOV-555111');
    expect(result.current.orders[0].orderId).toBe('ROOV-555111');
  });

  it('addOrder returns true when the server accepts the order', async () => {
    localStorage.setItem('rooveka_admin_token', '1');
    stubFetch((init) =>
      init?.method === 'POST'
        ? { ok: true, status: 201, json: async () => ({ success: true }) }
        : { ok: true, status: 200, json: async () => [] }
    );

    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(orderCalls().length).toBeGreaterThan(0));

    let saved = false;
    await act(async () => {
      saved = await result.current.addOrder(DB_ORDER);
    });

    expect(saved).toBe(true);
  });
});
