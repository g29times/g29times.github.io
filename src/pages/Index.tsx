import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { PillarSection } from '@/components/PillarSection';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

const pillars = [
  {
    id: 'context',
    titleKey: 'pillar.context.title',
    subtitleKey: 'pillar.context.subtitle',
    descKey: 'pillar.context.desc',
    anchorKey: 'pillar.context.anchor',
    path: '/blog?category=context',
    nextSection: 'taste',
    accentColor: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'taste',
    titleKey: 'pillar.taste.title',
    subtitleKey: 'pillar.taste.subtitle',
    descKey: 'pillar.taste.desc',
    anchorKey: 'pillar.taste.anchor',
    path: '/blog?category=taste',
    nextSection: 'variable',
    accentColor: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'variable',
    titleKey: 'pillar.variables.title',
    subtitleKey: 'pillar.variables.subtitle',
    descKey: 'pillar.variables.desc',
    anchorKey: 'pillar.variables.anchor',
    path: '/blog?category=variable',
    nextSection: 'builder',
    accentColor: 'from-amber-500 to-amber-600',
  },
  {
    id: 'builder',
    titleKey: 'pillar.builder.title',
    subtitleKey: 'pillar.builder.subtitle',
    descKey: 'pillar.builder.desc',
    anchorKey: 'pillar.builder.anchor',
    path: '/blog?category=builder',
    nextSection: 'contact',
    accentColor: 'from-rose-500 to-rose-600',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        {pillars.map((pillar, index) => (
          <PillarSection
            key={pillar.id}
            {...pillar}
            index={index}
          />
        ))}
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
