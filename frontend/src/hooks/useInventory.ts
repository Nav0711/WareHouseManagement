import { useState, useEffect, useCallback } from 'react';
import { api, InventoryWithDetails, StockMovementInbound, StockMovementTransfer } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useInventory(warehouseId?: number, productId?: number) {
  const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInventory(warehouseId, productId);
      setInventory(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [warehouseId, productId, toast]);

  // Create inbound movement
  const createInboundMovement = async (data: StockMovementInbound) => {
    try {
      await api.createInboundMovement(data);
      
      toast({
        title: 'Success',
        description: 'Stock received successfully',
      });
      
      // Refresh inventory to show changes
      await fetchInventory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to receive stock';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Create transfer movement
  const createTransferMovement = async (data: StockMovementTransfer) => {
    try {
      await api.createTransferMovement(data);
      
      toast({
        title: 'Success',
        description: 'Stock transferred successfully',
      });
      
      // Refresh inventory to show changes
      await fetchInventory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to transfer stock';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    createInboundMovement,
    createTransferMovement,
    refetch: fetchInventory,
  };
}
