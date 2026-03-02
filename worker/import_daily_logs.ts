import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dailyLog } from '../src/data/dailyLog';

type DailyLink = {
  title?: string;
  url: string;
};

type DailyItem =
  | string
  | {
      text: string;
      links?: DailyLink[];
    };

type DailyEntry = {
  date: string;
  done: DailyItem[];
  todo?: DailyItem[];
  note?: string;
};

function isYmd(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function normalizeItems(items: unknown): DailyItem[] {
  if (!Array.isArray(items)) return [];
  const out: DailyItem[] = [];
  for (const it of items) {
    if (typeof it === 'string') {
      const t = it.trim();
      if (t) out.push(t);
      continue;
    }
    if (it && typeof it === 'object') {
      const obj = it as { text?: unknown; links?: unknown };
      const text = typeof obj.text === 'string' ? obj.text.trim() : '';
      if (!text) continue;
      const linksRaw = obj.links;
      const links: DailyLink[] = Array.isArray(linksRaw)
        ? linksRaw
            .map((l): DailyLink | null => {
              const ll = l as { title?: unknown; url?: unknown };
              const url = typeof ll?.url === 'string' ? ll.url.trim() : '';
              if (!url) return null;
              const title = typeof ll?.title === 'string' ? ll.title.trim() : '';
              return title ? { url, title } : { url };
            })
            .filter((x): x is DailyLink => x !== null)
        : [];
      out.push({ text, links });
    }
  }
  return out;
}

function sqlString(s: string) {
  return `'${s.replace(/'/g, "''")}'`;
}

function main() {
  const now = new Date().toISOString();
  const entries: DailyEntry[] = Array.isArray(dailyLog) ? (dailyLog as DailyEntry[]) : [];

  const normalized = entries
    .filter((e) => e && typeof e === 'object')
    .map((e) => {
      const date = String((e as any).date ?? '').trim();
      const done = normalizeItems((e as any).done);
      const todo = normalizeItems((e as any).todo);
      const note = typeof (e as any).note === 'string' ? String((e as any).note) : '';
      return { date, done, todo, note };
    })
    .filter((e) => isYmd(e.date));

  const lines: string[] = [];


  for (const e of normalized) {
    const doneJson = JSON.stringify(e.done);
    const todoJson = JSON.stringify(e.todo);
    const note = e.note ?? '';

    lines.push(
      [
        'INSERT INTO daily_logs (date, doneJson, todoJson, note, createdAt, updatedAt)',
        `VALUES (${sqlString(e.date)}, ${sqlString(doneJson)}, ${sqlString(todoJson)}, ${sqlString(note)}, ${sqlString(
          now,
        )}, ${sqlString(now)})`,
        'ON CONFLICT(date) DO UPDATE SET',
        '  doneJson = excluded.doneJson,',
        '  todoJson = excluded.todoJson,',
        '  note = excluded.note,',
        '  updatedAt = excluded.updatedAt;',
      ].join('\n'),
    );
  }

  const outPath = resolve(process.cwd(), 'worker', 'import_daily_logs.sql');
  writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`wrote ${normalized.length} entries -> ${outPath}`);
}

main();
