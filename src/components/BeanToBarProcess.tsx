import React from 'react';
import { Sprout, Filter, Flame, Disc, Sliders, Thermometer, LayoutGrid, PackageCheck } from 'lucide-react';

export const BeanToBarProcess: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'COCOA BEANS',
      desc: 'Sourced directly from Andhra Pradesh estates at peak maturity.',
      icon: Sprout,
    },
    {
      num: '02',
      title: 'SORT',
      desc: 'Hand-inspected bean by bean to select only flawless cacao pods.',
      icon: Filter,
    },
    {
      num: '03',
      title: 'ROAST',
      desc: 'Gently roasted in small batches to unlock deep aromatic cocoa notes.',
      icon: Flame,
    },
    {
      num: '04',
      title: 'GRIND',
      desc: 'Traditional granite stone grinding for smooth liquid cocoa mass.',
      icon: Disc,
    },
    {
      num: '05',
      title: 'CONCH',
      desc: 'Aerated slowly over 48 hours to round off acidity and harshness.',
      icon: Sliders,
    },
    {
      num: '06',
      title: 'TEMPER',
      desc: 'Precise thermal control for a clean, sharp snap and glossy shine.',
      icon: Thermometer,
    },
    {
      num: '07',
      title: 'MOULD',
      desc: 'Poured into custom geometric bar moulds and set gently.',
      icon: LayoutGrid,
    },
    {
      num: '08',
      title: 'BAR',
      desc: 'Hand-wrapped in protective foil and signature ROOVEKA paper.',
      icon: PackageCheck,
    },
  ];

  return (
    <section id="bean-to-bar" className="py-24 bg-rooveka-cream border-t border-rooveka-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold tracking-mega text-rooveka-gold uppercase block">
            BEAN TO BAR
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-rooveka-dark">
            From Andhra Pradesh to Every Bar.
          </h2>
          <p className="text-sm sm:text-base text-rooveka-dark/70 font-light">
            Every step is completed under one roof with unhurried devotion.
          </p>
        </div>

        {/* 8-Step Grid Journey */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step) => {
            const IconComp = step.icon;
            return (
              <div
                key={step.num}
                className="bg-rooveka-cream-soft p-6 rounded-xl border border-rooveka-border/50 hover:border-rooveka-gold/50 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rooveka-gold">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-rooveka-dark/5 text-rooveka-dark group-hover:bg-rooveka-gold group-hover:text-rooveka-dark transition-colors flex items-center justify-center">
                    <IconComp size={16} />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-serif font-bold text-rooveka-dark tracking-wider mb-1 uppercase">
                    {step.title}
                  </h4>
                  <p className="text-xs text-rooveka-muted font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
