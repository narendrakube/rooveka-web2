import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../context/CartContext';
import { CheckoutModal } from '../components/CheckoutModal';

const CART_ITEM = {
  id: 'rooveka-50-dark-50g',
  productId: 'rooveka-50-dark',
  name: '50% Dark Chocolate',
  selectedSize: '50g',
  price: 295,
  quantity: 2,
  imageTag: 'ROOVEKA_50_GIFTING_BANNER',
};

let postBodies: Record<string, any>[] = [];

const stubFetch = (postOk: boolean) => {
  postBodies = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown, init?: RequestInit) => {
      const u = String(url);
      if (u.includes('/orders.php') && init?.method === 'POST') {
        postBodies.push(JSON.parse(init.body as string));
        return {
          ok: postOk,
          status: postOk ? 201 : 500,
          json: async () => (postOk ? { success: true } : { error: 'Failed to create order' }),
        } as Response;
      }
      if (u.includes('/orders.php')) {
        return { ok: false, status: 401, json: async () => ({ error: 'Authentication required' }) } as Response;
      }
      if (u.includes('/products.php')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      return { ok: true, status: 200, json: async () => [] } as Response;
    })
  );
};

const CheckoutHarness: React.FC = () => {
  const { setIsCheckoutOpen } = useCart();
  React.useEffect(() => {
    setIsCheckoutOpen(true);
  }, []);
  return <CheckoutModal />;
};

const renderCheckout = () =>
  render(
    <CartProvider>
      <CheckoutHarness />
    </CartProvider>
  );

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText('Full Name *'), { target: { value: 'Test Customer' } });
  fireEvent.change(screen.getByPlaceholderText('Email Address *'), { target: { value: 'buyer@rooveka.com' } });
  fireEvent.change(screen.getByPlaceholderText('Phone Number *'), { target: { value: '9848012345' } });
  fireEvent.change(screen.getByPlaceholderText('Pincode *'), { target: { value: '530001' } });
  fireEvent.change(screen.getByPlaceholderText('Street Address, Flat / House No. *'), {
    target: { value: '12-4-56 Mango Street' },
  });
  fireEvent.change(screen.getByPlaceholderText('City *'), { target: { value: 'Vijayawada' } });
  fireEvent.change(screen.getByPlaceholderText('State *'), { target: { value: 'Andhra Pradesh' } });
};

describe('CheckoutModal — order placement', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('rooveka_cart', JSON.stringify([CART_ITEM]));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('submits the order with correct payload (items, totals, customer)', async () => {
    stubFetch(true);
    renderCheckout();
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /PLACE ORDER/ }));

    await waitFor(() => expect(postBodies.length).toBe(1));
    const body = postBodies[0];

    expect(body.orderId).toMatch(/^ROOV-\d{6}$/);
    expect(body.status).toBe('Pending');
    expect(body.customerName).toBe('Test Customer');
    expect(body.email).toBe('buyer@rooveka.com');
    expect(body.phone).toBe('9848012345');
    expect(body.address).toBe('12-4-56 Mango Street');
    expect(body.city).toBe('Vijayawada');
    expect(body.pincode).toBe('530001');
    expect(body.state).toBe('Andhra Pradesh');
    expect(body.paymentMethod).toBe('upi');
    expect(body.subtotal).toBe(590);
    expect(body.shippingCost).toBe(99);
    expect(body.totalAmount).toBe(689);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].productId).toBe('rooveka-50-dark');
    expect(body.items[0].quantity).toBe(2);
    expect(body.items[0].price).toBe(295);
    expect(body.items[0].imageTag).toBe('ROOVEKA_50_GIFTING_BANNER');

    await screen.findByText('Order Confirmed!');
    expect(screen.getByText(new RegExp(body.orderId))).toBeInTheDocument();
  });

  it('clears the cart after a successful order', async () => {
    stubFetch(true);
    renderCheckout();
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /PLACE ORDER/ }));

    await screen.findByText('Order Confirmed!');
    expect(JSON.parse(localStorage.getItem('rooveka_cart') || '[]')).toHaveLength(0);
  });

  it('still confirms locally when the server rejects the order', async () => {
    stubFetch(false);
    renderCheckout();
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /PLACE ORDER/ }));

    await waitFor(() => expect(postBodies.length).toBe(1));
    await screen.findByText('Order Confirmed!');
  });

  it('free shipping above ₹999 sends shippingCost 0', async () => {
    stubFetch(true);
    localStorage.setItem(
      'rooveka_cart',
      JSON.stringify([{ ...CART_ITEM, id: 'big', quantity: 4, price: 595 }])
    );
    renderCheckout();
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: /PLACE ORDER/ }));

    await waitFor(() => expect(postBodies.length).toBe(1));
    expect(postBodies[0].subtotal).toBe(2380);
    expect(postBodies[0].shippingCost).toBe(0);
    expect(postBodies[0].totalAmount).toBe(2380);
  });
});
