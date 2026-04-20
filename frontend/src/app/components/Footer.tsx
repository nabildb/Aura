// Pie de página: logo, enlaces de navegación secundarios, redes y contacto.
// VISUAL: fondo dark premium, fade-in al entrar en viewport, hover refinado en iconos y links.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '/LogoAuraSinFondo.png';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const footerRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    // Fade-in suave cuando el footer entra en el viewport
    useEffect(() => {
        const el = footerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.08 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const socialLinks = [
        { name: 'Facebook', href: 'https://www.facebook.com', icon: Facebook },
        { name: 'Instagram', href: 'https://www.instagram.com', icon: Instagram },
        { name: 'Twitter', href: 'https://www.twitter.com', icon: Twitter },
    ];

    return (
        <footer
            ref={footerRef}
            className={[
                'mt-20 bg-[#0f172a] text-slate-400',
                'border-t border-white/5',
                'transition-all duration-700 ease-out',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
            ].join(' ')}
        >
            <div className="mx-auto max-w-7xl px-6 pt-14 pb-32 md:py-14">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">

                    {/* Logo y descripción */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center group w-fit">
                            <img
                                src={logoImage}
                                alt="AURA Logo"
                                className="h-10 w-auto transition-transform duration-200 group-hover:scale-105 brightness-0 invert"
                            />
                        </Link>
                        <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-500">
                            AURA — Tu destino premium para los mejores productos tecnológicos, hogar y más.
                            Calidad y diseño inspirador en cada detalle.
                        </p>

                        {/* Redes sociales */}
                        <div className="mt-6 flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    aria-label={social.name}
                                    className="rounded-full bg-white/5 p-2.5 text-slate-400
                             hover:bg-gradient-to-br hover:from-[#00D4FF]/20 hover:to-[#A855F7]/20
                             hover:text-[#00D4FF] hover:-translate-y-1 hover:scale-110
                             transition-all duration-200"
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Tienda */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">Tienda</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Catálogo', path: '/products' },
                                { name: 'Novedades', path: '/products?sort=recent' },
                                { name: 'Promociones', path: '/products' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-slate-500 hover:text-[#00D4FF] hover:translate-x-1
                               inline-block transition-all duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Compañía */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">Compañía</h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Acerca de', path: '/about' },
                                { name: 'Contacto', path: '/contact' },
                                { name: 'Términos y Condiciones', path: '#' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-slate-500 hover:text-[#00D4FF] hover:translate-x-1
                               inline-block transition-all duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">Contacto</h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-slate-500">
                                <span className="text-base">📍</span>
                                <span>Calle Rosa, Melano 69</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-500">
                                <span className="text-base">📞</span>
                                <span>+34 676 76 67 67</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-500">
                                <span className="text-base">✉️</span>
                                <span>info@aura.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Línea divisoria y copyright */}
                <div className="mt-12 border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        &copy; {currentYear} AURA. Todos los derechos reservados.
                    </p>
                    {/* Degradado de marca sutil en línea de copyright */}
                    <span className="text-xs bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7] bg-clip-text text-transparent font-semibold">
                        Premium · Innovación · Calidad
                    </span>
                </div>
            </div>
        </footer>
    );
}
