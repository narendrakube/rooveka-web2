import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { CartProvider } from '../context/CartContext';
import { CustomerRedemption } from '../components/CustomerRedemption';

const PROGRAM = {
  programId: 4,
  programName: 'Hot Chocolate Rewards',
  productId: 'hot-chocolate-985e77',
  productName: 'Hot Chocolate',
  subtitle: 'Warm spiced cocoa',
  imageTag: 'hot-chocolate-canister',
  category: 'Hot Chocolate',
  requiredQuantity: 3,
  rewardName: 'Coffee Whisker',
  rewardDescription: 'Free whisk',
  description: 'Enter 3 codes',
};

const REWARD_CART_SUCCESS = {
  success: true,
  processed: [{ code: 'HOTCODE1', product: 'Hot Chocolate', status: 'accepted' }],
  errors: [],
  warnings: [],
  rewardsEarned: [
    {
      redemptionUid: 'uid-1',
      programName: 'Hot Chocolate Rewards',
      rewardProduct: 'Coffee Whisker',
      customerRewardCode: 'REWARDCODE',
      rewardCart: { productId: 'gift-coffee-whisker', name: 'Coffee Whisker', price: 0, sizeLabel: 'Reward Gift' },
      requiredCodes: 3,
      submittedCodes: 3,
    },
  ],
  message: '1 code(s) processed, reward unlocked!',
};

let redeemBodies: any[] = [];
let redeemResponse: unknown = REWARD_CART_SUCCESS;
let redeemOk = true;

const stubFetch = () => {
  redeemBodies = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown, init?: RequestInit) => {
      const u = String(url);
      if (u.includes('/customer/programs.php')) {
        return { ok: true, status: 200, json: async () => ({ programs: [PROGRAM] }) } as Response;
      }
      if (u.includes('/customer/redeem.php') && init?.method === 'POST') {
        redeemBodies.push(JSON.parse(init.body as string));
        return {
          ok: redeemOk,
          status: redeemOk ? 200 : 400,
          json: async () => redeemResponse,
        } as Response;
      }
      if (u.includes('/products.php')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    })
  );
};

const renderRedemption = () =>
  render(
    <CartProvider>
      <CustomerRedemption onClose={vi.fn()} />
    </CartProvider>
  );

const selectProduct = async () => {
  const select = await screen.findByLabelText(/Select the product you purchased/i);
  fireEvent.change(select, { target: { value: PROGRAM.productId } });
};

describe('CustomerRedemption — product dropdown & cart gift', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('rooveka_customer_token', 'cust-1');
    localStorage.setItem('rooveka_customer_user', JSON.stringify({ id: 9, name: 'Gift User', email: 'g@t.com', role: 'customer' }));
    redeemOk = true;
    redeemResponse = REWARD_CART_SUCCESS;
    stubFetch();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('lists program products in the dropdown with the requirement hint', async () => {
    renderRedemption();

    const select = await screen.findByLabelText(/Select the product you purchased/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Choose a product...' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Hot Chocolate' })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: PROGRAM.productId } });
    expect(screen.getByText(/codes from/)).toBeInTheDocument();
    expect(screen.getByText('Coffee Whisker')).toBeInTheDocument();
  });

  it('blocks submission until a product is selected', async () => {
    renderRedemption();
    await selectProduct();

    // deselect to simulate missing selection
    const select = screen.getByLabelText(/Select the product you purchased/i);
    fireEvent.change(select, { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('Code 1'), { target: { value: 'HOTCODE1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Codes' }));

    expect(await screen.findByText('Please select the product you purchased')).toBeInTheDocument();
    expect(redeemBodies).toHaveLength(0);
  });

  it('submits productId + codes and auto-adds the ₹0 gift to the cart', async () => {
    renderRedemption();
    await selectProduct();
    fireEvent.change(screen.getByPlaceholderText('Code 1'), { target: { value: 'HOTCODE1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Codes' }));

    await waitFor(() => expect(redeemBodies.length).toBe(1));
    expect(redeemBodies[0].productId).toBe('hot-chocolate-985e77');
    expect(redeemBodies[0].codes).toEqual(['HOTCODE1']);

    expect(await screen.findByText('Added to your cart — ₹0.00')).toBeInTheDocument();
    expect(screen.getByText('Coffee Whisker ×1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Cart & Checkout/i })).toBeInTheDocument();

    const cart = JSON.parse(localStorage.getItem('rooveka_cart') || '[]');
    expect(cart).toHaveLength(1);
    expect(cart[0].productId).toBe('gift-coffee-whisker');
    expect(cart[0].name).toBe('Coffee Whisker');
    expect(cart[0].price).toBe(0);
    expect(cart[0].quantity).toBe(1);
  });

  it('shows per-code errors without awarding when server rejects', async () => {
    redeemOk = true;
    redeemResponse = {
      success: false,
      processed: [],
      errors: [{ code: 'BADCODE1', error: 'Code does not match the selected product' }],
      rewardsEarned: [],
      warnings: [],
      message: 'No valid codes found',
    };
    renderRedemption();
    await selectProduct();
    fireEvent.change(screen.getByPlaceholderText('Code 1'), { target: { value: 'BADCODE1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Codes' }));

    await waitFor(() => expect(redeemBodies.length).toBe(1));
    expect(await screen.findByText(/Code does not match the selected product/)).toBeInTheDocument();
    expect(screen.queryByText(/Added to your cart/)).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('rooveka_cart') || '[]')).toHaveLength(0);
  });
});
