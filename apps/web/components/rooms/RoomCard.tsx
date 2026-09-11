'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DoorClosed, Trash2, Building2 } from 'lucide-react';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: string;
  monthlyPrice: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  property?: {
    id: string;
    name: string;
  };
}

interface RoomCardProps {
  room: Room;
  index: number;
  onDelete: (id: string, roomNumber: string) => void;
  formatCurrency: (val: number) => string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, index, onDelete, formatCurrency }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'from-emerald-500 to-teal-600';
      case 'OCCUPIED':
        return 'from-indigo-500 to-violet-600';
      case 'MAINTENANCE':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success">Kosong</Badge>;
      case 'OCCUPIED':
        return <Badge variant="default">Terisi</Badge>;
      case 'MAINTENANCE':
        return <Badge variant="warning">Perbaikan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card
      className={`relative rounded-2xl border border-gray-100 dark:border-border/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group bg-white dark:bg-card animate-fade-in animate-stagger-${(index % 5) + 1}`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getStatusColor(room.status)} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3 mt-1">
            {getStatusBadge(room.status)}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(room.id, room.roomNumber)}
              className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
              title="Hapus Kamar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-foreground text-2xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {room.roomNumber}
            </h3>
            <span className="text-xs text-gray-400 dark:text-muted-foreground font-medium">
              Lantai {room.floor}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-4">
            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{room.property?.name || 'Properti'}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-border/60 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase font-bold tracking-wider">
              {room.type}
            </p>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {formatCurrency(Number(room.monthlyPrice))}
              <span className="text-[10px] text-gray-400 font-normal"> /bln</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-muted/30 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400 transition-colors">
            <DoorClosed className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
