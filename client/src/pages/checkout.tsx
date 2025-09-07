import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckoutLayout, OrderSummary } from '@/components/checkout/checkout-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LazyImage } from '@/components/ui/lazy-image';
import { 
  useCart, 
  useUpdateCartItem, 
  useRemoveFromCart,
  useFormatPrice 
} from '@/hooks/use-cart';
import { 
  useCheckoutStep,
  useGuestCheckout,
  useCheckoutPersistence,
  useCheckoutTotals,
} from '@/hooks/use-checkout';
import { 
  customerInfoSchema, 
  type CustomerInfoFormData, 
  defaultCustomerInfo 
} from '@/lib/checkout-validation';
import { cn } from '@/lib/utils';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Gift,
  Percent,
} from 'lucide-react';

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  const { cart, isLoading: isCartLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const formatPrice = useFormatPrice();
  
  const { currentStep, completeStep, goToStep } = useCheckoutStep();
  const { isGuest, guestEmail, setGuestEmail, toggleGuestMode } = useGuestCheckout();
  const { saveFormData, loadFormData } = useCheckoutPersistence();
  const { subtotal, shipping, tax, discount, total } = useCheckoutTotals();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      ...defaultCustomerInfo,
      ...loadFormData('customer'),
    },
    mode: 'onChange',
  });

  const watchCreateAccount = watch('createAccount');
  const watchEmail = watch('email');

  // Update guest email when form email changes
  useEffect(() => {
    if (isGuest && watchEmail) {
      setGuestEmail(watchEmail);
    }
  }, [watchEmail, isGuest, setGuestEmail]);

  // Save form data on changes
  useEffect(() => {
    const subscription = watch((data) => {
      saveFormData('customer', data);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveFormData]);

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart.mutate(itemId);
    } else {
      updateCartItem.mutate({ itemId, quantity: newQuantity });
    }
  };

  // Handle promo code application
  const handleApplyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    try {
      // TODO: Implement promo code API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Apply promo code:', promoCode);
    } catch (error) {
      console.error('Failed to apply promo code:', error);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Handle continue to shipping
  const onSubmit = (data: CustomerInfoFormData) => {
    saveFormData('customer', data);
    completeStep('cart');
    goToStep('shipping');
    setLocation('/checkout/shipping');
  };

  if (isCartLoading) {
    return (
      <CheckoutLayout
        currentStep="cart"
        completedSteps={[]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (cart.items.length === 0) {
    return (
      <CheckoutLayout
        currentStep="cart"
        completedSteps={[]}
      >
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

  return (
    <CheckoutLayout
      currentStep="cart"
      completedSteps={[]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Guest vs Account Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">
                      {isGuest ? 'Checkout as Guest' : 'Create Account'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isGuest 
                        ? 'Quick and easy checkout without creating an account'
                        : 'Save your information for faster checkout next time'
                      }
                    </p>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      toggleGuestMode();
                      setValue('createAccount', !isGuest);
                    }}
                  >
                    {isGuest ? 'Create Account' : 'Checkout as Guest'}
                  </Button>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={cn(errors.email && "border-destructive")}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    We'll send your order confirmation to this email
                  </p>
                </div>

                {/* Account Creation Fields */}
                <AnimatePresence>
                  {!isGuest && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                            className={cn(errors.password && "border-destructive")}
                            placeholder="Create a secure password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...register('confirmPassword')}
                          className={cn(errors.confirmPassword && "border-destructive")}
                          placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Marketing Emails Checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="marketingEmails"
                    {...register('marketingEmails')}
                    onCheckedChange={(checked) => setValue('marketingEmails', checked as boolean)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label 
                      htmlFor="marketingEmails"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Keep me updated on new releases and exclusive offers
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get early access to new merch, concert tickets, and band updates
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Review Your Items ({cart.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      layout
                    >
                      <div className="flex gap-4 p-4 border border-border rounded-lg">
                        {/* Product Image */}
                        {item.primaryImage ? (
                          <LazyImage
                            src={item.primaryImage.imageUrl}
                            alt={item.primaryImage.altText || item.product.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded border flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-muted-foreground">PS</span>
                          </div>
                        )}

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold line-clamp-2">
                                {item.product.name}
                              </h3>
                              
                              {/* Variant Info */}
                              {Object.keys(item.variant.attributes).length > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {Object.entries(item.variant.attributes)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="font-bold">
                                {formatPrice(item.total)}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-sm text-muted-foreground">
                                  {formatPrice(item.price)} each
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stock Status */}
                          {!item.inStock && (
                            <Alert className="mb-3">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                This item is currently out of stock
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-border rounded">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={updateCartItem.isPending || removeFromCart.isPending}
                                  className="px-2 py-1 h-8"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                
                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={
                                    updateCartItem.isPending || 
                                    removeFromCart.isPending ||
                                    item.quantity >= item.maxQuantity
                                  }
                                  className="px-2 py-1 h-8"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <span className="text-xs text-muted-foreground">
                                {item.availableStock} available
                              </span>
                            </div>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart.mutate(item.id)}
                              disabled={removeFromCart.isPending}
                              className="text-destructive hover:text-destructive p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Promo Code */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleApplyPromoCode} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="promoCode" className="font-medium">
                    Promo Code
                  </Label>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    variant="outline"
                    disabled={!promoCode.trim() || isApplyingPromo}
                  >
                    {isApplyingPromo ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Applying...
                      </>
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-between items-center pt-6">
            <Button asChild variant="outline">
              <a href="/cart">
                Back to Cart
              </a>
            </Button>
            
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || cart.items.length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              Continue to Shipping
              <ArrowRight className="ml-2 h-4 w-4" />
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
            promoCode={promoCode}
          />
        </div>
      </div>
    </CheckoutLayout>
  );
}