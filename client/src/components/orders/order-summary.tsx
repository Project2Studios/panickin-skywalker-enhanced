import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface OrderSummaryProps {
  totals: OrderTotals;
  itemCount?: number;
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}

export function OrderSummary({ 
  totals, 
  itemCount, 
  showTitle = true, 
  compact = false,
  className = '' 
}: OrderSummaryProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const summaryItems = [
    { label: itemCount ? `Subtotal (${itemCount} items)` : 'Subtotal', value: totals.subtotal },
    { label: 'Shipping', value: totals.shipping },
    { label: 'Tax', value: totals.tax },
  ];

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {summaryItems.map((item) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span>{formatPrice(item.value)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(totals.total)}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? 'pt-0' : 'pt-6'}>
        <div className="space-y-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <span>{formatPrice(item.value)}</span>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
          
          {totals.shipping === 0 && totals.subtotal > 0 && (
            <p className="text-sm text-green-600 font-medium">
              🎉 Free shipping on orders over $50!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}