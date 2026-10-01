import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { CartProvider } from '../context/CartContext';
import { Header } from '../components/Header';
import { AdminDashboard } from '../components/AdminDashboard';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

const normalProduct: Product = {
  id: 'rooveka-50-dark',
  name: '50% Dark Chocolate',
  subtitle: 'Balanced',
  shortDescription: 'Smooth dark bar',
  fullDescription: 'Smooth dark bar',
  category: 'Tablets',
  sizes: [{ label: '100g', price: 495 }],
  ingredients: [],
  tastingNotes: [],
  bgTheme: 'cream-beige',
  imageTag: '50-dark-bar',
  status: 'Active',
  sku: 'SKU-1',
  tags: [],
};

const giftProduct: Product = {
  id: 'gift-coffee-whisker',
  name: 'Coffee Whisker',
  subtitle: 'Handcrafted reward gift',
  shortDescription: 'Reward gift',
  fullDescription: 'Reward gift',
  category: 'Gifts',
  sizes: [],
  ingredients: [],
  tastingNotes: [],
  bgTheme: 'cream-beige',
  imageTag: 'gift-whisker',
  status: 'Active',
  sku: 'GIFT-1',
  tags: ['gift'],
};

const stubFetch = (products: Product[]) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown) => {
      const u = String(url);
      if (u.includes('/products.php')) {
        return { ok: true, status: 200, json: async () => products } as Response;
      }
      if (u.includes('/orders.php')) {
        return { ok: false, status: 401, json: async () => ({ error: 'Authentication required' }) } as Response;
      }
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    })
  );
};

describe('AdminDashboard with size-less gift product', () => {
  beforeEach(() => {
    localStorage.clear();
    stubFetch([normalProduct, giftProduct]);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('opens the admin dashboard without crashing and shows the gift row', async () => {
    render(
      <CartProvider>
        <Header onOpenShopPortal={vi.fn()} onOpenCustomerRewards={vi.fn()} />
        <AdminDashboard />
      </CartProvider>
    );

    fireEvent.click(screen.getByTitle('Open Admin Dashboard'));

    // Analytics tab (default) previously crashed on prod.sizes[0].price for the gift
    expect(await screen.findByText('TOTAL SALES REVENUE')).toBeInTheDocument();
    expect(screen.getByText(/Coffee Whisker/)).toBeInTheDocument();
    expect(screen.getByText('Reward gift — ₹0')).toBeInTheDocument();
    expect(screen.getByText('Starting at ₹495')).toBeInTheDocument();
  });

  it('ProductCard renders a size-less product without crashing', () => {
    render(
      <CartProvider>
        <ProductCard product={giftProduct} />
      </CartProvider>
    );
    expect(screen.getByText('Coffee Whisker')).toBeInTheDocument();
    expect(screen.getByText('₹0')).toBeInTheDocument();
  });
});
