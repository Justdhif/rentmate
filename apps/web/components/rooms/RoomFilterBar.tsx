'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface RoomFilterBarProps {
  properties: any[];
  selectedProperty: string;
  setSelectedProperty: (prop: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onOpenAddModal: () => void;
  stats: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
  };
}

export const RoomFilterBar: React.FC<RoomFilterBarProps> = ({
  properties,
  selectedProperty,
  setSelectedProperty,
  statusFilter,
  setStatusFilter,
  onOpenAddModal,
  stats,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-muted rounded-xl text-xs font-medium overflow-x-auto max-w-full">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-card text-gray-900 dark:text-foreground shadow-xs font-semibold'
                : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900'
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'AVAILABLE'
                ? 'bg-white dark:bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900'
            }`}
          >
            Kosong ({stats.available})
          </button>
          <button
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'OCCUPIED'
                ? 'bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900'
            }`}
          >
            Terisi ({stats.occupied})
          </button>
          <button
            onClick={() => setStatusFilter('MAINTENANCE')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'MAINTENANCE'
                ? 'bg-white dark:bg-card text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'text-gray-500 dark:text-muted-foreground hover:text-gray-900'
            }`}
          >
            Perbaikan ({stats.maintenance})
          </button>
        </div>

        {/* Property Selector */}
        {properties.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-muted-foreground whitespace-nowrap">
              Gedung:
            </span>
            <Select
              value={selectedProperty}
              onValueChange={(val) => setSelectedProperty(val)}
            >
              <SelectTrigger className="h-8 px-3 py-1 text-xs rounded-xl bg-white dark:bg-background border-gray-200 dark:border-border min-w-[160px]">
                <SelectValue placeholder="Semua Gedung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Gedung ({properties.length})</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
