import { useState, useEffect } from 'react';
import { api, Shipment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await api.getShipments();
      setShipments(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shipments';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return { shipments, loading, error, refetch: fetchShipments };
}
