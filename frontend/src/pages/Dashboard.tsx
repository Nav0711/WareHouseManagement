import { Warehouse, AlertTriangle, Package, ArrowLeftRight, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { UtilizationChart } from '@/components/dashboard/UtilizationChart';
import { MovementTrendChart } from '@/components/dashboard/MovementTrendChart';
import { useDashboard } from '@/hooks/useDashboard';

export default function Dashboard() {
  const { stats, loading, error } = useDashboard();

  const kpiData = [
    {
      title: 'Total Warehouses',
      value: stats?.total_warehouses ?? 0,
      change: { value: 0, trend: 'up' as const },
      icon: <Warehouse className="h-6 w-6" />,
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.low_stock_alerts ?? 0,
      change: { value: 0, trend: 'down' as const },
      icon: <AlertTriangle className="h-6 w-6" />,
    },
    {
      title: 'Total Inventory Items',
      value: stats?.total_inventory_items ?? 0,
      change: { value: 0, trend: 'up' as const },
      icon: <Package className="h-6 w-6" />,
    },
    {
      title: 'Recent Movements',
      value: stats?.recent_movements ?? 0,
      change: { value: 0, trend: 'up' as const },
      icon: <ArrowLeftRight className="h-6 w-6" />,
    },
  ];

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
            <p className="text-muted-foreground">Failed to load dashboard data</p>
            <p className="text-sm text-destructive mt-2">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your warehouse operations.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <div
              key={kpi.title}
              className="animate-slide-up opacity-0"
              style={{ animationDelay: `${0.1 * (index + 2)}s` }}
            >
              <KPICard
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                icon={kpi.icon}
              />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
            <UtilizationChart />
          </div>
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.7s' }}>
            <MovementTrendChart />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
