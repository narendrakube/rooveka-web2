import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const whatsappNumber = '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hello ROOVEKA, I have an inquiry regarding your bean-to-bar chocolates.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 p-3.5 bg-[#25D366] text-white rounded-full shadow-xl hover:bg-[#20bd5a] transition-all duration-300 transform hover:scale-105 animate-pulse-subtle flex items-center justify-center group"
      title="Chat with ROOVEKA on WhatsApp"
      aria-label="Contact via WhatsApp"
    >
      <MessageCircle size={22} fill="currentColor" className="text-white" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 bg-rooveka-dark text-rooveka-cream text-[10px] tracking-wider uppercase font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-rooveka-gold/30">
        Chat with ROOVEKA
      </span>
    </a>
  );
};
