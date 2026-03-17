// Página completa del carrito de compras.
// VISUAL: tabla de productos, resumen de pedido, diseño AURA premium.
import { Link } from 'react-router-dom';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react';

export function CartPage() {
  const { items, totalItems, totalPrice, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(price);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="h-[73px]" />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex text-xs text-slate-400 gap-2 items-center">
          <Link to="/" className="hover:text-[#5B9FE3] transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#5B9FE3] transition-colors">Productos</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Carrito</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 aura-fade-in-up">
          Mi Carrito
        </h1>

        {!isLoggedIn ? (
          /* Not logged in */
          <div className="aura-fade-in-up flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <ShoppingBag className="h-9 w-9 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">Inicia sesión para ver tu carrito</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              Necesitas una cuenta para guardar productos en tu carrito y realizar pedidos.
            </p>
            <Link
              to="/login"
              className="mt-2 rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] px-8 py-3 text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : loading ? (
          /* Loading */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 aura-skeleton rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty cart */
          <div className="aura-fade-in-up flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <ShoppingBag className="h-9 w-9 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">Tu carrito está vacío</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              Explora nuestro catálogo y encuentra los productos perfectos para ti.
            </p>
            <Link
              to="/products"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] px-8 py-3 text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Explorar catálogo
            </Link>
          </div>
        ) : (
          /* Cart with items */
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] aura-fade-in-up">
            {/* Items list */}
            <div className="space-y-4">
              {items.map((item, i) => {
                const product = item.products;
                const price = Number(product?.price ?? 0);
                return (
                  <article
                    key={item.id}
                    className="aura-fade-in-scale flex gap-5 rounded-2xl border border-slate-100 bg-white p-5
                               shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
                               transition-all duration-300 group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${product?.id}`}
                      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-slate-50 overflow-hidden"
                    >
                      {product?.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-slate-300" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        {product?.category && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B9FE3]">
                            {typeof product.category === 'object' && product.category !== null
                              ? (product.category as any).name
                              : ''}
                          </span>
                        )}
                        <Link
                          to={`/product/${product?.id}`}
                          className="block text-sm font-semibold text-slate-800 hover:text-[#5B9FE3] line-clamp-2 transition-colors"
                        >
                          {product?.name ?? 'Producto'}
                        </Link>
                        <p className="text-xs text-slate-400 mt-1">
                          Precio ud.: {formatPrice(price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        {/* Quantity selector */}
                        <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            aria-label="Disminuir"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[36px] text-center text-sm font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            aria-label="Aumentar"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-lg font-extrabold text-slate-900">
                            {formatPrice(price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300
                                       hover:bg-rose-50 hover:text-rose-500 transition-all duration-200"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Clear cart button */}
              <button
                onClick={() => { if (window.confirm('¿Vaciar todo el carrito?')) clearCart(); }}
                className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vaciar carrito
              </button>
            </div>

            {/* Order summary sidebar */}
            <div className="h-fit sticky top-24 space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5">
                  <Sparkles className="h-4 w-4 text-[#5B9FE3]" />
                  Resumen del pedido
                </h2>

                <div className="space-y-3 text-sm border-b border-slate-100 pb-5 mb-5">
                  <div className="flex justify-between text-slate-600">
                    <span>Artículos ({totalItems})</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span className="font-medium text-emerald-600">Gratis</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-[#00D4FF] to-[#A855F7] bg-clip-text text-transparent">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <button
                  className="w-full rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                             px-4 py-3.5 text-sm font-bold text-white
                             hover:scale-[1.02] hover:shadow-[var(--shadow-glow-blue)]
                             active:scale-[0.98] transition-all duration-200"
                >
                  Finalizar compra
                </button>

                <Link
                  to="/products"
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500
                             hover:text-[#5B9FE3] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Seguir comprando
                </Link>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🔒', text: 'Pago seguro' },
                  { icon: '🚀', text: 'Envío 24-48h' },
                  { icon: '↩', text: 'Devolución gratis' },
                  { icon: '⭐', text: 'Calidad premium' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-xs font-medium text-slate-600">
                    <span>{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
