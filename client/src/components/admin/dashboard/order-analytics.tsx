import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Clock,
  Package,
  Truck,
  CheckCircle,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'wouter';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';

interface OrderStats {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    averageOrderValue: number;
  };
  periods: {
    today: { orders: number; revenue: number };
    week: { orders: number; revenue: number };
    month: { orders: number; revenue: number };
    year: { orders: number; revenue: number };
  };
  statusDistribution: Record<string, number>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  topCustomers: Array<{
    email: string;
    name: string;
    orderCount: number;
  }>;
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
  };
}

export function OrderAnalytics() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'order-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch order statistics');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats: OrderStats = statsData?.stats;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(stats.overview.totalRevenue)}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.overview.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Order</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPrice(stats.overview.averageOrderValue)}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.overview.pendingOrders}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.overview.completedOrders}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Today</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{stats.periods.today.orders} orders</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(stats.periods.today.revenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{stats.periods.week.orders} orders</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(stats.periods.week.revenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{stats.periods.month.orders} orders</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(stats.periods.month.revenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">This Year</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{stats.periods.year.orders} orders</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(stats.periods.year.revenue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status as any} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.email} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {customer.orderCount} orders
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            {Object.entries(stats.statusDistribution).map(([status, count]) => (
              <div key={status} className="text-center">
                <OrderStatusBadge status={status as any} size="sm" className="mb-2" />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">orders</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}