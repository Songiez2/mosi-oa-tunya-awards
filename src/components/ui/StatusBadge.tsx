import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Status } from '@/types/types';

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/30' },
  approved: { label: 'Approved', className: 'bg-success/15 text-success border-success/30' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const cfg = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
}
