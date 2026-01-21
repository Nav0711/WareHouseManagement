import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Warehouse A', utilization: 78 },
  { name: 'Warehouse B', utilization: 92 },
  { name: 'Warehouse C', utilization: 65 },
  { name: 'Warehouse D', utilization: 88 },
  { name: 'Warehouse E', utilization: 45 },
];

export function UtilizationChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-6 text-lg font-semibold">Warehouse Utilization</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
              formatter={(value: number) => [`${value}%`, 'Utilization']}
            />
            <Bar
              dataKey="utilization"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
