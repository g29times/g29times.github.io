import { useLanguage } from '@/contexts/LanguageContext';
import { Rss, Mail } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          
          <div className="flex items-center gap-6">
            <a
              href="/rss.xml"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Rss className="w-4 h-4" />
              {t('footer.rss')}
            </a>
            <a
              href="mailto:g29tony@gmail.com"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t('footer.email')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
