export interface BlogPost {
  title: string;
  titleZh: string;
  excerpt: string;
  excerptZh: string;
  date: string;
  category: string;
  categoryZh: string;
  slug: string;
  readTime: string;
  content: string;
  contentZh: string;
  contentType?: 'markdown' | 'html';
  // When contentType === 'html', prefer htmlPath (public URL) or inline contentHtml
  htmlPath?: string;
  contentHtml?: string;
}
