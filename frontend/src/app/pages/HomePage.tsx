// Página principal (landing): hero, destacados y llamadas a acción.
// VISUAL: hero atmosférico, entrada escalonada, cards con IntersectionObserver, hover premium, parallax desktop.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { supabase } from '@/services/supabase';
import type { Product } from '@/types/product';
import logoImage from '/LogoAuraSinFondo.png';

/* ── Datos de respaldo si Supabase no está configurado ── */
const fallbackFeatured: Product[] = [
  {
    id: 1,
    name: 'Producto 1',
    description: 'Descripción breve del producto destacado',
    category: { id: 1, name: 'Electrónica' },
    price: 129.99,
  },
  {
    id: 2,
    name: 'Producto 2',
    description: 'Descripción breve del producto destacado',
    category: { id: 2, name: 'Ropa' },
    price: 79.5,
  },
  {
    id: 3,
    name: 'Producto 3',
    description: 'Descripción breve del producto destacado',
    category: { id: 3, name: 'Hogar' },
    price: 54.0,
  },
];

const hasSupabaseConfig =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

/* ── Hook: dispara cuando un elemento entra en el viewport ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(fallbackFeatured);

  /* Parallax suave en hero — solo desktop, movimiento muy sutil */
  const heroRef = useRef<HTMLElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 768) return; // Solo desktop
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    if (blob1Ref.current) blob1Ref.current.style.transform = `translate(${cx * -24}px, ${cy * -20}px)`;
    if (blob2Ref.current) blob2Ref.current.style.transform = `translate(${cx * 24}px, ${cy * 20}px)`;
  };

  // IntersectionObservers para las secciones
  const featured = useInView(0.1);
  const teamSect = useInView(0.15);
  const ctaSect = useInView(0.2);

  // Carga productos destacados desde Supabase (fallback si no hay config)
  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      if (!hasSupabaseConfig) return;

      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, categories ( id, name, description, created_at )')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!isMounted || error) return;

      const normalized = (data ?? []).map((row) => {
        const categoryValue = Array.isArray(row.categories) ? row.categories[0] : row.categories;
        return {
          id: row.id,
          name: row.name,
          description: row.description ?? '',
          price: row.price ?? null,
          image_url: row.image_url ?? null,
          category: categoryValue
            ? { id: categoryValue.id, name: categoryValue.name, description: categoryValue.description ?? null, created_at: categoryValue.created_at ?? null }
            : null,
        } as Product;
      });

      setFeaturedProducts(normalized);
    }

    loadFeatured();
    return () => { isMounted = false; };
  }, []);

  // Formatea precio para mostrar en la UI
  function formatPrice(price: Product['price']) {
    if (price === null || price === undefined || price === '') return 'Precio no disponible';
    const numericPrice = typeof price === 'string' ? Number(price) : price;
    if (Number.isNaN(numericPrice)) return 'Precio no disponible';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(numericPrice);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden pt-36 pb-28 md:pt-44 md:pb-36"
      >
        {/* Fondo atmosférico: gradiente base */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-950"
        />

        {/* Blob decorativo 1 — cyan */}
        <div
          ref={blob1Ref}
          aria-hidden="true"
          className="absolute -top-32 -left-32 h-[480px] w-[480px]
                     rounded-full bg-[#00d4ff]/20 blur-[120px]
                     transition-transform duration-700 ease-out pointer-events-none"
        />
        {/* Blob decorativo 2 — purple */}
        <div
          ref={blob2Ref}
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 h-[400px] w-[400px]
                     rounded-full bg-[#a855f7]/20 blur-[100px]
                     transition-transform duration-700 ease-out pointer-events-none"
        />

        {/* Contenido del hero — entrada escalonada */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Logo */}
          <img
            src={logoImage}
            alt="AURA Logo"
            className="aura-fade-in-up aura-delay-0 h-24 w-auto mx-auto mb-8 drop-shadow-[0_0_30px_rgba(0,212,255,0.4)]"
          />

          {/* Título */}
          <h1 className="aura-fade-in-up aura-delay-1 text-5xl md:text-6xl font-extrabold
                         bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                         bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
            Bienvenido a AURA
          </h1>

          {/* Descripción */}
          <p className="aura-fade-in-up aura-delay-2 text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Descubre nuestra selección de productos de alta calidad diseñados para mejorar tu vida diaria.
            Innovación, calidad y compromiso en cada producto.
          </p>

          {/* CTA principal */}
          <div className="aura-fade-in-up aura-delay-3 inline-block">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-9 py-4
                         bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                         text-white rounded-full font-semibold text-lg
                         hover:scale-105 hover:shadow-[var(--shadow-glow-cyan)]
                         active:scale-95 transition-all duration-300"
            >
              Ver Catálogo Completo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTOS DESTACADOS ─────────────────────────────────── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div ref={featured.ref}>
            <h2 className={[
              'text-3xl font-bold text-center text-slate-800 mb-4',
              'transition-all duration-500',
              featured.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            ].join(' ')}>
              Productos Destacados
            </h2>
            <p className={[
              'text-center text-slate-500 mb-12 transition-all duration-500 delay-100',
              featured.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            ].join(' ')}>
              Una selección de nuestros mejores artículos para ti
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProducts.map((product, i) => (
                <div
                  key={product.id}
                  /* Entrada escalonada por índice cuando la sección es visible */
                  style={{ transitionDelay: `${i * 120}ms` }}
                  className={[
                    'group bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] border border-slate-100 overflow-hidden',
                    'transition-all duration-500',
                    'hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]',
                    featured.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                  ].join(' ')}
                >
                  {/* Imagen con zoom en hover — Ahora clicable */}
                  <Link
                    to={`/product/${product.id}`}
                    className="flex items-center justify-center p-6 bg-slate-50/60 overflow-hidden cursor-pointer"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-40 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-[#00D4FF]/10 to-[#A855F7]/10 rounded-xl p-6 shadow-inner ring-1 ring-slate-100">
                        <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
                          <rect width="64" height="48" rx="8" fill="#F1F5F9" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Info de la card */}
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B9FE3]">
                      {product.category?.name ?? 'Sin categoría'}
                    </span>
                    <Link to={`/product/${product.id}`} className="hover:text-[#5B9FE3] transition-colors">
                      <h3 className="mt-1 font-semibold text-slate-800 leading-snug">{product.name}</h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
                      <Link
                        to={`/product/${product.id}`}
                        className="text-sm font-medium text-[#5B9FE3] hover:text-[#A855F7]
                                   transition-colors duration-200 flex items-center gap-1"
                      >
                        Ver más
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={[
              'text-center mt-10 transition-all duration-500 delay-500',
              featured.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            ].join(' ')}>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-[#5B9FE3] hover:text-[#A855F7]
                           font-medium transition-colors duration-200 group"
              >
                Ver todos los productos
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NUESTRO EQUIPO ───────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div ref={teamSect.ref} className="max-w-5xl mx-auto">
            <h2 className={[
              'text-3xl font-bold text-center text-slate-800 mb-12 transition-all duration-500',
              teamSect.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            ].join(' ')}>
              Nuestro Equipo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Texto */}
              <div
                style={{ transitionDelay: '100ms' }}
                className={[
                  'order-2 md:order-1 transition-all duration-600',
                  teamSect.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
                ].join(' ')}
              >
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] bg-clip-text text-transparent mb-4">
                  Creadores de AURA
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Somos un equipo apasionado de profesionales dedicados a crear productos excepcionales.
                  Nuestra misión es combinar innovación, diseño y funcionalidad para ofrecer soluciones
                  que realmente marquen la diferencia.
                </p>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Con años de experiencia en el sector, nos comprometemos a mantener los más altos
                  estándares de calidad y a escuchar las necesidades de nuestros clientes.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <Link
                    to="/about"
                    className="px-6 py-3 border-2 border-[#5B9FE3] text-[#5B9FE3] rounded-full font-semibold
                               hover:bg-[#5B9FE3] hover:text-white hover:scale-105
                               active:scale-95 transition-all duration-200"
                  >
                    Conocer más
                  </Link>
                  <Link
                    to="/contact"
                    className="px-6 py-3 bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                               text-white rounded-full font-semibold
                               hover:scale-105 hover:shadow-[var(--shadow-glow-blue)]
                               active:scale-95 transition-all duration-200"
                  >
                    Contactar
                  </Link>
                </div>
              </div>

              {/* Imagen */}
              <div
                style={{ transitionDelay: '200ms' }}
                className={[
                  'order-1 md:order-2 transition-all duration-600',
                  teamSect.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
                ].join(' ')}
              >
                <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-card-hover)] ring-4 ring-white">
                  <img src="TEAM.png" className="w-full h-auto" alt="Equipo AURA" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20">
        {/* Fondo con gradiente sutil */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/8 via-[#5B9FE3]/8 to-[#A855F7]/8" />
        <div aria-hidden="true" className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%235b9fe3\' fill-opacity=\'0.04\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <div ref={ctaSect.ref} className="relative z-10 container mx-auto px-4">
          <div className={[
            'max-w-3xl mx-auto text-center transition-all duration-600',
            ctaSect.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          ].join(' ')}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              ¿Listo para explorar nuestros productos?
            </h2>
            <p className="text-slate-500 mb-10 text-lg">
              Descubre toda nuestra gama de productos y encuentra exactamente lo que necesitas.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-9 py-4
                         bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                         text-white rounded-full font-semibold text-lg
                         hover:scale-105 hover:shadow-[var(--shadow-glow-cyan)]
                         active:scale-95 transition-all duration-300"
            >
              Ir al Catálogo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
