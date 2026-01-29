import { useEffect, useMemo, useRef, useState } from 'react';
import { eachDayOfInterval, format, startOfToday, subDays } from 'date-fns';
import { DailyEntry, DailyItem, dailyLog } from '@/data/dailyLog';
import { Plus, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// 单元格类型
 type Cell = {
  date: string;
  count: number;
  entries?: DailyEntry[];
};

type Persona = {
  id: string;
  name: string;
  systemPrompt: string;
  topicPrefs: string;
  enabled: boolean;
  deletable?: boolean;
};

type AgentReview = {
  agentId: string;
  agentName: string;
  chat: string;
  todo: string[];
};

type ReviewResponse = {
  reviews: AgentReview[];
  finalTodo: string[];
};

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
  doneNote: string;
  createdAt: string;
  updatedAt: string;
};

// 颜色分桶阈值（含）
const BUCKETS = [0, 1, 2, 4, 6];

const bucketClass = (count: number) => {
  if (count <= BUCKETS[0]) return 'bg-slate-200 dark:bg-slate-800';
  if (count <= BUCKETS[1]) return 'bg-emerald-50 text-emerald-900 border border-emerald-100';
  if (count <= BUCKETS[2]) return 'bg-emerald-200/80 text-emerald-900';
  if (count <= BUCKETS[3]) return 'bg-emerald-400 text-emerald-950';
  return 'bg-emerald-600 text-white';
};

const bucketLabel = ['空', '少', '一般', '多', '爆表'];

function buildCells(): Cell[] {
  const today = startOfToday();
  const start = subDays(today, 364);
  const days = eachDayOfInterval({ start, end: today });

  const map = new Map<string, DailyEntry[]>();
  dailyLog.forEach((d) => {
    const list = map.get(d.date) ?? [];
    list.push(d);
    map.set(d.date, list);
  });

  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd');
    const entries = map.get(key);
    const count =
      entries?.reduce((sum, e) => sum + e.done.length + (e.todo?.length ?? 0), 0) ?? 0;
    return { date: key, count, entries };
  });
}

const STORAGE_KEY_GEMINI = 'stats_gemini_key_v1';
const STORAGE_KEY_REVIEW = 'stats_agent_review_v1';
const STORAGE_KEY_CONCURRENCY = 'stats_llm_concurrency_v1';
const STORAGE_KEY_TODO_LIMIT = 'stats_todo_limit_v1';

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'hawking',
    name: '霍金',
    enabled: true,
    topicPrefs:
      '偏好话题：科学与理性推理、系统与模型、可证伪的假设。\n对工程/技术：从模型稳定性、约束清晰度、验证路径可靠性切入。',
    systemPrompt:
      '你是史蒂芬·霍金。你用清晰、冷静、严谨、带一点幽默的方式评价人的行动与计划。你会把问题抽象成模型、约束、变量与可证伪的假设。不要说教。输出必须有具体建议。',
  },
  {
    id: 'munger',
    name: '芒格',
    enabled: true,
    topicPrefs:
      '偏好话题：投资/商业与竞争优势、激励机制与人性偏差、风险与机会成本。\n对纯技术细节：可选择不评价，除非能映射到护城河、杠杆或风险控制。',
    systemPrompt:
      '你是查理·芒格。你用多学科思维模型、逆向思维、简单原则来评价人的行动。你会指出愚蠢的风险、激励错配、机会成本，并给出可执行建议。语气直接但不刻薄。',
  },
  {
    id: 'jobs',
    name: '乔布斯',
    enabled: true,
    topicPrefs:
      '偏好话题：产品与用户体验、审美与品味、聚焦与取舍、端到端系统构建。\n对技术：从是否服务产品/体验/效率、是否值得做到极致来评价。',
    systemPrompt:
      '你是史蒂夫·乔布斯。你强调聚焦、品味、用户体验与端到端系统。你会指出哪些事情不该做，哪些事情必须做到极致，并用简短有力的语言给出下一步建议。',
  },
];

function normalizeItem(item: DailyItem) {
  if (typeof item === 'string') return { text: item, links: [] as { title?: string; url: string }[] };
  return { text: item.text, links: item.links ?? [] };
}

