import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen, setIsSearchOpen, setIsContactOpen, setIsAdminViewOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'contact') {
      setIsContactOpen(true);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-rooveka-cream/90 modal-backdrop-blur py-3 border-b border-rooveka-border/50 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Desktop Brand / Nav */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-rooveka-dark p-1 hover:text-rooveka-gold transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <a
            href="#"
            className="text-2xl sm:text-3xl font-serif tracking-widest font-bold text-rooveka-dark uppercase hover:text-rooveka-brown transition-colors"
          >
            ROOVEKA
          </a>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-widest text-rooveka-dark/80">
          <button
            onClick={() => scrollToSection('shop')}
            className="hover:text-rooveka-gold transition-colors uppercase py-1"
          >
            SHOP
          </button>
          <button
            onClick={() => scrollToSection('our-story')}
            className="hover:text-rooveka-gold transition-colors uppercase py-1"
          >
            OUR STORY
          </button>
          <button
            onClick={() => scrollToSection('bean-to-bar')}
            className="hover:text-rooveka-gold transition-colors uppercase py-1"
          >
            BEAN TO BAR
          </button>
          <button
            onClick={() => scrollToSection('hot-chocolate')}
            className="hover:text-rooveka-gold transition-colors uppercase py-1"
          >
            HOT CHOCOLATE
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="hover:text-rooveka-gold transition-colors uppercase py-1"
          >
            CONTACT
          </button>
        </nav>

        {/* Right Side: Actions (Search, Cart, Admin Toggle) */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 text-rooveka-dark hover:text-rooveka-gold transition-colors rounded-full"
            title="Search Products"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 text-rooveka-dark hover:text-rooveka-gold transition-colors rounded-full"
            title="View Cart"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rooveka-gold text-rooveka-dark text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard Button */}
          <button
            onClick={() => setIsAdminViewOpen(true)}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rooveka-dark text-rooveka-cream hover:bg-rooveka-gold hover:text-rooveka-dark transition-all text-[11px] font-sans font-semibold tracking-wider uppercase border border-rooveka-gold/30 shadow-sm"
            title="Open Admin Dashboard"
          >
            <LayoutDashboard size={14} />
            <span>ADMIN</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bg-rooveka-cream border-b border-rooveka-border shadow-xl p-6 flex flex-col space-y-4 animate-fade-in z-50">
          <span className="text-[10px] tracking-mega uppercase font-bold text-rooveka-gold">NAVIGATION</span>
          <button
            onClick={() => scrollToSection('shop')}
            className="text-left text-sm font-semibold tracking-widest text-rooveka-dark hover:text-rooveka-gold py-2 border-b border-rooveka-border/30"
          >
            SHOP
          </button>
          <button
            onClick={() => scrollToSection('our-story')}
            className="text-left text-sm font-semibold tracking-widest text-rooveka-dark hover:text-rooveka-gold py-2 border-b border-rooveka-border/30"
          >
            OUR STORY
          </button>
          <button
            onClick={() => scrollToSection('bean-to-bar')}
            className="text-left text-sm font-semibold tracking-widest text-rooveka-dark hover:text-rooveka-gold py-2 border-b border-rooveka-border/30"
          >
            BEAN TO BAR
          </button>
          <button
            onClick={() => scrollToSection('hot-chocolate')}
            className="text-left text-sm font-semibold tracking-widest text-rooveka-dark hover:text-rooveka-gold py-2 border-b border-rooveka-border/30"
          >
            HOT CHOCOLATE
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-left text-sm font-semibold tracking-widest text-rooveka-dark hover:text-rooveka-gold py-2 border-b border-rooveka-border/30"
          >
            CONTACT
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsAdminViewOpen(true);
            }}
            className="w-full py-2.5 bg-rooveka-dark text-rooveka-gold text-xs font-semibold tracking-widest uppercase rounded flex items-center justify-center space-x-2"
          >
            <LayoutDashboard size={14} />
            <span>OPEN ADMIN DASHBOARD</span>
          </button>

          <div className="pt-2 border-t border-rooveka-border/50 text-[11px] text-rooveka-muted font-serif italic text-center">
            Bean to Bar from Andhra Pradesh
          </div>
        </div>
      )}
    </header>
  );
};
