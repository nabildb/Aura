// Página de detalle de producto: galería, ficha, tabs y productos relacionados.
// VISUAL: header offset, galería con ring AURA, precio con gradiente, tabs con underline AURA, related cards stagger.
import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import type { Product } from '@/types/product';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';

const fallbackImages = [
  'https://placehold.co/600x400?text=Producto',
  'https://placehold.co/600x400?text=Imagen+2',
];

const hasSupabaseConfig =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);


export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');
  // related products no necesitan IntersectionObserver:
  // el div se renderiza DESPUÉS del fetch async, así que la animación
  // CSS se activa automáticamente al aparecer en el DOM.

  // Cargar el producto por id y productos relacionados
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!hasSupabaseConfig) return;

      const productId = Number(id);
      if (!productId || Number.isNaN(productId)) { setError('Producto no válido.'); return; }

      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, image_url_2, category_id, is_active, created_at, categories ( id, name, description, created_at )')
        .eq('id', productId)
        .single();

      if (!isMounted) return;

      if (fetchError || !data) {
        setError('No se pudo cargar el producto.');
        setLoading(false);
        return;
      }

      const categoryValue = Array.isArray(data.categories) ? data.categories[0] : data.categories;
      const normalizedProduct = {
        id: data.id,
        name: data.name,
        description: data.description ?? '',
        price: data.price ?? null,
        image_url: data.image_url ?? null,
        image_url_2: data.image_url_2 ?? null,
        category_id: data.category_id ?? null,
        category: categoryValue
          ? { id: categoryValue.id, name: categoryValue.name, description: categoryValue.description ?? null, created_at: categoryValue.created_at ?? null }
          : null,
        is_active: data.is_active ?? null,
        created_at: data.created_at ?? null,
      } as Product;

      setProduct(normalizedProduct);
      setLoading(false);

      // Productos relacionados
      if (normalizedProduct.category_id) {
        const { data: relatedData } = await supabase
          .from('products')
          .select('id, name, price, image_url, category_id')
          .eq('category_id', normalizedProduct.category_id)
          .neq('id', productId)
          .eq('is_active', true)
          .limit(4);

        if (relatedData) setRelatedProducts(relatedData as Product[]);
      }
    }

    loadProduct();
    return () => { isMounted = false; };
  }, [id]);

  const images = useMemo(() => {
    const productImages = [product?.image_url, product?.image_url_2].filter(
      (v): v is string => Boolean(v)
    );
    return productImages.length > 0 ? productImages : fallbackImages;
  }, [product?.image_url, product?.image_url_2]);

  useEffect(() => { setSelected(0); }, [images.length]);

  function formatPrice(price: Product['price']) {
    if (price === null || price === undefined || price === '') return 'Precio no disponible';
    const n = typeof price === 'string' ? Number(price) : price;
    if (Number.isNaN(n)) return 'Precio no disponible';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);
  }

  const tabs = [
    { id: 'description', label: 'Descripción' },
    { id: 'specs', label: 'Especificaciones' },
    { id: 'shipping', label: 'Envío y Devoluciones' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      {/* Offset para header fijo */}
      <div className="h-[73px]" />

      <div className="px-6 py-12">
        <div className="mx-auto w-full max-w-5xl">

          {/* Breadcrumb */}
          <nav className="mb-8 flex text-xs text-slate-400 gap-2 items-center">
            <Link to="/" className="hover:text-[#5B9FE3] transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#5B9FE3] transition-colors">Productos</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium truncate max-w-[200px]">
              {product?.category?.name ?? 'Detalle'}
            </span>
          </nav>

          <div className="grid gap-10 md:grid-cols-2 aura-fade-in-up">
            {/* ─── Galería ──────────────────────────────────────────── */}
            <div className="flex gap-4">
              {/* Miniaturas */}
              <div className="hidden md:flex flex-col gap-3 items-start">
                {images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    onClick={() => setSelected(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    className={[
                      'overflow-hidden rounded-xl border-2 p-0.5 transition-all duration-200',
                      i === selected
                        ? 'border-[#5B9FE3] shadow-[var(--shadow-glow-blue)]'
                        : 'border-slate-200 hover:border-slate-300',
                    ].join(' ')}
                  >
                    <img src={src} alt={`thumb ${i + 1}`} className="h-20 w-24 object-contain bg-white rounded-lg" />
                  </button>
                ))}
              </div>

              {/* Imagen principal */}
              <div className="flex-1">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)]
                                ring-1 ring-slate-100 group">
                  <img
                    src={images[selected]}
                    alt={`Producto ${product?.name ?? id} imagen ${selected + 1}`}
                    className="w-full h-96 object-contain bg-white p-6 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Miniaturas móvil */}
                <div className="mt-4 flex gap-3 md:hidden overflow-x-auto">
                  {images.map((src, i) => (
                    <button
                      key={`m-${src}-${i}`}
                      onClick={() => setSelected(i)}
                      aria-label={`Ver imagen ${i + 1}`}
                      className={[
                        'overflow-hidden rounded-xl border-2 p-0.5 shrink-0 transition-all duration-200',
                        i === selected ? 'border-[#5B9FE3]' : 'border-slate-200',
                      ].join(' ')}
                    >
                      <img src={src} alt={`thumb ${i + 1}`} className="h-16 w-24 object-contain bg-white rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Ficha del producto ───────────────────────────────── */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)] sticky top-24">
              {product?.category?.name && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B9FE3]">
                  {product.category.name}
                </span>
              )}

              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 leading-snug">
                {product?.name ?? `Producto ${id}`}
              </h1>

              {/* Precio + badge */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-[#00D4FF] to-[#A855F7] bg-clip-text text-transparent">
                  {formatPrice(product?.price ?? null)}
                </span>
                <span className={[
                  'rounded-full px-3 py-1 text-xs font-bold',
                  product?.is_active === false
                    ? 'text-slate-500 bg-slate-100'
                    : 'text-emerald-700 bg-emerald-100',
                ].join(' ')}>
                  {product?.is_active === false ? 'No disponible' : '✓ En stock'}
                </span>
              </div>

              {/* Estrellas */}
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-yellow-400 tracking-tighter">★★★★★</span>
                <span className="font-semibold text-slate-900">4.5</span>
                <span className="text-slate-400 text-xs">(120 reseñas)</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {product?.description ?? 'Descripción breve del producto.'}
              </p>

              {loading && <p className="mt-4 text-xs text-slate-400">Cargando...</p>}
              {error && <p className="mt-4 text-xs text-rose-500">{error}</p>}

              {/* Selector de cantidad */}
              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Disminuir cantidad"
                    className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >−</button>
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                    aria-label="Cantidad"
                    className="w-14 text-center text-sm font-semibold py-2 outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Aumentar cantidad"
                    className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >+</button>
                </div>

                {/* Agregar al carrito — gradiente AURA */}
                <button
                  onClick={() => {
                    if (!isLoggedIn) { navigate('/login'); return; }
                    addToCart(Number(id), quantity);
                  }}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl
                                   bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                                   px-4 py-2.5 text-sm font-bold text-white
                                   hover:scale-105 hover:shadow-[var(--shadow-glow-blue)]
                                   active:scale-95 transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.35 2.7A1 1 0 007 17h10m-5 4a1 1 0 110-2 1 1 0 010 2zm-6 0a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                  Agregar al carrito
                </button>

                <button
                  onClick={() => {
                    if (!isLoggedIn) { navigate('/login'); return; }
                    addToCart(Number(id), quantity).then(() => navigate('/cart'));
                  }}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200
                                   px-4 py-2.5 text-sm font-semibold text-slate-700
                                   hover:border-[#5B9FE3] hover:text-[#5B9FE3]
                                   active:scale-95 transition-all duration-200">
                  Comprar ahora
                </button>
              </div>
            </div>
          </div>

          {/* ─── TABS ─────────────────────────────────────────────── */}
          <div className="mt-16 border-t border-slate-100 pt-12">
            {/* Pestañas */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 gap-1 pb-px scrollbar-hide">
              {tabs.map(({ id: tabId, label }) => (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={[
                    'relative px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-200',
                    activeTab === tabId
                      ? 'text-[#5B9FE3]'
                      : 'text-slate-400 hover:text-slate-600',
                  ].join(' ')}
                >
                  {label}
                  {/* Underline animado bajo la pestaña activa */}
                  {activeTab === tabId && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full
                                     bg-gradient-to-r from-[#00D4FF] to-[#A855F7]
                                     aura-fade-in-scale" />
                  )}
                </button>
              ))}
            </div>

            {/* Contenido de tabs */}
            <div className="py-8 aura-fade-in">
              {activeTab === 'description' && (
                <div className="space-y-4 max-w-2xl">
                  <h3 className="text-xl font-bold text-slate-900">Sobre este producto</h3>
                  <p className="text-slate-600 leading-relaxed">{product?.description}</p>
                  <p className="text-slate-600 leading-relaxed">
                    Nuestros productos están fabricados con los más altos estándares de calidad, asegurando
                    durabilidad y un rendimiento excepcional. El diseño ergonómico y moderno se integra
                    perfectamente en tu estilo de vida.
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="max-w-xl">
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        ['Material', 'Premium Gradual'],
                        ['Dimensiones', 'Variable según modelo'],
                        ['Peso', 'Ligero y resistente'],
                        ['Garantía', '2 años de fabricante'],
                        ['Origen', 'Importado / Local'],
                      ].map(([key, val]) => (
                        <tr key={key} className="border-b border-slate-100 last:border-0 text-sm group">
                          <td className="py-3.5 font-semibold text-slate-900 w-1/3 group-hover:text-[#5B9FE3] transition-colors">{key}</td>
                          <td className="py-3.5 text-slate-600">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
                  {[
                    {
                      title: '🚀 Envío Rápido',
                      body: 'Entregamos en 24-48h en toda la península. Envío gratuito en pedidos superiores a 50€.',
                    },
                    {
                      title: '↩ Devoluciones Sencillas',
                      body: '¿No es lo que esperabas? Tienes 30 días para realizar tu devolución de forma totalmente gratuita.',
                    },
                  ].map(({ title, body }) => (
                    <div key={title}
                      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]">
                      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── PRODUCTOS RELACIONADOS ───────────────────────────── */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="aura-fade-in-up text-2xl font-bold text-slate-900 mb-8">
                También te puede interesar
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    /* Stagger: cada card aparece 80 ms después de la anterior */
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="aura-fade-in-scale group flex flex-col"
                  >
                    <div className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-white
                                    shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
                                    transition-shadow duration-300">
                      <img
                        src={p.image_url ?? '/placeholder.png'}
                        alt={p.name}
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-108"
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-[#5B9FE3] transition-colors">{p.name}</h3>
                      <p className="mt-1 text-sm font-bold bg-gradient-to-r from-[#5B9FE3] to-[#A855F7] bg-clip-text text-transparent">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
