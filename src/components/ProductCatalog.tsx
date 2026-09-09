import React from 'react';
import { useCart } from '../context/CartContext';
import { ProductCard } from './ProductCard';

export const ProductCatalog: React.FC = () => {
  const { products } = useCart();

  return (
    <section id="shop" className="py-24 bg-rooveka-cream-soft border-t border-rooveka-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold tracking-mega text-rooveka-gold uppercase block">
            COLLECTION
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-rooveka-dark">
            Explore ROOVEKA
          </h2>
          <p className="text-sm sm:text-base text-rooveka-dark/70 font-light">
            Three ways to experience our chocolate. Hand-crafted in fresh batches in Andhra Pradesh.
          </p>
        </div>

        {/* 3-Column Desktop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
