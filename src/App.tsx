import React, { useState } from 'react';
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
import { ShopPortal } from './components/ShopPortal';
import { CustomerRedemption } from './components/CustomerRedemption';
import { GiftCatalog } from './components/GiftCatalog';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ToastNotification } from './components/ToastNotification';

export function App() {
  const [showShopPortal, setShowShopPortal] = useState(false);
  const [showCustomerRewards, setShowCustomerRewards] = useState(false);
  const [showGiftCatalog, setShowGiftCatalog] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-rooveka-cream text-rooveka-dark flex flex-col font-sans selection:bg-rooveka-gold/20">
        {/* Navigation */}
        <Header
          onOpenShopPortal={() => setShowShopPortal(true)}
          onOpenCustomerRewards={() => setShowCustomerRewards(true)}
          onOpenGiftCatalog={() => setShowGiftCatalog(true)}
        />

        {/* Main Content Flow */}
        <main className="flex-grow">
          <Hero />
          <BrandIntro />
          <ProductCatalog />
          <HotChocolateFeature />
          <BeanToBarProcess />
          <AndhraStory />
          <QualityPillars />
          <IngredientPhilosophy />
          <FounderStory />
        </main>

        <Footer onOpenShopPortal={() => setShowShopPortal(true)} />

        {/* Interactive Drawers & Modals */}
        <ProductModal />
        <CartDrawer />
        <CheckoutModal />
        <SearchModal />
        <ContactModal />
        <AdminDashboard />

        {/* Shop & Customer Portals */}
        {showShopPortal && <ShopPortal onClose={() => setShowShopPortal(false)} />}
        {showCustomerRewards && <CustomerRedemption onClose={() => setShowCustomerRewards(false)} />}
        {showGiftCatalog && (
          <GiftCatalog
            onClose={() => setShowGiftCatalog(false)}
            onOpenRewards={() => { setShowGiftCatalog(false); setShowCustomerRewards(true); }}
          />
        )}

        {/* Floating Controls & Notifications */}
        <WhatsAppButton />
        <ToastNotification />
      </div>
    </CartProvider>
  );
}

export default App;
