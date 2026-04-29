import { Loader2, AlertTriangle, Eye, Edit, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVehicles } from '@/hooks/useVehicles';
import { Vehicle } from '@/lib/api';

export default function Transportation() {
  const { vehicles, loading, error } = useVehicles();

  const columns = [
    { 
      key: 'vehicle_number', 
      header: 'Vehicle Number',
      render: (row: Vehicle) => <span className="font-bold">{row.vehicle_number}</span>,
    },
    { 
      key: 'vehicle_type', 
      header: 'Type',
      render: (row: Vehicle) => <span className="capitalize">{row.vehicle_type}</span>,
    },
    {
      key: 'capacity_kg',
      header: 'Capacity (KG)',
      render: (row: Vehicle) => row.capacity_kg.toLocaleString(),
    },
    {
      key: 'capacity_cubic_meters',
      header: 'Capacity (m³)',
      render: (row: Vehicle) => row.capacity_cubic_meters.toLocaleString(),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row: Vehicle) => (
        <Badge 
          variant="outline" 
          className={row.is_active 
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
          }
        >
          {row.is_active ? 'Active' : 'Maintenance'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Vehicle) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
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
            <p className="text-muted-foreground">Failed to load vehicles</p>
            <p className="text-sm text-destructive mt-2">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-3xl font-bold">Transportation & Fleet</h1>
            <p className="text-muted-foreground mt-1">Manage vehicles, drivers, and routes</p>
          </div>
          <Button className="gap-2 transition-all duration-300 hover:shadow-glow">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <DataTable columns={columns} data={vehicles} />
        </div>
      </div>
    </DashboardLayout>
  );
}
