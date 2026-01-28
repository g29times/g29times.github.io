export type DailyLink = {
  title?: string;
  url: string;
};

export type DailyItem =
  | string
  | {
      text: string;
      links?: DailyLink[];
    };

export type DailyEntry = {
  date: string; // YYYY-MM-DD
  done: DailyItem[];
  todo?: DailyItem[];
  note?: string;
};

// 样例数据，真实使用时可替换为你的日常记录
export const dailyLog: DailyEntry[] = [
  {
    "date": "2025-12-16",
    "done": [
      "犀照离职"
    ]
  },
  {
    "date": "2025-12-17",
    "done": [
      "电子烟 PCB 芯片调研"
    ]
  },
  {
    "date": "2025-12-18",
    "done": [
      "电子烟 PCB 芯片调研"
    ]
  },
  {
    "date": "2025-12-19",
    "done": [
      "电子烟 PCB 芯片调研"
    ]
  },
  {
    "date": "2025-12-20",
    "done": [
      "周六日休息"
    ]
  },
  {
    "date": "2025-12-21",
    "done": [
      "周六日休息"
    ]
  },
  {
    "date": "2025-12-23",
    "done": [
      "营销获客客户沟通（董欣欣）"
    ]
  },
  {
    "date": "2025-12-24",
    "done": [
      "营销获客客户沟通（董欣欣）"
    ]
  },
  {
    "date": "2025-12-25",
    "done": [
      "短视频工厂/短剧剪辑",
      "Aimmar 雏形设计"
    ]
  },
  {
    "date": "2025-12-26",
    "done": [
      "短视频工厂/短剧剪辑",
      "Aimmar 雏形设计"
    ]
  },
  {
    "date": "2025-12-27",
    "done": [
      "短视频工厂/短剧剪辑",
      "Aimmar 雏形设计"
    ]
  },
  {
    "date": "2025-12-28",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2025-12-29",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2025-12-30",
    "done": [
      "大模型备案珠海客户沟通",
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2025-12-31",
    "done": [
      "大模型备案珠海客户沟通",
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-01",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-02",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-03",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-04",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-05",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-06",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-07",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
    ]
  },
  {
    "date": "2026-01-08",
    "done": [
      "R2 存储和资源管理"
    ]
  },
  {
    "date": "2026-01-09",
    "done": [
      "音频处理",
      "支付集成 (Stripe Link)",
      "Way2AGI Vibe Coding 训练营"
    ]
  },
  {
    "date": "2026-01-10",
    "done": [
      "Shapes 相关工作"
    ]
  },
  {
    "date": "2026-01-11",
    "done": [
      "阿里巴巴相关",
      "香港徒步"
    ]
  },
  {
    "date": "2026-01-12",
    "done": [
      "个人博客维护",
      "浏览 Substack"
    ]
  },
  {
    "date": "2026-01-13",
    "done": [
      "芍药花朵研究",
      "CrewAI 研究"
    ]
  },
  {
    "date": "2026-01-14",
    "done": [
      "Lidar 3D 高斯分布研究",
      "面试数据 AI 创业公司"
    ]
  },
  {
    "date": "2026-01-16",
    "done": [
      "Manus 调研",
      "语鲸相关",
      "MCP Browser 能力研究",
      "面试通信集团"
    ]
  },
  {
    "date": "2026-01-17",
    "done": [
      "会见林工",
      "匹克球",
      "市场部田亦爽联系"
    ]
  },
  {
    "date": "2026-01-18",
    "done": [
      "会见林工",
      "匹克球",
      "市场部田亦爽联系",
      "添加了个人记忆"
    ]
  },
  {
    "date": "2026-01-19",
    "done": [
      "面试艾草"
    ]
  },
  {
    "date": "2026-01-20",
    "done": [
      "博客 D1 持久化",
      "宽凳复习"
    ]
  },
  {
    "date": "2026-01-21",
    "done": [
      "中商惠民复习",
      "手机端全通",
      "发布 4 篇中英文双语博客（ClickHouse对比、Lovart分析、AI意识错觉、Long-running Agents）",
      "修复博客 Markdown 渲染逻辑，更换为 Showdown.js 并集成 Typography",
      "开发 BlogChart 组件，实现文章表格数据自动化图表可视化",
      "重构 post_blog.py 为通用发布工具，支持内存处理与 JSON 输入",
      "部署 Cloudflare Worker Cron 任务，实现 Lightning endpoint 自动保活"
    ],
    "note": "全自动化生产力提升日"
  },
  {
    "date": "2026-01-22",
    "done": [
      "重构 weekly-digest-worker，将博客生成逻辑迁移至 JiJi (tmux agent) 实现本地化处理",
      "集成 Localtunnel 指令分发系统，实现 Worker 自动触发 JiJi 执行复杂 LLM 任务",
      "解决远程环境下 Wrangler OAuth 授权登录问题，更新至重要知识库",
      "成功部署并测试阮一峰周刊自动化同步流程（Issue 381 测试通过）"
    ]
  },
  {
    "date": "2026-01-23",
    "done": [
      "会见饭搭子社交创始人"
    ]
  },
  {
    "date": "2026-01-24",
    "done": [
      "使用 coze 扣子 2.0 制作定期任务",
      "完成研究报告：东西方思维差异与基因决定论（分析基因决定论角色，探讨神经科学框架及社会影响）"
    ]
  },
  {
    "date": "2026-01-25",
    "done": [
      "完成研究报告：脑机接口与神经AI融合的2026全景（分析技术趋势、产业格局、伦理挑战和投资机会）",
      "打通 hook，扣子 和 cf隧道"
    ]
  },
  {
    "date": "2026-01-26",
    "done": [
      { text: "对比clawdbot和coze，详情请阅读链接内容：", links: [{ title: "compare", url: "https://blog.aimmar.ink/blog/modular-ai-architecture-vs-clawdbot" }] },
      "完成研究报告：牡丹、芍药的谱系和演化研究"
    ]
  },
  {
    "date": "2026-01-27",
    "done": [
      "完成研究报告：工作记忆元认知的神经群体编码机制"
    ]
  },
  {
    "date": "2026-01-28",
    "done": [
      "完成研究报告：AI设计集成电路/芯片/PCB的研究和工业落地进展",
      "完成stats页面霍金等人的agents顾问团，内容分析及todo建议"
    ]
  }
];
