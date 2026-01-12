import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, MapPin } from 'lucide-react';
import { SectionNavigator } from './SectionNavigator';

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="min-h-screen bg-background flex items-center justify-center relative py-20 scroll-mt-0">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Top Identity Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-6 mb-16 gap-4 animate-fade-in">
          <div className="flex items-center gap-8 flex-wrap">
            <h2 className="font-serif text-2xl font-bold text-foreground">Neo Lee</h2>
            <a 
              href="mailto:g29tony@gmail.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>g29tony@gmail.com</span>
            </a>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{t('about.location')}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Visual Hook */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                "{t('about.headline')}"
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                "{t('about.subheadline')}"
              </p>
            </div>
          </div>

          {/* Right Column - Core Pillars & Narrative */}
          <div className="space-y-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Core Pillars - Identity Card */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 border border-border p-6 text-center hover:border-primary/40 transition-colors">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  {t('about.pillar.focus.label')}
                </span>
                <span className="font-serif text-lg font-semibold text-foreground">
                  {t('about.pillar.focus.value')}
                </span>
              </div>
              <div className="bg-muted/50 border border-border p-6 text-center hover:border-primary/40 transition-colors">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  {t('about.pillar.role.label')}
                </span>
                <span className="font-serif text-lg font-semibold text-foreground">
                  {t('about.pillar.role.value')}
                </span>
              </div>
              <div className="bg-muted/50 border border-border p-6 text-center hover:border-primary/40 transition-colors">
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  {t('about.pillar.belief.label')}
                </span>
                <span className="font-serif text-lg font-semibold text-foreground">
                  {t('about.pillar.belief.value')}
                </span>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about.narrative.intro')}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about.narrative.main')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <SectionNavigator targetId="context" />
    </section>
  );
}
