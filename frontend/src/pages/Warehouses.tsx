import { useState } from 'react';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Warehouse {
  id: string;
  name: string;
  city: string;
  capacity: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'inactive';
}

const warehousesData: Warehouse[] = [
  { id: '1', name: 'Central Hub', city: 'New York', capacity: 50000, utilization: 78, status: 'active' },
  { id: '2', name: 'West Coast DC', city: 'Los Angeles', capacity: 75000, utilization: 92, status: 'active' },
  { id: '3', name: 'Midwest Center', city: 'Chicago', capacity: 40000, utilization: 65, status: 'active' },
  { id: '4', name: 'Southern Hub', city: 'Dallas', capacity: 60000, utilization: 45, status: 'maintenance' },
  { id: '5', name: 'Northeast DC', city: 'Boston', capacity: 35000, utilization: 88, status: 'active' },
];

const statusColors = {
  active: 'bg-success/10 text-success border-success/20',
  maintenance: 'bg-warning/10 text-warning border-warning/20',
  inactive: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Warehouses() {
  const [warehouses] = useState<Warehouse[]>(warehousesData);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'city', header: 'City' },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (row: Warehouse) => row.capacity.toLocaleString() + ' sqft',
    },
    {
      key: 'utilization',
      header: 'Utilization',
      render: (row: Warehouse) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${row.utilization}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{row.utilization}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Warehouse) => (
        <Badge variant="outline" className={statusColors[row.status]}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-3xl font-bold">Warehouses</h1>
            <p className="text-muted-foreground mt-1">Manage your warehouse locations</p>
          </div>
          <Button className="gap-2 transition-all duration-300 hover:shadow-glow">
            <Plus className="h-4 w-4" />
            Add Warehouse
          </Button>
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <DataTable columns={columns} data={warehouses} />
        </div>
      </div>
    </DashboardLayout>
  );
}
