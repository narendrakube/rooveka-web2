import React from 'react';
import { HeartHandshake } from 'lucide-react';

export const FounderStory: React.FC = () => {
  return (
    <section className="py-24 bg-rooveka-cream border-t border-rooveka-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rooveka-dark rounded-3xl overflow-hidden text-rooveka-cream p-8 sm:p-12 lg:p-16 border border-rooveka-gold/20 shadow-2xl relative">
          
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-rooveka-gold/10 to-transparent blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rooveka-gold/15 text-rooveka-gold text-[10px] tracking-mega font-bold uppercase">
                <HeartHandshake size={14} />
                <span>SMALL BATCH KITCHEN</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-tight text-rooveka-cream">
                Made by People Who Care About Chocolate.
              </h2>

              <p className="text-sm sm:text-base text-rooveka-cream/80 font-light leading-relaxed">
                ROOVEKA was founded with a quiet commitment: to create real, honest chocolate right here in Andhra Pradesh. We are not a factory churning out millions of mass-produced bars, but a small team of artisans dedicated to perfecting every roast and grind.
              </p>

              <p className="text-xs sm:text-sm text-rooveka-cream/70 font-light leading-relaxed">
                When you unwrapped a ROOVEKA bar, you are experiencing the quiet craft of individuals who inspect every bean by hand and celebrate the true spirit of Indian bean-to-bar chocolate making.
              </p>

              <div className="pt-4 border-t border-rooveka-cream/15 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-rooveka-gold/20 border border-rooveka-gold/40 flex items-center justify-center font-serif text-lg font-bold text-rooveka-gold">
                  R
                </div>
                <div>
                  <span className="font-serif font-bold text-sm text-rooveka-cream block">The ROOVEKA Artisan Kitchen</span>
                  <span className="text-[11px] text-rooveka-gold font-mono uppercase tracking-wider">Andhra Pradesh, India</span>
                </div>
              </div>
            </div>

            {/* Right Founder Visual Placeholder Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/5] bg-gradient-to-b from-[#2E1C12] via-[#20130C] to-[#140B07] rounded-2xl border border-rooveka-gold/30 p-6 flex flex-col justify-between shadow-2xl group hover:border-rooveka-gold/60 transition-colors">
                <div className="flex justify-between items-center text-[9px] font-mono text-rooveka-gold uppercase tracking-widest">
                  <span>FOUNDER NOTE</span>
                  <span>EST. ANDHRA</span>
                </div>

                <div className="my-auto text-center space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-rooveka-gold/10 border border-rooveka-gold/30 flex items-center justify-center font-serif text-3xl font-bold text-rooveka-gold">
                    R
                  </div>
                  <p className="font-serif italic text-sm text-rooveka-cream/90">
                    "Every bar carries our deep respect for the land, the cocoa growers, and the art of pure chocolate making."
                  </p>
                </div>

                <div className="text-center text-[10px] text-rooveka-cream/50 font-mono tracking-widest uppercase border-t border-rooveka-cream/10 pt-3">
                  CRAFTED WITH INTENTION
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
