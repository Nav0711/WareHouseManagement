import { useState } from 'react';
import { Edit, Trash2, Eye, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Warehouse } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Warehouses() {
  const { warehouses, loading, error, createWarehouse, deleteWarehouse } = useWarehouses();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    warehouse_name: '',
    location: '',
    city: '',
    state: '',
    country: '',
    capacity_cubic_meters: 0,
  });

  const handleCreate = async () => {
    try {
      await createWarehouse(formData);
      setIsOpen(false);
      setFormData({
        warehouse_name: '',
        location: '',
        city: '',
        state: '',
        country: '',
        capacity_cubic_meters: 0,
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to deactivate this warehouse?')) {
      await deleteWarehouse(id);
    }
  };

  const columns = [
    { 
      key: 'warehouse_name', 
      header: 'Name',
      render: (row: Warehouse) => row.warehouse_name,
    },
    { 
      key: 'city', 
      header: 'City',
      render: (row: Warehouse) => row.city,
    },
    {
      key: 'capacity_cubic_meters',
      header: 'Capacity',
      render: (row: Warehouse) => row.capacity_cubic_meters.toLocaleString() + ' m³',
    },
    {
      key: 'location',
      header: 'Location',
      render: (row: Warehouse) => row.location,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row: Warehouse) => (
        <Badge 
          variant="outline" 
          className={row.is_active 
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
          }
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Warehouse) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-destructive"
            onClick={() => handleDelete(row.warehouse_id)}
          >
            <Trash2 className="h-4 w-4" />
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
            <p className="text-muted-foreground">Failed to load warehouses</p>
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
            <h1 className="text-3xl font-bold">Warehouses</h1>
            <p className="text-muted-foreground mt-1">Manage your warehouse locations</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 transition-all duration-300 hover:shadow-glow">
                <Plus className="h-4 w-4" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Warehouse</DialogTitle>
                <DialogDescription>
                  Create a new warehouse location.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Warehouse Name</Label>
                  <Input 
                    value={formData.warehouse_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, warehouse_name: e.target.value }))}
                    placeholder="Enter warehouse name" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input 
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter address" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>City</Label>
                    <Input 
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>State</Label>
                    <Input 
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State" 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Country</Label>
                  <Input 
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Capacity (m³)</Label>
                  <Input 
                    type="number"
                    value={formData.capacity_cubic_meters}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity_cubic_meters: Number(e.target.value) }))}
                    placeholder="Enter capacity" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>
                  Create Warehouse
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
          <DataTable columns={columns} data={warehouses} />
        </div>
      </div>
    </DashboardLayout>
  );
}
