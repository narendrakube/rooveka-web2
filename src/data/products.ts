import { Product } from '../types';

export const ROOVEKA_PRODUCTS: Product[] = [
  {
    id: 'rooveka-70-dark',
    name: '70% Dark Chocolate',
    subtitle: 'Deep & Bold Andhra Origin',
    shortDescription: 'Deep, bold and naturally intense, crafted for those who love real cocoa character.',
    fullDescription: 'Crafted from hand-selected cocoa beans harvested in the lush tropical climate of Andhra Pradesh. Roasted gently and stone-ground to preserve the rich, woodsy cocoa character with notes of dried plum and dark espresso.',
    cocoaPercentage: '70%',
    category: 'Tablets',
    sizes: [
      { label: '50g', price: 345 },
      { label: '100g', price: 595, isPopular: true },
    ],
    ingredients: ['Andhra Cocoa Beans', 'Cocoa Butter', 'Unrefined Sugar'],
    tastingNotes: ['Deep Cocoa', 'Dried Plum', 'Toasted Wood', 'Velvet Finish'],
    bgTheme: 'dark-espresso',
    imageTag: '70-dark-bar',
  },
  {
    id: 'rooveka-50-dark',
    name: '50% Dark Chocolate',
    subtitle: 'Smooth & Approachable',
    shortDescription: 'Smooth, balanced and approachable with a gentle cocoa finish.',
    fullDescription: 'Designed for everyday indulgence. A smoother, more harmonious chocolate with balanced cocoa intensity and subtle warmth. Perfect for newcomers to artisan bean-to-bar dark chocolate.',
    cocoaPercentage: '50%',
    category: 'Tablets',
    sizes: [
      { label: '50g', price: 325 },
      { label: '100g', price: 565, isPopular: true },
    ],
    ingredients: ['Andhra Cocoa Beans', 'Cocoa Butter', 'Cane Sugar'],
    tastingNotes: ['Soft Caramel', 'Warm Vanilla', 'Creamy Cocoa', 'Gentle Finish'],
    bgTheme: 'cream-beige',
    imageTag: '50-dark-bar',
  },
  {
    id: 'rooveka-hot-chocolate',
    name: 'Hot Chocolate',
    subtitle: 'Rich Drinking Chocolate',
    shortDescription: 'Rich drinking chocolate made for slow, comforting cups.',
    fullDescription: 'Coarsely ground pure dark chocolate flakes made exclusively from single-origin Andhra cocoa beans. Melts effortlessly into hot milk for an extraordinarily rich, velvety drinking chocolate experience.',
    category: 'Hot Chocolate',
    sizes: [
      { label: '150g', price: 395 },
      { label: '300g', price: 695, isPopular: true },
    ],
    ingredients: ['Pure Andhra Cocoa Flakes', 'Cocoa Powder', 'Unrefined Cane Sugar'],
    tastingNotes: ['Molten Chocolate', 'Creamy Density', 'Warm Cinnamon Note'],
    bgTheme: 'cocoa-warm',
    imageTag: 'hot-chocolate-canister',
  },
];
