import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, Column } from "../ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MoreHorizontal, 
  Eye,
  ShoppingCart,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Edit,
  Loader2
} from "lucide-react";
import { OrderStatusBadge, OrderStatus } from "@/components/orders/order-status-badge";

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  itemCount: number;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingAddress: any;
  billingAddress: any;
  createdAt: string;
  updatedAt: string;
}

const paymentStatusColors = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  paid: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  failed: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  refunded: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
};

export function EnhancedOrderList() {
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [updateStatusDialog, setUpdateStatusDialog] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNotes, setStatusNotes] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch orders from API
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "orders", page, pageSize, statusFilter, paymentFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        sort: 'newest',
      });

      if (statusFilter !== "all") {
        params.append('status', statusFilter);
      }
      if (paymentFilter !== "all") {
        params.append('paymentStatus', paymentFilter);
      }

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: OrderStatus; notes?: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setUpdateStatusDialog(null);
      setStatusNotes('');
    },
  });

  const orders = ordersData?.orders || [];
  const summary = ordersData?.summary || {};

  // Get stats from API response
  const totalRevenue = summary?.totalRevenue || 0;
  const pendingOrders = summary?.byStatus?.pending || 0;
  const processingOrders = summary?.byStatus?.processing || 0;
  const shippedOrders = summary?.byStatus?.shipped || 0;
  const totalOrders = summary?.total || 0;
  const averageOrderValue = summary?.averageOrderValue || 0;

  const handleStatusUpdate = (order: Order) => {
    setUpdateStatusDialog(order);
    setNewStatus(order.status);
    setStatusNotes('');
  };

  const submitStatusUpdate = () => {
    if (updateStatusDialog) {
      updateStatusMutation.mutate({
        orderId: updateStatusDialog.id,
        status: newStatus,
        notes: statusNotes || undefined,
      });
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      label: "Order",
      sortable: true,
      render: (_, order) => (
        <div className="space-y-1">
          <div className="font-medium">{order.orderNumber}</div>
          <div className="text-sm text-muted-foreground">
            {order.customerName}
          </div>
          <div className="text-xs text-muted-foreground">
            {order.customerEmail}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, order) => (
        <div className="space-y-1">
          <OrderStatusBadge status={value} size="sm" />
          <div 
            className={`inline-flex items-center px-2 py-1 text-xs rounded-md border ${paymentStatusColors[order.paymentStatus].bg} ${paymentStatusColors[order.paymentStatus].text} ${paymentStatusColors[order.paymentStatus].border}`}
          >
            {order.paymentStatus}
          </div>
        </div>
      ),
    },
    {
      key: "itemCount",
      label: "Items",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span>{value} items</span>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (value) => (
        <div className="font-medium">${value.toFixed(2)}</div>
      ),
    },
    {
      key: "shippingAddress",
      label: "Ship To",
      render: (value) => (
        <div className="text-sm">
          {value ? (
            <>
              <div>{value.city}, {value.state}</div>
              <div className="text-muted-foreground">{value.country}</div>
            </>
          ) : (
            <span className="text-muted-foreground">No address</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
          <div className="text-muted-foreground">
            {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "w-12",
      render: (_, order) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(order)}>
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleBulkStatusUpdate = (orders: Order[]) => {
    console.log("Bulk status update:", orders);
    // Implement bulk status update logic
  };

  const bulkActions = [
    {
      label: "Mark as Processing",
      onClick: handleBulkStatusUpdate,
      variant: "outline" as const,
    },
    {
      label: "Mark as Shipped",
      onClick: handleBulkStatusUpdate,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment ({totalOrders} total)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Average Order</p>
                <p className="text-2xl font-bold text-purple-600">${averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-indigo-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-indigo-600">{processingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            data={orders || []}
            columns={columns}
            loading={isLoading}
            selectable
            onSelectionChange={setSelectedOrders}
            actions={bulkActions}
            pagination={{
              page,
              pageSize,
              total: ordersData?.pagination?.total || 0,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <StatusUpdateDialog
        order={updateStatusDialog}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        statusNotes={statusNotes}
        setStatusNotes={setStatusNotes}
        onClose={() => setUpdateStatusDialog(null)}
        onSubmit={submitStatusUpdate}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}

// Status Update Dialog Component
function StatusUpdateDialog({
  order,
  newStatus,
  setNewStatus,
  statusNotes,
  setStatusNotes,
  onClose,
  onSubmit,
  isLoading,
}: {
  order: Order | null;
  newStatus: OrderStatus;
  setNewStatus: (status: OrderStatus) => void;
  statusNotes: string;
  setStatusNotes: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
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
                <SelectValue placeholder="Select status" />
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!newStatus || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}