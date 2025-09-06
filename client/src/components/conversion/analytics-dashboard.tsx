import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useUserTracking } from '@/lib/user-tracking';
import { useABTest, NEWSLETTER_SIGNUP_TEST, TICKET_CTA_TEST } from '@/lib/ab-testing';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  Mail,
  Ticket,
  Eye,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Settings
} from 'lucide-react';

// Mock analytics data - in production, this would come from your analytics service
const generateMockData = () => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      visitors: Math.floor(Math.random() * 1000) + 500,
      conversions: Math.floor(Math.random() * 50) + 20,
      newsletterSignups: Math.floor(Math.random() * 30) + 10,
      ticketClicks: Math.floor(Math.random() * 80) + 40,
      socialClicks: Math.floor(Math.random() * 100) + 60
    };
  });

  const conversionFunnel = [
    { stage: 'Page Views', count: 12543, percentage: 100 },
    { stage: 'Section Views', count: 8921, percentage: 71 },
    { stage: 'CTA Interactions', count: 3456, percentage: 28 },
    { stage: 'Form Starts', count: 1234, percentage: 10 },
    { stage: 'Conversions', count: 567, percentage: 5 }
  ];

  const abTestResults = {
    newsletter: {
      control: { variant: 'control', conversions: 234, visitors: 5000, rate: 4.68 },
      variant_a: { variant: 'variant-a', conversions: 289, visitors: 4800, rate: 6.02 },
      variant_b: { variant: 'variant-b', conversions: 267, visitors: 4900, rate: 5.45 }
    },
    tickets: {
      control: { variant: 'control', conversions: 156, visitors: 3200, rate: 4.88 },
      urgency: { variant: 'urgency', conversions: 189, visitors: 3100, rate: 6.10 },
      scarcity: { variant: 'scarcity', conversions: 198, visitors: 3050, rate: 6.49 }
    }
  };

  return { last30Days, conversionFunnel, abTestResults };
};

