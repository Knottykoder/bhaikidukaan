import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { AuthModal } from './components/AuthModal.js';
import { useAuthModalStore } from './stores/authModalStore.js';

// Pages
import { Home } from './pages/Home.js';
import { Products } from './pages/Products.js';
import { ProductDetail } from './pages/ProductDetail.js';
import { Checkout } from './pages/Checkout.js';
import { Orders } from './pages/Orders.js';
import { Profile } from './pages/Profile.js';

import { AiAssistant } from './components/AiAssistant.js';

export const App: React.FC = () => {
  const { isOpen, close, defaultTab, onAuthSuccess } = useAuthModalStore();

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#161c28',
              color: '#f8fafc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 12,
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            },
          }}
        />

        {/* Global Navigation */}
        <Navbar />

        {/* Global Sliding Cart Drawer */}
        <CartDrawer />

        {/* Global AI Shopping Assistant */}
        <AiAssistant />

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isOpen}
          onClose={close}
          defaultTab={defaultTab}
          onAuthSuccess={onAuthSuccess}
        />

        {/* Main Content View */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