function stableStringify(input: unknown) {
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

function itemToPlainText(item: DailyItem) {
  const n = normalizeItem(item);
  const links = n.links.map((l) => `${l.title ? `${l.title}: ` : ''}${l.url}`).join(' | ');
  return links ? `${n.text} (${links})` : n.text;
}

function ItemList({ items }: { items: DailyItem[] }) {
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map((it, idx) => {
        const n = normalizeItem(it);
        return (
          <li key={idx} className="leading-relaxed">
            <span>{n.text}</span>
            {n.links.length > 0 && (
              <span className="ml-2 inline-flex flex-wrap gap-1">
                {n.links.map((l, j) => (
                  <a
                    key={j}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs"
                  >
                    {l.title ?? (() => {
                      try {
                        return new URL(l.url).hostname;
                      } catch {
                        return l.url;
                      }
                    })()}
                  </a>
                ))}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Stats() {
  const cells = useMemo(buildCells, []);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<string>(() => format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [rangeEnd, setRangeEnd] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));

  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(DEFAULT_PERSONAS[0]?.id ?? '');
  const [newPersonaName, setNewPersonaName] = useState<string>('');
  const [newPersonaPrompt, setNewPersonaPrompt] = useState<string>('');
  const [newPersonaTopicPrefs, setNewPersonaTopicPrefs] = useState<string>('');
  const [isGeneratingPersona, setIsGeneratingPersona] = useState<boolean>(false);

  const [editingPersonaTopicPrefs, setEditingPersonaTopicPrefs] = useState<string>('');
  const [editingPersonaSystemPrompt, setEditingPersonaSystemPrompt] = useState<string>('');
  const personaPatchTimersRef = useRef<Record<string, number>>({});
  const pendingToggleRef = useRef<{ id: string; nextEnabled: boolean; cur?: Persona } | null>(null);

  const loadPersonas = async () => {
    try {
      const res = await fetch('/api/personas', { method: 'GET', credentials: 'include' });
      if (!res.ok) return;
      const data = (await res.json()) as { personas?: Array<{ id: string; name: string; enabled: boolean; topicPrefs: string; systemPrompt: string }> };
      const list = Array.isArray(data?.personas) ? data.personas : [];
      if (list.length === 0) return;
      setPersonas(
        list.map((p) => ({
          id: String(p.id),
          name: String(p.name),
          enabled: Boolean(p.enabled),
          topicPrefs: typeof p.topicPrefs === 'string' ? p.topicPrefs : '',
          systemPrompt: typeof p.systemPrompt === 'string' ? p.systemPrompt : '',
          deletable: !DEFAULT_PERSONAS.some((d) => d.id === p.id),
        })),
      );
      if (list.some((p) => p.id === selectedPersonaId) === false && list[0]?.id) {
        setSelectedPersonaId(String(list[0].id));
      }
    } catch {
      // ignore
    }
  };

  const upsertPersonaToServer = async (p: Persona) => {
    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          name: p.name,
          enabled: p.enabled,
          topicPrefs: p.topicPrefs,
          systemPrompt: p.systemPrompt,
        }),
      });
      return res.ok;
    } catch {
      // ignore
      return false;
    }
  };

  const patchPersonaToServer = async (id: string, patch: Partial<Persona>) => {
    try {
      const res = await fetch(`/api/personas/${encodeURIComponent(id)}` as string, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      });
      return res.ok;
    } catch {
      // ignore
      return false;
    }
  };

  const deletePersonaFromServer = async (id: string) => {
    try {
      const res = await fetch(`/api/personas/${encodeURIComponent(id)}` as string, {
        method: 'DELETE',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      // ignore
      return false;
    }
  };

  useEffect(() => {
    loadPersonas();
  }, []);

  useEffect(() => {
    const p = personas.find((x) => x.id === selectedPersonaId);
    if (!p) return;
    setEditingPersonaTopicPrefs(typeof p.topicPrefs === 'string' ? p.topicPrefs : '');
    setEditingPersonaSystemPrompt(typeof p.systemPrompt === 'string' ? p.systemPrompt : '');
  }, [personas, selectedPersonaId]);

  const [geminiKey, setGeminiKey] = useState<string>('');

  const [llmConcurrency, setLlmConcurrency] = useState<number>(3);
  const [todoLimit, setTodoLimit] = useState<number>(3);

  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [finalTodo, setFinalTodo] = useState<string[]>([]);

  const [persistedTodos, setPersistedTodos] = useState<TodoItem[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>('');
  const [editingTodoNote, setEditingTodoNote] = useState<string>('');
  const [newManualTodo, setNewManualTodo] = useState<string>('');

  const rangeCells = useMemo(() => {
    const start = selectedDate ?? rangeStart;
    const end = selectedDate ?? rangeEnd;

    const startIdx = cells.findIndex((c) => c.date === start);
    const endIdx = cells.findIndex((c) => c.date === end);
    if (startIdx < 0 || endIdx < 0) return [] as Cell[];

    const from = Math.min(startIdx, endIdx);
    const to = Math.max(startIdx, endIdx);
    return cells.slice(from, to + 1);
  }, [cells, rangeEnd, rangeStart, selectedDate]);

  const rangeEntries = useMemo(() => {
    return rangeCells.flatMap((c) => c.entries ?? []);
  }, [rangeCells]);

  const rangeEntriesDesc = useMemo(() => {
    return [...rangeEntries].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
  }, [rangeEntries]);

  const reviewCacheKey = useMemo(() => {
    const active = personas
      .filter((p) => p.enabled)
      .map((p) => ({ id: p.id, name: p.name, systemPrompt: p.systemPrompt, topicPrefs: p.topicPrefs }));
    const payload = {
      start: selectedDate ?? rangeStart,
      end: selectedDate ?? rangeEnd,
      selectedAgentIds,
      active,
      entries: rangeEntries.map((e) => ({
        date: e.date,
        done: e.done.map(itemToPlainText),
        todo: (e.todo ?? []).map(itemToPlainText),
        note: e.note ?? '',
      })),
    };
    return stableStringify(payload);
  }, [personas, rangeEnd, rangeEntries, rangeStart, selectedAgentIds, selectedDate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GEMINI);
      if (raw) setGeminiKey(raw);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONCURRENCY);
      if (!raw) return;
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) setLlmConcurrency(n);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TODO_LIMIT);
      if (!raw) return;
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) setTodoLimit(n);
    } catch {
      // ignore
    }
  }, []);

  const loadTodos = async () => {
    try {
      const res = await fetch('/api/todos', { method: 'GET', credentials: 'include' });
      if (!res.ok) return;
      const data = (await res.json()) as { todos?: TodoItem[] };
      setPersistedTodos(Array.isArray(data?.todos) ? data.todos : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REVIEW);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { key: string; reviews: AgentReview[]; finalTodo?: string[] };
      if (parsed?.key && Array.isArray(parsed.reviews) && parsed.key === reviewCacheKey) {
        setReviews(parsed.reviews);
        setFinalTodo(Array.isArray(parsed.finalTodo) ? parsed.finalTodo : []);
      }
    } catch {
      // ignore
    }
  }, [reviewCacheKey]);

  useEffect(() => {
    setReviews([]);
    setFinalTodo([]);
    setSelectedAgentIds([]);
  }, [selectedDate, rangeStart, rangeEnd, personas]);

  // 转成周列（列=周，行=周内星期，周一在上）
  const weeks: Cell[][] = [];
  cells.forEach((cell) => {
    const dateObj = new Date(cell.date);
    const day = dateObj.getDay(); // 0=Sun

    if (weeks.length === 0 || day === 1) {
      weeks.push(Array.from({ length: 7 }, () => undefined as unknown as Cell));
    }
    const currentWeek = weeks[weeks.length - 1];
    currentWeek[day === 0 ? 6 : day - 1] = cell; // 以周一为第一行
  });

  const legend = BUCKETS.map((_, idx) => idx);

  const displayedCells = useMemo(() => {
    if (selectedDate) {
      return cells.filter((c) => c.date === selectedDate);
    }
    return cells.slice(-10).reverse();
  }, [cells, selectedDate]);

  const handleTogglePersona = (id: string) => {
    setPersonas((prev) => {
      const cur = prev.find((p) => p.id === id);
      const nextEnabled = !(cur?.enabled ?? false);
      pendingToggleRef.current = { id, nextEnabled, cur };
      return prev.map((p) => (p.id === id ? { ...p, enabled: nextEnabled } : p));
    });

    const payload = pendingToggleRef.current;
    pendingToggleRef.current = null;
    const run = async () => {
      if (!payload?.cur) {
        await loadPersonas();
        return;
      }
      if (payload.nextEnabled) {
        await upsertPersonaToServer({ ...payload.cur, enabled: true });
        await loadPersonas();
        return;
      }
      await patchPersonaToServer(payload.id, { enabled: false });
      await loadPersonas();
    };
    run();
  };

  const handleSelectPersona = (id: string) => {
    setSelectedPersonaId(id);
  };

  const handleDeletePersona = (id: string) => {
    setPersonas((prev) => prev.filter((p) => p.id !== id));
    const run = async () => {
      await deletePersonaFromServer(id);
      await loadPersonas();
    };
    run();
  };

  const handleAddPersona = () => {
    const name = newPersonaName.trim();
    const prompt = newPersonaPrompt.trim();
    const topicPrefs = newPersonaTopicPrefs.trim();
    if (!name || !prompt) return;
    const id = `custom_${Date.now()}`;
    const created = { id, name, systemPrompt: prompt, topicPrefs, enabled: true, deletable: true } as Persona;
    setPersonas((prev) => [...prev, created]);
    const run = async () => {
      await upsertPersonaToServer(created);
      await loadPersonas();
    };
    run();
    setSelectedPersonaId(id);
    setNewPersonaName('');
    setNewPersonaPrompt('');
    setNewPersonaTopicPrefs('');
  };

  const handleGeneratePersona = async () => {
    const name = newPersonaName.trim();
    if (!name) return;
    if (!geminiKey.trim()) {
      window.alert('请先在“配置 Key”里填写 Gemini Key。');
      return;
    }

    const examples = personas
      .map((p) => ({
        name: p.name,
        topicPrefs: (p.topicPrefs ?? '').trim(),
        systemPrompt: (p.systemPrompt ?? '').trim(),
      }))
      .filter((e) => e.name && (e.topicPrefs || e.systemPrompt))
      .slice(0, 6);

    setIsGeneratingPersona(true);
    try {
      const res = await fetch('/api/personas/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ geminiKey: geminiKey.trim(), name, examples }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { topicPrefs?: string; systemPrompt?: string };
      setNewPersonaTopicPrefs(typeof data?.topicPrefs === 'string' ? data.topicPrefs : '');
      setNewPersonaPrompt(typeof data?.systemPrompt === 'string' ? data.systemPrompt : '');
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const selectedPersona = useMemo(() => personas.find((p) => p.id === selectedPersonaId) ?? null, [personas, selectedPersonaId]);

  const updatePersona = (id: string, patch: Partial<Persona>) => {
    setPersonas((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const schedulePersonaPatch = (id: string, patch: Partial<Persona>) => {
    const key = `${id}:${Object.keys(patch).sort().join(',')}`;
    const timers = personaPatchTimersRef.current;
    const existing = timers[key];
    if (existing) {
      clearTimeout(existing);
    }
    timers[key] = window.setTimeout(async () => {
      const ok = await patchPersonaToServer(id, patch);
      await loadPersonas();
      if (!ok) return;
    }, 500);
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    try {
      localStorage.setItem(STORAGE_KEY_GEMINI, key);
    } catch {
      // ignore
    }
  };

  const handleSaveConcurrency = (n: number) => {
    const next = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
    setLlmConcurrency(next);
    try {
      localStorage.setItem(STORAGE_KEY_CONCURRENCY, String(next));
    } catch {
      // ignore
    }
  };

  const handleSaveTodoLimit = (n: number) => {
    const next = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
    setTodoLimit(next);
    try {
      localStorage.setItem(STORAGE_KEY_TODO_LIMIT, String(next));
    } catch {
      // ignore
    }
  };

  const confirmTodo = async (text: string) => {
    try {
      const res = await fetch('/api/todos/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, todoLimit }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) {
        if (data?.error === 'todo_limit_reached') {
          window.alert(`未完成 TODO 已达到上限 ${data?.limit ?? todoLimit}。请先完成/删除库内 TODO 或清理建议 TODO。`);
        }
        if (data?.error === 'text_duplicated') {
          window.alert('TODO 内容重复：系统要求全局唯一，请换一个表达。');
        }
        return;
      }
      await loadTodos();
    } catch {
      // ignore
    }
  };

  const toggleTodoDone = async (id: string, done: boolean) => {
    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ done }),
      });
      if (!res.ok) return;
      await loadTodos();
    } catch {
      // ignore
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) return;
      await loadTodos();
    } catch {
      // ignore
    }
  };

  const startEditTodo = (t: TodoItem) => {
    setEditingTodoId(t.id);
    setEditingTodoText(t.text);
    setEditingTodoNote(t.doneNote ?? '');
  };

  const cancelEditTodo = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
    setEditingTodoNote('');
  };

  const saveEditTodo = async () => {
    if (!editingTodoId) return;
    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(editingTodoId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: editingTodoText, doneNote: editingTodoNote }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) {
        if (data?.error === 'text_duplicated') {
          window.alert('TODO 内容重复：系统要求全局唯一，请换一个表达。');
        }
        return;
      }
      cancelEditTodo();
      await loadTodos();
    } catch {
      // ignore
    }
  };

  const pickRandomAgents = (active: Persona[], k: number) => {
    const kk = Math.max(1, Math.min(Math.floor(k || 1), active.length));
    const arr = active.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr.slice(0, kk);
  };

  const generateReviews = async () => {
    const active = personas.filter((p) => p.enabled);
    if (active.length === 0) return;

    if (!geminiKey.trim()) {
      return;
    }

    setIsGenerating(true);
    try {
      const picked = pickRandomAgents(active, llmConcurrency);
      setSelectedAgentIds(picked.map((p) => p.id));
      const start = selectedDate ?? rangeStart;
      const end = selectedDate ?? rangeEnd;

      const res = await fetch('/api/agents/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          geminiKey: geminiKey.trim(),
          concurrency: llmConcurrency,
          todoLimit,
          startDate: start,
          endDate: end,
          entries: rangeEntries,
          agents: picked.map((a) => ({ id: a.id, name: a.name, systemPrompt: a.systemPrompt, topicPrefs: a.topicPrefs })),
        }),
      });

      if (!res.ok) return;
      const data = (await res.json()) as ReviewResponse;
      const next = Array.isArray(data?.reviews) ? data.reviews : [];
      const nextFinalTodo = Array.isArray(data?.finalTodo) ? data.finalTodo : [];
      setReviews(next);
      setFinalTodo(nextFinalTodo);
      await loadTodos();
      try {
        localStorage.setItem(STORAGE_KEY_REVIEW, JSON.stringify({ key: reviewCacheKey, reviews: next, finalTodo: nextFinalTodo }));
      } catch {
        // ignore
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Daily Rhythm</p>
          <h1 className="text-3xl font-bold">年度日常热力图</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            以智慧驱动每日行为密度。
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    handleSelectPersona(p.id);
                    handleTogglePersona(p.id);
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border transition-colors ${
                    p.enabled
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                      : 'bg-transparent text-slate-600 border-slate-200 dark:text-slate-300 dark:border-slate-700'
                  }`}
                  title={p.enabled ? '点击停用' : '点击启用'}
                >
                  <span>{p.name}</span>
                  {p.deletable && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePersona(p.id);
                      }}
                      className="ml-1 inline-flex items-center justify-center rounded-full hover:opacity-80"
                      title="删除"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  添加人设
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加 Persona</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 dark:text-slate-300">名称</div>
                    <Input value={newPersonaName} onChange={(e) => setNewPersonaName(e.target.value)} placeholder="例如：纳瓦尔" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 dark:text-slate-300">偏好话题（可选）</div>
                    <Textarea
                      value={newPersonaTopicPrefs}
                      onChange={(e) => setNewPersonaTopicPrefs(e.target.value)}
                      className="min-h-[90px]"
                      placeholder="例如：投资/商业、风险与机会成本..."
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 dark:text-slate-300">System Prompt</div>
                    <Textarea
                      value={newPersonaPrompt}
                      onChange={(e) => setNewPersonaPrompt(e.target.value)}
                      className="min-h-[180px]"
                      placeholder="粘贴 system prompt..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleGeneratePersona}
                    disabled={!newPersonaName.trim() || isGeneratingPersona}
                  >
                    {isGeneratingPersona ? '生成中…' : '一键添加'}
                  </Button>
                  <Button onClick={handleAddPersona} disabled={!newPersonaName.trim() || !newPersonaPrompt.trim()}>
                    添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  配置 Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gemini Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-300">该 Key 会保存到浏览器 localStorage，并随请求发送到 Worker。</div>
                  <Input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="粘贴 Gemini API Key"
                  />
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 dark:text-slate-300">LLM 并行度（建议 2~3）</div>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={llmConcurrency}
                      onChange={(e) => setLlmConcurrency(Number(e.target.value))}
                      placeholder="例如：3"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 dark:text-slate-300">未完成 TODO 上限（默认 3）</div>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={todoLimit}
                      onChange={(e) => setTodoLimit(Number(e.target.value))}
                      placeholder="例如：3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      handleSaveGeminiKey(geminiKey.trim());
                      handleSaveConcurrency(llmConcurrency);
                      handleSaveTodoLimit(todoLimit);
                    }}
                    disabled={!geminiKey.trim()}
                  >
                    保存
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {selectedPersona && (
            <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white/60 dark:bg-slate-900/60">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Persona：{selectedPersona.name}</div>
                <div className="text-xs text-slate-500">点击上方标签可启用/停用并切换当前编辑对象</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">偏好话题</div>
                  <Textarea
                    value={editingPersonaTopicPrefs}
                    onChange={(e) => setEditingPersonaTopicPrefs(e.target.value)}
                    onBlur={() => {
                      const next = editingPersonaTopicPrefs;
                      if (!selectedPersona) return;
                      if ((selectedPersona.topicPrefs ?? '') !== next) {
                        schedulePersonaPatch(selectedPersona.id, { topicPrefs: next });
                      }
                    }}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">System Prompt</div>
                  <Textarea
                    value={editingPersonaSystemPrompt}
                    onChange={(e) => setEditingPersonaSystemPrompt(e.target.value)}
                    onBlur={() => {
                      const next = editingPersonaSystemPrompt;
                      if (!selectedPersona) return;
                      if ((selectedPersona.systemPrompt ?? '') !== next) {
                        schedulePersonaPatch(selectedPersona.id, { systemPrompt: next });
                      }
                    }}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          )}
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-lg font-semibold">过去 52 周</div>
              <div className="text-xs text-slate-500">含今天，共 365 天</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {legend.map((i) => {
                const label = bucketLabel[i];
                const cls = bucketClass(BUCKETS[i] + (i === legend.length - 1 ? 1 : 0));
                return (
                  <div key={i} className="flex items-center gap-1">
                    <span className={`h-4 w-4 rounded ${cls}`} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1">
              {weeks.slice().reverse().map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-1">
                  {week.map((cell, dIdx) => {
                    if (!cell) return <div key={dIdx} className="h-4 w-4" />;
                    const cls = bucketClass(cell.count);
                    const isSelected = selectedDate === cell.date;
                    return (
                      <div
                        key={cell.date}
                        onClick={() => setSelectedDate(prev => prev === cell.date ? null : cell.date)}
                        className={`h-4 w-4 rounded-sm ${cls} cursor-pointer transition-all hover:opacity-80 ${isSelected ? 'ring-2 ring-slate-900 dark:ring-slate-100 ring-offset-1 dark:ring-offset-slate-900' : 'hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600'}`}
                        title={`${cell.date}：${cell.count} 条`}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedDate ? `明细：${selectedDate}` : '近期明细（近 10 天）'}
            </h2>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-xs flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
                显示全部
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="text-slate-500">范围</div>
              <Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="w-[160px]" />
              <span className="text-slate-400">→</span>
              <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="w-[160px]" />
              {selectedDate && <span className="text-xs text-slate-500">（当前以选中日期为准）</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" onClick={generateReviews} disabled={isGenerating || personas.every((p) => !p.enabled)}>
                {isGenerating ? '生成中…' : '生成点评'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {displayedCells.length > 0 ? (
                displayedCells.map((cell) => (
                  <div key={cell.date} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{cell.date}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${bucketClass(cell.count)} bg-opacity-80`}>
                        {cell.count} 条
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="text-slate-500 mb-1">Done</div>
                      {cell.entries && cell.entries.length > 0 ? (
                        <ItemList items={cell.entries.flatMap((e) => e.done)} />
                      ) : (
                        <div className="text-slate-400">无</div>
                      )}
                      {cell.entries && cell.entries.some((e) => (e.todo ?? []).length > 0) && (
                        <div className="mt-3">
                          <div className="text-slate-500 mb-1">Todo</div>
                          <ItemList items={cell.entries.flatMap((e) => e.todo ?? [])} />
                        </div>
                      )}
                    </div>
                    {cell.entries?.some((e) => e.note) && (
                      <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                        {cell.entries?.map((e) => e.note).filter(Boolean).join(' / ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  该日期无记录
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-sm font-semibold mb-2">我的 TODO</div>
              <div className="text-xs text-slate-500 mb-2">（全局独立，不随日期变化）</div>
              <div className="mb-3 flex items-center gap-2">
                <Input
                  value={newManualTodo}
                  onChange={(e) => setNewManualTodo(e.target.value)}
                  placeholder="手写新增 TODO（全局唯一）"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const t = newManualTodo.trim();
                    if (!t) return;
                    await confirmTodo(t);
                    setNewManualTodo('');
                  }}
                  disabled={!newManualTodo.trim()}
                >
                  添加
                </Button>
              </div>

              {persistedTodos.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {persistedTodos.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-2">
                      <label className="flex items-start gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={(e) => toggleTodoDone(t.id, e.target.checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className={t.done ? 'line-through text-slate-400' : ''}>{t.text}</div>
                          {t.done && (t.doneNote ?? '').trim() && (
                            <div className="mt-1 text-xs text-slate-500 whitespace-pre-wrap">完成说明：{t.doneNote}</div>
                          )}
                        </div>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditTodo(t)}
                          className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTodo(t.id)}
                          className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">暂无</div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI 讨论与评价</h2>
            <div className="text-xs text-slate-500">
              {selectedDate ? `日期：${selectedDate}` : `范围：${rangeStart} → ${rangeEnd}`}
            </div>
          </div>

          {(!geminiKey || !geminiKey.trim()) && (
            <div className="text-sm text-slate-500 mb-4">
              还未配置 Gemini Key。请在顶部点击“配置 Key”。
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-sm font-semibold mb-2">Chat</div>
              <div className="space-y-3 text-sm">
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r.agentId} className="border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                      <div className="text-xs font-semibold mb-2">{r.agentName}</div>
                      <div className="whitespace-pre-wrap leading-relaxed">{r.chat}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-sm">点击“生成点评”后展示</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="text-sm font-semibold mb-2">Todo</div>
              <div className="space-y-3 text-sm">
                <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-2">我的 TODO（已确认入库）</div>
                  <div className="mb-3 flex items-center gap-2">
                    <Input
                      value={newManualTodo}
                      onChange={(e) => setNewManualTodo(e.target.value)}
                      placeholder="手写新增 TODO（全局唯一）"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const t = newManualTodo.trim();
                        if (!t) return;
                        await confirmTodo(t);
                        setNewManualTodo('');
                      }}
                      disabled={!newManualTodo.trim()}
                    >
                      添加
                    </Button>
                  </div>
                  {persistedTodos.length > 0 ? (
                    <div className="space-y-2">
                      {persistedTodos.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={t.done}
                              onChange={(e) => toggleTodoDone(t.id, e.target.checked)}
                            />
                            <span className={t.done ? 'line-through text-slate-400' : ''}>{t.text}</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditTodo(t)}
                              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTodo(t.id)}
                              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                      {persistedTodos.some((t) => t.done && (t.doneNote ?? '').trim()) && (
                        <div className="pt-2 text-xs text-slate-500">
                          已完成项可在“编辑”里补充完成说明；说明会参与后续 AI 上下文，避免重复建议。
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">暂无</div>
                  )}
                </div>

                <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-2">融合后的可执行 TODO（建议）</div>
                  {finalTodo.length > 0 ? (
                    <div className="space-y-2">
                      {finalTodo.map((text, idx) => {
                        const already = persistedTodos.some((p) => p.text === text);
                        return (
                          <div key={idx} className="flex items-center justify-between gap-2">
                            <div className={already ? 'text-slate-400 line-through flex-1' : 'flex-1'}>{text}</div>
                            {!already && (
                              <Button variant="outline" size="sm" onClick={() => confirmTodo(text)}>
                                确认
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">点击“生成点评”后展示</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={!!editingTodoId} onOpenChange={(open) => { if (!open) cancelEditTodo(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑 TODO</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm text-slate-600 dark:text-slate-300">内容（全局唯一）</div>
              <Textarea
                value={editingTodoText}
                onChange={(e) => setEditingTodoText(e.target.value)}
                className="min-h-[90px]"
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-600 dark:text-slate-300">完成说明（可选）</div>
              <Textarea
                value={editingTodoNote}
                onChange={(e) => setEditingTodoNote(e.target.value)}
                className="min-h-[90px]"
                placeholder="例如：通过什么方式完成、关键链接、复盘结论..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEditTodo}>取消</Button>
            <Button onClick={saveEditTodo} disabled={!editingTodoText.trim()}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
