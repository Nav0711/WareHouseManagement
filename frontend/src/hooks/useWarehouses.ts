import { useState, useEffect, useCallback } from 'react';
import { api, Warehouse, WarehouseCreate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useWarehouses(autoRefresh: boolean = false) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch warehouses from API
  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWarehouses();
      setWarehouses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch warehouses';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create new warehouse
  const createWarehouse = async (data: WarehouseCreate) => {
    try {
      const newWarehouse = await api.createWarehouse(data);
      
      // Optimistic update - add to local state immediately
      setWarehouses(prev => [...prev, newWarehouse]);
      
      toast({
        title: 'Success',
        description: `Warehouse "${newWarehouse.warehouse_name}" created successfully`,
      });
      
      return newWarehouse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create warehouse';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update warehouse
  const updateWarehouse = async (id: number, data: Partial<WarehouseCreate>) => {
    try {
      const updated = await api.updateWarehouse(id, data);
      
      // Update local state
      setWarehouses(prev => 
        prev.map(w => w.warehouse_id === id ? updated : w)
      );
      
      toast({
        title: 'Success',
        description: 'Warehouse updated successfully',
      });
      
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update warehouse';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Delete warehouse
  const deleteWarehouse = async (id: number) => {
    try {
      await api.deleteWarehouse(id);
      
      // Remove from local state
      setWarehouses(prev => prev.filter(w => w.warehouse_id !== id));
      
      toast({
        title: 'Success',
        description: 'Warehouse deactivated successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete warehouse';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWarehouses();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchWarehouses]);

  return {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    refetch: fetchWarehouses,
  };
}
