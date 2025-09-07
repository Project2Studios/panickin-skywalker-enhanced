import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PerformanceMonitor, PerformanceInsights } from "@/components/performance-monitor";
import { GDPRConsentBanner } from "@/components/conversion/gdpr-consent";
import { ExitIntentManager } from "@/components/conversion/exit-intent-modal";
import { AnalyticsDashboard } from "@/components/conversion/analytics-dashboard";
import { UrgencyBanner } from "@/components/conversion/urgency-indicators";
import Home from "@/pages/home";
import Social from "@/pages/social";
import StorePage from "@/pages/store";
import CategoryPage from "@/pages/category";
import ProductDetailPage from "@/pages/product-detail";
import SearchPage from "@/pages/search";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import CheckoutShippingPage from "@/pages/checkout/shipping";
import CheckoutPaymentPage from "@/pages/checkout/payment";
import CheckoutSuccessPage from "@/pages/checkout/success";
import NotFound from "@/pages/not-found";

// Customer Order Pages
import OrderHistoryPage from "@/pages/account/orders";
import OrderDetailPage from "@/pages/account/order-detail";
import TrackOrderPage from "@/pages/track-order";

// Admin imports
import { AdminLayout } from "@/components/admin/layout/admin-layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminProductNew from "@/pages/admin/product-new";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/order-detail";
import AdminInventory from "@/pages/admin/inventory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/social" component={Social} />
      
      {/* Store routes */}
      <Route path="/store" component={StorePage} />
      <Route path="/store/search" component={SearchPage} />
      <Route path="/store/category/:slug" component={CategoryPage} />
      <Route path="/store/:slug" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      
      {/* Checkout routes */}
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/checkout/shipping" component={CheckoutShippingPage} />
      <Route path="/checkout/payment" component={CheckoutPaymentPage} />
      <Route path="/checkout/success" component={CheckoutSuccessPage} />
      
      {/* Customer Order routes */}
      <Route path="/account/orders" component={OrderHistoryPage} />
      <Route path="/account/orders/:orderNumber" component={OrderDetailPage} />
      <Route path="/track" component={TrackOrderPage} />
      <Route path="/track/:orderNumber" component={TrackOrderPage} />
      
      {/* Admin routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout>
          <AdminProducts />
        </AdminLayout>
      </Route>
      <Route path="/admin/products/new">
        <AdminLayout>
          <AdminProductNew />
        </AdminLayout>
      </Route>
      <Route path="/admin/categories">
        <AdminLayout>
          <AdminCategories />
        </AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      </Route>
      <Route path="/admin/orders/:id">
        <AdminLayout>
          <AdminOrderDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/inventory">
        <AdminLayout>
          <AdminInventory />
        </AdminLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Sample urgency data for demonstration
  const urgencyData = {
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    message: "Limited Time: Free Exclusive EP with Newsletter Signup!"
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ExitIntentManager
          variant="newsletter"
          enabled={true}
          delay={2000}
          sessionLimit={1}
          offerData={{
            title: "Don't Miss Out on Exclusive Content!",
            subtitle: "Join 156K+ anxious superheroes for exclusive updates",
            incentive: "Get early ticket access + free unreleased tracks",
            urgency: "Limited time: Bonus acoustic EP included!"
          }}
        >
          {/* Sample urgency banner - uncomment to test */}
          {/* <UrgencyBanner
            type="release-announcement"
            message="New single 'PANIC ATTACK' is climbing the charts! Stream it now."
            actionText="LISTEN NOW"
            actionUrl="#music"
          /> */}
          
          <Toaster />
          <Router />
          
          {/* Conversion optimization components */}
          <GDPRConsentBanner />
          <AnalyticsDashboard />
          
          {/* Performance monitoring components */}
          <PerformanceMonitor />
          <PerformanceInsights />
        </ExitIntentManager>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;