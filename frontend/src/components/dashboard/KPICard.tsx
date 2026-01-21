import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: ReactNode;
  className?: string;
}

export function KPICard({ title, value, change, icon, className }: KPICardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-glow hover:border-primary/50',
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  change.trend === 'up' ? 'text-success' : 'text-destructive'
                )}
              >
                {change.trend === 'up' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );
}
