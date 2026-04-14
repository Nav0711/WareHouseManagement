import { useState, useMemo } from 'react';
import { AlertTriangle, Filter, Loader2, Plus, Edit2, Trash2, Import } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useInventory } from '@/hooks/useInventory';
import { useWarehouses } from '@/hooks/useWarehouses';
import { InventoryWithDetails } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Inventory() {
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const { warehouses } = useWarehouses();
  const { toast } = useToast();
  
  const selectedWarehouseId = warehouseFilter !== 'all' ? Number(warehouseFilter) : undefined;
  const { inventory, loading, error, refetch } = useInventory(selectedWarehouseId);

  // Modal states
  const [editItem, setEditItem] = useState<InventoryWithDetails | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  
  const [deleteItem, setDeleteItem] = useState<InventoryWithDetails | null>(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addWarehouseId, setAddWarehouseId] = useState('');
  const [addProductId, setAddProductId] = useState('');
  const [addQuantity, setAddQuantity] = useState('');

  const warehouseOptions = useMemo(() => {
    return [{ id: 'all', name: 'All Warehouses' }, ...warehouses.map(w => ({ 
      id: w.warehouse_id.toString(), 
      name: w.warehouse_name 
    }))];
  }, [warehouses]);

  const handleEdit = async () => {
    if (!editItem || !editQuantity) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/inventory/${editItem.warehouse_id}/${editItem.product_id}?quantity=${editQuantity}`, {
        method: 'PUT'
      });
      if (response.ok) {
        toast({ title: 'Stock updated successfully' });
        refetch();
        setEditItem(null);
      } else {
        throw new Error('Failed to update');
      }
    } catch(err) {
      toast({ title: 'Error updating stock', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/inventory/${deleteItem.warehouse_id}/${deleteItem.product_id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast({ title: 'Record deleted completely' });
        refetch();
        setDeleteItem(null);
      } else {
        throw new Error('Failed to delete');
      }
    } catch(err) {
      toast({ title: 'Error deleting record', variant: 'destructive' });
    }
  };

  const handleCreateInbound = async () => {
    if(!addWarehouseId || !addProductId || !addQuantity) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/inventory/movements/inbound`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          to_warehouse_id: parseInt(addWarehouseId),
          product_id: parseInt(addProductId),
          quantity: parseInt(addQuantity),
          movement_type: 'inbound',
          reference_number: `MANUAL-${Date.now()}`,
          notes: 'Manual inbound stock addition'
        })
      });
      if (response.ok) {
        toast({ title: 'Stock added successfully' });
        refetch();
        setIsAddOpen(false);
      } else {
        throw new Error('Failed to add');
      }
    } catch(err) {
      toast({ title: 'Error adding stock', variant: 'destructive' });
    }
  };

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
    {
      key: 'actions',
      header: 'Actions',
      render: (row: InventoryWithDetails) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setEditItem(row); setEditQuantity(row.quantity.toString()); }}>
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(row)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="animate-slide-up opacity-0 flex justify-between items-end" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">Track inventory levels across warehouses</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4"/> Add Stock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Receive New Stock</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Warehouse ID</Label>
                  <Input type="number" value={addWarehouseId} onChange={e=>setAddWarehouseId(e.target.value)} placeholder="e.g. 1" />
                </div>
                <div className="space-y-2">
                  <Label>Product ID</Label>
                  <Input type="number" value={addProductId} onChange={e=>setAddProductId(e.target.value)} placeholder="e.g. 2" />
                </div>
                <div className="space-y-2">
                  <Label>Quantity to Add</Label>
                  <Input type="number" value={addQuantity} onChange={e=>setAddQuantity(e.target.value)} placeholder="e.g. 50" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateInbound}>Add to Inventory</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

        {error ? (
          <div className="flex items-center justify-center h-64 border rounded-xl bg-card">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground">Failed to load inventory</p>
              <p className="text-sm text-destructive mt-2">{error}</p>
            </div>
          </div>
        ) : (
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
            <DataTable columns={columns} data={inventory} />
          </div>
        )}

      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Inventory Quantity</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Editing <strong>{editItem?.product_name}</strong> at <strong>{editItem?.warehouse_name}</strong></p>
            <div className="space-y-2">
              <Label>Total Quantity</Label>
              <Input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
             <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove Inventory Record</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Are you sure you want to completely remove <strong>{deleteItem?.product_name}</strong> from <strong>{deleteItem?.warehouse_name}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
             <Button variant="destructive" onClick={handleDelete}>Delete Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
