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
  'taste-automation': {
    title: 'Taste Cannot Be Automated (Yet)',
    titleZh: '品味无法被自动化（目前）',
    date: 'December 2025',
    category: 'Taste as Leverage',
    categoryZh: '审美杠杆',
    readTime: '8 min read',
    content: `
## What Makes Something Feel "Right"?

In an age where AI can generate infinite variations of almost anything—images, code, copy, interfaces—the question is no longer "Can we make it?" but "Should we make it this way?"

This is where taste becomes leverage.

Taste isn't about decoration. It's a decision-making ability. It's knowing what to keep and what to discard. What to emphasize and what to mute. The gap between good and great products is rarely capability—it's curation.

## A Case Study in Craft: The Liquid Glass Lens

Let me show you what I mean with a concrete example. Visit this interactive demo:

[→ Experience the Magnifying Glass Component](https://g29times.github.io/liquid-dynamics/)

This component is a masterclass in tasteful engineering. At first glance, it's "just" a magnifying glass effect. But look closer:

**Dual Displacement Maps**
The component uses two displacement maps—one for the edge refraction (the subtle bending at the sides), and another for the zooming effect (the stronger distortion in the center). Most developers would use one. The choice to use two creates optical realism that your eye recognizes even if your mind doesn't consciously process it.

**Shadows and Scaling**
Watch what happens when you drag the lens. The shadow moves. The scale shifts. These micro-interactions create a sense of physical presence. The lens feels like it has weight.

**The Specular Bloom**
There's a subtle specular highlight—a hint of light reflection on the glass surface. This is pure attention to detail. It doesn't add functionality. It adds believability.

## Why This Matters

This lens could have been built in a thousand simpler ways. A basic CSS zoom. A single displacement filter. A static magnification circle.

But someone made a series of decisions:
- "The edge refraction should feel different from the center zoom."
- "The shadow should respond to movement."
- "There should be a hint of light on the glass."

These are taste decisions. They can't be algorithmically derived from requirements. They emerge from a cultivated sensibility about what makes interactions feel alive.

## The Hierarchy of Craft

I think about taste operating at three levels:

**Level 1: Correctness**
Does it work? Does it do what it says it does? Most products stop here.

**Level 2: Polish**
Is it smooth? Are the animations fluid? Do the interactions feel responsive? Good products reach here.

**Level 3: Soul**
Does it have a point of view? Do the details reveal intention? Does using it feel like encountering a considered opinion about how things should be?

The Liquid Glass lens operates at Level 3. Someone decided that a magnifying glass on a webpage should feel like holding actual glass.

## Taste as Competitive Advantage

Here's the insight that matters for builders:

AI can generate Level 1 outputs reliably. It's getting better at Level 2. But Level 3 remains stubbornly human.

Why? Because taste requires:
- **Cross-domain pattern recognition**: Knowing what makes physical glass feel "glassy" and translating that to pixels
- **Intentional constraint**: Choosing to stop adding features and start refining what exists
- **Conviction under ambiguity**: Deciding that this specific shadow opacity is correct when there's no spec to reference

These are precisely the capabilities that current AI struggles with. Not because they're computationally hard, but because they're contextually subtle.

## An Invitation

I encourage you to spend a few minutes with the demo. Drag the lens slowly. Watch the refraction. Notice the parameters at the bottom—Specular Opacity, Saturation, Refraction Level—and play with them.

Ask yourself: What makes this feel premium? What would be lost if any element were removed?

This exercise—developing the ability to notice and articulate what makes something excellent—is how taste is cultivated.

Taste is not an ornament. It is a decision.
    `,
    contentZh: `
## 什么让事物感觉"对"？

在AI可以生成几乎任何东西的无限变体的时代——图像、代码、文案、界面——问题不再是"我们能做吗？"而是"我们应该这样做吗？"

这就是品味成为杠杆的地方。

品味不是装饰。它是一种决策能力。它是知道什么该保留、什么该丢弃。什么该强调、什么该弱化。好产品和伟大产品之间的差距很少是能力——而是策展。

## 工艺案例研究：液态玻璃透镜

让我用一个具体的例子来说明我的意思。请访问这个交互演示：

[→ 体验放大镜组件](https://g29times.github.io/liquid-dynamics/)

这个组件是有品味的工程的典范。乍一看，它"只是"一个放大镜效果。但仔细看：

**双重位移贴图**
这个组件使用两个位移贴图——一个用于边缘折射（侧面的微妙弯曲），另一个用于缩放效果（中心更强的扭曲）。大多数开发者会使用一个。选择使用两个创造了光学真实感，即使你的头脑没有有意识地处理它，你的眼睛也能识别。

**阴影和缩放**
观察当你拖动镜头时会发生什么。阴影移动。比例变化。这些微交互创造了一种物理存在感。镜头感觉有重量。

**镜面高光**
有一个微妙的镜面高光——玻璃表面的光反射提示。这是纯粹的细节关注。它不增加功能。它增加可信度。

## 为什么这很重要

这个镜头可以用一千种更简单的方式构建。一个基本的CSS缩放。一个单一的位移滤镜。一个静态的放大圆。

但有人做出了一系列决定：
- "边缘折射应该与中心缩放感觉不同。"
- "阴影应该响应移动。"
- "玻璃上应该有一丝光芒。"

这些是品味决定。它们不能从需求中算法推导。它们来自于对什么使交互感觉生动的培养敏感度。

## 工艺层次

我认为品味在三个层面运作：

**第1层：正确性**
它工作吗？它做到它说的了吗？大多数产品止步于此。

**第2层：打磨**
它流畅吗？动画是否流畅？交互是否响应灵敏？好的产品达到这里。

**第3层：灵魂**
它有观点吗？细节是否揭示意图？使用它是否感觉像遇到了关于事物应该如何的深思熟虑的意见？

液态玻璃镜头在第3层运作。有人决定，网页上的放大镜应该感觉像拿着真正的玻璃。

## 品味作为竞争优势

这里是对建造者重要的洞察：

AI可以可靠地生成第1层输出。它在第2层越来越好。但第3层仍然顽固地是人类的。

为什么？因为品味需要：
- **跨领域模式识别**：知道什么使物理玻璃感觉"像玻璃"并将其转化为像素
- **有意的约束**：选择停止添加功能并开始精炼现有的东西
- **模糊中的信念**：在没有规格可参考时决定这个特定的阴影不透明度是正确的

这些正是当前AI难以做到的能力。不是因为它们计算困难，而是因为它们在情境上微妙。

## 邀请

我鼓励你花几分钟时间在演示上。慢慢拖动镜头。观察折射。注意底部的参数——镜面不透明度、饱和度、折射级别——并玩弄它们。

问自己：是什么让这感觉高级？如果任何元素被移除会失去什么？

这个练习——培养注意和阐明什么使某物卓越的能力——就是品味的培养方式。

审美不是装饰，而是一种决策能力。
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
