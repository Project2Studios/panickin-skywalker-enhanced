import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Zap, Flame, Timer, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface UrgencyIndicatorProps {
  type: 'countdown' | 'scarcity' | 'social-proof' | 'time-sensitive';
  data: {
    endTime?: Date;
    remainingCount?: number;
    totalCount?: number;
    recentActivity?: Array<{ action: string; timeAgo: string; location?: string }>;
    message?: string;
  };
  variant?: 'subtle' | 'prominent' | 'critical';
  className?: string;
}

export function UrgencyIndicator({ type, data, variant = 'prominent', className = '' }: UrgencyIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer logic
  useEffect(() => {
    if (type === 'countdown' && data.endTime) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const endTime = data.endTime!.getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeRemaining({ hours, minutes, seconds });
        } else {
          setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [type, data.endTime]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return 'bg-secondary/50 border-border text-muted-foreground';
      case 'critical':
        return 'bg-destructive/20 border-destructive/50 text-destructive animate-pulse';
      default:
        return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'countdown':
        return <Timer className="h-4 w-4" />;
      case 'scarcity':
        return <AlertTriangle className="h-4 w-4" />;
      case 'social-proof':
        return <Users className="h-4 w-4" />;
      case 'time-sensitive':
        return <Zap className="h-4 w-4" />;
    }
  };

  if (type === 'countdown' && data.endTime) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${className}`}
      >
        <Badge
          variant="outline"
          className={`${getVariantStyles()} px-3 py-2 text-sm font-bold tracking-wider flex items-center gap-2`}
        >
          {getIcon()}
          <span className="flex items-center gap-1">
            <span className="tabular-nums">{timeRemaining.hours.toString().padStart(2, '0')}</span>
            <span className="animate-pulse">:</span>
            <span className="tabular-nums">{timeRemaining.minutes.toString().padStart(2, '0')}</span>
            <span className="animate-pulse">:</span>
            <span className="tabular-nums">{timeRemaining.seconds.toString().padStart(2, '0')}</span>
          </span>
          <span>LEFT</span>
        </Badge>
      </motion.div>
    );
  }

  if (type === 'scarcity' && data.remainingCount !== undefined) {
    const percentage = data.totalCount ? (data.remainingCount / data.totalCount) * 100 : 0;
    const isCritical = percentage < 20;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Badge
          variant="outline"
          className={`${isCritical ? 'bg-destructive/20 border-destructive text-destructive animate-pulse' : getVariantStyles()} px-3 py-2 text-sm font-bold tracking-wider flex items-center gap-2`}
        >
          {getIcon()}
          <span className="flex items-center gap-1">
            <span className="text-lg tabular-nums">{data.remainingCount}</span>
            <span>TICKETS LEFT</span>
          </span>
          {isCritical && <Flame className="h-4 w-4 text-red-500" />}
        </Badge>
      </motion.div>
    );
  }

  if (type === 'social-proof' && data.recentActivity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="bg-card/90 backdrop-blur-sm border border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-primary tracking-wider">LIVE ACTIVITY</span>
            </div>
            <div className="space-y-1">
              {data.recentActivity.slice(0, 3).map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="text-xs text-muted-foreground flex items-center justify-between"
                >
                  <span>{activity.action}</span>
                  <span className="text-primary font-medium">{activity.timeAgo}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'time-sensitive' && data.message) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Badge
          variant="outline"
          className={`${getVariantStyles()} px-3 py-2 text-sm font-bold tracking-wider flex items-center gap-2 animate-pulse`}
        >
          {getIcon()}
          <span>{data.message}</span>
        </Badge>
      </motion.div>
    );
  }

  return null;
}

// Specific urgency components for common use cases
export function TicketCountdown({ endTime, className }: { endTime: Date; className?: string }) {
  return (
    <UrgencyIndicator
      type="countdown"
      data={{ endTime }}
      variant="critical"
      className={className}
    />
  );
}

export function TicketScarcity({ remaining, total, className }: { remaining: number; total: number; className?: string }) {
  return (
    <UrgencyIndicator
      type="scarcity"
      data={{ remainingCount: remaining, totalCount: total }}
      variant="prominent"
      className={className}
    />
  );
}

export function LiveActivity({ activities, className }: { 
  activities: Array<{ action: string; timeAgo: string; location?: string }>; 
  className?: string 
}) {
  return (
    <UrgencyIndicator
      type="social-proof"
      data={{ recentActivity: activities }}
      variant="subtle"
      className={className}
    />
  );
}

export function FlashSale({ message, className }: { message: string; className?: string }) {
  return (
    <UrgencyIndicator
      type="time-sensitive"
      data={{ message }}
      variant="critical"
      className={className}
    />
  );
}

// Banner component for site-wide urgency messages
interface UrgencyBannerProps {
  message: string;
  type: 'tour-alert' | 'release-announcement' | 'flash-sale' | 'last-chance';
  actionText?: string;
  actionUrl?: string;
  countdown?: Date;
  onClose?: () => void;
  className?: string;
}

export function UrgencyBanner({ 
  message, 
  type, 
  actionText, 
  actionUrl, 
  countdown, 
  onClose, 
  className = '' 
}: UrgencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const getTypeStyles = () => {
    switch (type) {
      case 'tour-alert':
        return 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30';
      case 'release-announcement':
        return 'bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30';
      case 'flash-sale':
        return 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30 animate-pulse';
      case 'last-chance':
        return 'bg-gradient-to-r from-yellow-600/20 to-red-600/20 border-yellow-500/30';
      default:
        return 'bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        >
          <div className={`border-b backdrop-blur-md ${getTypeStyles()}`}>
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Flame className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex items-center gap-4 flex-1">
                    <p className="text-sm font-medium text-foreground">{message}</p>
                    {countdown && (
                      <TicketCountdown endTime={countdown} className="flex-shrink-0" />
                    )}
                  </div>
                  {actionText && actionUrl && (
                    <motion.a
                      href={actionUrl}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {actionText}
                    </motion.a>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="ml-4 p-1 hover:bg-foreground/10 rounded text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}