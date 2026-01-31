import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartData {
  name: string
  [key: string]: string | number
}

interface BlogChartProps {
  data: ChartData[]
  keys: string[]
  type?: 'bar' | 'pie' | 'chart'
  title?: string
}

const COLORS = [
  "hsl(var(--primary))",
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
]

export function BlogChart({ data, keys, type = 'bar', title }: BlogChartProps) {
  if (!data || data.length === 0) return null

  return (
    <div className="w-full h-[400px] my-8 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      {title ? (
        <h3 className="text-lg font-semibold mb-4 font-serif text-center">
          {title}
        </h3>
      ) : null}

      <ResponsiveContainer width="100%" height="100%">
        {type === 'pie' ? (
          <PieChart>
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
            <Legend />
            <Pie
              data={data}
              dataKey={keys[0]}
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
            <Legend />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
