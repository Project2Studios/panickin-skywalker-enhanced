import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search,
  Package, 
  Truck, 
  Calendar, 
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Mail,
  MessageCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { Link } from 'wouter';

interface OrderTrackingData {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  customerInfo: {
    email: string;
    name: string;
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

const statusConfig = {
  pending: { 
    label: 'Order Received', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Your order has been received and is being processed'
  },
  confirmed: { 
    label: 'Payment Confirmed', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
    description: 'Payment has been processed successfully'
  },
  processing: { 
    label: 'Being Prepared', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package,
    description: 'Your items are being prepared for shipment'
  },
  shipped: { 
    label: 'On the Way', 
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Truck,
    description: 'Your order is on its way to you'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Your order has been delivered'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
    description: 'This order has been cancelled'
  },
};

export default function TrackOrderPage() {
  const params = useParams();
  const urlOrderNumber = params.orderNumber;
  const [orderNumber, setOrderNumber] = useState(urlOrderNumber || '');
  const [searchSubmitted, setSearchSubmitted] = useState(!!urlOrderNumber);

  const { data: orderData, isLoading, error, refetch } = useQuery({
    queryKey: ['track-order', orderNumber],
    queryFn: async () => {
      if (!orderNumber) throw new Error('No order number provided');
      
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    enabled: !!orderNumber && searchSubmitted,
  });

  const order: OrderTrackingData | null = orderData?.order || null;

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

  const handleSearch = () => {
    if (orderNumber.trim()) {
      setSearchSubmitted(true);
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const StatusIcon = order ? statusConfig[order.status].icon : Package;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground text-lg">
            Enter your order number to get real-time updates on your Panickin' Skywalker merch
          </p>
        </motion.div>

        {/* Search Section */}
        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Enter order number (e.g., PS-2024-001)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="w-full" disabled={!orderNumber.trim()}>
                Track Order
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Looking up your order...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && searchSubmitted && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find an order with that number. Please double-check and try again.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Order numbers typically look like: <code className="bg-muted px-2 py-1 rounded">PS-2024-001</code></p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Found */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Order Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Placed on {formatDate(order.dates.createdAt)}</span>
                      <span>•</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {formatPrice(order.totals.total)}
                      </span>
                    </div>
                  </div>
                  
                  <Badge className={`${statusConfig[order.status].color} text-lg px-4 py-2`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {statusConfig[order.status].label}
                  </Badge>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-center text-muted-foreground">
                    {statusConfig[order.status].description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {order.timeline.map((step, index) => (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-current" />
                          )}
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className={`w-px h-12 mt-2 ${
                            step.completed ? 'bg-green-200' : 'bg-border'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className={`font-medium text-lg ${
                          step.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-muted-foreground mb-2">{step.description}</p>
                        {step.timestamp && (
                          <p className="text-sm text-muted-foreground">
                            {formatDate(step.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-primary">Estimated Delivery</h4>
                        <p className="text-lg font-semibold">
                          {formatDate(order.dates.estimatedDelivery)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We'll send you tracking information once your order ships.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Shipping To:</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>{order.addresses.shipping.addressLine1}</p>
                      {order.addresses.shipping.addressLine2 && (
                        <p>{order.addresses.shipping.addressLine2}</p>
                      )}
                      <p>
                        {order.addresses.shipping.city}, {order.addresses.shipping.state} {order.addresses.shipping.postalCode}
                      </p>
                      <p>{order.addresses.shipping.country}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.productName} - {item.variantName} (×{item.quantity})
                          </span>
                          <span>{formatPrice(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panickin' Skywalker Message */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl mb-3">🦸‍♂️✨</div>
                <h3 className="text-xl font-bold mb-2">
                  Don't Panic - Your Order is Secured!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your superhero merchandise is making its way to you. We'll keep you updated every step of the way.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  - The Anxious Superhero Team
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Email Updates:</strong> We'll send tracking information to {order.customerInfo.email}
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href="/contact">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact Support
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href="/store">
                        <Package className="mr-2 h-4 w-4" />
                        Shop More
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}