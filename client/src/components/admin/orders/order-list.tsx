import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DataTable, Column } from "../ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertTriangle,
  Filter,
  Download
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data - replace with actual API call
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "PS-2024-001",
    customer: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com"
    },
    status: "pending",
    paymentStatus: "paid",
    items: 2,
    subtotal: 49.98,
    tax: 4.50,
    shipping: 9.99,
    total: 64.47,
    shippingAddress: {
      addressLine1: "123 Main St",
      city: "Anytown",
      state: "CA",
      postalCode: "12345",
      country: "US"
    },
    createdAt: "2024-01-20T10:30:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "2",
    orderNumber: "PS-2024-002",
    customer: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com"
    },
    status: "shipped",
    paymentStatus: "paid",
    items: 1,
    subtotal: 24.99,
    tax: 2.25,
    shipping: 9.99,
    total: 37.23,
    shippingAddress: {
      addressLine1: "456 Oak Ave",
      city: "Springfield",
      state: "NY",
      postalCode: "67890",
      country: "US"
    },
    createdAt: "2024-01-19T15:45:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
  },
];

const statusColors = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/20" },
  processing: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  shipped: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20" },
  delivered: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
};

const paymentStatusColors = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/20" },
  paid: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20" },
  failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
  refunded: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/20" },
};

export function OrderList() {
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [updateStatusDialog, setUpdateStatusDialog] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Mock query - replace with actual API call
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders", page, pageSize, statusFilter, paymentFilter],
    queryFn: () => {
      let filtered = mockOrders;
      if (statusFilter !== "all") {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
      if (paymentFilter !== "all") {
        filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
      }
      return Promise.resolve({
        orders: filtered,
        total: filtered.length,
      });
    },
  });

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      label: "Order",
      sortable: true,
      render: (_, order) => (
        <div className="space-y-1">
          <div className="font-medium">{order.orderNumber}</div>
          <div className="text-sm text-muted-foreground">
            {order.customer.firstName} {order.customer.lastName}
          </div>
          <div className="text-xs text-muted-foreground">
            {order.customer.email}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, order) => (
        <div className="space-y-1">
          <Badge 
            className={`${statusColors[value].bg} ${statusColors[value].text} ${statusColors[value].border}`}
          >
            {value}
          </Badge>
          <Badge 
            className={`${paymentStatusColors[order.paymentStatus].bg} ${paymentStatusColors[order.paymentStatus].text} ${paymentStatusColors[order.paymentStatus].border}`}
            variant="outline"
          >
            {order.paymentStatus}
          </Badge>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Package className="h-4 w-4 text-muted-foreground" />
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
          <div>{value.city}, {value.state}</div>
          <div className="text-muted-foreground">{value.country}</div>
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
            <DropdownMenuItem onClick={() => setUpdateStatusDialog(order)}>
              <Truck className="mr-2 h-4 w-4" />
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

  // Calculate stats
  const totalRevenue = orders?.orders.reduce((sum, order) => sum + order.total, 0) || 0;
  const pendingOrders = orders?.orders.filter(order => order.status === 'pending').length || 0;
  const processingOrders = orders?.orders.filter(order => order.status === 'processing').length || 0;
  const shippedOrders = orders?.orders.filter(order => order.status === 'shipped').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
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
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{processingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-4 w-4 text-purple-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">{shippedOrders}</p>
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
            data={orders?.orders || []}
            columns={columns}
            loading={isLoading}
            selectable
            onSelectionChange={setSelectedOrders}
            actions={bulkActions}
            pagination={{
              page,
              pageSize,
              total: orders?.total || 0,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <StatusUpdateDialog
        order={updateStatusDialog}
        onClose={() => setUpdateStatusDialog(null)}
      />
    </div>
  );
}

// Status Update Dialog Component
function StatusUpdateDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const [newStatus, setNewStatus] = useState(order?.status || "");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!order || !newStatus) return;
    
    console.log("Update order status:", {
      orderId: order.id,
      status: newStatus,
      notes,
    });
    
    // Implement status update logic
    onClose();
  };

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
            <label className="text-sm font-medium">New Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add tracking info, notes, etc..."
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!newStatus}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}