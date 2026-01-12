import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Hero() {
  const { t } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section id="home" className="min-h-screen flex flex-col justify-center items-center bg-primary relative">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary-foreground mb-6 tracking-tight uppercase">
              {t('hero.mainTitle')}
            </h1>
            
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-foreground mb-4">
              {t('hero.subtitle')}
            </h2>

            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto">
              {t('hero.tagline')}
            </p>
          </div>
        </div>

        {/* Scroll down arrow */}
        <button
          onClick={scrollToAbout}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground hover:text-primary-foreground/70 transition-colors animate-bounce"
          aria-label="Scroll to About"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </section>

      {/* Back to top button - fixed globally */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 bg-foreground text-background rounded-full shadow-lg hover:bg-primary transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
}
