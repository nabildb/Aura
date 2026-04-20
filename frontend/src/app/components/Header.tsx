// Cabecera de la web: logo, navegación principal y botón de acceso/gestión.
// VISUAL: sticky + blur al hacer scroll; underline animado en links; CTA con microinteracción.
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import logoImage from '/LogoAuraSinFondo.png';

export function Header() {
  const { isAdmin, isLoggedIn, profile, signOut } = useAuth();
  const { totalItems, setDrawerOpen } = useCart();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [mobileMenuOpen]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const displayName = profile?.full_name ?? '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-[100]',
        'transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-sm'
          : 'bg-white border-b border-transparent',
      ].join(' ')}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          {/* Logo - Contenedor flexible izquierdo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center transition-transform duration-200 hover:scale-105">
              <img src={logoImage} alt="AURA Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Navegación - Centrada en el espacio restante */}
          <nav className="hidden md:flex gap-6">
            {[
              { to: '/', label: 'Inicio' },
              { to: '/products', label: 'Productos' },
              { to: '/about', label: 'Acerca de' },
              { to: '/contact', label: 'Contacto' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? 'page' : undefined}
                className={[
                  'aura-nav-link text-sm font-medium transition-colors duration-200 pb-0.5',
                  isActive(to) ? 'text-[#5B9FE3]' : 'text-slate-600 hover:text-[#5B9FE3]',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Carrito + Área de usuario - Contenedor flexible derecho */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {/* Icono del carrito */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200
                         text-slate-600 hover:border-[#5B9FE3] hover:text-[#5B9FE3] hover:bg-sky-50
                         active:scale-95 transition-all duration-200"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full
                                 bg-gradient-to-r from-[#00D4FF] to-[#A855F7] text-[10px] font-extrabold text-white
                                 shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
            {isAdmin ? (
              /* Admin logged in */
              <button
                onClick={() => signOut()}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-full text-sm font-medium
                           hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50
                           active:scale-95 transition-all duration-200"
              >
                Cerrar Sesión
              </button>
            ) : isLoggedIn ? (
              /* Normal user logged in */
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5
                           text-sm font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50
                           hover:text-sky-600 transition-all duration-200"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full
                                 bg-gradient-to-br from-[#00D4FF] to-[#A855F7] text-xs font-extrabold text-white">
                  {initials !== '?' ? initials : <User className="h-4 w-4" />}
                </span>
                <span className="hidden sm:inline">{profile?.full_name?.split(' ')[0] ?? 'Mi Cuenta'}</span>
              </Link>
            ) : (
              /* Not logged in */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-full text-sm font-semibold
                             hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50
                             active:scale-95 transition-all duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/admin/login"
                  className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                             text-white rounded-full text-sm font-semibold
                             hover:scale-105 hover:shadow-[var(--shadow-glow-blue)]
                             active:scale-95 transition-all duration-200"
                >
                  Acceso Admin
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200
                         text-slate-600 hover:border-[#5B9FE3] hover:text-[#5B9FE3] hover:bg-sky-50
                         transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE MENU OVERLAY ─── */}
      <div 
        className={[
          'fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        ].join(' ')}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ─── MOBILE MENU DRAWER ─── */}
      <div 
        className={[
          'fixed top-0 right-0 z-[120] h-[100dvh] w-[280px] bg-white/95 backdrop-blur-md border-l border-slate-200/70 shadow-2xl',
          'transition-transform duration-300 ease-in-out md:hidden flex flex-col',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        ].join(' ')}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <img src={logoImage} alt="AURA Logo" className="h-8 w-auto mix-blend-multiply" />
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-6 overflow-y-auto">
          {[
            { to: '/', label: 'Inicio' },
            { to: '/products', label: 'Productos' },
            { to: '/about', label: 'Acerca de' },
            { to: '/contact', label: 'Contacto' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={[
                'px-4 py-3 rounded-xl text-base font-semibold transition-colors',
                isActive(to) 
                  ? 'bg-gradient-to-r from-[#00D4FF]/10 to-[#5B9FE3]/10 text-[#5B9FE3]' 
                  : 'text-slate-600 hover:bg-slate-50'
              ].join(' ')}
            >
              {label}
            </Link>
          ))}

          <div className="my-6 border-t border-slate-100" />
          
          {/* User actions on mobile */}
          {!isAdmin && !isLoggedIn && (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 border border-slate-200 text-slate-600 text-center rounded-xl text-sm font-semibold active:scale-95 transition-transform"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] text-white text-center rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-[var(--shadow-glow-cyan)]"
              >
                Acceso Admin
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
