// Cabecera de la web: logo, navegación principal y botón de acceso/gestión.
// VISUAL: sticky + blur al hacer scroll; underline animado en links; CTA con microinteracción.
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { User } from 'lucide-react';
import logoImage from '/LogoAuraSinFondo.png';

export function Header() {
  const { isAdmin, isLoggedIn, profile, signOut } = useAuth();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);

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
        'fixed inset-x-0 top-0 z-50',
        'transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-sm'
          : 'bg-white border-b border-transparent',
      ].join(' ')}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-transform duration-200 hover:scale-105">
            <img src={logoImage} alt="AURA Logo" className="h-10 w-auto" />
          </Link>

          {/* Navegación */}
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

          {/* Área de usuario */}
          <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </header>
  );
}
