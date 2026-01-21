import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Bin {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
}

interface Zone {
  id: string;
  name: string;
  type: 'receiving' | 'storage' | 'shipping' | 'returns';
  bins: Bin[];
}

interface WarehouseZone {
  warehouseId: string;
  warehouseName: string;
  zones: Zone[];
}

const zonesData: WarehouseZone[] = [
  {
    warehouseId: '1',
    warehouseName: 'Central Hub',
    zones: [
      {
        id: 'z1',
        name: 'Zone A - Receiving',
        type: 'receiving',
        bins: [
          { id: 'b1', name: 'A-01', capacity: 100, occupied: 75 },
          { id: 'b2', name: 'A-02', capacity: 100, occupied: 50 },
          { id: 'b3', name: 'A-03', capacity: 100, occupied: 90 },
        ],
      },
      {
        id: 'z2',
        name: 'Zone B - Storage',
        type: 'storage',
        bins: [
          { id: 'b4', name: 'B-01', capacity: 200, occupied: 180 },
          { id: 'b5', name: 'B-02', capacity: 200, occupied: 120 },
        ],
      },
    ],
  },
  {
    warehouseId: '2',
    warehouseName: 'West Coast DC',
    zones: [
      {
        id: 'z3',
        name: 'Zone C - Shipping',
        type: 'shipping',
        bins: [
          { id: 'b6', name: 'C-01', capacity: 150, occupied: 100 },
          { id: 'b7', name: 'C-02', capacity: 150, occupied: 140 },
        ],
      },
    ],
  },
];

const zoneTypeColors = {
  receiving: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  storage: 'bg-primary/10 text-primary border-primary/20',
  shipping: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  returns: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
};

export default function Zones() {
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-3xl font-bold">Zones & Bins</h1>
            <p className="text-muted-foreground mt-1">Manage warehouse zones and storage bins</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
            <Button className="gap-2 transition-all duration-300 hover:shadow-glow">
              <Plus className="h-4 w-4" />
              Add Bin
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {zonesData.map((warehouse, wIndex) => (
            <div
              key={warehouse.warehouseId}
              className="rounded-xl border border-border bg-card animate-slide-up opacity-0"
              style={{ animationDelay: `${0.1 * (wIndex + 2)}s` }}
            >
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold">{warehouse.warehouseName}</h2>
              </div>
              <div className="divide-y divide-border">
                {warehouse.zones.map((zone) => (
                  <div key={zone.id}>
                    <button
                      onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
                      className="flex w-full items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <ChevronRight
                          className={cn(
                            'h-5 w-5 text-muted-foreground transition-transform duration-200',
                            expandedZone === zone.id && 'rotate-90'
                          )}
                        />
                        <span className="font-medium">{zone.name}</span>
                        <Badge variant="outline" className={zoneTypeColors[zone.type]}>
                          {zone.type}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {zone.bins.length} bins
                      </span>
                    </button>
                    {expandedZone === zone.id && (
                      <div className="bg-muted/30 px-6 py-4 animate-scale-in">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {zone.bins.map((bin) => (
                            <div
                              key={bin.id}
                              className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/50"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-mono font-medium">{bin.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {bin.occupied}/{bin.capacity}
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    bin.occupied / bin.capacity > 0.9
                                      ? 'bg-destructive'
                                      : bin.occupied / bin.capacity > 0.7
                                      ? 'bg-warning'
                                      : 'bg-primary'
                                  )}
                                  style={{ width: `${(bin.occupied / bin.capacity) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
