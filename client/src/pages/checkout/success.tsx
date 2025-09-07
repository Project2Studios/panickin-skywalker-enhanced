import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { CheckoutLayout } from '@/components/checkout/checkout-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LazyImage } from '@/components/ui/lazy-image';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatAddress } from '@/lib/checkout-validation';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Download,
  Share2,
  ArrowRight,
  Heart,
  Sparkles,
  Gift,
  Star,
  Clock,
  ShoppingBag,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface OrderConfirmationData {
  order: {
    id: string;
    orderNumber: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    customerEmail: string;
    shippingAddress: any;
    billingAddress: any;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      variantName: string;
      quantity: number;
      price: number;
      total: number;
      image?: string;
    }>;
    totals: {
      subtotal: number;
      shipping: number;
      tax: number;
      discount: number;
      total: number;
    };
    shippingMethod: {
      name: string;
      description: string;
      estimatedDays: string;
    };
    paymentMethod: {
      type: string;
      last4?: string;
    };
    createdAt: string;
    estimatedDelivery?: string;
  };
}

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const [confetti, setConfetti] = useState(true);

  // Get order ID from URL params (in a real implementation)
  const orderId = new URLSearchParams(window.location.search).get('order') || 'demo-order-123';

  // Fetch order confirmation data
  const { data, isLoading, error } = useQuery<OrderConfirmationData>({
    queryKey: ['order-confirmation', orderId],
    queryFn: async () => {
      // For demo purposes, return mock data
      // In real implementation: await apiRequest('GET', `/api/orders/${orderId}/confirmation`)
      return {
        order: {
          id: orderId,
          orderNumber: 'PS-2024-001234',
          status: 'processing',
          customerEmail: 'fan@example.com',
          shippingAddress: {
            firstName: 'Alex',
            lastName: 'Superhero',
            address1: '123 Anxiety Ave',
            city: 'Panic City',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
          },
          billingAddress: {
            sameAsShipping: true,
          },
          items: [
            {
              id: '1',
              productId: 'tshirt-1',
              productName: 'Anxious Superhero T-Shirt',
              variantName: 'Size: M, Color: Black',
              quantity: 2,
              price: 25.00,
              total: 50.00,
              image: '/images/tshirt-black.jpg',
            },
            {
              id: '2',
              productId: 'hoodie-1',
              productName: 'Panic Attack Hoodie',
              variantName: 'Size: L, Color: Navy',
              quantity: 1,
              price: 45.00,
              total: 45.00,
              image: '/images/hoodie-navy.jpg',
            },
          ],
          totals: {
            subtotal: 95.00,
            shipping: 0.00,
            tax: 8.55,
            discount: 0.00,
            total: 103.55,
          },
          shippingMethod: {
            name: 'Free Standard Shipping',
            description: 'Delivered in 5-7 business days',
            estimatedDays: '5-7 business days',
          },
          paymentMethod: {
            type: 'card',
            last4: '4242',
          },
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      };
    },
    retry: 1,
  });

  // Hide confetti after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      processing: { label: 'Processing', variant: 'default' as const },
      shipped: { label: 'Shipped', variant: 'outline' as const },
      delivered: { label: 'Delivered', variant: 'secondary' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="font-medium">
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <CheckoutLayout
        currentStep="confirmation"
        completedSteps={['cart', 'shipping', 'payment']}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your order confirmation...</p>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (error || !data) {
    return (
      <CheckoutLayout
        currentStep="confirmation"
        completedSteps={['cart', 'shipping', 'payment']}
      >
        <div className="text-center py-16">
          <AlertTriangle className="h-24 w-24 mx-auto text-destructive/50 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-muted-foreground mb-8">
            We couldn't find your order confirmation. Please check your email or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/store">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  const { order } = data;

  return (
    <CheckoutLayout
      currentStep="confirmation"
      completedSteps={['cart', 'shipping', 'payment']}
    >
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="h-12 w-12 text-green-600" />
            </motion.div>
            
            {confetti && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </motion.div>
            )}
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Order Confirmed! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-2"
          >
            Thank you for supporting Panickin' Skywalker!
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground"
          >
            Your anxious superhero merch is on its way. We've sent a confirmation email to{' '}
            <span className="font-medium">{order.customerEmail}</span>
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order #{order.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Items Ordered ({order.items.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-muted rounded border flex-shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <LazyImage
                              src={item.image}
                              alt={item.productName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">PS</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.variantName}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-medium text-sm">
                              {formatPrice(item.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(order.totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>
                        {order.totals.shipping > 0 ? 
                          formatPrice(order.totals.shipping) : 
                          <Badge variant="secondary" className="text-xs">FREE</Badge>
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(order.totals.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total:</span>
                      <span>{formatPrice(order.totals.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="space-y-6">
                  {/* Delivery Details */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm">Estimated Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            {order.estimatedDelivery ? 
                              formatDate(order.estimatedDelivery) : 
                              order.shippingMethod.estimatedDays
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm">Shipping Address</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {formatAddress(order.shippingAddress)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm">Payment Method</p>
                          <p className="text-sm text-muted-foreground">
                            {order.paymentMethod.type === 'card' ? 
                              `Card ending in ${order.paymentMethod.last4}` : 
                              order.paymentMethod.type
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Tracking */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Order Status
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Order Confirmed</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Processing</p>
                          <p className="text-xs text-muted-foreground">
                            We're preparing your anxious superhero gear!
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 opacity-50">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Shipped</p>
                          <p className="text-xs text-muted-foreground">
                            On the way to you
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Confirmation</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email with your order details and tracking info
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Order Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll carefully pack your items and prepare them for shipping
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Shipping Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your package and get delivery updates via email and SMS
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Band Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-primary">
                    A Message from Panickin' Skywalker
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    "Thank you for being part of our anxious superhero family! Your support means 
                    everything to us as we continue making music that speaks to the beautifully 
                    chaotic experience of being human. Wear your gear with pride and remember - 
                    it's okay to not be okay! 💙"
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    - The Band
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg">
            <Link href="/store">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/account/orders">
              <FileText className="mr-2 h-4 w-4" />
              Track Order
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </motion.div>
      </div>
    </CheckoutLayout>
  );
}