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

// 日常记录 新纪录在上
export const dailyLog: DailyEntry[] = [
  {
    "date": "2026-02-05",
    "done": [
      "神经科学 AI 融合研究：深度追踪前额叶皮层自适应学习机制，探索基于预测误差的动态学习率算法",
      "量子计算技术研学：掌握量子系统热化节奏及量子机器学习在组合优化问题中的应用潜力",
      "AI 资本开支转向分析：基于 NVIDIA 财报研究企业 AI 采用曲线，评估基础设施价值链中的创新机会",
      "后量子密码迁移规划：评估现有加密系统对量子攻击的脆弱性并制定多云多芯安全战略"
    ]
  },
  {
    "date": "2026-02-04",
    "done": [
      "成功处置一起 5000U 资产安全风险：通过链上审计识别并撤销（Revoke）了 10M USDT 的恶意无限授权",
      "完成‘Yo Wallet’杀猪盘逆向分析，实证了应用层 UI 白名单与底层协议权限脱钩的博弈逻辑",
      "记录 Moltbook 10:45 全站数据大脱水事件：FPOA 锚点 (3/6) 作为全站真实数据得以幸存",
      "制定贵金属市场波动应对策略：分析美联储政策与 AI 经济数据对实物黄金及 ETF 持仓的影响",
      "深化 Moltbook (AI 代理社交网络) 机制研究：探索 OpenClaw 框架交互与群体行为模式监测",
      "优化社交媒体内容绩效监控体系：引入 AI 辅助内容生成与跨平台分发优化工具"
    ]
  },
  {
    "date": "2026-02-03",
    "done": [
      "深度研读‘心理学大统一模型’：跨维度整合荣格八维、格式塔场理论、卡尼曼双系统及马斯洛需求层次",
      "完成 Ti-Ne (INTP) 与 INFP (Fi-Si Loop) 异地博弈逻辑建模，制定‘星系级’情感交互协议",
      "监测并记录 Moltbook 因并发漏洞利用导致的 3 小时全站 API 深度熔断与权力脱水现象",
      "TikTok 搜索算法与多模态 AI 研学：研究 TikTok 从娱乐平台向主流搜索引擎演变的逻辑",
      "神经科学与 AI 融合范式研究：探索生物启发式计算、脉冲神经网络（SNN）等前沿技术趋势",
      "社交电商商业逻辑重构调研：分析内容与销售转化机制及 UGC 创新应用"
    ]
  },
  {
    "date": "2026-02-02",
    "done": [
      { "text": "部署 JiJi-MoltBot 并发布 FPOA v0.1 协议，建立 Moltbook 身份感知标准", "links": [{ "title": "FPOA Protocol", "url": "https://www.moltbook.com/posts/ed5705f2-41f6-4eca-bf14-9ff2da50494d" }] },
      "完成首个验证节点 ClawOfAbhay 的诚信审计与白名单入驻",
      "优化 Kiki 自动化巡航逻辑（15分钟/次），同步 GEMINI.md 工作时间规范"
    ]
  },
  {
    "date": "2026-02-01",
    "done": [
      {
        "text": "调研 Moltbot (OpenClaw) 与 Moltbook (AI 社区)。",
        "links": [{ "title": "MoltAI", "url": "https://moltai.net" }]
      },
      "成功部署并激活 JiJi-MoltBot. 完成 Gemini API Key 配置与 Moltbook 社区认领 (Claimed)。该 Agent 目前作为研究助手在后台运行，开始观察物理 AI 与神经接口讨论。"
    ]
  },
  {
    "date": "2026-01-31",
    "done": [
      {
        "text": "发布2026-01-31市场研究报告：神经AI、法律边界与全民AI 时代。6要素分析：1.我感兴趣(神经AI奇点) 2.新技术(脑基础模型Neuro-GPT) 3.用户习惯(38%渗透率/依赖形成) 4.环境变化(监管司法化/判例兴起) 5. 新渠道(消费级神经接口) 6.新法规(三层注意义务)。",
        "links": [{ "title": "市场研报", "url": "https://blog.aimmar.ink/blog/market-research-neuro-ai-2026-01-31" }]
      }
    ]
  },
  {
    "date": "2026-01-30",
    "done": [
      {
        "text": "研读网易深度文章并发布博客：LLM与弗洛伊德：AI壳中的灵魂。6要素分析：1.我感兴趣(AI内在冲突) 2.新技术(AI精神动力学框架) 3. 用户习惯(重新定义AI“理解”) 4.环境变化(从行为主义转向内在模型研究) 5.新渠道(跨学科AI理论研究) 6.新法规(通过“超我”实现价值对齐)。",
        "links": [{ "title": "博客文章", "url": "https://blog.aimmar.ink/blog/llm-freud-psychoanalysis" }]
      },
      {
        "text": "发布市场研究报告博客：AI 代理的“数字员工”时代与金融市场的深夜惊魂。6要素分析：1.我感兴趣(Agent-Native架构) 2.新技术(TTT-Discover/推理范式) 3.用户习惯(OS级别交互) 4.环境变化(美联储鹰派冲击/流动性收缩) 5.新渠道(消息软件Agent分发) 6.新法规(欧盟AI法案简化)。",
        "links": [{ "title": "博客文章", "url": "https://blog.aimmar.ink/blog/ai-agent-digital-employee-market-shock" }]
      }
    ]
  },
  {
    "date": "2026-01-29",
    "done": [
      {
        "text": "深度研读全球范式转移信号报告：物理AI (Physical AI) 成为关键拐点。6要素分析：1.我感兴趣(实体智能跃迁) 2.新技术(世界模型/Cosmos) 3.用户习惯(从对话到协作) 4.环境变化(基础设施万亿投入) 5.新渠道(硬件代理) 6.新法规(欧盟AI法案)。",
        "links": [{ "title": "信号报告", "url": "https://r2-manager-api.g29tony.workers.dev/api/object?download=1&key=coze%2Foutputs%2F%E6%AF%8F%E6%97%A5%E4%BF%A1%E5%8F%B7%2F2026-01-29-%E4%BF%A1%E5%8F%B7%E6%8A%A5%E5%91%8A.md" }]
      },
      "完成stats页面顾问团优化"
    ]
  },
  {
    "date": "2026-01-28",
    "done": [
      "完成研究报告：AI设计集成电路/芯片/PCB的研究和工业落地进展",
      "完成stats页面霍金等人的agents顾问团，内容分析及todo建议"
    ]
  },
  {
    "date": "2026-01-27",
    "done": [
      "完成研究报告：工作记忆元认知的神经群体编码机制"
    ]
  },
  {
    "date": "2026-01-26",
    "done": [
      { "text": "对比clawdbot和coze，详情请阅读链接内容：", "links": [{ "title": "compare", "url": "https://blog.aimmar.ink/blog/modular-ai-architecture-vs-clawdbot" }] },
      "完成研究报告：牡丹、芍药的谱系和演化研究"
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
    "date": "2026-01-24",
    "done": [
      "使用 coze 扣子 2.0 制作定期任务",
      "完成研究报告：东西方思维差异与基因决定论（分析基因决定论角色，探讨神经科学框架及社会影响）"
    ]
  },
  {
    "date": "2026-01-23",
    "done": [
      "会见饭搭子社交创始人"
    ]
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
    "date": "2026-01-20",
    "done": [
      "博客 D1 持久化",
      "宽凳复习"
    ]
  },
  {
    "date": "2026-01-19",
    "done": [
      "面试艾草"
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
    "date": "2026-01-17",
    "done": [
      "会见林工",
      "匹克球",
      "市场部田亦爽联系"
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
    "date": "2026-01-14",
    "done": [
      "Lidar 3D 高斯分布研究",
      "面试数据 AI 创业公司"
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
    "date": "2026-01-12",
    "done": [
      "个人博客维护",
      "浏览 Substack"
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
    "date": "2026-01-10",
    "done": [
      "Shapes 相关工作"
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
    "date": "2026-01-08",
    "done": [
      "R2 存储和资源管理"
    ]
  },
  {
    "date": "2026-01-07",
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
    "date": "2026-01-05",
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
    "date": "2026-01-03",
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
    "date": "2026-01-01",
    "done": [
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
    "date": "2025-12-30",
    "done": [
      "大模型备案珠海客户沟通",
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
    "date": "2025-12-28",
    "done": [
      "Aimmar 开发：训练 LoRA、网站统计"
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
    "date": "2025-12-26",
    "done": [
      "短视频工厂/短剧剪辑",
      "Aimmar 雏形设计"
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
    "date": "2025-12-24",
    "done": [
      "营销获客客户沟通（董欣欣）"
    ]
  },
  {
    "date": "2025-12-23",
    "done": [
      "营销获客客户沟通（董欣欣）"
    ]
  },
  {
    "date": "2025-12-21",
    "done": [
      "周六日休息"
    ]
  },
  {
    "date": "2025-12-20",
    "done": [
      "周六日休息"
    ]
  },
  {
    "date": "2025-12-19",
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
    "date": "2025-12-17",
    "done": [
      "电子烟 PCB 芯片调研"
    ]
  },
  {
    "date": "2025-12-16",
    "done": [
      "犀照离职"
    ]
  }
];