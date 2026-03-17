// Drawer lateral del carrito de compras.
// Se desliza desde la derecha con overlay oscuro. Estilo premium AURA.
import { Link } from 'react-router-dom';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const { items, totalItems, totalPrice, loading, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(price);
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={[
          'fixed right-0 top-0 z-[61] h-full w-full max-w-md flex flex-col',
          'bg-white shadow-2xl transition-transform duration-300 ease-out',
          drawerOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4FF]/15 to-[#A855F7]/15">
              <ShoppingBag className="h-4.5 w-4.5 text-[#5B9FE3]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mi Carrito</h2>
              <p className="text-xs text-slate-400">{totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ShoppingBag className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">Inicia sesión para ver tu carrito</p>
              <Link
                to="/login"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] px-6 py-2.5 text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-20 w-20 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-4 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ShoppingBag className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">Tu carrito está vacío</p>
              <p className="text-xs text-slate-400">Explora nuestro catálogo y añade productos</p>
              <Link
                to="/products"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] px-6 py-2.5 text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.products;
                const price = Number(product?.price ?? 0);
                return (
                  <div
                    key={item.id}
                    className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-3
                               hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${product?.id}`}
                      onClick={() => setDrawerOpen(false)}
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-50 overflow-hidden"
                    >
                      {product?.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-slate-300" />
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <Link
                          to={`/product/${product?.id}`}
                          onClick={() => setDrawerOpen(false)}
                          className="text-sm font-semibold text-slate-800 hover:text-[#5B9FE3] line-clamp-1 transition-colors"
                        >
                          {product?.name ?? 'Producto'}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatPrice(price)} /ud.
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            aria-label="Disminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[28px] text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            aria-label="Aumentar"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {formatPrice(price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300
                                       hover:bg-rose-50 hover:text-rose-500 transition-all"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {isLoggedIn && items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Subtotal</span>
              <span className="text-lg font-extrabold bg-gradient-to-r from-[#00D4FF] to-[#A855F7] bg-clip-text text-transparent">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Buttons */}
            <Link
              to="/cart"
              onClick={() => setDrawerOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl
                         bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                         px-4 py-3 text-sm font-bold text-white
                         hover:scale-[1.02] hover:shadow-[var(--shadow-glow-blue)]
                         active:scale-[0.98] transition-all duration-200"
            >
              <ShoppingBag className="h-4 w-4" />
              Ver carrito completo
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
