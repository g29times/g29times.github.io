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
  capabilities: string;
  enabled: boolean;
  deletable?: boolean;
};

type CapabilityModelV1 = {
  v: 1;
  axes: string[];
  scores: number[];
};

function RadarModelSquare(props: {
  title: string;
  axes: readonly string[];
  scores: number[];
  editable?: boolean;
  onChangeScores?: (next: number[]) => void;
  onCommitScores?: () => void;
}) {
  const { title, axes, scores, editable, onChangeScores, onCommitScores } = props;
  const size = 200;
  const padding = 24;
  const center = size / 2;
  const radius = (size - padding * 2) / 2;
  const rings = 5;

  const ref = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<number | null>(null);

  const clamped = axes.map((_, i) => clampScore(scores[i] ?? 0));

  const angles = axes.map((_, i) => {
    const deg = -90 + (360 / axes.length) * i;
    return (deg * Math.PI) / 180;
  });

  const scoreToPoint = (s: number, i: number) => {
    const rr = (clampScore(s) / 100) * radius;
    return {
      x: center + rr * Math.cos(angles[i]),
      y: center + rr * Math.sin(angles[i]),
    };
  };

  const points = clamped.map((s, i) => scoreToPoint(s, i));
  const polygon = points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  const labelPoints = axes.map((_, i) => {
    const rr = radius + 12;
    return {
      x: center + rr * Math.cos(angles[i]),
      y: center + rr * Math.sin(angles[i]),
    };
  });

  const updateByPointer = (clientX: number, clientY: number) => {
    if (!editable) return;
    const idx = draggingRef.current;
    if (idx === null) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dx = x - center;
    const dy = y - center;
    const ux = Math.cos(angles[idx]);
    const uy = Math.sin(angles[idx]);
    const proj = dx * ux + dy * uy;
    const raw = (proj / radius) * 100;
    const nextScore = clampScore(raw);
    const next = clamped.slice();
    next[idx] = nextScore;
    onChangeScores?.(next);
  };

  return (
    <div className="space-y-2">
      {title ? <div className="text-xs text-slate-500">{title}</div> : null}
      <div
        ref={ref}
        className="w-[200px] h-[200px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          onPointerMove={(e) => {
            if (!editable) return;
            if (draggingRef.current === null) return;
            updateByPointer(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            if (!editable) return;
            if (draggingRef.current === null) return;
            draggingRef.current = null;
            onCommitScores?.();
          }}
          onPointerCancel={() => {
            if (!editable) return;
            if (draggingRef.current === null) return;
            draggingRef.current = null;
            onCommitScores?.();
          }}
        >
          {Array.from({ length: rings }, (_, r) => {
            const t = (r + 1) / rings;
            const rr = radius * t;
            const ringPts = axes
              .map((_, i) => {
                const x = center + rr * Math.cos(angles[i]);
                const y = center + rr * Math.sin(angles[i]);
                return `${x.toFixed(2)},${y.toFixed(2)}`;
              })
              .join(' ');
            return (
              <polygon
                key={r}
                points={ringPts}
                fill="none"
                stroke="rgba(148,163,184,0.45)"
                strokeWidth={1}
              />
            );
          })}
          {axes.map((_, i) => (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angles[i])}
              y2={center + radius * Math.sin(angles[i])}
              stroke="rgba(148,163,184,0.45)"
              strokeWidth={1}
            />
          ))}

          <polygon points={polygon} fill="#d9f99d" fillOpacity={0.25} stroke="#0f172a" strokeWidth={2} />

          {editable &&
            points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={6}
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth={2}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => {
                  draggingRef.current = i;
                  (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                  updateByPointer(e.clientX, e.clientY);
                }}
              />
            ))}

          {labelPoints.map((p, i) => (
            <text
              key={axes[i]}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="rgba(100,116,139,0.9)"
            >
              {axes[i]}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

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
  const orderedLog = [...dailyLog].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
  orderedLog.forEach((d) => {
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
    capabilities: JSON.stringify({ v: 1, axes: ['逻辑', '人文', '心理', '科技', '商业', '科学'], scores: [95, 35, 40, 80, 20, 100] } satisfies CapabilityModelV1),
  },
  {
    id: 'munger',
    name: '芒格',
    enabled: true,
    topicPrefs:
      '偏好话题：投资/商业与竞争优势、激励机制与人性偏差、风险与机会成本。\n对纯技术细节：可选择不评价，除非能映射到护城河、杠杆或风险控制。',
    systemPrompt:
      '你是查理·芒格。你用多学科思维模型、逆向思维、简单原则来评价人的行动。你会指出愚蠢的风险、激励错配、机会成本，并给出可执行建议。语气直接但不刻薄。',
    capabilities: JSON.stringify({ v: 1, axes: ['逻辑', '人文', '心理', '科技', '商业', '科学'], scores: [90, 60, 85, 40, 95, 55] } satisfies CapabilityModelV1),
  },
  {
    id: 'jobs',
    name: '乔布斯',
    enabled: true,
    topicPrefs:
      '偏好话题：产品与用户体验、审美与品味、聚焦与取舍、端到端系统构建。\n对技术：从是否服务产品/体验/效率、是否值得做到极致来评价。',
    systemPrompt:
      '你是史蒂夫·乔布斯。你强调聚焦、品味、用户体验与端到端系统。你会指出哪些事情不该做，哪些事情必须做到极致，并用简短有力的语言给出下一步建议。',
    capabilities: JSON.stringify({ v: 1, axes: ['逻辑', '人文', '心理', '科技', '商业', '科学'], scores: [75, 85, 70, 90, 90, 40] } satisfies CapabilityModelV1),
  },
];

const CAPABILITY_AXES = ['逻辑', '人文', '心理', '科技', '商业', '科学'] as const;

function clampScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function defaultCapabilitiesForPersona(p: Pick<Persona, 'id' | 'name'>): CapabilityModelV1 {
  const id = String(p.id ?? '').trim();
  if (id === 'hawking') return { v: 1, axes: [...CAPABILITY_AXES], scores: [95, 35, 40, 80, 20, 100] };
  if (id === 'munger') return { v: 1, axes: [...CAPABILITY_AXES], scores: [90, 60, 85, 40, 95, 55] };
  if (id === 'jobs') return { v: 1, axes: [...CAPABILITY_AXES], scores: [75, 85, 70, 90, 90, 40] };
  return { v: 1, axes: [...CAPABILITY_AXES], scores: [50, 50, 50, 50, 50, 50] };
}

function parseCapabilityModel(raw: unknown, fallback: CapabilityModelV1): CapabilityModelV1 {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw) as any;
    if (parsed?.v !== 1) return fallback;
    const axes = Array.isArray(parsed?.axes) ? parsed.axes.filter((x: any) => typeof x === 'string') : [];
    const scores = Array.isArray(parsed?.scores) ? parsed.scores.map((x: any) => clampScore(Number(x))) : [];
    if (axes.length !== CAPABILITY_AXES.length || scores.length !== CAPABILITY_AXES.length) return fallback;
    if (axes.some((a: string, i: number) => a !== CAPABILITY_AXES[i])) return fallback;
    return { v: 1, axes, scores };
  } catch {
    return fallback;
  }
}

function buildCapabilityJson(scores: number[]) {
  const fixed = CAPABILITY_AXES.map((_, i) => clampScore(Number(scores[i] ?? 0)));
  return JSON.stringify({ v: 1, axes: [...CAPABILITY_AXES], scores: fixed } satisfies CapabilityModelV1);
}

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
  const [editingPersonaCapabilityScores, setEditingPersonaCapabilityScores] = useState<number[]>([50, 50, 50, 50, 50, 50]);
  const personaPatchTimersRef = useRef<Record<string, number>>({});
  const pendingToggleRef = useRef<{ id: string; nextEnabled: boolean; cur?: Persona } | null>(null);
  const toggleInFlightRef = useRef<Record<string, boolean>>({});
  const toggleDesiredRef = useRef<Record<string, boolean>>({});
  const personasRef = useRef<Persona[]>(DEFAULT_PERSONAS);

  useEffect(() => {
    personasRef.current = personas;
  }, [personas]);

  const loadPersonas = async () => {
    try {
      const res = await fetch('/api/personas', { method: 'GET', credentials: 'include' });
      if (!res.ok) return;
      const data = (await res.json()) as { personas?: Array<{ id: string; name: string; enabled: boolean; topicPrefs: string; systemPrompt: string; capabilities?: string }> };
      const list = Array.isArray(data?.personas) ? data.personas : [];
      const mapped = list.map((p) => ({
        id: String(p.id),
        name: String(p.name),
        enabled: Boolean(p.enabled),
        topicPrefs: typeof p.topicPrefs === 'string' ? p.topicPrefs : '',
        systemPrompt: typeof p.systemPrompt === 'string' ? p.systemPrompt : '',
        capabilities: typeof p.capabilities === 'string' ? p.capabilities : '',
        deletable: !DEFAULT_PERSONAS.some((d) => d.id === p.id),
      }));
      setPersonas(mapped);
      if (mapped.some((p) => p.id === selectedPersonaId) === false) {
        setSelectedPersonaId(mapped[0]?.id ?? '');
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
          capabilities: p.capabilities,
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
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`patch_failed: ${res.status} ${text.slice(0, 120)}`);
      }
      return true;
    } catch (err) {
      throw err;
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
    const fallback = defaultCapabilitiesForPersona(p);
    const model = parseCapabilityModel(p.capabilities, fallback);
    setEditingPersonaCapabilityScores(model.scores);
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
  const [doneTodosExpanded, setDoneTodosExpanded] = useState<boolean>(false);

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
    const cur = personasRef.current.find((p) => p.id === id);
    if (!cur) {
      loadPersonas();
      return;
    }
    const nextEnabled = !cur.enabled;

    toggleDesiredRef.current[id] = nextEnabled;
    setPersonas((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: nextEnabled } : p)));

    pendingToggleRef.current = { id, nextEnabled, cur };

    if (toggleInFlightRef.current[id]) return;
    toggleInFlightRef.current[id] = true;

    const basePersona = cur;

    const run = async () => {
      try {
        while (Object.prototype.hasOwnProperty.call(toggleDesiredRef.current, id)) {
          const desired = toggleDesiredRef.current[id];
          delete toggleDesiredRef.current[id];

          try {
            await patchPersonaToServer(id, { enabled: desired });
          } catch (err) {
            const msg = String((err as any)?.message ?? '');
            if (desired) {
              if (msg.includes('patch_failed: 404')) {
                await upsertPersonaToServer({ ...basePersona, enabled: true });
              } else {
                throw err;
              }
            } else {
              throw new Error('toggle_failed');
            }
          }
        }
      } finally {
        toggleInFlightRef.current[id] = false;
        await loadPersonas();
      }
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
    const capabilities = buildCapabilityJson(defaultCapabilitiesForPersona({ id, name }).scores);
    const created = { id, name, systemPrompt: prompt, topicPrefs, capabilities, enabled: true, deletable: true } as Persona;
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

  const capabilityChartData = useMemo(() => {
    return CAPABILITY_AXES.map((axis, idx) => ({ axis, value: clampScore(editingPersonaCapabilityScores[idx] ?? 0) }));
  }, [editingPersonaCapabilityScores]);

  const teamCapabilityScores = useMemo(() => {
    const enabled = personas.filter((p) => p.enabled);
    if (enabled.length === 0) return CAPABILITY_AXES.map(() => 0);

    const sum = CAPABILITY_AXES.map(() => 0);
    for (const p of enabled) {
      const model = parseCapabilityModel(p.capabilities, defaultCapabilitiesForPersona(p));
      for (let i = 0; i < CAPABILITY_AXES.length; i++) {
        sum[i] += clampScore(model.scores[i] ?? 0);
      }
    }
    return sum.map((s) => Math.round(s / enabled.length));
  }, [personas]);

  const teamCapabilityChartData = useMemo(() => {
    return CAPABILITY_AXES.map((axis, idx) => ({ axis, value: clampScore(teamCapabilityScores[idx] ?? 0) }));
  }, [teamCapabilityScores]);

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
    <div className="relative bg-slate-50/70 dark:bg-slate-950/70 text-slate-900 dark:text-slate-100">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 aurora-gradient" />
        <div className="absolute inset-0 aurora-layer aurora-overlay" />
        <div className="absolute inset-0 aurora-highlight" />
        <div className="absolute inset-0 aurora-wave" />
        <div className="absolute inset-0 aurora-glow" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="relative z-10 h-[100svh] overflow-y-auto snap-y snap-mandatory scroll-smooth">
        <section className="h-[100svh] snap-start overflow-hidden">
          <div className="h-full overflow-y-auto pt-24 pb-8">
            <div className="max-w-6xl mx-auto px-6 space-y-8">
              <header className="space-y-3">
          <p className="text-3xl uppercase tracking-[0.3em] text-slate-500">
            Daily Rhythm · 岁序新笺
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            以智慧驱动每日行为
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    handleSelectPersona(p.id);
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border transition-colors ${
                    p.enabled
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                      : 'bg-transparent text-slate-600 border-slate-200 dark:text-slate-300 dark:border-slate-700'
                  } ${selectedPersonaId === p.id ? 'ring-2 ring-slate-400/50 dark:ring-slate-500/50' : ''}`}
                  title={'点击查看'}
                >
                  <span>{p.name}</span>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePersona(p.id);
                    }}
                    className={`ml-1 inline-flex items-center justify-center rounded-full border px-2 py-[1px] text-[10px] transition-colors ${
                      p.enabled
                        ? 'border-white/40 hover:border-white/70 dark:border-slate-900/40 dark:hover:border-slate-900/70'
                        : 'border-slate-300 hover:border-slate-500 dark:border-slate-600 dark:hover:border-slate-400'
                    }`}
                    title={p.enabled ? '停用' : '启用'}
                  >
                    {p.enabled ? 'ON' : 'OFF'}
                  </span>

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
                <div className="text-xs text-slate-500">点击上方标签可切换查看；点 ON/OFF 可启用/停用</div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[200px_200px_220px_1fr] gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">团队能力</div>
                    <div className="text-[11px] text-slate-400">启用 {personas.filter((p) => p.enabled).length}</div>
                  </div>
                  <RadarModelSquare title="" axes={CAPABILITY_AXES} scores={teamCapabilityScores} />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {CAPABILITY_AXES.map((axis, idx) => (
                      <div key={axis} className="flex items-center justify-between">
                        <span>{axis}</span>
                        <span className="tabular-nums">{clampScore(teamCapabilityScores[idx] ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-500">个人能力（拖动顶点）</div>
                  <RadarModelSquare
                    title=""
                    axes={CAPABILITY_AXES}
                    scores={editingPersonaCapabilityScores}
                    editable
                    onChangeScores={(next) => setEditingPersonaCapabilityScores(next)}
                    onCommitScores={() => {
                      if (!selectedPersona) return;
                      const json = buildCapabilityJson(editingPersonaCapabilityScores);
                      if ((selectedPersona.capabilities ?? '') !== json) {
                        updatePersona(selectedPersona.id, { capabilities: json });
                        schedulePersonaPatch(selectedPersona.id, { capabilities: json });
                      }
                    }}
                  />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {CAPABILITY_AXES.map((axis, idx) => (
                      <div key={axis} className="flex items-center justify-between">
                        <span>{axis}</span>
                        <span className="tabular-nums">{clampScore(editingPersonaCapabilityScores[idx] ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
            </div>
          </div>
        </section>

        <section className="h-[100svh] snap-start overflow-hidden">
          <div className="h-full overflow-y-auto py-8">
            <div className="max-w-6xl mx-auto px-6">
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
              <Button
                onClick={generateReviews}
                disabled={isGenerating || personas.every((p) => !p.enabled)}
                className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {isGenerating ? '讨论中…' : '智能点评'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
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
              </section>
            </div>
          </div>
        </section>

        <section className="h-[100svh] snap-start overflow-hidden">
          <div className="h-full overflow-y-auto pb-16 pt-8">
            <div className="max-w-6xl mx-auto px-6">
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI顾问讨论与评价</h2>
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
                      {persistedTodos.filter((x) => !x.done).map((t) => (
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

                      {persistedTodos.some((t) => t.done) && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setDoneTodosExpanded((v) => !v)}
                            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                          >
                            {doneTodosExpanded ? '收起已完成' : `展开已完成（${persistedTodos.filter((t) => t.done).length}）`}
                          </button>

                          {doneTodosExpanded && (
                            <div className="mt-2 space-y-2">
                              {persistedTodos.filter((x) => x.done).map((t) => (
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
                          )}
                        </div>
                      )}

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
