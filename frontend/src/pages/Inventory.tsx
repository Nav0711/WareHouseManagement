import { useState } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
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

interface InventoryItem {
  id: string;
  product: string;
  sku: string;
  warehouse: string;
  quantity: number;
  minStock: number;
  category: string;
}

const inventoryData: InventoryItem[] = [
  { id: '1', product: 'Widget Pro Max', sku: 'WPM-001', warehouse: 'Central Hub', quantity: 1250, minStock: 500, category: 'Electronics' },
  { id: '2', product: 'Standard Gadget', sku: 'SG-042', warehouse: 'West Coast DC', quantity: 89, minStock: 200, category: 'Electronics' },
  { id: '3', product: 'Premium Package', sku: 'PP-103', warehouse: 'Central Hub', quantity: 3400, minStock: 1000, category: 'Packaging' },
  { id: '4', product: 'Basic Component', sku: 'BC-205', warehouse: 'Midwest Center', quantity: 45, minStock: 100, category: 'Components' },
  { id: '5', product: 'Industrial Tool', sku: 'IT-301', warehouse: 'Southern Hub', quantity: 780, minStock: 250, category: 'Tools' },
  { id: '6', product: 'Office Supply Kit', sku: 'OSK-412', warehouse: 'Northeast DC', quantity: 2100, minStock: 500, category: 'Office' },
  { id: '7', product: 'Safety Equipment', sku: 'SE-508', warehouse: 'Central Hub', quantity: 15, minStock: 50, category: 'Safety' },
];

const warehouses = ['All Warehouses', 'Central Hub', 'West Coast DC', 'Midwest Center', 'Southern Hub', 'Northeast DC'];
const categories = ['All Categories', 'Electronics', 'Packaging', 'Components', 'Tools', 'Office', 'Safety'];

export default function Inventory() {
  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const filteredInventory = inventoryData.filter((item) => {
    const matchesWarehouse = warehouseFilter === 'All Warehouses' || item.warehouse === warehouseFilter;
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
    return matchesWarehouse && matchesCategory;
  });

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (row: InventoryItem) => (
        <div>
          <p className="font-medium">{row.product}</p>
          <p className="text-sm text-muted-foreground font-mono">{row.sku}</p>
        </div>
      ),
    },
    { key: 'warehouse', header: 'Warehouse' },
    { key: 'category', header: 'Category' },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row: InventoryItem) => (
        <div className="flex items-center gap-2">
          <span className={cn(row.quantity < row.minStock && 'text-destructive font-medium')}>
            {row.quantity.toLocaleString()}
          </span>
          {row.quantity < row.minStock && (
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Stock Status',
      render: (row: InventoryItem) => {
        const ratio = row.quantity / row.minStock;
        if (ratio < 0.5) {
          return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
        } else if (ratio < 1) {
          return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Low</Badge>;
        }
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Normal</Badge>;
      },
    },
  ];

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
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(warehouseFilter !== 'All Warehouses' || categoryFilter !== 'All Categories') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setWarehouseFilter('All Warehouses');
                setCategoryFilter('All Categories');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
          <DataTable columns={columns} data={filteredInventory} />
        </div>
      </div>
    </DashboardLayout>
  );
}
