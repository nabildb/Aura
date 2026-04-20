// Página de catálogo: lista productos, filtros, ordenación y CRUD (para admin).
// VISUAL: sidebar pulido, barra de búsqueda con icono, cards con stagger animado, botones con microinteracciones.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/app/components/Header';
import { supabase } from '@/services/supabase';
import type { Product } from '@/types/product';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { ProductModal } from '@/app/components/ProductModal';
import { productService } from '@/services/productService';
import { Footer } from '@/app/components/Footer';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';

const fallbackCategories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros'];

const hasSupabaseConfig =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

export function CatalogPage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'relevance' | 'price-asc' | 'price-desc' | 'name' | 'recent'>('relevance');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenSort, setIsModalOpenSort] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Carga productos y categorías desde Supabase (usado en montaje y tras CRUD)
  async function loadProducts() {
    if (!hasSupabaseConfig) return;

    setLoading(true);
    setError('');

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, description, price, image_url, image_url_2, category_id, is_active, created_at, categories ( id, name, description, created_at )')
          .eq('is_active', true)
          .order('id', { ascending: true }),
        supabase.from('categories').select('id, name').order('name', { ascending: true }),
      ]);

      if (productResponse.error || categoryResponse.error) {
        throw new Error('No se pudieron cargar los productos desde Supabase.');
      }

      const normalizedProducts = (productResponse.data ?? []).map((row) => {
        const categoryValue = Array.isArray(row.categories) ? row.categories[0] : row.categories;
        return {
          id: row.id,
          name: row.name,
          description: row.description ?? '',
          price: row.price ?? null,
          image_url: row.image_url ?? null,
          image_url_2: row.image_url_2 ?? null,
          category_id: row.category_id ?? null,
          category: categoryValue
            ? { id: categoryValue.id, name: categoryValue.name, description: categoryValue.description ?? null, created_at: categoryValue.created_at ?? null }
            : null,
          is_active: row.is_active ?? null,
          created_at: row.created_at ?? null,
        } as Product;
      });

      const normalizedCategories = (categoryResponse.data ?? []).map((category) => category.name) ?? [];
      setProducts(normalizedProducts);
      setCategories(normalizedCategories.length > 0 ? normalizedCategories : fallbackCategories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  // Lista visible: aplica filtros de categoría, búsqueda, precio y ordenación
  const visibleProducts = useMemo(() => {
    let list = products.slice();

    if (selectedCategories.length > 0) {
      list = list.filter((product) => selectedCategories.includes(product.category?.name ?? ''));
    }

    if (query.trim() !== '') {
      const q = query.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.category?.name ?? '').toLowerCase().includes(q)
      );
    }

    if (sort === 'price-asc') list.sort((a, b) => (Number(a.price ?? 0) - Number(b.price ?? 0)));
    else if (sort === 'price-desc') list.sort((a, b) => (Number(b.price ?? 0) - Number(a.price ?? 0)));
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'recent') list.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });

    if (minPrice !== '') list = list.filter((p) => Number(p.price ?? 0) >= Number(minPrice));
    if (maxPrice !== '') list = list.filter((p) => Number(p.price ?? 0) <= Number(maxPrice));

    return list;
  }, [products, selectedCategories, query, sort, minPrice, maxPrice]);

  // Alterna selección de una categoría en los filtros
  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((v) => v !== category) : [...prev, category]
    );
  }

  // Guarda o actualiza producto usando el servicio y recarga la lista
  const handleSaveProduct = async (formData: any) => {
    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, formData);
    } else {
      await productService.createProduct(formData);
    }
    loadProducts();
  };

  // Elimina un producto vía servicio y recarga la lista
  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await productService.deleteProduct(id);
      loadProducts();
    }
  };

  // Formatea precio para mostrar en la UI
  function formatPrice(price: Product['price']) {
    if (!price) return 'Precio no disponible';
    const numericPrice = typeof price === 'string' ? Number(price) : price;
    if (Number.isNaN(numericPrice)) return 'Precio no disponible';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(numericPrice);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      {/* Espaciador para el header fijo */}
      <div className="h-[73px]" />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

          {/* ─── BOTÓN FILTROS MÓVIL (Solo lg e inferiores) ─── */}
          <div className="lg:hidden flex items-center justify-between mt-2 mb-[-1rem]">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#5B9FE3] hover:text-[#5B9FE3] active:scale-95 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Ver Filtros
            </button>
          </div>

          {/* ─── SIDEBAR / FILTROS ─────────────────────────────────── */}
          {/* Overlay Mobile */}
          <div 
             className={[
                'fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300',
                mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
             ].join(' ')}
             onClick={() => setMobileFiltersOpen(false)}
          />
          <aside className={[
             // Clases base y desktop
             'lg:block h-fit rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)] ring-1 ring-slate-100 p-6',
             // Clases mobile drawer
             'fixed lg:relative inset-y-0 left-0 z-[70] w-[280px] lg:w-auto h-full lg:h-fit overflow-y-auto lg:overflow-visible transition-transform duration-300 lg:translate-x-0',
             mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
          ].join(' ')}>
            {/* Header del sidebar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#00D4FF] to-[#A855F7]" />
                <h2 className="text-base font-bold text-slate-800">Categorías</h2>
              </div>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="lg:hidden h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lista de categorías */}
            <div className="space-y-1 text-sm text-slate-700">
              {categories.map((category) => {
                const checked = selectedCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2',
                      'transition-all duration-150',
                      checked
                        ? 'bg-gradient-to-r from-[#00D4FF]/10 to-[#A855F7]/10 text-[#5B9FE3] font-medium border border-[#5B9FE3]/20'
                        : 'border border-transparent hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-slate-300 accent-[#5B9FE3] transition"
                    />
                    {category}
                  </label>
                );
              })}
            </div>

            {/* Filtro precio */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#5B9FE3] to-[#A855F7]" />
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Precio (EUR)</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs
                             focus:outline-none focus:ring-2 focus:ring-[#5B9FE3]/40 focus:border-[#5B9FE3]
                             transition-all duration-200"
                />
                <span className="text-slate-300 font-bold">—</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs
                             focus:outline-none focus:ring-2 focus:ring-[#5B9FE3]/40 focus:border-[#5B9FE3]
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Botón limpiar filtros */}
            <button
              type="button"
              onClick={() => { setSelectedCategories([]); setMinPrice(''); setMaxPrice(''); }}
              className="mt-6 w-full rounded-xl border border-[#5B9FE3]/40 bg-white px-4 py-2.5
                         text-sm font-semibold text-[#5B9FE3]
                         hover:bg-gradient-to-r hover:from-[#00D4FF]/10 hover:to-[#A855F7]/10
                         hover:border-[#5B9FE3] active:scale-98
                         transition-all duration-200"
            >
              Limpiar filtros
            </button>
          </aside>

          {/* ─── CONTENIDO PRINCIPAL ───────────────────────────────── */}
          <section>
            {/* Breadcrumb */}
            <nav className="mb-6 flex text-xs text-slate-400 gap-2 items-center">
              <Link to="/" className="hover:text-[#5B9FE3] transition-colors duration-150">Inicio</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Productos</span>
            </nav>

            {/* Hero banner — colores AURA */}
            <div className="mb-10 overflow-hidden rounded-3xl relative
                            bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                            p-8 text-white shadow-[var(--shadow-card-hover)]">
              {/* Forma decorativa blur */}
              <div aria-hidden="true"
                className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div aria-hidden="true"
                className="absolute -left-6 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="relative z-10 max-w-md">
                <h2 className="text-3xl font-extrabold tracking-tight">Nuestra Colección</h2>
                <p className="mt-2 text-white/85 text-sm leading-relaxed">
                  Descubre los productos más destacados de la temporada. Calidad premium garantizada.
                </p>
              </div>
            </div>

            {/* Barra: título + búsqueda + ordenación */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Resultados</h1>
                  <p className="text-xs text-slate-500">
                    Mostrando <span className="font-semibold text-slate-700">{visibleProducts.length}</span> productos
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full max-w-xl">
                  {isAdmin && (
                    <button
                      onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                      className="whitespace-nowrap px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#5B9FE3]
                                 text-sm font-semibold text-white
                                 hover:scale-105 hover:shadow-[var(--shadow-glow-cyan)]
                                 active:scale-95 transition-all duration-200 hidden sm:block"
                    >
                      + Añadir
                    </button>
                  )}

                  {/* Barra de búsqueda con icono de lupa */}
                  <label className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm
                                 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B9FE3]/30
                                 focus:border-[#5B9FE3] transition-all duration-200"
                    />
                  </label>

                  {/* Dropdown de ordenación */}
                  <div className="relative inline-block text-left z-20">
                    <button
                      type="button"
                      onClick={() => setIsModalOpenSort(!isModalOpenSort)}
                      className="flex items-center justify-between gap-2 rounded-full border border-slate-200
                                 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm
                                 hover:border-[#5B9FE3] hover:text-[#5B9FE3]
                                 focus:outline-none transition-all duration-200"
                    >
                      <span className="hidden sm:inline">
                        {sort === 'relevance' && 'Relevancia'}
                        {sort === 'recent' && 'Más recientes'}
                        {sort === 'price-asc' && 'Precio: bajo → alto'}
                        {sort === 'price-desc' && 'Precio: alto → bajo'}
                        {sort === 'name' && 'Nombre A → Z'}
                      </span>
                      <span className="sm:hidden">Ordenar</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isModalOpenSort ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Menú desplegable con animación */}
                    <div
                      className={[
                        'absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-100',
                        'bg-white p-2 shadow-xl ring-1 ring-black/5 z-30',
                        'transition-all duration-200 ease-out',
                        isModalOpenSort ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
                      ].join(' ')}
                    >
                      {[
                        { id: 'relevance', label: 'Relevancia' },
                        { id: 'recent', label: 'Más recientes' },
                        { id: 'price-asc', label: 'Precio: bajo → alto' },
                        { id: 'price-desc', label: 'Precio: alto → bajo' },
                        { id: 'name', label: 'Nombre A → Z' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => { setSort(option.id as any); setIsModalOpenSort(false); }}
                          className={[
                            'flex w-full items-center rounded-xl px-4 py-2.5 text-sm transition-colors duration-150',
                            sort === option.id
                              ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#5B9FE3]/20 text-[#5B9FE3] font-semibold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-[#5B9FE3]',
                          ].join(' ')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {/* Overlay para cerrar al hacer clic fuera */}
                    {isModalOpenSort && (
                      <div className="fixed inset-0 z-10" onClick={() => setIsModalOpenSort(false)} />
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-rose-500">{error}</p>}
            </div>

            {/* ─── GRID DE CARDS ─────────────────────────────────── */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {loading
                ? /* Skeletons con shimmer */
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="h-80 aura-skeleton rounded-2xl" />
                ))
                : visibleProducts.map((product, i) => (
                  <article
                    key={`${product.id}-${visibleProducts.length}`}
                    /* Stagger de aparición al cargar y al filtrar (key fuerza re-mount) */
                    className="aura-fade-in-scale flex flex-col overflow-hidden rounded-3xl
                               border border-slate-200 bg-white shadow-[var(--shadow-card)]
                               hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1.5
                               transition-all duration-300 group relative"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    {/* Controles admin */}
                    {isAdmin && (
                      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                          className="bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-sky-50 text-sky-600 border border-slate-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-rose-50 text-rose-600 border border-slate-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}

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

                    {/* Info */}
                    <div className="px-6 pb-6 pt-4 flex-1 flex flex-col">
                      <div className="mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B9FE3]">
                          {product.category?.name ?? 'Sin categoría'}
                        </span>
                      </div>
                      <Link to={`/product/${product.id}`} className="hover:text-[#5B9FE3] transition-colors">
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{product.name}</h3>
                      </Link>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-slate-900">{formatPrice(product.price)}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500 flex-1 line-clamp-3 leading-relaxed">
                        {product.description}
                      </div>

                      {/* Botones de acción */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                        {/* Añadir al carrito — gradiente AURA + microinteracción */}
                        <button
                          onClick={() => {
                            if (!isLoggedIn) { navigate('/login'); return; }
                            addToCart(product.id);
                          }}
                          className="flex-1 rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                                     px-3 py-2.5 text-xs font-semibold text-white
                                     hover:scale-105 hover:shadow-[var(--shadow-glow-blue)]
                                     active:scale-95 transition-all duration-200"
                        >
                          Añadir al carrito
                        </button>
                        {/* Detalles */}
                        <Link
                          to={`/product/${product.id}`}
                          className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600
                                     hover:border-[#5B9FE3] hover:text-[#5B9FE3] hover:bg-[#5B9FE3]/5
                                     active:scale-95 transition-all duration-200"
                        >
                          Detalles
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        </div>
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
      <Footer />
    </div>
  );
}