'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-foreground">
            Daftar Kamar
          </h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
            Pantau status ketersediaan dan rincian harga sewa setiap kamar.
          </p>
        </div>

        <Button
          onClick={onOpenAddModal}
          disabled={properties.length === 0}
          className="flex items-center gap-2 rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kamar</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
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
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-background text-gray-900 dark:text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Gedung ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
