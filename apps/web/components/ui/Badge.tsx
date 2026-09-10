import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'available'
    | 'occupied'
    | 'maintenance'
    | 'paid'
    | 'pending'
    | 'failed'
    | 'default'
    | 'blue'
    | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantMap: Record<string, string> = {
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    occupied: 'bg-blue-50 text-blue-700 border border-blue-200',
    maintenance: 'bg-amber-50 text-amber-700 border border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    failed: 'bg-rose-50 text-rose-700 border border-rose-200',
    blue: 'bg-sky-50 text-sky-700 border border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    default: 'bg-gray-50 text-gray-700 border border-gray-200',
  };

  const statusVariant =
    typeof children === 'string'
      ? children.toUpperCase() === 'AVAILABLE'
        ? 'available'
        : children.toUpperCase() === 'OCCUPIED'
          ? 'occupied'
          : children.toUpperCase() === 'MAINTENANCE'
            ? 'maintenance'
            : children.toUpperCase() === 'PAID' || children.toUpperCase() === 'RESOLVED' || children.toUpperCase() === 'CLOSED'
              ? 'paid'
              : children.toUpperCase() === 'PENDING' || children.toUpperCase() === 'REPORTED' || children.toUpperCase() === 'ASSIGNED'
                ? 'pending'
                : children.toUpperCase() === 'IN_PROGRESS'
                  ? 'blue'
                  : children.toUpperCase() === 'FAILED' || children.toUpperCase() === 'OVERDUE'
                    ? 'failed'
                    : variant
      : variant;

  const colorClass = variantMap[statusVariant] || variantMap.default;

  return (
    <span className={`inline-flex items-center rounded-full ${sizeClasses} ${colorClass}`}>
      {children}
    </span>
  );
};
