import { useState, useEffect, useCallback } from 'react';
import { api, LowStockAlert } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useAlerts(autoRefresh: boolean = false) {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLowStockAlerts();
      setAlerts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alerts';
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

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
  };
}
