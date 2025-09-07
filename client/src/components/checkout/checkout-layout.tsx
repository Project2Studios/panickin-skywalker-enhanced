import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle,
  Lock,
  Shield,
  RotateCcw,
  Phone,
  Mail,
} from 'lucide-react';

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface CheckoutLayoutProps {
  children: React.ReactNode;
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  onStepClick?: (step: CheckoutStep) => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

const steps = [
  {
    id: 'cart' as CheckoutStep,
    title: 'Cart Review',
    icon: ShoppingBag,
    description: 'Review your items',
  },
  {
    id: 'shipping' as CheckoutStep,
    title: 'Shipping',
    icon: Truck,
    description: 'Delivery information',
  },
  {
    id: 'payment' as CheckoutStep,
    title: 'Payment',
    icon: CreditCard,
    description: 'Payment & billing',
  },
  {
    id: 'confirmation' as CheckoutStep,
    title: 'Confirmation',
    icon: CheckCircle,
    description: 'Order complete',
  },
];

export function CheckoutLayout({
  children,
  currentStep,
  completedSteps,
  onStepClick,
  canGoBack = false,
  onGoBack,
}: CheckoutLayoutProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;

  const canAccessStep = (stepId: CheckoutStep) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    return stepIndex <= currentStepIndex || completedSteps.includes(stepId);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {canGoBack ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onGoBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Cart
                  </Button>
                </Link>
              )}
              
              <Separator orientation="vertical" className="h-6" />
              
              <div>
                <h1 className="text-xl font-bold">
                  Checkout
                </h1>
                <p className="text-sm text-muted-foreground">
                  Secure checkout powered by Panickin' Skywalker
                </p>
              </div>
            </div>

            {/* Security Badges */}
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Safe Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Progress Bar */}
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {steps[currentStepIndex].title}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Desktop Step Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Steps */}
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = step.id === currentStep;
                  const canAccess = canAccessStep(step.id);
                  const StepIcon = step.icon;

                  return (
                    <motion.div
                      key={step.id}
                      className="relative flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-12 h-12 rounded-full border-2 bg-background relative z-10 transition-all",
                          {
                            "border-primary bg-primary text-primary-foreground": isCompleted,
                            "border-primary bg-background text-primary": isCurrent,
                            "border-muted-foreground/30 text-muted-foreground": !isCurrent && !isCompleted,
                            "hover:border-primary hover:text-primary": canAccess && !isCurrent,
                            "cursor-pointer": canAccess && onStepClick,
                            "cursor-not-allowed": !canAccess,
                          }
                        )}
                        onClick={() => canAccess && onStepClick?.(step.id)}
                        disabled={!canAccess}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </Button>
                      
                      <div className="mt-3 text-center min-w-0">
                        <div className={cn(
                          "text-sm font-medium",
                          {
                            "text-primary": isCurrent,
                            "text-foreground": isCompleted,
                            "text-muted-foreground": !isCurrent && !isCompleted,
                          }
                        )}>
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Security Features */}
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Secure Checkout</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure
                </p>
              </div>

              {/* Return Policy */}
              <div className="text-center">
                <RotateCcw className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">30-Day Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Easy returns on all unworn merchandise
                </p>
              </div>

              {/* Support */}
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Mail className="h-3 w-3" />
                    <span>support@panickinskywalker.com</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>1-800-PANICKIN</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="text-center sm:text-left">
                <p>&copy; 2024 Panickin' Skywalker. All rights reserved.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link href="/shipping" className="hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
                <Link href="/returns" className="hover:text-foreground transition-colors">
                  Returns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Order Summary Component
interface OrderSummaryProps {
  items?: Array<{
    id: string;
    name: string;
    variant: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingMethod?: {
    name: string;
    description: string;
  };
  promoCode?: string;
  className?: string;
}

export function OrderSummary({
  items = [],
  subtotal,
  shipping,
  tax,
  discount,
  total,
  shippingMethod,
  promoCode,
  className,
}: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card className={cn("sticky top-4", className)}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Order Summary
        </h3>

        {/* Items */}
        {items.length > 0 && (
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-2">
                    {item.name}
                  </div>
                  {item.variant && (
                    <div className="text-xs text-muted-foreground">
                      {item.variant}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(item.total)}
                </div>
              </div>
            ))}
            
            <Separator />
          </div>
        )}

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.length} items):</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {shippingMethod && (
            <div className="flex justify-between text-sm">
              <div>
                <div>Shipping:</div>
                <div className="text-xs text-muted-foreground">
                  {shippingMethod.name}
                </div>
              </div>
              <span>
                {shipping > 0 ? formatPrice(shipping) : (
                  <Badge variant="secondary" className="text-xs">FREE</Badge>
                )}
              </span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>{formatPrice(tax)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <div>
                <div>Discount:</div>
                {promoCode && (
                  <div className="text-xs">
                    Code: {promoCode}
                  </div>
                )}
              </div>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </Card>
  );
}