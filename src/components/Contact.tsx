import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, ArrowUpRight } from 'lucide-react';

export function Contact() {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      className="min-h-screen flex items-center justify-center relative py-20 bg-muted/30"
    >
      <div className="container max-w-4xl mx-auto px-6 text-center">
        <div className="space-y-8 animate-fade-in">
          {/* Label */}
          <span className="inline-block px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-full">
            {t('contact.label')}
          </span>

          {/* Headline */}
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {t('contact.headline')}
          </h2>

          {/* Subtext */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('contact.subtext')}
          </p>

          {/* Email CTA */}
          <a
            href="mailto:g29tony@gmail.com"
            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-primary transition-colors group"
          >
            <Mail className="w-5 h-5" />
            <span>g29tony@gmail.com</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          {/* Additional Info */}
          <div className="pt-8 flex flex-wrap justify-center gap-8 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm uppercase tracking-wider mb-1">{t('contact.location.label')}</p>
              <p className="font-medium text-foreground">{t('about.location')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-wider mb-1">{t('contact.response.label')}</p>
              <p className="font-medium text-foreground">{t('contact.response.value')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
