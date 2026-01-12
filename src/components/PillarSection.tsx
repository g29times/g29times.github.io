import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionNavigator } from './SectionNavigator';

interface PillarSectionProps {
  id: string;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  anchorKey: string;
  path: string;
  nextSection: string;
  accentColor: string;
  index: number;
}

export function PillarSection({
  id,
  titleKey,
  subtitleKey,
  descKey,
  anchorKey,
  path,
  nextSection,
  accentColor,
  index,
}: PillarSectionProps) {
  const { t } = useLanguage();
  const isEven = index % 2 === 0;

  return (
    <section
      id={id}
      className="min-h-screen flex items-center justify-center relative py-20 scroll-mt-0"
    >
      <div className="container max-w-5xl mx-auto px-6">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
          {/* Content Side */}
          <div className={`space-y-8 animate-fade-in ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
            {/* Number & Title */}
            <div className="space-y-4">
              <span 
                className={`inline-block text-6xl md:text-8xl font-serif font-bold ${accentColor} opacity-20`}
              >
                0{index + 1}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground -mt-12">
                {t(titleKey)}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t(subtitleKey)}
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t(descKey)}
            </p>

            {/* Anchor Tags */}
            <div className="flex flex-wrap gap-3">
              {t(anchorKey).split('·').map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-sm px-4 py-2 rounded-full border border-border bg-muted/50 text-muted-foreground`}
                >
                  {tag.trim()}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              to={path}
              className="inline-flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors group"
            >
              <span className="underline-accent">{t('pillar.explore')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Visual Side */}
          <div className={`relative ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
            <div 
              className={`aspect-square rounded-3xl bg-gradient-to-br ${accentColor} opacity-10 absolute inset-0 blur-3xl`}
            />
            <div 
              className={`aspect-square rounded-3xl border border-border bg-gradient-to-br ${accentColor} bg-opacity-5 flex items-center justify-center relative`}
            >
              <span className="font-serif text-8xl md:text-9xl font-bold text-foreground/5">
                {t(titleKey).charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SectionNavigator targetId={nextSection} />
    </section>
  );
}
