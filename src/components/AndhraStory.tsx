import React from 'react';
import { MapPin, Sun, Droplets, Mountain } from 'lucide-react';

export const AndhraStory: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#FAF6EE] to-[#EFE7D8] border-t border-rooveka-border/50 relative overflow-hidden">
      {/* Subtle Earthy Pattern Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1C120C_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-mega text-rooveka-gold uppercase block">
                OUR ORIGIN
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-rooveka-dark leading-tight">
                Rooted in Andhra Pradesh.
              </h2>
            </div>

            <p className="text-base sm:text-lg text-rooveka-dark/80 font-light leading-relaxed">
              Nestled along the fertile tropical belts of Andhra Pradesh, where warm river valleys meet rich alluvial soil, our cacao trees thrive under generous sunshine and monsoon rains.
            </p>

            <p className="text-sm text-rooveka-dark/70 font-light leading-relaxed">
              We collaborate closely with local cocoa growers who tend each pod with ancestral agricultural wisdom. By sourcing exclusively from Andhra Pradesh, ROOVEKA showcases the distinctive terroir of South Indian cocoa—rich, fruity, and naturally balanced.
            </p>

            {/* Terroir Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-rooveka-border">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded bg-rooveka-gold/10 text-rooveka-gold mt-1">
                  <Sun size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-rooveka-dark uppercase">Tropical Climate</h4>
                  <p className="text-[11px] text-rooveka-muted font-light">Abundant warmth & humidity for cocoa ripening.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded bg-rooveka-gold/10 text-rooveka-gold mt-1">
                  <Droplets size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-rooveka-dark uppercase">Rich Soil</h4>
                  <p className="text-[11px] text-rooveka-muted font-light">Nutrient-dense agricultural river basins.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Visual Showcase */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg bg-rooveka-dark rounded-2xl p-8 text-rooveka-cream shadow-2xl border border-rooveka-gold/20 overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-rooveka-gold/20 rounded-full blur-2xl" />

              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center border-b border-rooveka-gold/30 pb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-rooveka-gold" />
                    <span className="text-xs font-mono tracking-widest text-rooveka-gold uppercase">ANDHRA PRADESH, INDIA</span>
                  </div>
                  <span className="text-[10px] font-mono text-rooveka-cream/60">SINGLE ORIGIN</span>
                </div>

                <div className="space-y-4">
                  <div className="text-4xl font-serif font-bold tracking-wide text-rooveka-cream">
                    16° 30' N, 80° 38' E
                  </div>
                  <p className="text-xs text-rooveka-cream/80 font-light leading-relaxed">
                    "From tree canopy to final tempering, Andhra Pradesh provides the soil, sunshine, and spirit behind every piece of ROOVEKA chocolate."
                  </p>
                </div>

                <div className="pt-4 border-t border-rooveka-cream/10 flex items-center justify-between text-[11px] font-mono text-rooveka-gold">
                  <span>ESTATE SOURCED</span>
                  <span>HAND CRAFTED</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
