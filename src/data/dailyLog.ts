export type DailyEntry = {
  date: string; // YYYY-MM-DD
  done: string[];
  todo?: string[];
  note?: string;
};

// 样例数据，真实使用时可替换为你的日常记录
export const dailyLog: DailyEntry[] = [
  { date: '2025-12-28', done: ['阅读《复杂》30分钟', '整理 2025 总结草稿'] },
  { date: '2025-12-31', done: ['跑步 5km', '写年度回顾'], todo: ['复盘 OKR'], note: '跨年夜收尾' },
  { date: '2026-01-02', done: ['写博客草稿：AI 作为系统的变量', '30 分钟冥想'], todo: ['给 Alice 回信'] },
  { date: '2026-01-03', done: ['健身（力量）', '更新博客样式'], todo: ['安排一月访谈'] },
  { date: '2026-01-04', done: ['录播客提纲', '整理阅读笔记'], note: '保持节奏' },
  { date: '2026-01-05', done: ['设计个人统计页草图', '完成 2 个 code review'], todo: ['发布到生产'], note: '视觉方向定稿' },
  { date: '2026-01-06', done: ['部署博客更新', '阅读论文：LLM eval'], todo: ['明天买苹果'], note: '晚上开会' },
  { date: '2026-01-07', done: ['写博客正文 1200 字', '复盘 2025 → 2026 目标'], note: '状态不错' },
  { date: '2026-01-08', done: ['跑步 4km', '做饭'], todo: ['补充拍照'], note: '轻松日' },
  { date: '2026-01-09', done: ['代码重构：提取组件', '整理 Notion 待办'], todo: ['补测试用例'] },
  { date: '2026-01-10', done: ['录制视频 demo', '健身（推拉腿）', '清理邮箱'], note: '信息减脂日' },
  { date: '2026-01-18', done: ['添加了个人记忆'] },
];
