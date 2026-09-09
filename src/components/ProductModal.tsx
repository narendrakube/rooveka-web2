import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImageGraphic } from './ProductImageGraphic';

export const ProductModal: React.FC = () => {
  const { selectedProductForModal, setSelectedProductForModal, addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (selectedProductForModal) {
      const defaultOption = selectedProductForModal.sizes.find((s) => s.isPopular) || selectedProductForModal.sizes[0];
      setSelectedSize(defaultOption.label);
      setQuantity(1);
    }
  }, [selectedProductForModal]);

  if (!selectedProductForModal) return null;

  const currentSizeOption = selectedProductForModal.sizes.find((s) => s.label === selectedSize) || selectedProductForModal.sizes[0];
  const totalPrice = currentSizeOption.price * quantity;

  const handleAddToCart = () => {
    addToCart(selectedProductForModal, currentSizeOption.label, currentSizeOption.price, quantity);
    setSelectedProductForModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop with Blur */}
      <div 
        onClick={() => setSelectedProductForModal(null)}
        className="fixed inset-0 bg-rooveka-espresso/70 modal-backdrop-blur transition-opacity"
      />

      {/* Centered Modal Card */}
      <div className="relative z-10 bg-rooveka-cream w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-rooveka-border flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductForModal(null)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-rooveka-dark/10 hover:bg-rooveka-dark/20 text-rooveka-dark flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Left Side Visual */}
        <div className="md:w-1/2 bg-rooveka-brown/5 flex items-center justify-center p-4">
          <ProductImageGraphic tag={selectedProductForModal.imageTag} aspect="aspect-square" className="rounded-xl overflow-hidden w-full" />
        </div>

        {/* Right Side Content */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Cocoa Tag */}
            {selectedProductForModal.cocoaPercentage && (
              <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-gold block">
                COCOA INTENSITY: {selectedProductForModal.cocoaPercentage}
              </span>
            )}

            <h2 className="text-2xl font-serif font-bold text-rooveka-dark">
              {selectedProductForModal.name}
            </h2>

            <p className="text-xs text-rooveka-dark/75 font-light leading-relaxed">
              {selectedProductForModal.fullDescription}
            </p>

            {/* Tasting Notes */}
            <div className="pt-2">
              <span className="text-[9px] tracking-mega text-rooveka-muted uppercase font-bold block mb-1.5">
                TASTING NOTES
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProductForModal.tastingNotes.map((note, i) => (
                  <span key={i} className="text-[10px] bg-rooveka-beige/60 text-rooveka-dark px-2 py-0.5 rounded font-mono">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-5 pt-4 border-t border-rooveka-border/60">
            {/* Size Selector */}
            <div className="space-y-2">
              <span className="text-[10px] tracking-mega font-bold text-rooveka-dark/80 uppercase block">
                SELECT SIZE:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {selectedProductForModal.sizes.map((size) => {
                  const isSelected = size.label === selectedSize;
                  return (
                    <button
                      key={size.label}
                      onClick={() => setSelectedSize(size.label)}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-rooveka-gold bg-rooveka-gold/10 text-rooveka-dark shadow-sm'
                          : 'border-rooveka-border bg-rooveka-cream hover:border-rooveka-gold/50 text-rooveka-dark/70'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isSelected && <Check size={14} className="text-rooveka-gold" />}
                        <span>{size.label}</span>
                      </div>
                      <span className="font-mono text-[11px]">₹{size.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-mega font-bold text-rooveka-dark/80 uppercase">
                QUANTITY:
              </span>
              <div className="flex items-center space-x-3 bg-rooveka-beige/50 border border-rooveka-border px-3 py-1.5 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-rooveka-dark hover:text-rooveka-gold transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-mono font-bold text-xs text-rooveka-dark">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-rooveka-dark hover:text-rooveka-gold transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart CTA Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-rooveka-dark text-rooveka-cream rounded-lg text-xs font-sans font-semibold tracking-widest uppercase hover:bg-rooveka-brown transition-all duration-300 shadow-md flex items-center justify-center space-x-2"
            >
              <span>ADD TO CART</span>
              <span>—</span>
              <span className="font-mono text-rooveka-gold">₹{totalPrice}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
