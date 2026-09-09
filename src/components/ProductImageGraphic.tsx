import React from 'react';

interface Props {
  tag: string;
  className?: string;
  aspect?: string;
}

export const ProductImageGraphic: React.FC<Props> = ({ tag, className = '', aspect = 'aspect-[4/3]' }) => {
  if (tag === '70-dark-bar') {
    return (
      <div className={`relative overflow-hidden bg-[#180E09] flex items-center justify-center p-6 select-none ${aspect} ${className}`}>
        {/* Dark espresso ambient glow */}
        <div className="absolute inset-0 bg-radial from-[#382116] via-[#180E09] to-[#0D0704] opacity-90" />

        {/* Scattered cocoa beans in background */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 400 300" fill="none">
          <ellipse cx="60" cy="80" rx="14" ry="8" transform="rotate(35 60 80)" fill="#4A2F20" />
          <ellipse cx="340" cy="220" rx="16" ry="9" transform="rotate(-25 340 220)" fill="#3D2518" />
          <ellipse cx="320" cy="60" rx="12" ry="7" transform="rotate(45 320 60)" fill="#4A2F20" />
          <ellipse cx="70" cy="240" rx="15" ry="9" transform="rotate(-40 70 240)" fill="#3D2518" />
        </svg>

        {/* Chocolate Bar Visual */}
        <div className="relative z-10 w-44 h-56 bg-gradient-to-br from-[#2E1C12] via-[#20130C] to-[#140B07] rounded-sm shadow-2xl border border-[#442B1D]/40 flex flex-col items-center justify-between p-4 transform hover:scale-105 transition-transform duration-500">
          {/* Packaging Wrapper Header */}
          <div className="w-full flex justify-between items-center border-b border-[#C5A059]/30 pb-2">
            <span className="text-[9px] tracking-mega text-[#C5A059] font-semibold uppercase">ROOVEKA</span>
            <span className="text-[8px] tracking-widest text-[#EAE2D3]/60 font-mono">70%</span>
          </div>

          {/* Embossed Chocolate Grid Pattern */}
          <div className="w-full my-auto grid grid-cols-2 gap-1.5 p-2 bg-[#170C08] rounded border border-[#2D1B11]">
            <div className="h-10 bg-[#28170E] rounded-sm shadow-inner flex items-center justify-center border border-[#3A2216]">
              <span className="text-[7px] text-[#C5A059]/40 tracking-widest font-serif">R</span>
            </div>
            <div className="h-10 bg-[#28170E] rounded-sm shadow-inner flex items-center justify-center border border-[#3A2216]">
              <span className="text-[7px] text-[#C5A059]/40 tracking-widest font-serif">R</span>
            </div>
            <div className="h-10 bg-[#28170E] rounded-sm shadow-inner flex items-center justify-center border border-[#3A2216]">
              <span className="text-[7px] text-[#C5A059]/40 tracking-widest font-serif">R</span>
            </div>
            <div className="h-10 bg-[#28170E] rounded-sm shadow-inner flex items-center justify-center border border-[#3A2216]">
              <span className="text-[7px] text-[#C5A059]/40 tracking-widest font-serif">R</span>
            </div>
          </div>

          {/* Foil Accent */}
          <div className="w-full border-t border-[#C5A059]/20 pt-2 flex justify-between items-center">
            <span className="text-[7px] tracking-wider text-[#EAE2D3]/70 uppercase">DARK TABLET</span>
            <span className="text-[7px] tracking-wider text-[#C5A059]">ANDHRA</span>
          </div>
        </div>

        {/* Real Cocoa Beans in Foreground */}
        <div className="absolute bottom-3 left-4 z-20 flex items-center space-x-1 opacity-80">
          <div className="w-6 h-3 bg-[#382014] rounded-full transform -rotate-12 border border-[#4A2D1F]" />
          <div className="w-7 h-3.5 bg-[#2B180E] rounded-full transform rotate-45 border border-[#3D2316]" />
        </div>
        <div className="absolute top-4 right-4 z-20 opacity-70">
          <div className="w-5 h-2.5 bg-[#402619] rounded-full transform rotate-12 border border-[#523322]" />
        </div>
      </div>
    );
  }

  if (tag === '50-dark-bar') {
    return (
      <div className={`relative overflow-hidden bg-[#F6F0E6] flex items-center justify-center p-6 select-none ${aspect} ${className}`}>
        {/* Soft warm ivory glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F0] via-[#F3ECE0] to-[#EAE0D0]" />

        {/* Soft shadow background */}
        <div className="absolute w-48 h-48 bg-[#C5A059]/10 rounded-full blur-2xl" />

        {/* Chocolate Bar Visual */}
        <div className="relative z-10 w-44 h-56 bg-gradient-to-br from-[#4A3022] via-[#382216] to-[#25150C] rounded-sm shadow-xl border border-[#604231]/30 flex flex-col items-center justify-between p-4 transform hover:scale-105 transition-transform duration-500">
          {/* Packaging Wrapper Header */}
          <div className="w-full flex justify-between items-center border-b border-[#C5A059]/40 pb-2">
            <span className="text-[9px] tracking-mega text-[#C5A059] font-semibold uppercase">ROOVEKA</span>
            <span className="text-[8px] tracking-widest text-[#F6F2EA]/70 font-mono">50%</span>
          </div>

          {/* Embossed Chocolate Grid Pattern */}
          <div className="w-full my-auto grid grid-cols-2 gap-1.5 p-2 bg-[#2D1B12] rounded border border-[#422B1E]">
            <div className="h-10 bg-[#3F281C] rounded-sm shadow-inner flex items-center justify-center border border-[#543828]">
              <span className="text-[7px] text-[#C5A059]/50 tracking-widest font-serif">R</span>
            </div>
            <div className="h-10 bg-[#3F281C] rounded-sm shadow-inner flex items-center justify-center border border-[#543828]">
              <span className="text-[7px] text-[#C5A059]/50 tracking-widest font-serif">R</span>
            </div>
            <div className="h-10 bg-[#3F281C] rounded-sm shadow-inner flex items-center justify-center border border-[#543828]">
              <span className="text-[7px] text-[#C5A059]/50 tracking-widest font-serif">R</span>
            </div>
            <div className="h-10 bg-[#3F281C] rounded-sm shadow-inner flex items-center justify-center border border-[#543828]">
              <span className="text-[7px] text-[#C5A059]/50 tracking-widest font-serif">R</span>
            </div>
          </div>

          {/* Foil Accent */}
          <div className="w-full border-t border-[#C5A059]/30 pt-2 flex justify-between items-center">
            <span className="text-[7px] tracking-wider text-[#F6F2EA]/80 uppercase">SMOOTH DARK</span>
            <span className="text-[7px] tracking-wider text-[#C5A059]">ANDHRA</span>
          </div>
        </div>

        {/* Soft Decorative Elements */}
        <div className="absolute bottom-4 right-6 w-8 h-8 rounded-full border border-[#C5A059]/20 flex items-center justify-center text-[10px] text-[#8C7F75] font-serif italic">
          50%
        </div>
      </div>
    );
  }

  // Hot Chocolate Canister / Ceramic Cup Graphic
  return (
    <div className={`relative overflow-hidden bg-[#241710] flex items-center justify-center p-6 select-none ${aspect} ${className}`}>
      {/* Warm cocoa environment */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#321F16] via-[#241710] to-[#170E0A]" />

      {/* Ceramic Cup & Canister Illustration */}
      <div className="relative z-10 flex items-center space-x-4 transform hover:scale-105 transition-transform duration-500">
        {/* Canister Container */}
        <div className="w-28 h-52 bg-gradient-to-b from-[#EAE2D3] via-[#F4EFE6] to-[#DDD4C3] rounded-t-lg rounded-b-md shadow-2xl border border-[#C5A059]/40 flex flex-col justify-between p-3 text-rooveka-dark">
          <div className="text-center border-b border-rooveka-dark/10 pb-2">
            <div className="text-[7px] tracking-widest text-rooveka-gold uppercase font-bold">ROOVEKA</div>
            <div className="text-[8px] font-serif tracking-wider font-semibold text-rooveka-dark">HOT CHOCOLATE</div>
          </div>

          <div className="my-auto text-center px-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-rooveka-dark/5 flex items-center justify-center my-1 border border-rooveka-gold/30">
              <svg className="w-5 h-5 text-rooveka-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                <path d="M6 2v3M10 2v3M14 2v3" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[6px] tracking-wider text-rooveka-muted uppercase mt-1">Rich Drinking Chocolate</p>
          </div>

          <div className="border-t border-rooveka-dark/10 pt-1.5 flex justify-between items-center text-[7px] font-mono text-rooveka-muted">
            <span>ANDHRA</span>
            <span>PURE</span>
          </div>
        </div>

        {/* Steaming Ceramic Cup */}
        <div className="relative flex flex-col items-center">
          {/* Steam FX */}
          <div className="absolute -top-6 flex space-x-1 opacity-60 animate-pulse">
            <div className="w-1 h-4 bg-rooveka-cream/30 rounded-full blur-[1px] transform -rotate-12" />
            <div className="w-1 h-5 bg-rooveka-cream/40 rounded-full blur-[1px]" />
            <div className="w-1 h-4 bg-rooveka-cream/30 rounded-full blur-[1px] transform rotate-12" />
          </div>

          {/* Cup */}
          <div className="w-24 h-20 bg-gradient-to-b from-[#ECE5D8] to-[#D5C9B5] rounded-b-2xl rounded-t-sm shadow-xl border border-[#F6F2EA]/30 flex flex-col items-center justify-start pt-1 relative">
            {/* Liquid Surface */}
            <div className="w-20 h-4 bg-gradient-to-r from-[#20120B] via-[#382015] to-[#1D100A] rounded-full border border-[#4A2D1F] flex items-center justify-center shadow-inner">
              <div className="w-16 h-2 bg-[#42261A]/50 rounded-full blur-[0.5px]" />
            </div>
            {/* Cup Handle */}
            <div className="absolute right-[-10px] top-4 w-4 h-9 border-2 border-[#ECE5D8] rounded-r-full" />
          </div>
        </div>
      </div>

      {/* Floating cocoa powder dusting */}
      <div className="absolute bottom-2 right-4 text-[9px] text-[#C5A059]/60 font-serif italic">
        Crafted for slow cups
      </div>
    </div>
  );
};
