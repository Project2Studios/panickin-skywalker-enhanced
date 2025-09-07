import React, { useState, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface StripeCardElementProps {
  onPaymentMethodChange?: (paymentMethodId: string | null) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Mock Stripe integration component
// In a real implementation, you would use @stripe/stripe-js and @stripe/react-stripe-js
export function StripeCardElement({
  onPaymentMethodChange,
  onError,
  disabled = false,
  className,
}: StripeCardElementProps) {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>('unknown');
  const cardRef = useRef<HTMLDivElement>(null);

  // Mock card input validation
  const handleCardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\s/g, '');
    
    // Basic card number validation
    if (value.length > 0) {
      if (value.length < 13 || value.length > 19) {
        setError('Please enter a valid card number');
        setIsValid(false);
      } else if (!/^\d+$/.test(value)) {
        setError('Card number must contain only numbers');
        setIsValid(false);
      } else {
        setError(null);
        setIsValid(true);
        
        // Detect card brand (basic)
        if (value.startsWith('4')) {
          setCardBrand('visa');
        } else if (value.startsWith('5') || value.startsWith('2')) {
          setCardBrand('mastercard');
        } else if (value.startsWith('3')) {
          setCardBrand('amex');
        } else {
          setCardBrand('unknown');
        }
      }
      
      setIsComplete(value.length >= 13);
    } else {
      setError(null);
      setIsValid(false);
      setIsComplete(false);
      setCardBrand('unknown');
    }

    // Notify parent of changes
    if (isValid && isComplete) {
      onPaymentMethodChange?.(`pm_mock_${value}`);
    } else {
      onPaymentMethodChange?.(null);
    }

    if (error) {
      onError?.(error);
    }
  };

  const getCardBrandIcon = () => {
    switch (cardBrand) {
      case 'visa':
        return <span className="text-blue-600 font-bold text-xs">VISA</span>;
      case 'mastercard':
        return <span className="text-red-500 font-bold text-xs">MC</span>;
      case 'amex':
        return <span className="text-blue-500 font-bold text-xs">AMEX</span>;
      default:
        return <CreditCard className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Your payment information is processed securely by Stripe. 
          Card details are never stored on our servers.
        </AlertDescription>
      </Alert>

      {/* Mock Stripe Card Element */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={cardRef}
            className={cn(
              "relative min-h-[44px] border border-input rounded-md bg-background transition-all",
              {
                "border-destructive": error,
                "border-green-500": isValid && isComplete,
                "opacity-50": disabled,
              }
            )}
          >
            {/* Card Number Input (Mock) */}
            <div className="flex items-center p-3 gap-3">
              <div className="flex items-center gap-2">
                {getCardBrandIcon()}
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
              
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                onChange={handleCardChange}
                disabled={disabled}
                maxLength={19}
                onInput={(e) => {
                  // Format card number with spaces
                  const target = e.target as HTMLInputElement;
                  let value = target.value.replace(/\s/g, '');
                  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                  target.value = formattedValue;
                }}
              />
              
              {isValid && isComplete && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>

            {/* Expiry and CVC Row */}
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                <div className="p-3 border-r border-border">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                    disabled={disabled}
                    maxLength={5}
                    onInput={(e) => {
                      // Format MM/YY
                      const target = e.target as HTMLInputElement;
                      let value = target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                      }
                      target.value = value;
                    }}
                  />
                </div>
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                    disabled={disabled}
                    maxLength={4}
                    onInput={(e) => {
                      // Only allow numbers
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/\D/g, '');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border-t border-destructive/20">
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
          <Lock className="h-3 w-3 text-green-600" />
          <span className="text-xs text-muted-foreground">
            Powered by Stripe
          </span>
        </div>
      </div>

      {/* Real Stripe Integration Instructions */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-800">
          <strong>Development Note:</strong> This is a mock implementation. 
          In production, integrate with Stripe Elements for secure card processing:
          <br />
          <code className="text-xs bg-blue-100 px-1 rounded mt-1 inline-block">
            npm install @stripe/stripe-js @stripe/react-stripe-js
          </code>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Real Stripe integration would look like this:
/*
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export function StripeCardElement({ onPaymentMethodChange, onError }: StripeCardElementProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleCardChange = (event: any) => {
    if (event.error) {
      onError?.(event.error.message);
    } else {
      onError?.(null);
    }

    if (event.complete) {
      // Create payment method when card is complete
      createPaymentMethod();
    }
  };

  const createPaymentMethod = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      onError?.(error.message || 'Payment method creation failed');
    } else if (paymentMethod) {
      onPaymentMethodChange?.(paymentMethod.id);
    }
  };

  return (
    <div className="p-3 border border-input rounded-md">
      <CardElement
        onChange={handleCardChange}
        options={{
          style: {
            base: {
              fontSize: '14px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
    </div>
  );
}
*/