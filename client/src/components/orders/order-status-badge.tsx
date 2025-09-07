import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  AlertCircle,
  XCircle 
} from 'lucide-react';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function OrderStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <Icon className={`${iconSizeClasses[size]} ${size !== 'sm' ? 'mr-1' : 'mr-0.5'}`} />
      )}
      {config.label}
    </Badge>
  );
}