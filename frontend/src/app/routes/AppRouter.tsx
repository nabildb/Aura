// Define las rutas de la SPA usando react-router.
// Cada ruta monta la página correspondiente.
import { HashRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/app/pages/HomePage';
import { CatalogPage } from '@/app/pages/CatalogPage';
import { ProductDetailPage } from '@/app/pages/ProductDetailPage';
import { AboutPage } from '@/app/pages/AboutPage';
import { ContactPage } from '@/app/pages/ContactPage';
import { LoginPage } from '@/app/pages/LoginPage';
import { AdminLoginPage } from '@/app/pages/AdminLoginPage';
import { UserAccountPage } from '@/app/pages/UserAccountPage';
import { CartPage } from '@/app/pages/CartPage';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { ScrollToTopButton } from '@/app/components/ScrollToTopButton';
import { CartDrawer } from '@/app/components/CartDrawer';

export default function AppRouter() {
  return (
    <HashRouter>
      <ScrollToTop />
      <ScrollToTopButton />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/products" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/account" element={<UserAccountPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
              <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold">Ruta no encontrada</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Prueba con / o /products
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}
