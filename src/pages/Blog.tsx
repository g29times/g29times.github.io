import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EssayCard } from '@/components/EssayCard';
import { useLanguage } from '@/contexts/LanguageContext';

import postsData from '@/data/posts.json';
import { BlogPost } from '@/types/blog';

const allEssays = postsData as BlogPost[];

const Blog = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              {language === 'zh' ? '所有文章' : 'All Writing'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'zh' 
                ? '长篇思考与系列文章，探索AI、产品和系统。'
                : 'Long-form essays and series exploring AI, products, and systems.'}
            </p>
          </div>

          <div>
            {allEssays.map((essay) => (
              <EssayCard
                key={essay.slug}
                title={language === 'zh' ? essay.titleZh : essay.title}
                excerpt={language === 'zh' ? essay.excerptZh : essay.excerpt}
                date={essay.date}
                category={language === 'zh' ? essay.categoryZh : essay.category}
                slug={essay.slug}
                readTime={essay.readTime}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
