import { Loader2, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/lib/api';

export default function Orders() {
  const { orders, loading, error } = useOrders();

  const columns = [
    { 
      key: 'order_number', 
      header: 'Order Number',
      render: (row: Order) => <span className="font-medium">{row.order_number}</span>,
    },
    { 
      key: 'customer_id', 
      header: 'Customer ID',
      render: (row: Order) => row.customer_id,
    },
    {
      key: 'order_date',
      header: 'Date',
      render: (row: Order) => new Date(row.order_date).toLocaleDateString(),
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (row: Order) => `$${row.total_amount.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Order) => {
        let variant = 'outline';
        if (row.status === 'delivered') variant = 'success';
        if (row.status === 'processing') variant = 'secondary';
        
        return (
          <Badge variant="outline" className={row.status === 'delivered' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Order) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
            <Eye className="h-4 w-4" />
          </Button>
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
            <p className="text-muted-foreground">Failed to load orders</p>
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
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground mt-1">Manage customer orders and fulfillment</p>
          </div>
          <Button className="gap-2 transition-all duration-300 hover:shadow-glow">
            Create Order
          </Button>
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <DataTable columns={columns} data={orders} />
        </div>
      </div>
    </DashboardLayout>
  );
}
