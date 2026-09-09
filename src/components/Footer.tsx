import React, { useState } from 'react';
import { ArrowRight, Check, Globe, Share2, Mail, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Footer: React.FC = () => {
  const { setIsContactOpen, setIsAdminViewOpen } = useCart();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const scrollTo = (id: string) => {
    if (id === 'contact') {
      setIsContactOpen(true);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="bg-[#140B07] text-rooveka-cream pt-20 pb-12 border-t border-rooveka-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-rooveka-cream/10">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-3xl font-serif font-bold tracking-widest text-rooveka-cream uppercase">
              ROOVEKA
            </h2>
            <p className="text-xs font-serif italic text-rooveka-gold">
              Bean to Bar from Andhra Pradesh
            </p>
            <p className="text-xs text-rooveka-cream/70 font-light leading-relaxed max-w-sm">
              Artisan bean-to-bar chocolate crafted from single-origin Andhra Pradesh cacao. Honest ingredients, zero fillers, patient craftsmanship.
            </p>

            {/* Social Icons */}
            <div className="pt-2 flex items-center space-x-4 text-rooveka-cream/60">
              <a href="#" className="hover:text-rooveka-gold transition-colors p-1" aria-label="Website">
                <Globe size={18} />
              </a>
              <a href="#" className="hover:text-rooveka-gold transition-colors p-1" aria-label="Share">
                <Share2 size={18} />
              </a>
              <a href="#" className="hover:text-rooveka-gold transition-colors p-1" aria-label="Email Us">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-gold block">
              NAVIGATION
            </span>
            <ul className="space-y-2 text-xs text-rooveka-cream/80 font-sans tracking-wider">
              <li>
                <button onClick={() => scrollTo('shop')} className="hover:text-rooveka-gold transition-colors">
                  SHOP CHOCOLATE
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('our-story')} className="hover:text-rooveka-gold transition-colors">
                  OUR STORY
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('bean-to-bar')} className="hover:text-rooveka-gold transition-colors">
                  BEAN TO BAR JOURNEY
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('hot-chocolate')} className="hover:text-rooveka-gold transition-colors">
                  HOT CHOCOLATE
                </button>
              </li>
              <li>
                <button onClick={() => setIsContactOpen(true)} className="hover:text-rooveka-gold transition-colors">
                  CONTACT US
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Admin Column */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-gold block">
              STORE MANAGEMENT
            </span>
            <ul className="space-y-2 text-xs text-rooveka-cream/70 font-sans tracking-wider">
              <li><a href="#" className="hover:text-rooveka-gold transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-rooveka-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-rooveka-gold transition-colors">Terms of Service</a></li>
              <li>
                <button
                  onClick={() => setIsAdminViewOpen(true)}
                  className="text-rooveka-gold font-semibold uppercase hover:underline flex items-center space-x-1 pt-1"
                >
                  <ShieldCheck size={14} />
                  <span>Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-4">
            <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-gold block">
              JOIN THE JOURNAL
            </span>
            <p className="text-xs text-rooveka-cream/70 font-light leading-relaxed">
              Subscribe for fresh batch release notes and stories directly from our kitchen in Andhra Pradesh.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
                <input
                  required
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-rooveka-dark/80 border border-rooveka-gold/30 rounded text-xs text-rooveka-cream focus:outline-none focus:border-rooveka-gold placeholder-rooveka-cream/40"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-rooveka-gold text-rooveka-dark rounded hover:bg-rooveka-gold-light transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-rooveka-gold font-mono">
                <Check size={16} />
                <span>Thank you for subscribing!</span>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-rooveka-cream/50 space-y-2 sm:space-y-0">
          <div>
            © 2026 ROOVEKA™. All rights reserved.
          </div>
          <div>
            Bean to Bar from Andhra Pradesh, India.
          </div>
        </div>

      </div>
    </footer>
  );
};
