import { Link } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { User, Mail, LogOut, ShoppingBag } from 'lucide-react';

export function UserAccountPage() {
    const { user, profile, signOut } = useAuth();

    const displayName = profile?.full_name ?? user?.email ?? 'Usuario';
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
                    <div className="rounded-2xl border border-slate-100 bg-white p-6">
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

                    <div className="rounded-2xl border border-slate-100 bg-white p-6">
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

                {/* Quick Actions */}
                <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6">
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
