import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import logoImage from '/LogoAuraSinFondo.png';

type Tab = 'login' | 'register';

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const resetForm = () => {
    setFullName(''); setEmail(''); setPassword('');
    setError(null); setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      // 1. Create user (trigger will auto-create profile row with role: 'user')
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // 2. Auto-login immediately
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      // 3. Update full_name in profile now that we have a session
      if (loginData.user && fullName) {
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', loginData.user.id);
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 py-16">
      {/* Background */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0d1b3e] to-slate-950" />
      <div aria-hidden className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00d4ff]/15 blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#a855f7]/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md aura-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logoImage} alt="AURA Logo" className="h-14 w-auto drop-shadow-[0_0_20px_rgba(0,212,255,0.35)]" />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-white/5 p-1 mb-2">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); resetForm(); }}
                className={[
                  'flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200',
                  tab === t
                    ? 'bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] text-white shadow'
                    : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <div className="p-6">
            <h1 className="text-xl font-extrabold text-white text-center">
              {tab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h1>
            <p className="mt-1 text-sm text-slate-400 text-center">
              {tab === 'login' ? 'Accede a tu cuenta personal.' : 'Es gratis, rápido y sencillo.'}
            </p>

            <form className="mt-6 space-y-4" onSubmit={tab === 'login' ? handleLogin : handleRegister}>
              {/* Error / Success */}
              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400 text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 text-center">
                  {success}
                </div>
              )}

              {/* Name (register only) */}
              {tab === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="full_name">Nombre completo</label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#5B9FE3] focus:ring-2 focus:ring-[#5B9FE3]/30 focus:outline-none transition-all"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="user-email">Correo</label>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#5B9FE3] focus:ring-2 focus:ring-[#5B9FE3]/30 focus:outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="user-password">Contraseña</label>
                <input
                  id="user-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#5B9FE3] focus:ring-2 focus:ring-[#5B9FE3]/30 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                           px-5 py-3.5 text-sm font-bold text-white
                           hover:scale-[1.02] hover:shadow-[var(--shadow-glow-blue)]
                           active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </>
                ) : tab === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>

              <Link to="/" className="block text-center text-sm text-slate-500 hover:text-[#5B9FE3] transition-colors mt-2">
                ← Volver al inicio
              </Link>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Área de clientes AURA · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
