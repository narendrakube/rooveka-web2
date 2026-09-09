import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OrderRecord } from '../types';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, subtotal, clearCart, addOrder } = useCart();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: 'Andhra Pradesh',
  });

  if (!isCheckoutOpen) return null;

  const shippingCost = subtotal >= 999 ? 0 : 99;
  const finalTotal = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `ROOV-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newOrderRecord: OrderRecord = {
      orderId: generatedId,
      createdAt: dateFormatted,
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      state: formData.state,
      paymentMethod,
      items: [...cart],
      subtotal,
      shippingCost,
      totalAmount: finalTotal,
      status: 'Pending',
    };

    addOrder(newOrderRecord);
    setStep('success');
    clearCart();
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-rooveka-espresso/70 modal-backdrop-blur transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 bg-rooveka-cream w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-rooveka-border p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-rooveka-dark hover:text-rooveka-gold p-2 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-rooveka-gold tracking-widest uppercase font-bold block">
                CHECKOUT — ROOVEKA
              </span>
              <h2 className="text-2xl font-serif font-bold text-rooveka-dark">
                Shipping & Payment Details
              </h2>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-rooveka-muted">
                1. Delivery Address
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs font-sans text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                />
                <input
                  required
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs font-sans text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs font-sans text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                />
                <input
                  required
                  type="text"
                  placeholder="Pincode *"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs font-sans text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                />
              </div>

              <input
                required
                type="text"
                placeholder="Street Address, Flat / House No. *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs font-sans text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  placeholder="City *"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs font-sans text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                />
                <input
                  required
                  type="text"
                  placeholder="State *"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs font-sans text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
                />
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-rooveka-muted">
                2. Select Payment Method
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-lg border text-xs flex flex-col items-center space-y-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-rooveka-gold bg-rooveka-gold/10 text-rooveka-dark shadow-sm'
                      : 'border-rooveka-border bg-rooveka-cream-soft text-rooveka-muted'
                  }`}
                >
                  <QrCode size={18} />
                  <span className="font-semibold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border text-xs flex flex-col items-center space-y-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-rooveka-gold bg-rooveka-gold/10 text-rooveka-dark shadow-sm'
                      : 'border-rooveka-border bg-rooveka-cream-soft text-rooveka-muted'
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="font-semibold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-lg border text-xs flex flex-col items-center space-y-1 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-rooveka-gold bg-rooveka-gold/10 text-rooveka-dark shadow-sm'
                      : 'border-rooveka-border bg-rooveka-cream-soft text-rooveka-muted'
                  }`}
                >
                  <Banknote size={18} />
                  <span className="font-semibold">Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Order Total & Submit */}
            <div className="pt-4 border-t border-rooveka-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rooveka-muted uppercase tracking-wider block">TOTAL PAYABLE</span>
                <span className="text-xl font-serif font-bold text-rooveka-dark">₹{finalTotal}</span>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-rooveka-dark text-rooveka-cream text-xs font-semibold tracking-widest uppercase hover:bg-rooveka-brown transition-colors shadow-md rounded-lg"
              >
                PLACE ORDER — ₹{finalTotal}
              </button>
            </div>
          </form>
        ) : (
          /* Order Confirmation Screen */
          <div className="py-8 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-rooveka-gold tracking-widest uppercase font-bold block">
                THANK YOU FOR YOUR ORDER
              </span>
              <h2 className="text-3xl font-serif font-bold text-rooveka-dark">
                Order Confirmed!
              </h2>
              <p className="text-xs font-mono text-rooveka-muted">
                Order ID: <span className="font-bold text-rooveka-dark">{orderId}</span>
              </p>
            </div>

            <p className="text-xs text-rooveka-dark/80 max-w-md mx-auto leading-relaxed">
              We have received your order. Your ROOVEKA artisan chocolate will be freshly packed and dispatched from Andhra Pradesh.
            </p>

            <div className="pt-4 border-t border-rooveka-border">
              <button
                onClick={handleClose}
                className="px-8 py-3.5 bg-rooveka-dark text-rooveka-cream text-xs font-semibold tracking-widest uppercase hover:bg-rooveka-brown transition-colors rounded-lg"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
