import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductImageGraphic } from './ProductImageGraphic';

export const Hero: React.FC = () => {
  const scrollTo = (id: string) => {
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
    <section className="relative min-h-[92vh] pt-28 pb-16 flex items-center justify-center bg-gradient-to-b from-[#FAF6EE] via-[#F6F0E4] to-[#ECE3D2] overflow-hidden">
      {/* Background Subtle Ambient Graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rooveka-gold/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-rooveka-brown/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left animate-slide-up">
            {/* Small Editorial Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rooveka-dark/5 border border-rooveka-dark/10">
              <span className="w-1.5 h-1.5 rounded-full bg-rooveka-gold animate-pulse" />
              <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-dark/80">
                CRAFTED IN ANDHRA PRADESH · INDIA
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-rooveka-dark leading-[1.1] tracking-tight">
              Chocolate, From Our Beans to Your Bar.
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-rooveka-dark/75 font-light leading-relaxed max-w-xl">
              Bean-to-bar chocolate crafted in Andhra Pradesh. Pure, single-origin cocoa transformed with patience, care, and honest intent.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={() => scrollTo('shop')}
                className="inline-flex items-center justify-center px-8 py-4 bg-rooveka-dark text-rooveka-cream font-sans text-xs tracking-widest uppercase font-semibold hover:bg-rooveka-brown transition-all duration-300 shadow-md group"
              >
                <span>SHOP CHOCOLATE</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollTo('our-story')}
                className="inline-flex items-center justify-center px-8 py-4 border border-rooveka-dark/30 text-rooveka-dark font-sans text-xs tracking-widest uppercase font-semibold hover:border-rooveka-dark hover:bg-rooveka-dark/5 transition-all duration-300"
              >
                OUR STORY
              </button>
            </div>

            {/* Trust Indicator */}
            <div className="pt-6 border-t border-rooveka-border/60 w-full flex items-center justify-between sm:justify-start sm:space-x-8 text-xs font-mono text-rooveka-muted">
              <div>
                <span className="font-serif text-rooveka-dark font-bold text-sm block">100%</span>
                <span>Single Origin</span>
              </div>
              <div className="h-6 w-px bg-rooveka-border" />
              <div>
                <span className="font-serif text-rooveka-dark font-bold text-sm block">Small Batch</span>
                <span>Hand Crafted</span>
              </div>
              <div className="h-6 w-px bg-rooveka-border" />
              <div>
                <span className="font-serif text-rooveka-dark font-bold text-sm block">Zero</span>
                <span>Artificial Additives</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Composition */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Main Visual Card Showcase */}
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-rooveka-border/60 bg-rooveka-dark text-rooveka-cream artisan-card-shadow">
              <ProductImageGraphic tag="70-dark-bar" aspect="aspect-[4/5]" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-rooveka-dark/85 modal-backdrop-blur p-4 rounded-xl border border-rooveka-gold/30 flex items-center justify-between">
                <div>
                  <span className="text-[9px] tracking-mega text-rooveka-gold uppercase font-bold block">FEATURED RELEASE</span>
                  <span className="text-sm font-serif font-semibold text-rooveka-cream block">70% Dark Chocolate Bar</span>
                </div>
                <button
                  onClick={() => scrollTo('shop')}
                  className="text-xs text-rooveka-gold uppercase tracking-wider hover:underline font-semibold"
                >
                  EXPLORE →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
