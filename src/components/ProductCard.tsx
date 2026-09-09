import React from 'react';
import { Product } from '../types';
import { ProductImageGraphic } from './ProductImageGraphic';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { setSelectedProductForModal } = useCart();
  const defaultSize = product.sizes.find((s) => s.isPopular) || product.sizes[0];

  return (
    <div className="bg-rooveka-cream rounded-2xl overflow-hidden border border-rooveka-border/70 artisan-card-shadow transition-all duration-300 flex flex-col group">
      {/* Product Photography Container */}
      <div 
        onClick={() => setSelectedProductForModal(product)}
        className="relative cursor-pointer overflow-hidden bg-rooveka-brown/5"
      >
        <ProductImageGraphic tag={product.imageTag} aspect="aspect-[4/3]" />
        
        {/* Cocoa Percentage or Tag Overlay */}
        {product.cocoaPercentage && (
          <div className="absolute top-4 right-4 bg-rooveka-dark/85 modal-backdrop-blur text-rooveka-gold text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-md border border-rooveka-gold/30">
            {product.cocoaPercentage} COCOA
          </div>
        )}

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-rooveka-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="bg-rooveka-cream text-rooveka-dark text-[10px] uppercase font-bold tracking-mega px-4 py-2 rounded-full shadow-lg border border-rooveka-border transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            QUICK VIEW
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-mega font-bold text-rooveka-gold uppercase">
              {product.category}
            </span>
            <span className="text-[10px] font-mono text-rooveka-muted">
              {defaultSize.label}
            </span>
          </div>

          <h3 
            onClick={() => setSelectedProductForModal(product)}
            className="text-xl font-serif font-bold text-rooveka-dark group-hover:text-rooveka-gold transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-rooveka-dark/75 font-light leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-rooveka-border/60 pt-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rooveka-muted uppercase tracking-wider block">FROM</span>
            <span className="text-base font-serif font-bold text-rooveka-dark">
              ₹{defaultSize.price}
            </span>
          </div>

          <button
            onClick={() => setSelectedProductForModal(product)}
            className="inline-flex items-center text-xs font-semibold tracking-wider text-rooveka-dark hover:text-rooveka-gold uppercase transition-colors group/btn"
          >
            <span>CHOOSE OPTIONS</span>
            <span className="ml-1 group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
