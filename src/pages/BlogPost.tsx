import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

import postsData from '@/data/posts.json';
import { BlogPost as BlogPostType } from '@/types/blog';

const allPosts = postsData as BlogPostType[];

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const [post, setPost] = useState<BlogPostType | null>(() =>
    slug ? allPosts.find((p) => p.slug === slug) ?? null : null,
  );

  useEffect(() => {
    if (!slug) {
      setPost(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
          headers: { accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = (await res.json()) as BlogPostType;
        if (!cancelled && data?.slug) setPost(data);
      } catch {
        // ignore and fallback to bundled posts.json
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container max-w-3xl mx-auto px-6">
            <p className="text-muted-foreground">
              {language === 'zh' ? '文章未找到' : 'Post not found'}
            </p>
            <Link to="/blog" className="link-subtle mt-4 inline-block">
              {language === 'zh' ? '返回所有文章' : 'Back to all posts'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <article className="container max-w-3xl mx-auto px-6">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'zh' ? '所有文章' : 'All writing'}
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-primary">
                {language === 'zh' ? post.categoryZh : post.category}
              </span>
              <span className="text-sm text-muted-foreground">
                {post.date}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {post.readTime}
              </span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              {language === 'zh' ? post.titleZh : post.title}
            </h1>
          </header>

          <div className="prose-blog">
            {(language === 'zh' ? post.contentZh : post.content)
              .split('\n')
              .map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl md:text-3xl font-serif font-semibold mt-12 mb-6 text-foreground">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <p key={index} className="text-lg font-semibold text-foreground mb-2">
                      {paragraph.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <li key={index} className="text-lg text-muted-foreground ml-6 mb-2 list-disc">
                      {paragraph.replace('- ', '')}
                    </li>
                  );
                }
                if (paragraph.trim()) {
                  // Handle links in the format [text](url)
                  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                  const parts = paragraph.split(linkRegex);
                  
                  if (parts.length > 1) {
                    const elements: React.ReactNode[] = [];
                    let i = 0;
                    let lastIndex = 0;
                    let match;
                    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
                    
                    while ((match = regex.exec(paragraph)) !== null) {
                      if (match.index > lastIndex) {
                        elements.push(paragraph.slice(lastIndex, match.index));
                      }
                      elements.push(
                        <a 
                          key={i++}
                          href={match[2]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          {match[1]}
                        </a>
                      );
                      lastIndex = match.index + match[0].length;
                    }
                    if (lastIndex < paragraph.length) {
                      elements.push(paragraph.slice(lastIndex));
                    }
                    
                    return (
                      <p key={index} className="text-lg leading-8 text-foreground mb-6">
                        {elements}
                      </p>
                    );
                  }
                  
                  return (
                    <p key={index} className="text-lg leading-8 text-foreground mb-6">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
