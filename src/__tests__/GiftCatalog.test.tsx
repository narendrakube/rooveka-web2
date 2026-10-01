import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { CartProvider } from '../context/CartContext';
import { GiftCatalog } from '../components/GiftCatalog';
import { Product } from '../types';

const giftProduct: Product = {
  id: 'gift-coffee-whisker',
  name: 'Coffee Whisker',
  subtitle: 'Handcrafted reward gift',
  shortDescription: 'A artisan milk coffee whisk — FREE when you unlock a Rooveka reward.',
  fullDescription: 'Earn it by entering 3 qualifying product codes.',
  category: 'Gifts',
  sizes: [],
  ingredients: [],
  tastingNotes: [],
  bgTheme: 'cream-beige',
  imageTag: 'gift-whisker',
  status: 'Active',
  sku: 'GIFT-WHISKER-001',
  tags: ['gift', 'reward'],
};

const chocolateProduct: Product = {
  id: 'rooveka-70-dark',
  name: '70% Dark Chocolate',
  subtitle: 'Single origin',
  shortDescription: 'Rich dark bar',
  fullDescription: 'Rich dark bar',
  category: 'Tablets',
  sizes: [{ label: '100g', price: 595 }],
  ingredients: [],
  tastingNotes: [],
  bgTheme: 'cream-beige',
  imageTag: '70-dark-bar',
  status: 'Active',
  sku: 'SKU-1',
  tags: [],
};

const stubProducts = (list: Product[]) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown) => {
      const u = String(url);
      if (u.includes('/products.php')) {
        return { ok: true, status: 200, json: async () => list } as Response;
      }
      if (u.includes('/orders.php')) {
        return { ok: false, status: 401, json: async () => ({ error: 'Authentication required' }) } as Response;
      }
      return { ok: true, status: 200, json: async () => [] } as Response;
    })
  );
};

describe('GiftCatalog', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows only gift-category products with the ₹0 reward price and CTA', async () => {
    stubProducts([giftProduct, chocolateProduct]);
    const onOpenRewards = vi.fn();

    render(
      <CartProvider>
        <GiftCatalog onClose={vi.fn()} onOpenRewards={onOpenRewards} />
      </CartProvider>
    );

    expect(await screen.findByText('Coffee Whisker')).toBeInTheDocument();
    expect(screen.getByText(/A artisan milk coffee whisk/)).toBeInTheDocument();
    expect(screen.getAllByText('₹0.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/with rewards/)).toBeInTheDocument();
    expect(screen.queryByText('70% Dark Chocolate')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Earn with 3 Codes/i }));
    expect(onOpenRewards).toHaveBeenCalledTimes(1);
  });

  it('calls onClose from the header close button', async () => {
    stubProducts([giftProduct]);
    const onClose = vi.fn();

    render(
      <CartProvider>
        <GiftCatalog onClose={onClose} onOpenRewards={vi.fn()} />
      </CartProvider>
    );

    await screen.findByText('Coffee Whisker');
    fireEvent.click(screen.getByLabelText('Close gift catalog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when there are no gift products', async () => {
    stubProducts([chocolateProduct]);
    render(
      <CartProvider>
        <GiftCatalog onClose={vi.fn()} onOpenRewards={vi.fn()} />
      </CartProvider>
    );

    expect(await screen.findByText('No gift products yet')).toBeInTheDocument();
  });
});
