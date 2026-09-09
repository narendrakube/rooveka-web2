import React from 'react';
import { ProductImageGraphic } from './ProductImageGraphic';

export const BrandIntro: React.FC = () => {
  return (
    <section id="our-story" className="py-24 bg-rooveka-cream border-t border-rooveka-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Editorial Photograph / Visual */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-rooveka-border">
              <ProductImageGraphic tag="50-dark-bar" aspect="aspect-[4/3]" />
              <div className="absolute inset-0 bg-gradient-to-t from-rooveka-dark/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-rooveka-cream">
                <span className="text-[10px] tracking-mega font-bold uppercase text-rooveka-gold block">ARTISANAL INTEGRITY</span>
                <p className="font-serif italic text-base opacity-90 mt-1">
                  "Real luxury chocolate requires no artificial shortcuts, only patience and pure cocoa."
                </p>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-mega text-rooveka-gold uppercase block">
                THE ROOVEKA WAY
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-rooveka-dark leading-tight">
                From Bean to Bar, Made With Intention.
              </h2>
            </div>

            <p className="text-base sm:text-lg text-rooveka-dark/80 font-light leading-relaxed">
              ROOVEKA is an artisan chocolate brand rooted in Andhra Pradesh, turning carefully selected cocoa beans into honest, beautifully crafted chocolate.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-6 border-t border-rooveka-border/60">
              <div>
                <h4 className="text-sm font-serif font-bold text-rooveka-dark">Single Origin Cacao</h4>
                <p className="text-xs text-rooveka-muted mt-1 font-light leading-relaxed">
                  Harvested exclusively from trusted estates in Andhra Pradesh.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-rooveka-dark">Uncompromising Purity</h4>
                <p className="text-xs text-rooveka-muted mt-1 font-light leading-relaxed">
                  No palm oil, no artificial emulsifiers, no compound fillers.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
