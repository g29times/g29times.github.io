-- D1 schema for blog posts

CREATE TABLE IF NOT EXISTS posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  titleZh TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  excerptZh TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  categoryZh TEXT NOT NULL,
  readTime TEXT NOT NULL,
  content TEXT NOT NULL,
  contentZh TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date);
