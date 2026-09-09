/**
 * ============================================================================
 * ROOVEKA PRICING CONFIGURATION FILE
 * ============================================================================
 * You can easily modify all product prices, shipping thresholds, and currency
 * settings directly in this file. 
 * Changes here automatically apply across the entire website and checkout.
 * ============================================================================
 */

export interface ProductPriceConfig {
  [sizeLabel: string]: number;
}

export interface CentralPricingConfig {
  currencySymbol: string;
  currencyCode: string;
  freeShippingThreshold: number; // Order subtotal required for free shipping in INR
  standardShippingFee: number;  // Flat shipping fee when subtotal is below threshold
  productPrices: {
    'rooveka-70-dark': ProductPriceConfig;
    'rooveka-50-dark': ProductPriceConfig;
    'rooveka-hot-chocolate': ProductPriceConfig;
  };
}

export const INITIAL_ROOVEKA_PRICING: CentralPricingConfig = {
  currencySymbol: '₹',
  currencyCode: 'INR',
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  productPrices: {
    // 70% Dark Chocolate Bar
    'rooveka-70-dark': {
      '50g': 345,
      '100g': 595,
    },
    // 50% Dark Chocolate Bar
    'rooveka-50-dark': {
      '50g': 325,
      '100g': 565,
    },
    // Hot Chocolate Canister
    'rooveka-hot-chocolate': {
      '150g': 395,
      '300g': 695,
    },
  },
};
