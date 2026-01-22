import { AlertTriangle, Package, TrendingDown, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAlerts } from '@/hooks/useAlerts';
import { LowStockAlert } from '@/lib/api';

const getAlertConfig = (shortage: number, currentQuantity: number) => {
  if (currentQuantity === 0) {
    return {
      icon: Package,
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      label: 'Out of Stock',
      bgClass: 'border-l-destructive animate-pulse',
    };
  } else if (shortage > 50) {
    return {
      icon: AlertTriangle,
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      label: 'Critical',
      bgClass: 'border-l-destructive',
    };
  }
  return {
    icon: TrendingDown,
    color: 'bg-warning/10 text-warning border-warning/20',
    label: 'Low Stock',
    bgClass: 'border-l-warning',
  };
};

export default function Alerts() {
  const { alerts, loading, error } = useAlerts(true); // Auto-refresh enabled

  const criticalCount = alerts.filter(a => a.current_quantity === 0 || a.shortage > 50).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load alerts</p>
            <p className="text-sm text-destructive mt-2">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        {alerts.length === 0 ? (
          <div className="animate-slide-up opacity-0 text-center py-12" style={{ animationDelay: '0.2s' }}>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No Alerts</p>
            <p className="text-muted-foreground">All inventory levels are healthy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: LowStockAlert, index: number) => {
              const config = getAlertConfig(alert.shortage, alert.current_quantity);
              const Icon = config.icon;
              const stockPercentage = (alert.current_quantity / alert.reorder_level) * 100;

              return (
                <div
                  key={`${alert.warehouse_id}-${alert.product_id}`}
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
                          <h3 className="font-semibold">{alert.product_name}</h3>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-mono">{alert.product_code}</span> • {alert.warehouse_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current / Reorder Level</p>
                        <p className="font-semibold">
                          <span className={alert.current_quantity < alert.reorder_level * 0.5 ? 'text-destructive' : 'text-warning'}>
                            {alert.current_quantity}
                          </span>
                          <span className="text-muted-foreground"> / {alert.reorder_level}</span>
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
                  <p className="text-xs text-muted-foreground mt-4">
                    Shortage: {alert.shortage} units
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
