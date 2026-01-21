import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'low_stock' | 'critical_stock' | 'out_of_stock';
  product: string;
  sku: string;
  warehouse: string;
  currentStock: number;
  minStock: number;
  timestamp: string;
}

const alertsData: Alert[] = [
  { id: '1', type: 'critical_stock', product: 'Safety Equipment', sku: 'SE-508', warehouse: 'Central Hub', currentStock: 15, minStock: 50, timestamp: '2 hours ago' },
  { id: '2', type: 'out_of_stock', product: 'Emergency Kit', sku: 'EK-101', warehouse: 'West Coast DC', currentStock: 0, minStock: 25, timestamp: '4 hours ago' },
  { id: '3', type: 'low_stock', product: 'Standard Gadget', sku: 'SG-042', warehouse: 'West Coast DC', currentStock: 89, minStock: 200, timestamp: '6 hours ago' },
  { id: '4', type: 'low_stock', product: 'Basic Component', sku: 'BC-205', warehouse: 'Midwest Center', currentStock: 45, minStock: 100, timestamp: '8 hours ago' },
  { id: '5', type: 'critical_stock', product: 'Premium Tool', sku: 'PT-302', warehouse: 'Southern Hub', currentStock: 8, minStock: 30, timestamp: '12 hours ago' },
];

const alertConfig = {
  low_stock: {
    icon: TrendingDown,
    color: 'bg-warning/10 text-warning border-warning/20',
    label: 'Low Stock',
    bgClass: 'border-l-warning',
  },
  critical_stock: {
    icon: AlertTriangle,
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    label: 'Critical',
    bgClass: 'border-l-destructive',
  },
  out_of_stock: {
    icon: Package,
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    label: 'Out of Stock',
    bgClass: 'border-l-destructive animate-pulse',
  },
};

export default function Alerts() {
  const criticalCount = alertsData.filter(a => a.type === 'critical_stock' || a.type === 'out_of_stock').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Alerts</h1>
            {criticalCount > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 relative pulse-ring">
                {criticalCount} Critical
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Monitor low stock and critical inventory alerts</p>
        </div>

        <div className="space-y-4">
          {alertsData.map((alert, index) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            const stockPercentage = (alert.currentStock / alert.minStock) * 100;

            return (
              <div
                key={alert.id}
                className={cn(
                  'rounded-xl border border-border bg-card p-6 border-l-4 transition-all duration-300 hover:shadow-glow animate-slide-up opacity-0',
                  config.bgClass
                )}
                style={{ animationDelay: `${0.1 * (index + 2)}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.color.split(' ')[0])}>
                      <Icon className={cn('h-5 w-5', config.color.split(' ')[1])} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.product}</h3>
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono">{alert.sku}</span> • {alert.warehouse}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Current / Minimum</p>
                      <p className="font-semibold">
                        <span className={alert.currentStock < alert.minStock * 0.5 ? 'text-destructive' : 'text-warning'}>
                          {alert.currentStock}
                        </span>
                        <span className="text-muted-foreground"> / {alert.minStock}</span>
                      </p>
                      <div className="mt-1 h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            stockPercentage <= 30 ? 'bg-destructive' : 'bg-warning'
                          )}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" className="transition-all duration-300 hover:shadow-glow">
                      Reorder
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">{alert.timestamp}</p>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
