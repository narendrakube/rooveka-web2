import React from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BrandIntro } from './components/BrandIntro';
import { ProductCatalog } from './components/ProductCatalog';
import { HotChocolateFeature } from './components/HotChocolateFeature';
import { BeanToBarProcess } from './components/BeanToBarProcess';
import { AndhraStory } from './components/AndhraStory';
import { QualityPillars } from './components/QualityPillars';
import { IngredientPhilosophy } from './components/IngredientPhilosophy';
import { FounderStory } from './components/FounderStory';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { ContactModal } from './components/ContactModal';
import { AdminDashboard } from './components/AdminDashboard';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ToastNotification } from './components/ToastNotification';

export function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-rooveka-cream text-rooveka-dark flex flex-col font-sans selection:bg-rooveka-gold/20">
        {/* Navigation */}
        <Header />

        {/* Main Content Flow */}
        <main className="flex-grow">
          {/* Hero Section */}
          <Hero />

          {/* Brand Introduction ("THE ROOVEKA WAY") */}
          <BrandIntro />

          {/* Product Catalog ("Explore ROOVEKA" - 3 Core Products) */}
          <ProductCatalog />

          {/* Dedicated Hot Chocolate Experience & 4-Step Guide */}
          <HotChocolateFeature />

          {/* Bean to Bar 8-Stage Journey */}
          <BeanToBarProcess />

          {/* Andhra Pradesh Terroir & Origin Story */}
          <AndhraStory />

          {/* 4 Quality & Trust Pillars */}
          <QualityPillars />

          {/* Ingredient Philosophy ("Nothing to Hide") */}
          <IngredientPhilosophy />

          {/* Founder & Artisan Story */}
          <FounderStory />
        </main>

        {/* Footer */}
        <Footer />

        {/* Interactive Drawers & Modals */}
        <ProductModal />
        <CartDrawer />
        <CheckoutModal />
        <SearchModal />
        <ContactModal />
        
        {/* Admin Dashboard */}
        <AdminDashboard />

        {/* Floating Controls & Notifications */}
        <WhatsAppButton />
        <ToastNotification />
      </div>
    </CartProvider>
  );
}

export default App;
