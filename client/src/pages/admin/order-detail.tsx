import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Package, 
  User, 
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  RefreshCw,
  MessageSquare,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { Link } from 'wouter';
import { OrderStatusBadge, OrderStatus } from '@/components/orders/order-status-badge';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { OrderItemDisplay } from '@/components/orders/order-item-display';

interface AdminOrderDetails {
  id: string;
  orderNumber: string;
  status: OrderStatus;
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
    product?: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
    };
    variant?: {
      id: string;
      name: string;
      sku: string;
      isActive: boolean;
      attributes: any;
    };
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
  stripePaymentIntentId?: string;
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
  summary: {
    itemCount: number;
    totalQuantity: number;
    uniqueProducts: number;
  };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id;
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNotes, setStatusNotes] = useState('');

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('No order ID provided');
      
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: OrderStatus; notes?: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setStatusDialogOpen(false);
      setStatusNotes('');
    },
  });

  const order: AdminOrderDetails | null = orderData?.order || null;

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

  const handleStatusUpdate = () => {
    if (order) {
      setNewStatus(order.status);
      setStatusDialogOpen(true);
    }
  };

  const submitStatusUpdate = () => {
    updateStatusMutation.mutate({
      status: newStatus,
      notes: statusNotes || undefined,
    });
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
              The order you're looking for could not be found.
            </p>
            <Button asChild>
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <OrderStatusBadge status={order.status} size="lg" />
              <Badge 
                variant="outline"
                className={
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : order.paymentStatus === 'failed'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }
              >
                Payment: {order.paymentStatus}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Placed {formatDate(order.dates.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleStatusUpdate}>
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{order.summary.itemCount}</div>
            <div className="text-sm text-muted-foreground">Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{order.summary.uniqueProducts}</div>
            <div className="text-sm text-muted-foreground">Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{formatPrice(order.totals.total)}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-sm font-bold">
              {new Date(order.dates.estimatedDelivery).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">Est. Delivery</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline timeline={order.timeline} />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemDisplay items={order.items} />
              
              {/* Order Total */}
              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({order.summary.totalQuantity} items)</span>
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

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customerInfo.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {order.customerInfo.email}
                </p>
                {order.customerInfo.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {order.customerInfo.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Shipping Address</h4>
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

              <Separator />

              <div>
                <h4 className="font-medium mb-1">Billing Address</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{order.addresses.billing.addressLine1}</p>
                  {order.addresses.billing.addressLine2 && (
                    <p>{order.addresses.billing.addressLine2}</p>
                  )}
                  <p>
                    {order.addresses.billing.city}, {order.addresses.billing.state} {order.addresses.billing.postalCode}
                  </p>
                  <p>{order.addresses.billing.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Method:</span>
                <span className="text-sm font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Status:</span>
                <Badge 
                  variant="outline"
                  className={
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : order.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.stripePaymentIntentId && (
                <div>
                  <span className="text-sm">Payment ID:</span>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {order.stripePaymentIntentId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleStatusUpdate}
              >
                <Edit className="mr-2 h-4 w-4" />
                Update Status
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Order
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order {order.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">New Status</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add tracking info, notes, etc..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStatusDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitStatusUpdate}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}