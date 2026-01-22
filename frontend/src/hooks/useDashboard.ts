import { useState, useEffect, useCallback } from 'react';
import { api, DashboardStats, Warehouse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats and warehouses in parallel
      const [statsData, warehousesData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getWarehouses()
      ]);
      
      // If stats endpoint doesn't exist, calculate from warehouses
      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback: derive stats from available data
        const alertsData = await api.getLowStockAlerts().catch(() => []);
        setStats({
          total_warehouses: warehousesData.length,
          low_stock_alerts: alertsData.length,
          total_inventory_items: 0, // Will need inventory endpoint
          recent_movements: 0,
        });
      }
      
      setWarehouses(warehousesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
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
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    warehouses,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
