import React from 'react';
import { Compass, Sparkles, ShieldCheck, Layers } from 'lucide-react';

export const QualityPillars: React.FC = () => {
  const pillars = [
    {
      title: 'SINGLE ORIGIN',
      desc: 'Cocoa with a traceable story.',
      icon: Compass,
    },
    {
      title: 'SMALL BATCH',
      desc: 'Made with care, not mass produced.',
      icon: Sparkles,
    },
    {
      title: 'PURE INGREDIENTS',
      desc: 'Simple ingredients. Nothing unnecessary.',
      icon: ShieldCheck,
    },
    {
      title: 'BEAN TO BAR',
      desc: 'Crafted through every stage.',
      icon: Layers,
    },
  ];

  return (
    <section className="py-16 bg-rooveka-cream border-t border-rooveka-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-rooveka-cream-soft transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-rooveka-gold/10 text-rooveka-gold shrink-0">
                  <IconComp size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-widest text-rooveka-dark uppercase font-sans">
                    {item.title}
                  </h4>
                  <p className="text-xs text-rooveka-muted font-light mt-1 leading-relaxed">
                    {item.desc}
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
