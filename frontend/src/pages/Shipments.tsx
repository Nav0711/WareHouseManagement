import { Loader2, AlertTriangle, MapPin, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useShipments } from '@/hooks/useShipments';
import { Shipment } from '@/lib/api';

export default function Shipments() {
  const { shipments, loading, error } = useShipments();

  const columns = [
    { 
      key: 'shipment_number', 
      header: 'Shipment Number',
      render: (row: Shipment) => <span className="font-bold text-primary">{row.shipment_number}</span>,
    },
    { 
      key: 'order_id', 
      header: 'Order Ref',
      render: (row: Shipment) => `#${row.order_id}`,
    },
    {
      key: 'route_id',
      header: 'Route ID',
      render: (row: Shipment) => (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" /> {row.route_id}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Shipment) => {
        const statusColors: Record<string, string> = {
          'planned': 'bg-secondary/10 text-secondary border-secondary/20',
          'in_transit': 'bg-primary/10 text-primary border-primary/20',
          'delivered': 'bg-success/10 text-success border-success/20',
          'cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
        };
        const color = statusColors[row.status] || statusColors['planned'];
        return (
          <Badge variant="outline" className={color}>
            {row.status.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      },
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
            <p className="text-muted-foreground">Failed to load shipments</p>
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
            <h1 className="text-3xl font-bold">Shipments</h1>
            <p className="text-muted-foreground mt-1">Track in-transit logistics and deliveries</p>
          </div>
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <DataTable columns={columns} data={shipments} />
        </div>
      </div>
    </DashboardLayout>
  );
}
