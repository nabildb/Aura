import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div
            className={[
                'fixed bottom-8 left-8 z-50 transition-all duration-300',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            ].join(' ')}
        >
            <button
                onClick={scrollToTop}
                className="flex h-12 w-12 items-center justify-center rounded-full
                   bg-gradient-to-r from-[#00D4FF] via-[#5B9FE3] to-[#A855F7]
                   text-white shadow-[var(--shadow-glow-cyan)]
                   hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label="Volver arriba"
            >
                <ChevronUp className="h-6 w-6" />
            </button>
        </div>
    );
}
