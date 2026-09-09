import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, OrderRecord, OrderStatus } from '../types';
import { ROOVEKA_PRODUCTS } from '../data/products';
import { INITIAL_SAMPLE_ORDERS } from '../data/sampleOrders';
import { INITIAL_ROOVEKA_PRICING, CentralPricingConfig } from '../config/pricing';

const API_BASE_URL = 'http://localhost:5000/api';

interface ToastState {
  message: string;
  visible: boolean;
}

interface CartContextType {
  products: Product[];
  cart: CartItem[];
  orders: OrderRecord[];
  pricingConfig: CentralPricingConfig;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isContactOpen: boolean;
  setIsContactOpen: (open: boolean) => void;
  isAdminViewOpen: boolean;
  setIsAdminViewOpen: (open: boolean) => void;
  addToCart: (product: Product, sizeLabel: string, price: number, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  addOrder: (order: OrderRecord) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  updateProductPrice: (productId: string, sizeLabel: string, newPrice: number) => void;
  updateFreeShippingThreshold: (newThreshold: number) => void;
  cartCount: number;
  subtotal: number;
  toast: ToastState;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pricingConfig, setPricingConfig] = useState<CentralPricingConfig>(() => {
    const saved = localStorage.getItem('rooveka_pricing_config');
    return saved ? JSON.parse(saved) : INITIAL_ROOVEKA_PRICING;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    return ROOVEKA_PRODUCTS.map((prod) => ({
      ...prod,
      sizes: prod.sizes.map((s) => ({
        ...s,
        price: pricingConfig.productPrices[prod.id as keyof typeof pricingConfig.productPrices]?.[s.label] ?? s.price,
      })),
    }));
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rooveka_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('rooveka_orders');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_ORDERS;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

  // 🔄 Sync with MySQL Backend API on mount
  useEffect(() => {
    async function fetchFromBackend() {
      try {
        const prodRes = await fetch(`${API_BASE_URL}/products`);
        if (prodRes.ok) {
          const apiProducts = await prodRes.json();
          if (Array.isArray(apiProducts) && apiProducts.length > 0) {
            setProducts(apiProducts);
          }
        }

        const ordRes = await fetch(`${API_BASE_URL}/orders`);
        if (ordRes.ok) {
          const apiOrders = await ordRes.json();
          if (Array.isArray(apiOrders)) {
            setOrders(apiOrders);
          }
        }
      } catch (err) {
        console.log('ℹ️ Running in standalone mode with persistent storage (Backend API offline or connecting...)');
      }
    }
    fetchFromBackend();
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('rooveka_pricing_config', JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  useEffect(() => {
    localStorage.setItem('rooveka_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rooveka_orders', JSON.stringify(orders));
  }, [orders]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3500);
  };

  const addToCart = (product: Product, sizeLabel: string, price: number, quantity = 1) => {
    const itemId = `${product.id}-${sizeLabel}`;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          selectedSize: sizeLabel,
          price,
          quantity,
          imageTag: product.imageTag,
        },
      ];
    });

    showToast(`Added ${quantity}x ${product.name} (${sizeLabel}) to cart`);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = async (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.orderId} placed successfully!`);

    // Sync to MySQL API
    try {
      await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (e) {
      console.log('Order saved locally');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.orderId === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Order ${orderId} status updated to ${newStatus}`);

    // Sync to MySQL API
    try {
      await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.log('Status updated locally');
    }
  };

  const updateProductPrice = async (productId: string, sizeLabel: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          return {
            ...prod,
            sizes: prod.sizes.map((s) => (s.label === sizeLabel ? { ...s, price: newPrice } : s)),
          };
        }
        return prod;
      })
    );

    setPricingConfig((prev) => ({
      ...prev,
      productPrices: {
        ...prev.productPrices,
        [productId]: {
          ...(prev.productPrices[productId as keyof typeof prev.productPrices] || {}),
          [sizeLabel]: newPrice,
        },
      },
    }));

    showToast(`Updated price for ${sizeLabel} to ₹${newPrice}`);

    // Sync to MySQL API
    try {
      await fetch(`${API_BASE_URL}/products/${productId}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizeLabel, price: newPrice }),
      });
    } catch (e) {
      console.log('Price updated locally');
    }
  };

  const updateFreeShippingThreshold = async (newThreshold: number) => {
    setPricingConfig((prev) => ({
      ...prev,
      freeShippingThreshold: newThreshold,
    }));
    showToast(`Free shipping threshold updated to ₹${newThreshold}`);

    // Sync to MySQL API
    try {
      await fetch(`${API_BASE_URL}/settings/shipping-threshold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: newThreshold }),
      });
    } catch (e) {
      console.log('Threshold updated locally');
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        products,
        cart,
        orders,
        pricingConfig,
        isCartOpen,
        setIsCartOpen,
        selectedProductForModal,
        setSelectedProductForModal,
        isSearchOpen,
        setIsSearchOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isContactOpen,
        setIsContactOpen,
        isAdminViewOpen,
        setIsAdminViewOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addOrder,
        updateOrderStatus,
        updateProductPrice,
        updateFreeShippingThreshold,
        cartCount,
        subtotal,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
