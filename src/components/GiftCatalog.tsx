import React from 'react';
import { Gift, X, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImageGraphic } from './ProductImageGraphic';

export const GiftCatalog: React.FC<{ onClose: () => void; onOpenRewards: () => void }> = ({ onClose, onOpenRewards }) => {
  const { products } = useCart();
  const gifts = products.filter(p => p.category === 'Gifts');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-rooveka-cream animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Gift size={20} className="text-stone-900" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-amber-400 uppercase tracking-wider">Gift Catalog</h1>
            <p className="text-xs text-stone-400">Reward gifts unlocked with product codes</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close gift catalog"
          className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition"
        >
          <X size={22} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {gifts.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-20 bg-white rounded-2xl border border-rooveka-border">
            <Gift size={40} className="mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 font-medium">No gift products yet</p>
            <p className="text-sm text-stone-400 mt-1">Check back soon for reward gifts</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <Sparkles size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Earn these gifts <strong>FREE</strong> — enter 3 qualifying product codes on the{' '}
                <strong>My Rewards</strong> page and the gift is added straight to your cart at{' '}
                <strong>₹0.00</strong>, ready to check out.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {gifts.map(g => (
                <div key={g.id} className="bg-white rounded-2xl border border-rooveka-border overflow-hidden shadow-sm">
                  <ProductImageGraphic tag={g.imageTag} aspect="aspect-[16/9]" className="rounded-none" />
                  <div className="p-5 space-y-3">
                    <span className="inline-block text-[9px] font-mono font-bold tracking-widest uppercase text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                      Rewards Gift
                    </span>
                    <h2 className="text-xl font-serif font-bold text-rooveka-dark">{g.name}</h2>
                    <p className="text-sm text-rooveka-muted">{g.shortDescription || g.subtitle}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-rooveka-border/50">
                      <span className="text-lg font-serif font-bold text-emerald-600">
                        ₹0.00 <span className="text-xs font-sans font-normal text-rooveka-muted">with rewards</span>
                      </span>
                      <button
                        onClick={onOpenRewards}
                        className="px-4 py-2.5 bg-rooveka-dark text-rooveka-cream text-xs font-semibold tracking-widest uppercase rounded-lg hover:bg-rooveka-brown transition flex items-center gap-2"
                      >
                        Earn with 3 Codes <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
