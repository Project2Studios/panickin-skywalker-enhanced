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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/social" component={Social} />
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