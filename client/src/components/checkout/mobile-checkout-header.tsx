import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface MobileCheckoutHeaderProps {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  onGoBack?: () => void;
  itemCount?: number;
  total?: number;
}

const steps = [
  { id: 'cart' as CheckoutStep, title: 'Cart', shortTitle: 'Cart' },
  { id: 'shipping' as CheckoutStep, title: 'Shipping', shortTitle: 'Ship' },
  { id: 'payment' as CheckoutStep, title: 'Payment', shortTitle: 'Pay' },
  { id: 'confirmation' as CheckoutStep, title: 'Done', shortTitle: 'Done' },
];

export function MobileCheckoutHeader({
  currentStep,
  completedSteps,
  onGoBack,
  itemCount,
  total,
}: MobileCheckoutHeaderProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="md:hidden bg-background border-b border-border sticky top-0 z-50">
      <div className="px-4 py-3">
        {/* Header with back button and totals */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {onGoBack && (
              <Button variant="ghost" size="sm" onClick={onGoBack} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="font-semibold text-base">Checkout</h1>
              <p className="text-xs text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
          </div>
          
          {(itemCount !== undefined || total !== undefined) && (
            <div className="text-right">
              {itemCount !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShoppingBag className="h-3 w-3" />
                  <span>{itemCount} items</span>
                </div>
              )}
              {total !== undefined && (
                <div className="font-semibold text-sm">
                  {formatPrice(total)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <Progress value={progressPercentage} className="h-1.5" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between text-xs">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isPast = index < currentStepIndex;

            return (
              <div
                key={step.id}
                className={cn(
                  "text-center",
                  {
                    "text-primary font-medium": isCurrent,
                    "text-foreground": isCompleted || isPast,
                    "text-muted-foreground": !isCurrent && !isCompleted && !isPast,
                  }
                )}
              >
                <span>{step.shortTitle}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}