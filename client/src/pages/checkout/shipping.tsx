import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckoutLayout, OrderSummary } from '@/components/checkout/checkout-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  useCheckoutStep,
  useCheckoutSession,
  useUpdateCheckoutSession,
  useShippingMethods,
  useValidateAddress,
  useCheckoutPersistence,
  useCheckoutTotals,
} from '@/hooks/use-checkout';
import { useCart } from '@/hooks/use-cart';
import { 
  shippingAddressSchema,
  shippingMethodSchema,
  type ShippingAddressFormData,
  type ShippingMethodFormData,
  defaultShippingAddress,
  COUNTRIES,
  getStateOptions,
  formatPostalCode,
} from '@/lib/checkout-validation';
import { cn } from '@/lib/utils';
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Package,
  Zap,
  Calendar,
} from 'lucide-react';

export default function CheckoutShippingPage() {
  const [, setLocation] = useLocation();
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('');
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  
  const { cart } = useCart();
  const { session } = useCheckoutSession();
  const updateSession = useUpdateCheckoutSession();
  const validateAddress = useValidateAddress();
  const { currentStep, completeStep, goToStep, isStepCompleted } = useCheckoutStep();
  const { saveFormData, loadFormData } = useCheckoutPersistence();
  const { subtotal, shipping, tax, discount, total } = useCheckoutTotals();

  // Address form
  const addressForm = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      ...defaultShippingAddress,
      ...session?.shippingAddress,
      ...loadFormData('shipping-address'),
    },
    mode: 'onChange',
  });

  // Shipping method form
  const shippingForm = useForm<ShippingMethodFormData>({
    resolver: zodResolver(shippingMethodSchema),
    defaultValues: {
      shippingMethodId: selectedShippingMethod || session?.shippingMethod?.id || '',
    },
    mode: 'onChange',
  });

  const watchCountry = addressForm.watch('country');
  const stateOptions = getStateOptions(watchCountry);

  // Get shipping methods based on address
  const { data: shippingMethods, isLoading: isLoadingShippingMethods } = useShippingMethods();

  // Auto-select default shipping method
  useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0 && !selectedShippingMethod) {
      const defaultMethod = shippingMethods.find(method => method.isDefault) || shippingMethods[0];
      setSelectedShippingMethod(defaultMethod.id);
      shippingForm.setValue('shippingMethodId', defaultMethod.id);
    }
  }, [shippingMethods, selectedShippingMethod, shippingForm]);

  // Save form data on changes
  useEffect(() => {
    const subscription = addressForm.watch((data) => {
      saveFormData('shipping-address', data);
    });
    return () => subscription.unsubscribe();
  }, [addressForm, saveFormData]);

  // Handle address validation
  const handleValidateAddress = async (data: ShippingAddressFormData) => {
    setIsValidatingAddress(true);
    try {
      const result = await validateAddress.mutateAsync(data);
      if (result.suggestions && result.suggestions.length > 0) {
        // Handle address suggestions
        console.log('Address suggestions:', result.suggestions);
      }
      return result;
    } catch (error) {
      console.error('Address validation failed:', error);
      throw error;
    } finally {
      setIsValidatingAddress(false);
    }
  };

  // Handle form submission
  const onSubmit = async (addressData: ShippingAddressFormData) => {
    try {
      // Validate address first
      await handleValidateAddress(addressData);

      // Get selected shipping method
      const shippingMethodData = shippingForm.getValues();
      const selectedMethod = shippingMethods?.find(m => m.id === shippingMethodData.shippingMethodId);

      if (!selectedMethod) {
        throw new Error('Please select a shipping method');
      }

      // Update checkout session
      await updateSession.mutateAsync({
        shippingAddress: {
          ...addressData,
          postalCode: formatPostalCode(addressData.postalCode, addressData.country),
        },
        shippingMethod: selectedMethod,
      });

      // Mark step as completed and continue
      completeStep('shipping');
      goToStep('payment');
      setLocation('/checkout/payment');
    } catch (error) {
      console.error('Failed to save shipping information:', error);
    }
  };

  const handleGoBack = () => {
    goToStep('cart');
    setLocation('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <CheckoutLayout
      currentStep="shipping"
      completedSteps={isStepCompleted('cart') ? ['cart'] : []}
      onStepClick={(step) => {
        if (step === 'cart') {
          setLocation('/checkout');
        }
      }}
      canGoBack={true}
      onGoBack={handleGoBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...addressForm.register('firstName')}
                      className={cn(addressForm.formState.errors.firstName && "border-destructive")}
                      placeholder="First name"
                    />
                    {addressForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {addressForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...addressForm.register('lastName')}
                      className={cn(addressForm.formState.errors.lastName && "border-destructive")}
                      placeholder="Last name"
                    />
                    {addressForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {addressForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    {...addressForm.register('company')}
                    placeholder="Company name"
                  />
                </div>

                {/* Address Lines */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address *</Label>
                    <Input
                      id="address1"
                      {...addressForm.register('address1')}
                      className={cn(addressForm.formState.errors.address1 && "border-destructive")}
                      placeholder="Street address"
                    />
                    {addressForm.formState.errors.address1 && (
                      <p className="text-sm text-destructive">
                        {addressForm.formState.errors.address1.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address2">Apartment, suite, etc. (Optional)</Label>
                    <Input
                      id="address2"
                      {...addressForm.register('address2')}
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...addressForm.register('city')}
                      className={cn(addressForm.formState.errors.city && "border-destructive")}
                      placeholder="City"
                    />
                    {addressForm.formState.errors.city && (
                      <p className="text-sm text-destructive">
                        {addressForm.formState.errors.city.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Controller
                      name="state"
                      control={addressForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={cn(addressForm.formState.errors.state && "border-destructive")}>
                            <SelectValue placeholder="Select state/province" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateOptions.length > 0 ? (
                              stateOptions.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                Select country first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {addressForm.formState.errors.state && (
                      <p className="text-sm text-destructive">
                        {addressForm.formState.errors.state.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">ZIP/Postal Code *</Label>
                    <Input
                      id="postalCode"
                      {...addressForm.register('postalCode')}
                      className={cn(addressForm.formState.errors.postalCode && "border-destructive")}
                      placeholder="ZIP/Postal code"
                    />
                    {addressForm.formState.errors.postalCode && (
                      <p className="text-sm text-destructive">
                        {addressForm.formState.errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Controller
                    name="country"
                    control={addressForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={cn(addressForm.formState.errors.country && "border-destructive")}>
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
                  {addressForm.formState.errors.country && (
                    <p className="text-sm text-destructive">
                      {addressForm.formState.errors.country.message}
                    </p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...addressForm.register('phone')}
                    className={cn(addressForm.formState.errors.phone && "border-destructive")}
                    placeholder="+1 (555) 123-4567"
                  />
                  {addressForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {addressForm.formState.errors.phone.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    For delivery updates and questions about your order
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Shipping Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingShippingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading shipping options...</p>
                  </div>
                </div>
              ) : shippingMethods && shippingMethods.length > 0 ? (
                <Controller
                  name="shippingMethodId"
                  control={shippingForm.control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedShippingMethod(value);
                      }}
                      className="space-y-4"
                    >
                      {shippingMethods.map((method) => {
                        const isSelected = field.value === method.id;
                        const Icon = method.id.includes('express') ? Zap : 
                                   method.id.includes('standard') ? Package : Truck;

                        return (
                          <motion.div
                            key={method.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <Label
                              htmlFor={method.id}
                              className={cn(
                                "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                                {
                                  "border-primary bg-primary/5": isSelected,
                                  "border-border hover:border-primary/50": !isSelected,
                                }
                              )}
                            >
                              <RadioGroupItem value={method.id} id={method.id} />
                              
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{method.name}</span>
                                  <div className="flex items-center gap-2">
                                    {method.price === 0 ? (
                                      <Badge variant="secondary" className="text-xs">
                                        FREE
                                      </Badge>
                                    ) : (
                                      <span className="font-semibold">
                                        {formatPrice(method.price)}
                                      </span>
                                    )}
                                    {method.isDefault && (
                                      <Badge variant="outline" className="text-xs">
                                        Recommended
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground">
                                  {method.description}
                                </p>
                                
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Estimated delivery: {method.estimatedDays}</span>
                                </div>
                              </div>
                            </Label>
                          </motion.div>
                        );
                      })}
                    </RadioGroup>
                  )}
                />
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete your shipping address to see available shipping options.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-between items-center pt-6">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
            
            <Button 
              onClick={addressForm.handleSubmit(onSubmit)}
              disabled={
                !addressForm.formState.isValid || 
                !shippingForm.formState.isValid ||
                updateSession.isPending ||
                isValidatingAddress
              }
              size="lg"
              className="min-w-[200px]"
            >
              {updateSession.isPending || isValidatingAddress ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  {isValidatingAddress ? 'Validating...' : 'Saving...'}
                </>
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
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
            shippingMethod={
              selectedShippingMethod && shippingMethods
                ? shippingMethods.find(m => m.id === selectedShippingMethod)
                : undefined
            }
          />
        </div>
      </div>
    </CheckoutLayout>
  );
}