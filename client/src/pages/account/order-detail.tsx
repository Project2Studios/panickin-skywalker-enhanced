import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Package, 
  Truck, 
  Calendar, 
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Download,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Link } from 'wouter';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  customerInfo: {
    email: string;
    name: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    sku: string;
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
  addresses: {
    shipping: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    billing: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  paymentMethod: string;
  notes?: string;
  dates: {
    createdAt: string;
    updatedAt: string;
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

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber;
  const [copied, setCopied] = useState(false);

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      if (!orderNumber) throw new Error('No order number provided');
      
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    enabled: !!orderNumber,
  });

  const order: OrderDetails | null = orderData?.order || null;

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find the order you're looking for.
            </p>
            <Button asChild>
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyOrderNumber}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : ''}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={statusConfig[order.status].color}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusConfig[order.status].label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Placed on {formatDate(order.dates.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button asChild>
              <Link href={`/track/${order.orderNumber}`}>
                <Truck className="mr-2 h-4 w-4" />
                Track Order
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Timeline
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

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estimated Delivery</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatDate(order.dates.estimatedDelivery)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items Ordered ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.lineTotal)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              ))}

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
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Message for Band Theme */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">🦸‍♂️✨</div>
              <p className="text-lg font-medium mb-2">
                "Your superhero merchandise is on its way - no need to panic!"
              </p>
              <p className="text-sm text-muted-foreground italic">
                - The Anxious Superhero
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customerInfo.name}</p>
                <p className="text-sm text-muted-foreground">{order.customerInfo.email}</p>
                {order.customerInfo.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {order.customerInfo.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>{order.addresses.shipping.addressLine1}</p>
                {order.addresses.shipping.addressLine2 && (
                  <p>{order.addresses.shipping.addressLine2}</p>
                )}
                <p>
                  {order.addresses.shipping.city}, {order.addresses.shipping.state} {order.addresses.shipping.postalCode}
                </p>
                <p>{order.addresses.shipping.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                </p>
                <Badge 
                  className={
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : order.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }
                >
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/contact">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              
              {order.status === 'delivered' && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/returns">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Return/Exchange
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/store">
                  <Package className="mr-2 h-4 w-4" />
                  Shop Again
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}