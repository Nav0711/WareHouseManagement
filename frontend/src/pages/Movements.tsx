import { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMovements } from '@/hooks/useMovements';
import { StockMovement } from '@/lib/api';
import { format } from 'date-fns';

const typeConfig = {
  inbound: { icon: ArrowDownLeft, color: 'bg-success/10 text-success border-success/20', label: 'Inbound' },
  outbound: { icon: ArrowUpRight, color: 'bg-chart-2/10 text-chart-2 border-chart-2/20', label: 'Outbound' },
  transfer: { icon: ArrowLeftRight, color: 'bg-chart-3/10 text-chart-3 border-chart-3/20', label: 'Transfer' },
};

export default function Movements() {
  const [isOpen, setIsOpen] = useState(false);
  const [movementType, setMovementType] = useState<string>('');
  const { movements, loading, error } = useMovements();

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (row: StockMovement) => {
        const config = typeConfig[row.movement_type];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={`gap-1.5 ${config.color}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
    { 
      key: 'product', 
      header: 'Product',
      render: (row: StockMovement) => (
        <div>
          <p className="font-medium">{row.product_name || `Product #${row.product_id}`}</p>
          {row.product_code && (
            <p className="text-sm text-muted-foreground font-mono">{row.product_code}</p>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row: StockMovement) => row.quantity.toLocaleString(),
    },
    { 
      key: 'from', 
      header: 'From',
      render: (row: StockMovement) => row.from_warehouse_name || '-',
    },
    { 
      key: 'to', 
      header: 'To',
      render: (row: StockMovement) => row.to_warehouse_name || '-',
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row: StockMovement) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.created_at), 'yyyy-MM-dd HH:mm')}
        </span>
      ),
    },
    { 
      key: 'createdBy', 
      header: 'Created By',
      render: (row: StockMovement) => row.created_by || '-',
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
            <p className="text-muted-foreground">Failed to load movements</p>
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
            <h1 className="text-3xl font-bold">Stock Movements</h1>
            <p className="text-muted-foreground mt-1">Track all inventory movements</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 transition-all duration-300 hover:shadow-glow">
                <Plus className="h-4 w-4" />
                Create Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Stock Movement</DialogTitle>
                <DialogDescription>
                  Record a new inventory movement between locations.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Movement Type</Label>
                  <Select value={movementType} onValueChange={setMovementType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Product ID</Label>
                  <Input type="number" placeholder="Enter product ID" />
                </div>
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="Enter quantity" />
                </div>
                {(movementType === 'outbound' || movementType === 'transfer') && (
                  <div className="grid gap-2">
                    <Label>From Warehouse ID</Label>
                    <Input type="number" placeholder="Source warehouse" />
                  </div>
                )}
                {(movementType === 'inbound' || movementType === 'transfer') && (
                  <div className="grid gap-2">
                    <Label>To Warehouse ID</Label>
                    <Input type="number" placeholder="Destination warehouse" />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Reference Number (optional)</Label>
                  <Input placeholder="e.g., PO-12345" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Create Movement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <DataTable columns={columns} data={movements} />
        </div>
      </div>
    </DashboardLayout>
  );
}
