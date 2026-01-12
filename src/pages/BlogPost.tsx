import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';

// Sample blog post content
const blogPosts: Record<string, {
  title: string;
  titleZh: string;
  date: string;
  category: string;
  categoryZh: string;
  readTime: string;
  content: string;
  contentZh: string;
}> = {
  'context-problem': {
    title: 'Why Most AI Products Fail: The Context Problem',
    titleZh: '为什么大多数AI产品失败：情境问题',
    date: 'January 2026',
    category: 'Context Deconstruction',
    categoryZh: '情境解构',
    readTime: '12 min read',
    content: `
## The Demo Delusion

There's a peculiar pattern in AI product development that I've observed repeatedly: the demo works beautifully, the pilot shows promise, and then the product fails in production. Not because the AI doesn't work—it does—but because it works in the wrong context.

This isn't a technical problem. It's a context problem.

## What Context Actually Means

When we talk about context in AI products, we're not just talking about prompt engineering or fine-tuning. We're talking about the entire ecosystem of human behaviors, organizational workflows, and existing tools that any new product must navigate.

Consider a simple example: an AI writing assistant. The demo shows it generating beautiful prose. The pilot users love it. But in production, adoption stalls. Why?

Because the demo didn't account for:
- How people actually write (in fragments, across sessions, with constant interruptions)
- Where writing fits in their workflow (often at the end, under deadline pressure)
- What "good" means in their specific domain (legal writing ≠ marketing copy)
- Who else needs to review and approve the output

## The Context Stack

I think of context as a stack with four layers:

**Layer 1: Task Context**
What is the user actually trying to accomplish? Not what we think they should want, but what they genuinely need.

**Layer 2: Workflow Context**
How does this task fit into their broader work pattern? What happens before and after?

**Layer 3: Social Context**
Who else is involved? Who reviews, approves, or is affected by the output?

**Layer 4: Organizational Context**
What are the cultural norms, risk tolerances, and power dynamics that shape how tools get adopted?

Most AI products address Layer 1 reasonably well. Very few address all four.

## A Different Approach

The products that succeed tend to start from context, not capability. They ask: "Given how people actually work in this domain, where would AI create genuine value?" rather than "Given what AI can do, where can we apply it?"

This is slower. It's less impressive in demos. It doesn't generate viral Twitter threads.

But it builds products that people actually use.
    `,
    contentZh: `
## 演示的幻觉

在AI产品开发中，我反复观察到一个奇特的模式：演示效果出色，试点显示出希望，然后产品在生产中失败。不是因为AI不工作——它确实工作——而是因为它在错误的情境中工作。

这不是技术问题。这是情境问题。

## 情境真正意味着什么

当我们谈论AI产品中的情境时，我们不仅仅是在谈论提示工程或微调。我们谈论的是人类行为、组织工作流程和现有工具的整个生态系统——任何新产品都必须在其中导航。

考虑一个简单的例子：AI写作助手。演示显示它生成优美的散文。试点用户喜欢它。但在生产中，采用停滞。为什么？

因为演示没有考虑到：
- 人们实际上如何写作（片段式，跨会话，不断被打断）
- 写作如何融入他们的工作流程（通常在最后，在截止日期压力下）
- "好"在他们特定领域意味着什么（法律写作≠营销文案）
- 还有谁需要审查和批准输出

## 情境堆栈

我将情境视为具有四个层次的堆栈：

**第1层：任务情境**
用户实际上试图完成什么？不是我们认为他们应该想要什么，而是他们真正需要什么。

**第2层：工作流情境**
这个任务如何融入他们更广泛的工作模式？之前和之后发生了什么？

**第3层：社会情境**
还有谁参与？谁审查、批准或受输出影响？

**第4层：组织情境**
哪些文化规范、风险容忍度和权力动态塑造了工具的采用方式？

大多数AI产品相当好地解决了第1层。很少有产品解决所有四层。

## 不同的方法

成功的产品往往从情境开始，而不是从能力开始。他们问："鉴于人们在这个领域实际上如何工作，AI在哪里会创造真正的价值？"而不是"鉴于AI可以做什么，我们可以在哪里应用它？"

这更慢。在演示中不那么令人印象深刻。它不会产生病毒式的Twitter帖子。

但它构建了人们实际使用的产品。
    `,
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  
  const post = slug ? blogPosts[slug] : null;

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
