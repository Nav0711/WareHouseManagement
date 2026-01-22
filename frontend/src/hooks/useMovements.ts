import { useState, useEffect, useCallback } from 'react';
import { api, StockMovement } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useMovements(warehouseId?: number, movementType?: string) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStockMovements(warehouseId, movementType);
      setMovements(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch movements';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [warehouseId, movementType, toast]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    refetch: fetchMovements,
  };
}
