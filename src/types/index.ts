export interface ProductSizeOption {
  label: string; // e.g. "50g" or "100g"
  price: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  cocoaPercentage?: string;
  category: string;
  sizes: ProductSizeOption[];
  ingredients: string[];
  tastingNotes: string[];
  bgTheme: string;
  imageTag: string;
  // New fields from Add Product feature
  images?: string[];           // uploaded image URLs from product_images table
  discountPrice?: number | null;
  stockQuantity?: number;
  sku?: string | null;
  status?: 'Active' | 'Inactive';
  tags?: string[];
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
  createdAt: string;
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

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface NewProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string;
  categoryId: string;
  stockQuantity: string;
  sku: string;
  status: 'Active' | 'Inactive';
  tags: string;
  sizes: { label: string; price: string; isPopular: boolean }[];
}
