import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ContactModal: React.FC = () => {
  const { isContactOpen, setIsContactOpen } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  if (!isContactOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setIsContactOpen(false);
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-rooveka-espresso/70 modal-backdrop-blur transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-10 bg-rooveka-cream w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-rooveka-border p-6 sm:p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-rooveka-dark hover:text-rooveka-gold p-2 transition-colors"
          aria-label="Close contact modal"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-rooveka-gold tracking-widest uppercase font-bold block">
                GET IN TOUCH
              </span>
              <h2 className="text-2xl font-serif font-bold text-rooveka-dark">
                Contact ROOVEKA
              </h2>
              <p className="text-xs text-rooveka-muted font-light mt-1">
                Have questions about our bean-to-bar chocolates, custom orders, or bulk inquiries? Send us a message.
              </p>
            </div>

            <div className="space-y-3">
              <input
                required
                type="text"
                placeholder="Your Name *"
                value={contactData.name}
                onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
              />
              <input
                required
                type="email"
                placeholder="Your Email *"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
              />
              <textarea
                required
                rows={4}
                placeholder="How can we help you? *"
                value={contactData.message}
                onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rooveka-cream-soft border border-rooveka-border rounded-lg text-xs text-rooveka-dark focus:outline-none focus:border-rooveka-gold"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-rooveka-muted font-mono space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <Mail size={12} className="text-rooveka-gold" />
                  <span>hello@rooveka.in</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin size={12} className="text-rooveka-gold" />
                  <span>Andhra Pradesh, India</span>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-rooveka-dark text-rooveka-cream text-xs font-semibold tracking-widest uppercase hover:bg-rooveka-brown transition-colors rounded-lg flex items-center space-x-2"
              >
                <span>SEND MESSAGE</span>
                <Send size={14} />
              </button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-rooveka-dark">
              Message Sent!
            </h3>
            <p className="text-xs text-rooveka-dark/80 max-w-sm mx-auto">
              Thank you for reaching out. The ROOVEKA team will get back to you shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 bg-rooveka-dark text-rooveka-cream text-xs font-semibold tracking-widest uppercase hover:bg-rooveka-brown transition-colors rounded-lg"
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
