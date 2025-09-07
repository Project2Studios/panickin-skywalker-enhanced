import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { CheckoutLayout } from '@/components/checkout/checkout-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Calendar,
  Download,
  Share2,
  Star,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerInfo: {
    email: string;
    name: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  dates: {
    createdAt: string;
    estimatedDelivery: string;
  };
  timeline: Array<{
    status: string;
    title: string;
    description: string;
    timestamp: string | null;
    completed: boolean;
  }>;
}

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Get order number from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('order');

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails(orderNumber);
    } else {
      setError('No order number provided');
      setIsLoading(false);
    }
  }, [orderNumber]);

  const fetchOrderDetails = async (orderNum: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${orderNum}`);
      
      if (!response.ok) {
        throw new Error('Order not found');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err: any) {
      console.error('Failed to fetch order details:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const shareOrder = () => {
    if (navigator.share && order) {
      navigator.share({
        title: `Order ${order.orderNumber} - Panickin' Skywalker`,
        text: `I just ordered some awesome merch from Panickin' Skywalker! Order #${order.orderNumber}`,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <CheckoutLayout currentStep="success" completedSteps={['cart', 'shipping', 'payment']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your order details...</p>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (error || !order) {
    return (
      <CheckoutLayout currentStep="success" completedSteps={['cart', 'shipping', 'payment']}>
        <div className="text-center py-16">
          <AlertTriangle className="h-24 w-24 mx-auto text-destructive mb-6" />
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-muted-foreground mb-8">
            {error || 'We could not find the order you are looking for.'}
          </p>
          <Button asChild size="lg">
            <a href="/store">Continue Shopping</a>
          </Button>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout currentStep="success" completedSteps={['cart', 'shipping', 'payment']}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Thanks for your order! Your superhero merchandise is on its way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Order #{order.orderNumber}
            </Badge>
            <Badge className={`text-lg px-4 py-2 ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </motion.div>

        {/* Panickin' Skywalker themed message */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">🦸‍♂️✨</div>
            <p className="text-lg font-medium mb-2">
              "Don't panic - your order is secured and ready for takeoff!"
            </p>
            <p className="text-sm text-muted-foreground italic">
              - The Anxious Superhero himself
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={shareOrder}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Order
          </Button>
          <Button variant="outline" onClick={() => setLocation('/orders')}>
            <Package className="mr-2 h-4 w-4" />
            View All Orders
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((step, index) => (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(step.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Estimated Delivery</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatDate(order.dates.estimatedDelivery)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Information */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="text-sm text-muted-foreground">
                  <p>{order.customerInfo.name}</p>
                  <p>{order.customerInfo.email}</p>
                  {order.customerInfo.phone && (
                    <p>{order.customerInfo.phone}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Items Ordered ({order.items.length})</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-muted-foreground">{item.variantName}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p>{formatPrice(item.lineTotal)}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatPrice(item.unitPrice)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(order.totals.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(order.totals.tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Confirmation Alert */}
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            A confirmation email has been sent to <strong>{order.customerInfo.email}</strong>. 
            You can track your order status and updates through the link in that email.
          </AlertDescription>
        </Alert>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Check Your Email</h4>
                  <p className="text-sm text-muted-foreground">
                    We've sent you an order confirmation with tracking information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Track Your Order</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll send you shipping updates as your order makes its way to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild>
                <a href="/store">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Sharing */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Love your order?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your Panickin' Skywalker merch with the world!
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm">
                <Star className="mr-2 h-4 w-4" />
                Leave a Review
              </Button>
              <Button variant="outline" size="sm" onClick={shareOrder}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CheckoutLayout>
  );
}