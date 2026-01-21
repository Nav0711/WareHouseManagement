import { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
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

interface Movement {
  id: string;
  type: 'inbound' | 'outbound' | 'transfer';
  product: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  timestamp: string;
  createdBy: string;
}

const movementsData: Movement[] = [
  { id: '1', type: 'inbound', product: 'Widget Pro Max', quantity: 500, fromLocation: 'Supplier A', toLocation: 'Central Hub - Zone A', timestamp: '2025-01-21 14:32', createdBy: 'John D.' },
  { id: '2', type: 'outbound', product: 'Standard Gadget', quantity: 120, fromLocation: 'West Coast DC - Zone B', toLocation: 'Customer #1234', timestamp: '2025-01-21 13:15', createdBy: 'Sarah M.' },
  { id: '3', type: 'transfer', product: 'Premium Package', quantity: 200, fromLocation: 'Central Hub - Zone C', toLocation: 'Midwest Center - Zone A', timestamp: '2025-01-21 11:45', createdBy: 'Mike R.' },
  { id: '4', type: 'inbound', product: 'Basic Component', quantity: 1000, fromLocation: 'Supplier B', toLocation: 'Southern Hub - Zone D', timestamp: '2025-01-21 10:20', createdBy: 'Emily S.' },
  { id: '5', type: 'outbound', product: 'Industrial Tool', quantity: 50, fromLocation: 'Northeast DC - Zone A', toLocation: 'Customer #5678', timestamp: '2025-01-21 09:00', createdBy: 'John D.' },
];

const typeConfig = {
  inbound: { icon: ArrowDownLeft, color: 'bg-success/10 text-success border-success/20', label: 'Inbound' },
  outbound: { icon: ArrowUpRight, color: 'bg-chart-2/10 text-chart-2 border-chart-2/20', label: 'Outbound' },
  transfer: { icon: ArrowLeftRight, color: 'bg-chart-3/10 text-chart-3 border-chart-3/20', label: 'Transfer' },
};

export default function Movements() {
  const [isOpen, setIsOpen] = useState(false);
  const [movementType, setMovementType] = useState<string>('');

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (row: Movement) => {
        const config = typeConfig[row.type];
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={`gap-1.5 ${config.color}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
    { key: 'product', header: 'Product' },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row: Movement) => row.quantity.toLocaleString(),
    },
    { key: 'fromLocation', header: 'From' },
    { key: 'toLocation', header: 'To' },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row: Movement) => (
        <span className="text-sm text-muted-foreground">{row.timestamp}</span>
      ),
    },
    { key: 'createdBy', header: 'Created By' },
  ];

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
                  <Label>Product</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wpm">Widget Pro Max</SelectItem>
                      <SelectItem value="sg">Standard Gadget</SelectItem>
                      <SelectItem value="pp">Premium Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="Enter quantity" />
                </div>
                <div className="grid gap-2">
                  <Label>From Location</Label>
                  <Input placeholder="Source location" />
                </div>
                <div className="grid gap-2">
                  <Label>To Location</Label>
                  <Input placeholder="Destination location" />
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
          <DataTable columns={columns} data={movementsData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
