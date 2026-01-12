import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.context': 'Context',
    'nav.taste': 'Taste',
    'nav.variable': 'Variable',
    'nav.builder': 'Builder',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.mainTitle': 'Beyond the Noise',
    'hero.subtitle': 'Neo Lee - Critical Thinker & Creative Builder',
    'hero.tagline': 'Reconstructing AI Products with Taste and Judgment',
    
    // Content Pillars
    'pillar.context.title': 'Context Deconstruction',
    'pillar.context.subtitle': 'Scene Analysis',
    'pillar.context.desc': 'Most AI discussions stop at the tool level, rarely entering real-world actions, processes, and constraints. I care not about "what this model can do," but rather: in a specific scenario, what changes occurred in the division of labor between humans, systems, and AI. Only when technology enters the scene does judgment begin to become meaningful.',
    'pillar.context.anchor': 'Calm · Specific · Anti-demo thinking',
    
    'pillar.taste.title': 'Taste as Leverage',
    'pillar.taste.subtitle': 'Aesthetic Leverage',
    'pillar.taste.desc': 'Aesthetics is not decoration, but a decision-making capability. In an era where AI participates in creation and decision-making, what truly separates people is often not the upper limit of capability, but who knows what to ignore and what to persist in. Here I record those standards of judgment that are difficult to quantify but continuously affect product quality.',
    'pillar.taste.anchor': 'Subjective but not arbitrary · Measured · Takes a stand on good and bad',
    
    'pillar.variables.title': 'Variables & Constants',
    'pillar.variables.subtitle': 'Variables and Constants',
    'pillar.variables.desc': 'Technology updates quickly, but people repeatedly worry about the same problems. I try to distinguish rapidly changing tools from long-unchanged needs, motivations, and structures. Understanding what are variables and what are constants is a prerequisite for staying clear-headed amid noise.',
    'pillar.variables.anchor': 'Long-termism · Noise reduction · Let readers breathe',
    
    'pillar.builder.title': "Builder's Log",
    'pillar.builder.subtitle': 'Builder Notes',
    'pillar.builder.desc': 'Not all judgments come from successful experiences. Many more important cognitions come from hesitation, failure, and accidents during the building process. Here I record some building moments that are not complete enough, but real enough.',
    'pillar.builder.anchor': 'Honest · Anti-hero narrative · Insider notes for peers',
    'pillar.explore': 'Explore Essays',
    // Featured
    'featured.title': 'Latest Writing',
    'featured.viewAll': 'View all essays',
    
    // Themes
    'themes.title': 'Thinking Themes',
    'themes.subtitle': 'Recurring ideas that shape how I approach AI, products, and systems.',
    'theme.context.title': 'Context Deconstruction',
    'theme.context.desc': 'AI in real-world scenarios and workflows. Understanding what actually happens when technology meets human systems.',
    'theme.taste.title': 'Taste as Leverage',
    'theme.taste.desc': 'Product aesthetics, judgment, and intuition as competitive edges that compound over time.',
    'theme.variables.title': 'Variables & Constants',
    'theme.variables.desc': 'Separating fast-changing tools from enduring principles. What stays, what goes, and why.',
    'theme.builders.title': "Builder's Log",
    'theme.builders.desc': 'Practical notes, failures, and insights from building or observing products in the wild.',
    
    // About
    'about.label': 'About',
    'about.location': 'Chicago',
    'about.headline': 'Extract the 1% certainty.',
    'about.subheadline': 'Taste is not an ornament; it is a decision.',
    'about.pillar.focus.label': 'Focus',
    'about.pillar.focus.value': 'Systems Thinking',
    'about.pillar.role.label': 'Role',
    'about.pillar.role.value': 'Strategic Thinker',
    'about.pillar.belief.label': 'Belief',
    'about.pillar.belief.value': 'Taste is a Decision',
    'about.narrative.intro': 'Most discussions today are trapped in the noise of AI tools. I choose to focus on the systems behind them.',
    'about.narrative.main': "As a Strategic Thinker rooted in Systems Thinking, I help founders and product leaders navigate the gap between 'what AI can do' and 'what actually matters.' I believe that as technology becomes a commodity, the only enduring moats are human taste, contextual judgment, and the ability to see the system as a whole.",
    'about.connect': 'Connect',
    
    // Contact
    'contact.label': 'Get in Touch',
    'contact.headline': "Let's Connect",
    'contact.subtext': "I'm always open to conversations about AI products, systems thinking, and meaningful collaboration. Drop me a line.",
    'contact.location.label': 'Location',
    'contact.response.label': 'Response Time',
    'contact.response.value': '24-48 hours',
    
    // Footer
    'footer.copyright': '© 2024. Thoughts on AI, products, and systems.',
    'footer.rss': 'RSS',
    'footer.email': 'Email',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.context': '情境',
    'nav.taste': '品味',
    'nav.variable': '变量',
    'nav.builder': '构建',
    'nav.contact': '联系',
    
    // Hero
    'hero.mainTitle': '穿越噪音',
    'hero.subtitle': 'Neo Lee - 批判性思考者与创意构建者',
    'hero.tagline': '以品味与判断力重构AI产品',
    
    // Content Pillars
    'pillar.context.title': '场景拆解',
    'pillar.context.subtitle': 'Context Deconstruction',
    'pillar.context.desc': '大多数 AI 讨论止步于工具层，却很少进入真实世界的动作、流程与约束。我关心的不是"这个模型能做什么"，而是：在一个具体场景里，人、系统和 AI 的分工发生了什么变化。只有当技术进入场景，判断才开始变得有意义。',
    'pillar.context.anchor': '冷静 · 具体 · 反"demo 思维"',
    
    'pillar.taste.title': '审美杠杆',
    'pillar.taste.subtitle': 'Taste as Leverage',
    'pillar.taste.desc': '审美不是装饰，而是一种决策能力。在 AI 参与创作与决策的时代，真正拉开差距的，往往不是能力上限，而是谁知道什么该被忽略、什么值得坚持。这里记录那些难以量化，却持续影响产品质量的判断尺度。',
    'pillar.taste.anchor': '主观但不任性 · 有分寸 · 对"好坏"敢于站队',
    
    'pillar.variables.title': '变量与常量',
    'pillar.variables.subtitle': 'Variables & Constants',
    'pillar.variables.desc': '技术更新得很快，但人们反复为同样的问题焦虑。我尝试把快速变化的工具，与长期不变的需求、动机和结构区分开来。理解哪些是变量，哪些是常量，是在噪音中保持清醒的前提。',
    'pillar.variables.anchor': '长期主义 · 降噪 · 让读者"呼一口气"',
    
    'pillar.builder.title': '构建者笔记',
    'pillar.builder.subtitle': "Builder's Log",
    'pillar.builder.desc': '不是所有判断都来自成功经验。很多更重要的认知，来自构建过程中的迟疑、失败和意外。这里记录一些不够完整、但足够真实的构建瞬间。',
    'pillar.builder.anchor': '诚实 · 去英雄叙事 · 给同行看的"内行笔记"',
    'pillar.explore': '浏览文章',
    // Featured
    'featured.title': '最新文章',
    'featured.viewAll': '查看全部文章',
    
    // Themes
    'themes.title': '思考主题',
    'themes.subtitle': '塑造我对AI、产品和系统思考方式的核心理念。',
    'theme.context.title': '情境解构',
    'theme.context.desc': '真实场景和工作流中的AI。理解技术与人类系统相遇时究竟发生了什么。',
    'theme.taste.title': '品味作为杠杆',
    'theme.taste.desc': '产品美学、判断力和直觉作为随时间复利增长的竞争优势。',
    'theme.variables.title': '变量与常量',
    'theme.variables.desc': '区分快速变化的工具与持久不变的原则。什么会留下，什么会消失，以及为什么。',
    'theme.builders.title': '建造者日志',
    'theme.builders.desc': '来自构建或观察产品的实践笔记、失败教训和洞见。',
    
    // About
    'about.label': '关于',
    'about.location': '芝加哥',
    'about.headline': '提取1%的确定性。',
    'about.subheadline': '审美不是装饰，而是一种决策。',
    'about.pillar.focus.label': '专注',
    'about.pillar.focus.value': '系统思维',
    'about.pillar.role.label': '角色',
    'about.pillar.role.value': '战略思考者',
    'about.pillar.belief.label': '信念',
    'about.pillar.belief.value': '品味即决策',
    'about.narrative.intro': '当下的大多数讨论都被困在AI工具的噪音中。我选择专注于背后的系统。',
    'about.narrative.main': '作为一名根植于系统思维的战略思考者，我帮助创始人和产品负责人弥合"AI能做什么"与"什么真正重要"之间的鸿沟。我相信，当技术成为大宗商品时，唯一持久的护城河是人类品味、情境判断，以及从整体看待系统的能力。',
    'about.connect': '联系我',
    
    // Contact
    'contact.label': '联系方式',
    'contact.headline': '保持联系',
    'contact.subtext': '我始终乐于探讨AI产品、系统思维和有意义的合作。欢迎留言。',
    'contact.location.label': '所在地',
    'contact.response.label': '回复时间',
    'contact.response.value': '24-48小时',
    
    // Footer
    'footer.copyright': '© 2024. 关于AI、产品和系统的思考。',
    'footer.rss': 'RSS',
    'footer.email': '邮箱',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
