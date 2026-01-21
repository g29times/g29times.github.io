import { useMemo, useState } from 'react';
import { eachDayOfInterval, format, startOfToday, subDays } from 'date-fns';
import { dailyLog, DailyEntry } from '@/data/dailyLog';
import { X } from 'lucide-react';

// 单元格类型
 type Cell = {
  date: string;
  count: number;
  entries?: DailyEntry[];
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
    const count = entries?.reduce((sum, e) => sum + e.done.length + (e.todo?.length ?? 0), 0) ?? 0;
    return { date: key, count, entries };
  });
}

export default function Stats() {
  const cells = useMemo(buildCells, []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Daily Rhythm</p>
          <h1 className="text-3xl font-bold">年度日常热力图</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            记录过去一年的每日行为密度。
          </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500 mb-1">Done</div>
                      <ul className="list-disc list-inside space-y-1">
                        {cell.entries?.flatMap((e) => e.done).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li className="text-slate-400">无</li>}
                      </ul>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Todo</div>
                      <ul className="list-disc list-inside space-y-1">
                        {cell.entries?.flatMap((e) => e.todo ?? []).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li className="text-slate-400">无</li>}
                      </ul>
                    </div>
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
  );
}
