import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Mock data - replace with actual API calls
const dashboardStats = {
  totalRevenue: { value: "$12,345", change: "+12%", trend: "up" },
  totalOrders: { value: "145", change: "+8%", trend: "up" },
  totalProducts: { value: "89", change: "+3", trend: "up" },
  totalCustomers: { value: "2,350", change: "+15%", trend: "up" },
};

const recentOrders = [
  { id: "1234", customer: "John Doe", amount: "$89.99", status: "pending", items: 2 },
  { id: "1235", customer: "Jane Smith", amount: "$45.50", status: "shipped", items: 1 },
  { id: "1236", customer: "Mike Johnson", amount: "$120.00", status: "delivered", items: 3 },
  { id: "1237", customer: "Sarah Wilson", amount: "$67.75", status: "processing", items: 2 },
];

const lowStockItems = [
  { name: "Anxious Superhero Tee", stock: 3, sku: "AST-001" },
  { name: "Panic Attack Hoodie", stock: 1, sku: "PAH-002" },
  { name: "Skywalker Vinyl", stock: 5, sku: "SV-003" },
];

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  shipped: "bg-green-500/10 text-green-600 border-green-500/20",
  delivered: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Store
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalRevenue.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dashboardStats.totalRevenue.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {dashboardStats.totalRevenue.change} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalOrders.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {dashboardStats.totalOrders.change} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalProducts.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {dashboardStats.totalProducts.change} new products added
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCustomers.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {dashboardStats.totalCustomers.change} from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.items} items</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                    <p className="font-medium">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.sku} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50 border-orange-200/50">
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {item.stock} left
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Package className="h-6 w-6" />
              Add Product
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <ShoppingCart className="h-6 w-6" />
              View Orders
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              Customer List
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <TrendingUp className="h-6 w-6" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}