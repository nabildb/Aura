import { Link } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { User, Mail, LogOut, ShoppingBag, Trash2, Minus, Plus, Sparkles } from 'lucide-react';

export function UserAccountPage() {
    const { user, profile, signOut } = useAuth();
    const { items, totalPrice, updateQuantity, removeFromCart, loading: cartLoading } = useCart();

    const displayName = profile?.full_name ?? user?.email ?? 'Usuario';
    const formatPrice = (price: number) => 
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />

            <main className="mx-auto max-w-4xl px-6 py-24">
                {/* Profile Card */}
                <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] text-3xl font-extrabold text-white shadow-lg">
                            {initials}
                        </div>

                        <div className="text-center sm:text-left flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-sky-500">Mi Cuenta</p>
                            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{displayName}</h1>
                            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                            <span className="mt-3 inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
                                Cliente AURA
                            </span>
                        </div>

                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600
                         hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Correo</p>
                                <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nombre</p>
                                <p className="text-sm font-semibold text-slate-900">{profile?.full_name ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mi Carrito Actual */}
                <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-[#5B9FE3]" />
                            Mi Carrito Actual
                        </h2>
                        {items.length > 0 && (
                            <Link to="/cart" className="text-xs font-bold text-[#5B9FE3] hover:underline transition-all">
                                Gestionar Carrito Completo
                            </Link>
                        )}
                    </div>

                    {cartLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-20 aura-skeleton rounded-2xl" />)}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 mb-4 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Tu carrito está vacío</p>
                            <Link to="/products" className="mt-4 text-xs font-bold text-[#5B9FE3] hover:text-[#A855F7] transition-all">
                                Explorar productos &#8594;
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 hover:border-slate-100 transition-all">
                                    <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center">
                                        {item.products?.image_url ? (
                                            <img src={item.products.image_url} alt={item.products.name} className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <ShoppingBag className="h-6 w-6 text-slate-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.products?.name}</p>
                                        <p className="text-xs text-slate-400">{formatPrice(Number(item.products?.price ?? 0))}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center rounded-lg border border-slate-200">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-slate-400 hover:text-slate-600"><Minus className="h-3 w-3" /></button>
                                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-400 hover:text-slate-600"><Plus className="h-3 w-3" /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subtotal</p>
                                    <p className="text-xl font-extrabold bg-gradient-to-r from-[#00D4FF] to-[#A855F7] bg-clip-text text-transparent">
                                        {formatPrice(totalPrice)}
                                    </p>
                                </div>
                                <Link to="/cart" className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all">
                                    Finalizar Compra
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Acciones Rápidas</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/products"
                            className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-all"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Ver Catálogo
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
