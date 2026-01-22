import { useState, useMemo } from 'react';
import { AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useInventory } from '@/hooks/useInventory';
import { useWarehouses } from '@/hooks/useWarehouses';
import { InventoryWithDetails } from '@/lib/api';

export default function Inventory() {
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const { warehouses } = useWarehouses();
  
  const selectedWarehouseId = warehouseFilter !== 'all' ? Number(warehouseFilter) : undefined;
  const { inventory, loading, error } = useInventory(selectedWarehouseId);

  const warehouseOptions = useMemo(() => {
    return [{ id: 'all', name: 'All Warehouses' }, ...warehouses.map(w => ({ 
      id: w.warehouse_id.toString(), 
      name: w.warehouse_name 
    }))];
  }, [warehouses]);

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (row: InventoryWithDetails) => (
        <div>
          <p className="font-medium">{row.product_name}</p>
          <p className="text-sm text-muted-foreground font-mono">{row.product_code}</p>
        </div>
      ),
    },
    { 
      key: 'warehouse_name', 
      header: 'Warehouse',
      render: (row: InventoryWithDetails) => row.warehouse_name,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row: InventoryWithDetails) => (
        <div className="flex items-center gap-2">
          <span className={cn(row.available_quantity < 50 && 'text-destructive font-medium')}>
            {row.quantity.toLocaleString()}
          </span>
          {row.available_quantity < 50 && (
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          )}
        </div>
      ),
    },
    {
      key: 'available_quantity',
      header: 'Available',
      render: (row: InventoryWithDetails) => row.available_quantity.toLocaleString(),
    },
    {
      key: 'reserved_quantity',
      header: 'Reserved',
      render: (row: InventoryWithDetails) => row.reserved_quantity.toLocaleString(),
    },
    {
      key: 'status',
      header: 'Stock Status',
      render: (row: InventoryWithDetails) => {
        if (row.available_quantity <= 0) {
          return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Out of Stock</Badge>;
        } else if (row.available_quantity < 50) {
          return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Low</Badge>;
        }
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Normal</Badge>;
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
            <p className="text-muted-foreground">Failed to load inventory</p>
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
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">Track inventory levels across warehouses</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {warehouseFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWarehouseFilter('all')}
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
          <DataTable columns={columns} data={inventory} />
        </div>
      </div>
    </DashboardLayout>
  );
}
