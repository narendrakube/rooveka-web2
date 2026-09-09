import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImageGraphic } from './ProductImageGraphic';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, setIsCheckoutOpen } = useCart();
  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-rooveka-espresso/60 modal-backdrop-blur transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-rooveka-cream border-l border-rooveka-border shadow-2xl flex flex-col justify-between animate-slide-right">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-rooveka-border/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={20} className="text-rooveka-dark" />
              <h2 className="text-lg font-serif font-bold text-rooveka-dark uppercase tracking-wider">
                YOUR CART ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-rooveka-dark hover:text-rooveka-gold transition-colors rounded-full"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-rooveka-beige/50 border-b border-rooveka-border/40">
            <div className="flex items-center space-x-2 text-xs text-rooveka-dark font-sans mb-1.5">
              <Truck size={15} className="text-rooveka-gold shrink-0" />
              <span>
                {remainingForFreeShipping > 0 ? (
                  <>Add <strong className="font-mono text-rooveka-gold">₹{remainingForFreeShipping}</strong> more for Free Shipping in India</>
                ) : (
                  <strong className="text-rooveka-gold font-semibold">🎉 You have unlocked Free Shipping!</strong>
                )}
              </span>
            </div>
            <div className="w-full h-1.5 bg-rooveka-border/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rooveka-gold transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items Scroll Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-rooveka-muted py-16">
                <div className="w-16 h-16 rounded-full bg-rooveka-beige/60 flex items-center justify-center text-rooveka-gold">
                  <ShoppingBag size={28} />
                </div>
                <p className="text-sm font-serif italic">Your ROOVEKA cart is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-rooveka-dark text-rooveka-cream text-xs tracking-widest uppercase font-semibold hover:bg-rooveka-brown transition-colors"
                >
                  EXPLORE CHOCOLATE
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-3 bg-rooveka-cream-soft rounded-xl border border-rooveka-border/60"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-rooveka-brown/10 border border-rooveka-border/40">
                    <ProductImageGraphic tag={item.imageTag} aspect="aspect-square" className="w-full h-full" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-serif font-bold text-rooveka-dark">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-rooveka-muted hover:text-red-700 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-rooveka-muted">
                      Size: {item.selectedSize}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-2 bg-rooveka-beige/60 border border-rooveka-border rounded px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-rooveka-dark hover:text-rooveka-gold transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-mono font-bold text-rooveka-dark px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-rooveka-dark hover:text-rooveka-gold transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-serif font-bold text-rooveka-dark">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-rooveka-border/60 bg-rooveka-cream space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-rooveka-muted font-sans">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-rooveka-dark">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-rooveka-muted font-sans">
                  <span>Estimated Shipping</span>
                  <span className="font-mono text-rooveka-gold font-semibold">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-serif font-bold text-rooveka-dark border-t border-rooveka-border/40 pt-2">
                  <span>TOTAL</span>
                  <span className="font-mono text-rooveka-gold">
                    ₹{subtotal + (subtotal >= freeShippingThreshold ? 0 : 99)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-rooveka-dark text-rooveka-cream text-xs font-sans font-semibold tracking-widest uppercase hover:bg-rooveka-brown transition-all duration-300 shadow-md flex items-center justify-center space-x-2 group"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
