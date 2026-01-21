import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-semibold prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-lg prose-p:leading-8 prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-lg prose-li:text-muted-foreground"
              components={{
                a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />
              }}
            >
              {language === 'zh' ? post.contentZh : post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
