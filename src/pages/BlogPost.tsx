import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import showdown from 'showdown';
import parse, { DOMNode, Element, domToReact } from 'html-react-parser';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BlogChart } from '@/components/BlogChart';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

import postsData from '@/data/posts.json';
import { BlogPost as BlogPostType } from '@/types/blog';

const allPosts = postsData as BlogPostType[];

// Helper to extract text from a node recursively
const getText = (node: DOMNode): string => {
  if (node.type === 'text') return node.data || '';
  if (node.type === 'tag' && (node as Element).children) {
    return (node as Element).children.map(getText).join('');
  }
  return '';
};

const stripScriptsAndHead = (html: string) => {
  const withoutScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  const bodyMatch = withoutScripts.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : withoutScripts;
};

const extractTableData = (node: Element) => {
  if (node.name !== 'table') return null;

  const thead = node.children.find(c => c.type === 'tag' && c.name === 'thead') as Element;
  const tbody = node.children.find(c => c.type === 'tag' && c.name === 'tbody') as Element;

  if (!thead || !tbody) return null;

  // Parse Headers
  const headerRow = thead.children.find(c => c.type === 'tag' && c.name === 'tr') as Element;
  if (!headerRow) return null;

  const headers = headerRow.children
    .filter(c => c.type === 'tag' && c.name === 'th')
    .map(th => getText(th as Element).trim());

  // We expect at least: MetricName, Description (optional), Value1, Value2...
  // Heuristic: If we have "Databricks" or "Snowflake" in headers, it's likely our target table
  const targetKeywords = ['Databricks', 'Snowflake', 'ClickHouse'];
  const dataKeys: string[] = [];
  const valueIndices: number[] = [];

  headers.forEach((h, i) => {
    // Clean header: remove (得分) or similar
    const cleanHeader = h.replace(/\(.*\)/, '').trim();
    if (targetKeywords.some(k => cleanHeader.includes(k))) {
      dataKeys.push(cleanHeader);
      valueIndices.push(i);
    }
  });

  if (dataKeys.length < 2) return null; // Need at least 2 series to compare

  // Parse Rows
  const rows = tbody.children.filter(c => c.type === 'tag' && c.name === 'tr') as Element[];
  const data = rows.map(row => {
    const cells = row.children.filter(c => c.type === 'tag' && c.name === 'td') as Element[];
    if (cells.length < headers.length) return null;

    const name = getText(cells[0] as Element).replace(/\(.*\)/, '').trim(); // First column is usually the metric
    
    const rowData: any = { name };
    let hasValidNumber = false;

    valueIndices.forEach((colIndex, i) => {
      const valText = getText(cells[colIndex] as Element).replace(/\*\*/g, '').trim();
      const val = parseFloat(valText);
      if (!isNaN(val)) {
        rowData[dataKeys[i]] = val;
        hasValidNumber = true;
      } else {
        rowData[dataKeys[i]] = 0;
      }
    });

    return hasValidNumber ? rowData : null;
  }).filter(Boolean);

  if (data.length === 0) return null;

  return { data, keys: dataKeys };
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const [post, setPost] = useState<BlogPostType | null>(() =>
    slug ? allPosts.find((p) => p.slug === slug) ?? null : null,
  );
  const [isFetching, setIsFetching] = useState(true);
  const [htmlSource, setHtmlSource] = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setIsFetching(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
          headers: { accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = (await res.json()) as BlogPostType;
        if (!cancelled && data?.slug) setPost(data);
      } catch {
        // ignore and fallback to bundled posts.json
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();

    return () => {
      cancelled = true;
      setIsFetching(false);
    };
  }, [slug]);

  const converter = useMemo(() => {
    const cvbw = new showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
      openLinksInNewWindow: true,
      emoji: true
    });
    return cvbw;
  }, []);

  useEffect(() => {
    if (!post) {
      setHtmlSource('');
      setContentLoading(false);
      return;
    }

    if (post.contentType === 'html') {
      const inline = language === 'zh' ? (post.contentHtml ?? post.contentZh) : (post.contentHtml ?? post.content);
      if (inline && inline.trim()) {
        setHtmlSource(inline);
        setContentLoading(false);
        return;
      }
      if (post.htmlPath) {
        setContentLoading(true);
        (async () => {
          try {
            const res = await fetch(post.htmlPath);
            if (!res.ok) throw new Error('fetch html failed');
            const text = await res.text();
            setHtmlSource(text);
          } catch {
            setHtmlSource('');
          } finally {
            setContentLoading(false);
          }
        })();
        return;
      }
      setHtmlSource('');
      setContentLoading(false);
    } else {
      setHtmlSource('');
      setContentLoading(false);
    }
  }, [post, language]);

  const htmlContent = useMemo(() => {
    if (!post) return '';

    // Raw HTML path / inline HTML takes precedence when contentType === 'html'
    if (post.contentType === 'html') {
      return stripScriptsAndHead(htmlSource || '');
    }

    const content = language === 'zh' ? post.contentZh : post.content;
    const safeContent = typeof content === 'string'
      ? content
      : content == null
        ? ''
        : String(content);
    const html = converter.makeHtml(safeContent);
    return typeof html === 'string' ? html : '';
  }, [post, language, converter, htmlSource]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container max-w-3xl mx-auto px-6">
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
        <div className="report-page">
          <article className="report-container">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'zh' ? '所有文章' : 'All writing'}
          </Link>

          <header className="mb-12">
            <div className="report-meta mb-4">
              <span className="report-tag">
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
            
            <h1 className="report-title">
              {language === 'zh' ? post.titleZh : post.title}
            </h1>
          </header>

          <div className="prose-blog">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-semibold prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-lg prose-p:leading-8 prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-lg prose-li:text-muted-foreground">
              {typeof htmlContent === 'string' && htmlContent.trim() ? (
                parse(htmlContent, {
                  replace: (domNode) => {
                    if (domNode instanceof Element) {
                      if (domNode.name === 'script') return null;
                      if (domNode.name === 'table') {
                        const chartInfo = extractTableData(domNode);
                        if (chartInfo) {
                          return (
                            <div className="my-8">
                              <BlogChart data={chartInfo.data} keys={chartInfo.keys} />
                              <div className="overflow-x-auto">
                                {domToReact([domNode])}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="overflow-x-auto my-8">
                            {domToReact([domNode])}
                          </div>
                        );
                      }
                    }
                  }
                })
              ) : (isFetching || contentLoading) ? (
                <p className="text-muted-foreground">
                  {language === 'zh' ? '正在加载正文…' : 'Loading post content…'}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {language === 'zh'
                    ? '这篇文章的正文内容还未提供。'
                    : 'The body content for this post is not available yet.'}
                </p>
              )}
            </div>
          </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
