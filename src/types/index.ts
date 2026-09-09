export interface ProductSizeOption {
  label: string; // e.g. "50g" or "100g"
  price: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  cocoaPercentage?: string;
  category: 'Tablets' | 'Hot Chocolate';
  sizes: ProductSizeOption[];
  ingredients: string[];
  tastingNotes: string[];
  bgTheme: 'dark-espresso' | 'cream-beige' | 'cocoa-warm';
  imageTag: string;
}

export interface CartItem {
  id: string; // product.id + '-' + size.label
  productId: string;
  name: string;
  selectedSize: string;
  price: number;
  quantity: number;
  imageTag: string;
}

export interface OrderDetails {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  paymentMethod: 'upi' | 'card' | 'cod';
}

export type OrderStatus = 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderRecord {
  orderId: string;
  createdAt: string; // Formatted date e.g. "08 Sep 2026, 04:30 PM"
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  paymentMethod: 'upi' | 'card' | 'cod';
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
}