export function AnalyticsDashboard({ className = '' }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ab-tests' | 'funnel'>('overview');
  const [data, setData] = useState(generateMockData());
  const { getInsights } = useUserTracking();

  // In development/demo mode, show the dashboard
  useEffect(() => {
    // Only show in development or if explicitly enabled
    const isDev = process.env.NODE_ENV === 'development';
    const isEnabled = localStorage.getItem('ps_analytics_enabled') === 'true';
    setIsVisible(isDev || isEnabled);
  }, []);

  const insights = getInsights();
  const { variant: newsletterVariant } = useABTest('newsletter-signup-optimization', NEWSLETTER_SIGNUP_TEST);
  const { variant: ticketVariant } = useABTest('ticket-cta-optimization', TICKET_CTA_TEST);

  // Calculate key metrics
  const totalVisitors = data.last30Days.reduce((sum, day) => sum + day.visitors, 0);
  const totalConversions = data.last30Days.reduce((sum, day) => sum + day.conversions, 0);
  const conversionRate = ((totalConversions / totalVisitors) * 100).toFixed(2);
  const avgDailyVisitors = Math.round(totalVisitors / 30);

  // Calculate trends
  const recentWeek = data.last30Days.slice(-7);
  const previousWeek = data.last30Days.slice(-14, -7);
  const recentWeekConversions = recentWeek.reduce((sum, day) => sum + day.conversions, 0);
  const previousWeekConversions = previousWeek.reduce((sum, day) => sum + day.conversions, 0);
  const conversionTrend = ((recentWeekConversions - previousWeekConversions) / previousWeekConversions * 100).toFixed(1);

  const colors = {
    primary: '#ff006e',
    secondary: '#8338ec',
    accent: '#3a86ff',
    success: '#06ffa5',
    warning: '#ffbe0b',
    muted: '#64748b'
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-card/90 backdrop-blur-sm"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={`fixed bottom-0 right-0 w-full max-w-6xl h-[600px] z-50 m-4 ${className}`}
      >
        <Card className="bg-card/95 backdrop-blur-lg border-primary/20 shadow-2xl h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Conversion Analytics
                <Badge variant="outline" className="ml-2">Live Demo</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setActiveTab('overview')}
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    Overview
                  </Button>
                  <Button
                    onClick={() => setActiveTab('ab-tests')}
                    variant={activeTab === 'ab-tests' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    A/B Tests
                  </Button>
                  <Button
                    onClick={() => setActiveTab('funnel')}
                    variant={activeTab === 'funnel' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    Funnel
                  </Button>
                </div>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Visitors</p>
                          <p className="text-2xl font-bold">{totalVisitors.toLocaleString()}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">{conversionRate}%</p>
                            <div className={`flex items-center text-sm ${Number(conversionTrend) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {Number(conversionTrend) > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {Math.abs(Number(conversionTrend))}%
                            </div>
                          </div>
                        </div>
                        <Target className="h-8 w-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Newsletter Signups</p>
                          <p className="text-2xl font-bold">{data.last30Days.reduce((sum, day) => sum + day.newsletterSignups, 0)}</p>
                        </div>
                        <Mail className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Ticket Interest</p>
                          <p className="text-2xl font-bold">{data.last30Days.reduce((sum, day) => sum + day.ticketClicks, 0)}</p>
                        </div>
                        <Ticket className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Traffic Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Traffic & Conversions (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={data.last30Days}>
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).getDate().toString()}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value, name) => [value, name === 'visitors' ? 'Visitors' : 'Conversions']}
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <Line type="monotone" dataKey="visitors" stroke={colors.primary} strokeWidth={2} />
                          <Line type="monotone" dataKey="conversions" stroke={colors.success} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Channel Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Channel Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Newsletter', value: data.last30Days.reduce((sum, day) => sum + day.newsletterSignups, 0), color: colors.primary },
                              { name: 'Social', value: data.last30Days.reduce((sum, day) => sum + day.socialClicks, 0), color: colors.secondary },
                              { name: 'Tickets', value: data.last30Days.reduce((sum, day) => sum + day.ticketClicks, 0), color: colors.accent },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[colors.primary, colors.secondary, colors.accent].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* User Insights */}
                {insights && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Profile Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Engagement Level</p>
                          <Badge variant={insights.engagementLevel === 'high' ? 'default' : 'secondary'}>
                            {insights.engagementLevel}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Session Count</p>
                          <p className="font-bold">{insights.sessionCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interests</p>
                          <div className="flex flex-wrap gap-1">
                            {insights.interests.slice(0, 3).map((interest, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion Likelihood</p>
                          <div className="flex items-center gap-2">
                            <Progress value={insights.conversionLikelihood * 100} className="flex-1" />
                            <span className="text-sm">{Math.round(insights.conversionLikelihood * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'ab-tests' && (
              <div className="space-y-6">
                {/* Newsletter A/B Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Newsletter Signup A/B Test</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Your variant: <Badge variant="outline">{newsletterVariant}</Badge>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(data.abTestResults.newsletter).map(([key, result]) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium capitalize">{result.variant.replace('-', ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.conversions} conversions from {result.visitors} visitors
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{result.rate}%</p>
                            <div className="w-20">
                              <Progress value={result.rate * 10} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Ticket CTA A/B Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ticket CTA A/B Test</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Your variant: <Badge variant="outline">{ticketVariant}</Badge>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(data.abTestResults.tickets).map(([key, result]) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium capitalize">{result.variant}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.conversions} clicks from {result.visitors} visitors
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{result.rate}%</p>
                            <div className="w-20">
                              <Progress value={result.rate * 10} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'funnel' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.conversionFunnel.map((stage, index) => (
                        <div key={stage.stage} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{stage.stage}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {stage.count.toLocaleString()}
                              </span>
                              <Badge variant={index === 0 ? 'default' : 'secondary'}>
                                {stage.percentage}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={stage.percentage} className="h-3" />
                          {index < data.conversionFunnel.length - 1 && (
                            <div className="text-center mt-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                ↓ {((data.conversionFunnel[index + 1].count / stage.count) * 100).toFixed(1)}% continue
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-700">Improve Section Views → CTA Interactions</p>
                          <p className="text-sm text-muted-foreground">
                            Consider adding more compelling CTAs in the middle sections
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-700">Reduce Form Abandonment</p>
                          <p className="text-sm text-muted-foreground">
                            Simplify the newsletter signup form or add progress indicators
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-700">A/B Test Exit Intent</p>
                          <p className="text-sm text-muted-foreground">
                            Try different exit-intent popup timings and messages
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}