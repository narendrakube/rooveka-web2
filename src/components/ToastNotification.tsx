import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ToastNotification: React.FC = () => {
  const { toast } = useCart();

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className="bg-rooveka-espresso text-rooveka-cream px-4 py-3 rounded-xl shadow-2xl border border-rooveka-gold/40 flex items-center space-x-3 modal-backdrop-blur">
        <CheckCircle2 size={18} className="text-rooveka-gold shrink-0" />
        <span className="text-xs font-sans text-rooveka-cream font-medium">
          {toast.message}
        </span>
      </div>
    </div>
  );
};
