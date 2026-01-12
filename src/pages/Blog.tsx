import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EssayCard } from '@/components/EssayCard';
import { useLanguage } from '@/contexts/LanguageContext';

const allEssays = [
  {
    title: 'Why Most AI Products Fail: The Context Problem',
    titleZh: '为什么大多数AI产品失败：情境问题',
    excerpt: 'The gap between AI capability demos and actual product value is not technical—it\'s contextual. Understanding why reveals a different approach to building.',
    excerptZh: 'AI能力演示与实际产品价值之间的差距不是技术性的——而是情境性的。理解这一点揭示了一种不同的构建方法。',
    date: 'Jan 2026',
    category: 'Context Deconstruction',
    categoryZh: '情境解构',
    slug: 'context-problem',
    readTime: '12 min read',
  },
  {
    title: 'Taste Cannot Be Automated (Yet)',
    titleZh: '品味无法被自动化（目前）',
    excerpt: 'In a world of infinite generation, curation becomes the bottleneck. But taste is more than selection—it\'s pattern recognition across domains that machines don\'t traverse.',
    excerptZh: '在一个无限生成的世界中，策展成为瓶颈。但品味不仅仅是选择——它是机器无法跨越的领域间的模式识别。',
    date: 'Dec 2025',
    category: 'Taste as Leverage',
    categoryZh: '品味作为杠杆',
    slug: 'taste-automation',
    readTime: '8 min read',
  },
  {
    title: 'The Tools You Forget vs. The Principles You Keep',
    titleZh: '你遗忘的工具与你保留的原则',
    excerpt: 'A framework for deciding what to learn deeply and what to learn just enough. Spoiler: most tool-specific knowledge has a half-life of 18 months.',
    excerptZh: '一个决定什么要深入学习、什么只需浅尝辄止的框架。剧透：大多数工具特定知识的半衰期是18个月。',
    date: 'Nov 2025',
    category: 'Variables & Constants',
    categoryZh: '变量与常量',
    slug: 'tools-vs-principles',
    readTime: '10 min read',
  },
  {
    title: 'Building in Public: Three Months of Quiet Failures',
    titleZh: '公开构建：三个月的沉默失败',
    excerpt: 'A candid look at what didn\'t work, what I learned, and why I\'m still building. The messy middle of product development rarely gets documented.',
    excerptZh: '坦诚地审视什么没有奏效，我学到了什么，以及为什么我仍在构建。产品开发的混乱中段很少被记录。',
    date: 'Oct 2025',
    category: "Builder's Log",
    categoryZh: '建造者日志',
    slug: 'quiet-failures',
    readTime: '15 min read',
  },
  {
    title: 'The Attention Economy and AI: A Systems View',
    titleZh: '注意力经济与AI：系统视角',
    excerpt: 'How AI tools are reshaping attention patterns, and what this means for products competing for cognitive real estate.',
    excerptZh: 'AI工具如何重塑注意力模式，这对争夺认知空间的产品意味着什么。',
    date: 'Sep 2025',
    category: 'Context Deconstruction',
    categoryZh: '情境解构',
    slug: 'attention-economy',
    readTime: '11 min read',
  },
];

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
