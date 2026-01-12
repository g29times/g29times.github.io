import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface EssayCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  readTime?: string;
}

export function EssayCard({ title, excerpt, date, category, slug, readTime }: EssayCardProps) {
  return (
    <article className="group py-8 border-b border-border last:border-b-0">
      <Link to={`/blog/${slug}`} className="block">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">
            {date}
          </span>
          {readTime && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{readTime}</span>
            </>
          )}
        </div>
        
        <h3 className="font-serif text-2xl font-medium text-foreground group-hover:text-primary transition-colors mb-3">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {excerpt}
        </p>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          Read essay
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </article>
  );
}
