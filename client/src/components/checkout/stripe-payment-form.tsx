import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Lock,
  Smartphone,
  Globe,
} from 'lucide-react';
import { handleStripeError } from '@/lib/stripe';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
  customerEmail?: string;
  isProcessing?: boolean;
}

export function StripePaymentForm({
  clientSecret,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  customerEmail,
  isProcessing = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [email, setEmail] = useState(customerEmail || '');

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          onPaymentSuccess(paymentIntent);
          break;
        case 'processing':
          setErrorMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setErrorMessage('Your payment was not successful, please try again.');
          break;
        default:
          setErrorMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, clientSecret, onPaymentSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL will be handled by our SPA routing
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Payment failed
        const errorMsg = handleStripeError(error);
        setErrorMessage(errorMsg);
        onPaymentError(errorMsg);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onPaymentSuccess(paymentIntent);
      }
    } catch (err: any) {
      const errorMsg = handleStripeError(err);
      setErrorMessage(errorMsg);
      onPaymentError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading secure payment form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Amount Display */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <span className="text-lg font-medium">Total Amount:</span>
            <span className="text-2xl font-bold">{formatAmount(amount, currency)}</span>
          </div>

          {/* Link Authentication Element */}
          {!customerEmail && (
            <div className="space-y-2">
              <LinkAuthenticationElement
                id="link-authentication-element"
                onChange={(e) => setEmail(e.value.email)}
              />
            </div>
          )}

          {/* Payment Element */}
          <div className="space-y-4">
            <PaymentElement 
              id="payment-element" 
              options={{
                layout: "tabs",
                paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link'],
              }}
            />
          </div>

          {/* Security Information */}
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your payment information is encrypted and secure</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-blue-600" />
                <span>International</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-blue-600" />
                <span>Mobile Wallets</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={!stripe || !elements || isSubmitting || isProcessing}
          >
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay {formatAmount(amount, currency)}
              </>
            )}
          </Button>

          {/* Payment Methods Info */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Powered by Stripe • We accept all major cards
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">Visa</Badge>
              <Badge variant="outline" className="text-xs">Mastercard</Badge>
              <Badge variant="outline" className="text-xs">American Express</Badge>
              <Badge variant="outline" className="text-xs">Apple Pay</Badge>
              <Badge variant="outline" className="text-xs">Google Pay</Badge>
            </div>
          </div>

          {/* Panickin' Skywalker themed message */}
          <div className="text-center text-xs text-muted-foreground italic">
            "Don't panic about your payment security - we've got it covered!" 
            <br />
            - The Anxious Superhero
          </div>
        </form>
      </CardContent>
    </Card>
  );
}