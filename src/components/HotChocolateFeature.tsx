import React from 'react';
import { Flame, PlusCircle, RefreshCw, Heart } from 'lucide-react';
import { ProductImageGraphic } from './ProductImageGraphic';
import { useCart } from '../context/CartContext';

export const HotChocolateFeature: React.FC = () => {
  const { products, setSelectedProductForModal } = useCart();
  const hotChocolateProduct = products.find((p) => p.id === 'rooveka-hot-chocolate') || products[2];
  const startingPrice = hotChocolateProduct?.sizes[0]?.price ?? 395;

  const steps = [
    {
      step: '01',
      title: 'HEAT',
      instruction: 'Warm your choice of milk to a gentle simmer.',
      icon: Flame,
    },
    {
      step: '02',
      title: 'ADD',
      instruction: 'Add 2–3 tablespoons of ROOVEKA Hot Chocolate.',
      icon: PlusCircle,
    },
    {
      step: '03',
      title: 'STIR',
      instruction: 'Stir slowly until completely melted and velvety.',
      icon: RefreshCw,
    },
    {
      step: '04',
      title: 'ENJOY',
      instruction: 'Pour into your favorite cup. Sip. Enjoy.',
      icon: Heart,
    },
  ];

  return (
    <section id="hot-chocolate" className="py-24 bg-rooveka-brown text-rooveka-cream relative overflow-hidden">
      {/* Background Graphic Ambient */}
      <div className="absolute inset-0 bg-radial from-[#382216] via-[#2A1A12] to-[#170E09] opacity-90 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold tracking-mega text-rooveka-gold uppercase block">
              ROOVEKA HOT CHOCOLATE
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-tight">
              A Ritual of Slow Warmth & Real Cocoa.
            </h2>
            <p className="text-sm sm:text-base text-rooveka-cream/80 font-light leading-relaxed">
              Coarsely ground pure dark chocolate flakes made exclusively from single-origin Andhra cocoa beans. No artificial thickeners or excess sugar.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedProductForModal(hotChocolateProduct)}
                className="inline-flex items-center px-6 py-3 bg-rooveka-gold text-rooveka-dark text-xs font-semibold uppercase tracking-widest hover:bg-rooveka-gold-light transition-colors rounded-sm"
              >
                ORDER HOT CHOCOLATE — FROM ₹{startingPrice}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-rooveka-gold/30">
              <ProductImageGraphic tag="hot-chocolate-canister" aspect="aspect-[4/3]" />
            </div>
          </div>
        </div>

        {/* How to Make 4-Step Process Header */}
        <div className="border-t border-rooveka-gold/20 pt-16">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold tracking-mega text-rooveka-gold uppercase block">
              SIMPLE PREPARATION
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-bold text-rooveka-cream">
              How to Make
            </h3>
            <p className="text-xs sm:text-sm text-rooveka-cream/70">
              Crafting a soul-warming cup in four easy steps.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-[#20120B]/80 rounded-xl p-6 border border-rooveka-gold/20 flex flex-col justify-between hover:border-rooveka-gold/50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-rooveka-gold tracking-wider">
                      {item.step}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-rooveka-gold/10 text-rooveka-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComp size={18} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-serif font-bold text-rooveka-cream mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-rooveka-cream/70 font-light leading-relaxed">
                      {item.instruction}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
