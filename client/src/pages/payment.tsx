import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutLayout } from '@/components/checkout/checkout-layout';
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import { getStripe, stripeAPI, formatStripeAmount } from '@/lib/stripe';
import { 
  useCart, 
  useCheckoutPersistence,
  useCheckoutTotals,
  useFormatPrice,
} from '@/hooks/use-cart';

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const { cart, isLoading: isCartLoading } = useCart();
  const { loadFormData } = useCheckoutPersistence();
  const { subtotal, shipping, tax, discount, total } = useCheckoutTotals();
  const formatPrice = useFormatPrice();
  
  const stripePromise = getStripe();

  // Load customer info from previous step
  const customerData = loadFormData('customer');
  const shippingData = loadFormData('shipping');
  const billingData = loadFormData('billing');

  useEffect(() => {
    createPaymentIntent();
  }, [cart.items]);

  const createPaymentIntent = async () => {
    if (cart.items.length === 0 || isCartLoading) {
      return;
    }

    try {
      setIsCreatingIntent(true);
      setError('');

      // Prepare order items for API
      const orderItems = cart.items.map(item => ({
        productId: item.product.id,
        variantId: item.variant.id,
        quantity: item.quantity,
      }));

      const customerInfo = {
        email: customerData?.email || '',
        name: `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim() || 'Customer',
      };

      // Create payment intent
      const response = await stripeAPI.createPaymentIntent({
        amount: total,
        currency: 'usd',
        orderItems,
        customerInfo,
      });

      setPaymentIntent(response.paymentIntent);
      setClientSecret(response.paymentIntent.client_secret);

    } catch (err: any) {
      console.error('Failed to create payment intent:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (confirmedPaymentIntent: any) => {
    try {
      setIsProcessingOrder(true);

      // Prepare order data for confirmation
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        customerInfo: {
          email: customerData?.email || '',
          firstName: customerData?.firstName || '',
          lastName: customerData?.lastName || '',
          phone: customerData?.phone || '',
        },
        shippingAddress: shippingData?.shippingAddress || {},
        billingAddress: billingData?.billingAddress || shippingData?.shippingAddress || {},
        shippingMethod: shippingData?.shippingMethod || 'standard',
        notes: shippingData?.notes || '',
      };

      // Confirm the order with the backend
      const orderResponse = await stripeAPI.confirmOrder({
        paymentIntentId: confirmedPaymentIntent.id,
        orderData,
      });

      // Redirect to success page
      setLocation(`/checkout/success?order=${orderResponse.order.orderNumber}`);

    } catch (err: any) {
      console.error('Failed to confirm order:', err);
      setError(err.message || 'Payment succeeded but order confirmation failed. Please contact support.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Redirect if cart is empty
  if (!isCartLoading && cart.items.length === 0) {
    return (
      <CheckoutLayout currentStep="payment" completedSteps={['cart', 'shipping']}>
        <div className="text-center py-16">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Add some anxious superhero merch before checking out!
          </p>
          <Button asChild size="lg">
            <a href="/store">Continue Shopping</a>
          </Button>
        </div>
      </CheckoutLayout>
    );
  }

  // Loading states
  if (isCartLoading || isCreatingIntent || !customerData) {
    return (
      <CheckoutLayout currentStep="payment" completedSteps={['cart', 'shipping']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isCartLoading && 'Loading your cart...'}
              {isCreatingIntent && 'Setting up secure payment...'}
              {!customerData && 'Loading customer information...'}
            </p>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#000000',
    },
  };

  return (
    <CheckoutLayout currentStep="payment" completedSteps={['cart', 'shipping']}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => setLocation('/checkout/shipping')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shipping
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Processing Order Alert */}
          {isProcessingOrder && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Payment successful! Processing your order...
              </AlertDescription>
            </Alert>
          )}

          {/* Customer Information Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p>{customerData.firstName} {customerData.lastName}</p>
                  <p className="text-muted-foreground">{customerData.email}</p>
                  {customerData.phone && (
                    <p className="text-muted-foreground">{customerData.phone}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="text-muted-foreground">
                    <p>{shippingData?.shippingAddress?.addressLine1}</p>
                    {shippingData?.shippingAddress?.addressLine2 && (
                      <p>{shippingData?.shippingAddress?.addressLine2}</p>
                    )}
                    <p>
                      {shippingData?.shippingAddress?.city}, {shippingData?.shippingAddress?.state} {shippingData?.shippingAddress?.postalCode}
                    </p>
                    <p>{shippingData?.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Shipping Method:</span>
                <Badge variant="secondary">
                  {shippingData?.shippingMethod === 'standard' && 'Standard (5-7 days)'}
                  {shippingData?.shippingMethod === 'express' && 'Express (2-3 days)'}
                  {shippingData?.shippingMethod === 'overnight' && 'Overnight (Next day)'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Payment Form */}
          {clientSecret && stripePromise && (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret, 
                appearance 
              }}
            >
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={total}
                currency="usd"
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                customerEmail={customerData.email}
                isProcessing={isProcessingOrder}
              />
            </Elements>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Total
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-muted-foreground">
                        {Object.entries(item.variant.attributes)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')
                        }
                      </p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right ml-2">
                      {formatPrice(item.total)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>
                  "Your superhero merch order is about to take flight - 
                  but don't panic, we've got secure payment covered!"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CheckoutLayout>
  );
}