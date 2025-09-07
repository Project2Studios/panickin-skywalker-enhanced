import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckoutLayout, OrderSummary } from '@/components/checkout/checkout-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  useCheckoutStep,
  useCheckoutSession,
  useUpdateCheckoutSession,
  useCreateOrder,
  useCheckoutPersistence,
  useCheckoutTotals,
} from '@/hooks/use-checkout';
import { useCart } from '@/hooks/use-cart';
import { 
  billingAddressSchema,
  paymentSchema,
  orderDetailsSchema,
  type BillingAddressFormData,
  type PaymentFormData,
  type OrderDetailsFormData,
  defaultBillingAddress,
  defaultPayment,
  defaultOrderDetails,
  COUNTRIES,
  getStateOptions,
  formatPostalCode,
  formatAddress,
} from '@/lib/checkout-validation';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  MapPin,
  FileText,
  ArrowRight,
  ArrowLeft,
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Apple,
  Chrome,
  Smartphone,
  Banknote,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function CheckoutPaymentPage() {
  const [, setLocation] = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal' | 'apple_pay' | 'google_pay'>('card');
  const [showCardDetails, setShowCardDetails] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const { cart } = useCart();
  const { session } = useCheckoutSession();
  const updateSession = useUpdateCheckoutSession();
  const createOrder = useCreateOrder();
  const { currentStep, completeStep, goToStep, isStepCompleted } = useCheckoutStep();
  const { saveFormData, loadFormData } = useCheckoutPersistence();
  const { subtotal, shipping, tax, discount, total } = useCheckoutTotals();

  // Billing address form
  const billingForm = useForm<BillingAddressFormData>({
    resolver: zodResolver(billingAddressSchema),
    defaultValues: {
      ...defaultBillingAddress,
      ...session?.billingAddress,
      ...loadFormData('billing-address'),
    },
    mode: 'onChange',
  });

  // Payment form
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ...defaultPayment,
      ...loadFormData('payment'),
    },
    mode: 'onChange',
  });

  // Order details form
  const orderForm = useForm<OrderDetailsFormData>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: {
      ...defaultOrderDetails,
      ...loadFormData('order-details'),
    },
    mode: 'onChange',
  });

  const watchBillingMode = billingForm.watch('sameAsShipping');
  const watchPaymentMethod = paymentForm.watch('paymentMethod');
  
  // Update selected payment method when form changes
  useEffect(() => {
    if (watchPaymentMethod && watchPaymentMethod !== selectedPaymentMethod) {
      setSelectedPaymentMethod(watchPaymentMethod);
      setShowCardDetails(watchPaymentMethod === 'card');
    }
  }, [watchPaymentMethod, selectedPaymentMethod]);

  // Get state options for billing address if different from shipping
  const stateOptions = billingForm.watch('sameAsShipping') 
    ? [] 
    : getStateOptions(billingForm.watch('country') || 'US');

  // Save form data on changes
  useEffect(() => {
    const billingSubscription = billingForm.watch((data) => {
      saveFormData('billing-address', data);
    });
    const paymentSubscription = paymentForm.watch((data) => {
      saveFormData('payment', data);
    });
    const orderSubscription = orderForm.watch((data) => {
      saveFormData('order-details', data);
    });

    return () => {
      billingSubscription.unsubscribe();
      paymentSubscription.unsubscribe();
      orderSubscription.unsubscribe();
    };
  }, [billingForm, paymentForm, orderForm, saveFormData]);

  // Handle form submission
  const onSubmit = async () => {
    try {
      const billingData = billingForm.getValues();
      const paymentData = paymentForm.getValues();
      const orderData = orderForm.getValues();

      // Validate all forms
      const billingValid = await billingForm.trigger();
      const paymentValid = await paymentForm.trigger();
      const orderValid = await orderForm.trigger();

      if (!billingValid || !paymentValid || !orderValid) {
        throw new Error('Please complete all required fields');
      }

      setIsProcessingPayment(true);

      // Update session with final data
      await updateSession.mutateAsync({
        billingAddress: billingData.sameAsShipping 
          ? session?.shippingAddress 
          : billingData as any,
        paymentMethod: {
          type: paymentData.paymentMethod,
          data: paymentData.stripePaymentMethodId ? {
            stripePaymentMethodId: paymentData.stripePaymentMethodId
          } : undefined,
        },
        orderNotes: orderData.orderNotes,
        termsAccepted: orderData.termsAccepted,
      });

      // Create the order
      await createOrder.mutateAsync({
        sessionId: session!.id,
        paymentMethodId: paymentData.stripePaymentMethodId,
        savePaymentMethod: paymentData.savePaymentMethod,
      });

      // Success - redirect to confirmation
      completeStep('payment');
      goToStep('confirmation');
      setLocation('/checkout/success');
    } catch (error) {
      console.error('Failed to complete order:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGoBack = () => {
    goToStep('shipping');
    setLocation('/checkout/shipping');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit or Debit Card',
      description: 'Visa, Mastercard, American Express, Discover',
      icon: CreditCard,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: Banknote,
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      description: 'Touch ID or Face ID required',
      icon: Apple,
      disabled: !window.ApplePaySession?.canMakePayments(),
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      description: 'Pay with Google',
      icon: Chrome,
      disabled: !window.google?.payments,
    },
  ];

  return (
    <CheckoutLayout
      currentStep="payment"
      completedSteps={[
        ...(isStepCompleted('cart') ? ['cart'] : []),
        ...(isStepCompleted('shipping') ? ['shipping'] : []),
      ] as any}
      onStepClick={(step) => {
        if (step === 'cart') setLocation('/checkout');
        if (step === 'shipping' && isStepCompleted('shipping')) {
          setLocation('/checkout/shipping');
        }
      }}
      canGoBack={true}
      onGoBack={handleGoBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="paymentMethod"
                control={paymentForm.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="space-y-4"
                  >
                    {paymentMethods.map((method) => {
                      const isSelected = field.value === method.id;
                      const Icon = method.icon;

                      return (
                        <motion.div
                          key={method.id}
                          whileHover={{ scale: method.disabled ? 1 : 1.01 }}
                          whileTap={{ scale: method.disabled ? 1 : 0.99 }}
                        >
                          <Label
                            htmlFor={method.id}
                            className={cn(
                              "flex items-center gap-4 p-4 border rounded-lg transition-colors",
                              {
                                "border-primary bg-primary/5": isSelected && !method.disabled,
                                "border-border hover:border-primary/50": !isSelected && !method.disabled,
                                "cursor-pointer": !method.disabled,
                                "cursor-not-allowed opacity-50": method.disabled,
                              }
                            )}
                          >
                            <RadioGroupItem 
                              value={method.id} 
                              id={method.id} 
                              disabled={method.disabled}
                            />
                            
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            
                            <div className="flex-1">
                              <div className="font-medium">{method.name}</div>
                              <p className="text-sm text-muted-foreground">
                                {method.description}
                              </p>
                            </div>

                            {method.disabled && (
                              <span className="text-xs text-muted-foreground">
                                Not available
                              </span>
                            )}
                          </Label>
                        </motion.div>
                      );
                    })}
                  </RadioGroup>
                )}
              />

              {/* Card Details (when card is selected) */}
              <AnimatePresence>
                {showCardDetails && selectedPaymentMethod === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-6 border border-border rounded-lg bg-muted/30"
                  >
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Card Information
                      </h3>

                      {/* Cardholder Name */}
                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name *</Label>
                        <Input
                          id="cardholderName"
                          {...paymentForm.register('cardholderName')}
                          className={cn(paymentForm.formState.errors.cardholderName && "border-destructive")}
                          placeholder="Full name as it appears on card"
                        />
                        {paymentForm.formState.errors.cardholderName && (
                          <p className="text-sm text-destructive">
                            {paymentForm.formState.errors.cardholderName.message}
                          </p>
                        )}
                      </div>

                      {/* Stripe Elements would go here */}
                      <div className="space-y-4">
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            Card details will be securely processed by Stripe. 
                            Your payment information is encrypted and never stored on our servers.
                          </AlertDescription>
                        </Alert>
                        
                        {/* Placeholder for Stripe Elements */}
                        <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center text-muted-foreground">
                          <CreditCard className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Stripe payment form would be integrated here</p>
                          <p className="text-xs mt-1">Secure card input with real-time validation</p>
                        </div>
                      </div>

                      {/* Save Payment Method */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="savePaymentMethod"
                          {...paymentForm.register('savePaymentMethod')}
                          onCheckedChange={(checked) => 
                            paymentForm.setValue('savePaymentMethod', checked as boolean)
                          }
                        />
                        <div className="space-y-1 leading-none">
                          <Label 
                            htmlFor="savePaymentMethod"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Save this payment method for future purchases
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Securely save your card for faster checkout
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Same as Shipping Toggle */}
                <div className="flex items-start gap-3">
                  <Controller
                    name="sameAsShipping"
                    control={billingForm.control}
                    render={({ field }) => (
                      <Checkbox
                        id="sameAsShipping"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label 
                      htmlFor="sameAsShipping"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Same as shipping address
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Use your shipping address for billing
                    </p>
                  </div>
                </div>

                {/* Shipping Address Preview */}
                {watchBillingMode && session?.shippingAddress && (
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <h4 className="font-medium mb-2">Billing Address:</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {formatAddress(session.shippingAddress)}
                    </div>
                  </div>
                )}

                {/* Different Billing Address Form */}
                <AnimatePresence>
                  {!watchBillingMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingFirstName">First Name *</Label>
                          <Input
                            id="billingFirstName"
                            {...billingForm.register('firstName')}
                            placeholder="First name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="billingLastName">Last Name *</Label>
                          <Input
                            id="billingLastName"
                            {...billingForm.register('lastName')}
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      {/* Address Fields */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress1">Address *</Label>
                          <Input
                            id="billingAddress1"
                            {...billingForm.register('address1')}
                            placeholder="Street address"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress2">Apartment, suite, etc. (Optional)</Label>
                          <Input
                            id="billingAddress2"
                            {...billingForm.register('address2')}
                            placeholder="Apartment, suite, unit, building, floor, etc."
                          />
                        </div>
                      </div>

                      {/* City, State, Postal Code */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">City *</Label>
                          <Input
                            id="billingCity"
                            {...billingForm.register('city')}
                            placeholder="City"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="billingState">State/Province *</Label>
                          <Controller
                            name="state"
                            control={billingForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state/province" />
                                </SelectTrigger>
                                <SelectContent>
                                  {stateOptions.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="billingPostalCode">ZIP/Postal Code *</Label>
                          <Input
                            id="billingPostalCode"
                            {...billingForm.register('postalCode')}
                            placeholder="ZIP/Postal code"
                          />
                        </div>
                      </div>

                      {/* Country */}
                      <div className="space-y-2">
                        <Label htmlFor="billingCountry">Country *</Label>
                        <Controller
                          name="country"
                          control={billingForm.control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.value} value={country.value}>
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Notes (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNotes">
                    Special instructions for your order
                  </Label>
                  <Textarea
                    id="orderNotes"
                    {...orderForm.register('orderNotes')}
                    placeholder="Gift message, delivery instructions, etc."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum 500 characters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Controller
                    name="termsAccepted"
                    control={orderForm.control}
                    render={({ field }) => (
                      <Checkbox
                        id="termsAccepted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={cn(orderForm.formState.errors.termsAccepted && "border-destructive")}
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label 
                      htmlFor="termsAccepted"
                      className="text-sm font-normal cursor-pointer"
                    >
                      I agree to the{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>{' '}
                      *
                    </Label>
                    {orderForm.formState.errors.termsAccepted && (
                      <p className="text-xs text-destructive">
                        {orderForm.formState.errors.termsAccepted.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Controller
                    name="privacyPolicyAccepted"
                    control={orderForm.control}
                    render={({ field }) => (
                      <Checkbox
                        id="privacyPolicyAccepted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={cn(orderForm.formState.errors.privacyPolicyAccepted && "border-destructive")}
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label 
                      htmlFor="privacyPolicyAccepted"
                      className="text-sm font-normal cursor-pointer"
                    >
                      I understand how my personal data will be processed *
                    </Label>
                    {orderForm.formState.errors.privacyPolicyAccepted && (
                      <p className="text-xs text-destructive">
                        {orderForm.formState.errors.privacyPolicyAccepted.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <div className="flex justify-between items-center pt-6">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
              disabled={isProcessingPayment}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shipping
            </Button>
            
            <Button 
              onClick={onSubmit}
              disabled={
                isProcessingPayment ||
                !billingForm.formState.isValid || 
                !paymentForm.formState.isValid ||
                !orderForm.formState.isValid ||
                updateSession.isPending ||
                createOrder.isPending
              }
              size="lg"
              className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isProcessingPayment ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing Order...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Complete Order - {formatPrice(total)}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={cart.items.map(item => ({
              id: item.id,
              name: item.product.name,
              variant: Object.entries(item.variant.attributes)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', '),
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              image: item.primaryImage?.imageUrl,
            }))}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            discount={discount}
            total={total}
            shippingMethod={session?.shippingMethod}
          />

          {/* Security Information */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">
                      256-bit SSL encryption
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Safe Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment info is never stored
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Guaranteed</p>
                    <p className="text-xs text-muted-foreground">
                      30-day money back guarantee
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CheckoutLayout>
  );
}