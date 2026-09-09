import React from 'react';
import { ProductImageGraphic } from './ProductImageGraphic';

export const IngredientPhilosophy: React.FC = () => {
  return (
    <section className="py-24 bg-rooveka-cream-soft border-t border-rooveka-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Macro Visual */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-rooveka-border bg-rooveka-dark">
              <ProductImageGraphic tag="70-dark-bar" aspect="aspect-[4/3]" />
              <div className="absolute top-4 left-4 bg-rooveka-dark/85 modal-backdrop-blur px-3 py-1.5 rounded border border-rooveka-gold/30">
                <span className="text-[10px] font-mono tracking-widest text-rooveka-gold uppercase">PURE RECIPE</span>
              </div>
            </div>
          </div>

          {/* Right Text & Ingredient Tags */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-mega text-rooveka-gold uppercase block">
                INGREDIENTS
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-rooveka-dark leading-tight">
                Nothing to Hide.
              </h2>
            </div>

            <p className="text-base text-rooveka-dark/80 font-light leading-relaxed">
              Great chocolate doesn't require a paragraph of complex chemical stabilizers, artificial flavourings, or hydrogenated oils. We stick strictly to pure, honest ingredients that allow the real cocoa character of Andhra Pradesh to shine.
            </p>

            {/* Ingredient Pills */}
            <div className="pt-2">
              <span className="text-[10px] tracking-mega text-rooveka-muted font-bold uppercase block mb-3">
                OUR ESSENTIAL INGREDIENTS
              </span>

              <div className="flex flex-wrap gap-2.5">
                <div className="px-4 py-2 bg-rooveka-cream border border-rooveka-border rounded-lg shadow-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rooveka-gold" />
                  <span className="text-xs font-serif font-bold text-rooveka-dark">COCOA</span>
                </div>

                <div className="px-4 py-2 bg-rooveka-cream border border-rooveka-border rounded-lg shadow-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rooveka-gold" />
                  <span className="text-xs font-serif font-bold text-rooveka-dark">SUGAR</span>
                </div>

                <div className="px-4 py-2 bg-rooveka-cream border border-rooveka-border rounded-lg shadow-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rooveka-gold" />
                  <span className="text-xs font-serif font-bold text-rooveka-dark">COCOA BUTTER</span>
                </div>
              </div>
            </div>

            {/* Transparent Note */}
            <p className="text-xs text-rooveka-muted font-light italic border-l-2 border-rooveka-gold pl-4 py-1">
              "We believe clarity is true luxury. What we put in is simple; what we leave out is everything unnecessary."
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
