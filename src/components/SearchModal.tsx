import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImageGraphic } from './ProductImageGraphic';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setSelectedProductForModal, products } = useCart();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-rooveka-espresso/70 modal-backdrop-blur transition-opacity"
      />

      {/* Search Drawer */}
      <div className="relative z-10 bg-rooveka-cream w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-rooveka-border p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-rooveka-border pb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <Search size={20} className="text-rooveka-gold" />
            <input
              autoFocus
              type="text"
              placeholder="Search ROOVEKA products (70%, 50%, Hot Chocolate)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-sans text-rooveka-dark focus:outline-none placeholder-rooveka-muted"
            />
          </div>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-rooveka-dark hover:text-rooveka-gold p-1 transition-colors"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <span className="text-[9px] font-mono tracking-widest text-rooveka-muted uppercase font-bold block">
            RESULTS ({filteredProducts.length})
          </span>

          {filteredProducts.map((product) => {
            const defaultSize = product.sizes.find((s) => s.isPopular) || product.sizes[0];
            return (
              <div
                key={product.id}
                onClick={() => {
                  setIsSearchOpen(false);
                  setSelectedProductForModal(product);
                }}
                className="flex items-center space-x-4 p-3 bg-rooveka-cream-soft rounded-xl border border-rooveka-border/50 hover:border-rooveka-gold cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-rooveka-brown/10 border border-rooveka-border/40">
                  <ProductImageGraphic tag={product.imageTag} aspect="aspect-square" className="w-full h-full" />
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-serif font-bold text-rooveka-dark group-hover:text-rooveka-gold transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-rooveka-muted line-clamp-1">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-serif font-bold text-rooveka-dark block">
                    ₹{defaultSize.price}
                  </span>
                  <span className="text-[10px] text-rooveka-gold font-semibold uppercase tracking-wider">
                    VIEW →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
