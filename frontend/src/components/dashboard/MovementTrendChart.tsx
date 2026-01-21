import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Jan', inbound: 240, outbound: 180 },
  { date: 'Feb', inbound: 300, outbound: 220 },
  { date: 'Mar', inbound: 280, outbound: 250 },
  { date: 'Apr', inbound: 320, outbound: 280 },
  { date: 'May', inbound: 350, outbound: 300 },
  { date: 'Jun', inbound: 380, outbound: 340 },
];

export function MovementTrendChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-6 text-lg font-semibold">Inventory Movement Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorInbound)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="hsl(var(--chart-2))"
              fillOpacity={1}
              fill="url(#colorOutbound)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Inbound</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-2" />
          <span className="text-sm text-muted-foreground">Outbound</span>
        </div>
      </div>
    </div>
  );
}
