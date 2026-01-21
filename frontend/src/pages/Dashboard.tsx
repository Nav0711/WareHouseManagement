import { Warehouse, AlertTriangle, Package, ArrowLeftRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { UtilizationChart } from '@/components/dashboard/UtilizationChart';
import { MovementTrendChart } from '@/components/dashboard/MovementTrendChart';

const kpiData = [
  {
    title: 'Total Warehouses',
    value: 12,
    change: { value: 8.2, trend: 'up' as const },
    icon: <Warehouse className="h-6 w-6" />,
  },
  {
    title: 'Low Stock Alerts',
    value: 23,
    change: { value: 12.5, trend: 'down' as const },
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  {
    title: 'Total Inventory Items',
    value: '45.2K',
    change: { value: 5.4, trend: 'up' as const },
    icon: <Package className="h-6 w-6" />,
  },
  {
    title: 'Recent Movements',
    value: 847,
    change: { value: 15.3, trend: 'up' as const },
    icon: <ArrowLeftRight className="h-6 w-6" />,
  },
];

export default function Dashboard() {
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
