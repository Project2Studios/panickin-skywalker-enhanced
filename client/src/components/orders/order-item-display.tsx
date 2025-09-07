import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

export interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl?: string;
}

interface OrderItemDisplayProps {
  items: OrderItem[];
  showImages?: boolean;
  compact?: boolean;
  className?: string;
}

export function OrderItemDisplay({ 
  items, 
  showImages = false, 
  compact = false, 
  className = '' 
}: OrderItemDisplayProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <span className="font-medium">{item.productName}</span>
              {item.variantName && (
                <span className="text-muted-foreground"> - {item.variantName}</span>
              )}
              <span className="text-muted-foreground"> (×{item.quantity})</span>
            </div>
            <span className="font-medium">{formatPrice(item.lineTotal)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => (
        <Card key={item.id} className="border border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Product Image or Icon */}
              <div className="flex-shrink-0">
                {showImages && item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {item.productName}
                </h4>
                {item.variantName && (
                  <p className="text-sm text-muted-foreground">
                    {item.variantName}
                  </p>
                )}
                {item.sku && (
                  <p className="text-xs text-muted-foreground">
                    SKU: {item.sku}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Qty: {item.quantity}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(item.unitPrice)} each
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-lg">
                  {formatPrice(item.lineTotal)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}