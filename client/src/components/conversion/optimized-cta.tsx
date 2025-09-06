import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useABTest, TICKET_CTA_TEST } from '@/lib/ab-testing';
import { useUserTracking } from '@/lib/user-tracking';
import { UrgencyIndicator } from './urgency-indicators';
import { 
  Music, 
  Ticket, 
  Mail, 
  Users, 
  Zap, 
  Heart, 
  Star, 
  Calendar,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface OptimizedCTAProps {
  type: 'newsletter' | 'tickets' | 'social' | 'music' | 'generic';
  primary?: boolean;
  urgency?: {
    type: 'countdown' | 'scarcity' | 'social-proof' | 'time-sensitive';
    data: any;
  };
  onClick?: () => void;
  href?: string;
  className?: string;
  testId?: string;
  children?: React.ReactNode;
  customText?: string;
}

export function OptimizedCTA({ 
  type, 
  primary = true, 
  urgency, 
  onClick, 
  href, 
  className = '',
  testId = 'optimized-cta',
  children,
  customText
}: OptimizedCTAProps) {
  const { trackEvent, getInsights } = useUserTracking();
  const { variant: ticketVariant, trackMetric } = useABTest('ticket-cta-optimization', TICKET_CTA_TEST);
  const [isHovered, setIsHovered] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string;
    timeAgo: string;
    location?: string;
  }>>([]);

  const insights = getInsights();

  // Simulate recent activity for social proof
  useEffect(() => {
    const activities = [
      { action: 'Someone from Brooklyn signed up', timeAgo: '2 min ago' },
      { action: 'New Discord member joined', timeAgo: '5 min ago' },
      { action: 'Playlist saved by fan in LA', timeAgo: '8 min ago' },
      { action: 'Ticket purchased for SF show', timeAgo: '12 min ago' },
      { action: 'Instagram story shared', timeAgo: '15 min ago' }
    ];
    setRecentActivity(activities);
  }, []);

  const getOptimizedContent = () => {
    // Use A/B test results for ticket CTAs
    if (type === 'tickets') {
      const config = TICKET_CTA_TEST.variants.find(v => v.id === ticketVariant)?.config;
      if (config) {
        return {
          text: config.text,
          variant: config.color,
          urgency: config.urgency,
          scarcity: config.scarcity
        };
      }
    }

    // Personalize based on user insights
    const isHighEngagement = insights?.engagementLevel === 'high';
    const isReturnVisitor = (insights?.sessionCount || 0) > 1;
    const hasInterestIn = (interest: string) => insights?.interests.includes(interest) || false;

    switch (type) {
      case 'newsletter':
        if (hasInterestIn('tours')) {
          return {
            text: customText || 'GET TOUR ALERTS FIRST',
            icon: <Calendar className="h-4 w-4" />,
            variant: 'primary' as const,
            message: isReturnVisitor ? 'Welcome back! Never miss a show.' : 'Join 156K+ fans for priority access'
          };
        }
        if (hasInterestIn('exclusive_content')) {
          return {
            text: customText || 'UNLOCK EXCLUSIVE CONTENT',
            icon: <Star className="h-4 w-4" />,
            variant: 'primary' as const,
            message: 'Get unreleased tracks & behind-the-scenes access'
          };
        }
        return {
          text: customText || (isReturnVisitor ? 'JOIN THE SQUAD' : 'BECOME A SUPERHERO'),
          icon: <Users className="h-4 w-4" />,
          variant: 'primary' as const,
          message: isHighEngagement ? 'You seem to love what we do!' : 'Join our community of anxious superheroes'
        };

      case 'tickets':
        return {
          text: customText || 'GET TICKETS NOW',
          icon: <Ticket className="h-4 w-4" />,
          variant: 'accent' as const,
          message: 'Shows sell out fast - secure your spot!'
        };

      case 'social':
        const platform = hasInterestIn('social') ? 'Discord' : 'Instagram';
        return {
          text: customText || `FOLLOW ON ${platform.toUpperCase()}`,
          icon: <Heart className="h-4 w-4" />,
          variant: 'outline' as const,
          message: `Connect with fellow fans on ${platform}`
        };

      case 'music':
        return {
          text: customText || 'LISTEN NOW',
          icon: <Music className="h-4 w-4" />,
          variant: 'primary' as const,
          message: 'Stream on your favorite platform'
        };

      default:
        return {
          text: customText || 'LEARN MORE',
          icon: <ArrowRight className="h-4 w-4" />,
          variant: 'primary' as const,
          message: ''
        };
    }
  };

  const content = getOptimizedContent();

  const handleClick = (e: React.MouseEvent) => {
    // Track the click event
    trackEvent({
      eventType: 'click',
      elementId: testId,
      metadata: { 
        cta_type: type, 
        variant: type === 'tickets' ? ticketVariant : 'default',
        personalized: !!insights
      }
    });

    // Track A/B test metric for tickets
    if (type === 'tickets') {
      trackMetric('ticket_click_through');
    }

    // Track conversion metric for newsletter
    if (type === 'newsletter') {
      trackMetric('form_interactions');
    }

    // Call custom onClick handler
    if (onClick) {
      onClick();
    } else if (href) {
      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Urgency indicator */}
      {urgency && (
        <div className="mb-3">
          <UrgencyIndicator 
            type={urgency.type} 
            data={urgency.data}
            variant="prominent"
          />
        </div>
      )}

      {/* Social proof for high-engagement users */}
      {insights?.engagementLevel === 'high' && type === 'newsletter' && (
        <div className="mb-3">
          <UrgencyIndicator 
            type="social-proof"
            data={{ recentActivity: recentActivity.slice(0, 2) }}
            variant="subtle"
          />
        </div>
      )}

      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative"
      >
        <Button
          variant={content.variant}
          size={primary ? 'lg' : 'default'}
          onClick={handleClick}
          data-testid={testId}
          className={`
            ${primary ? 'text-lg font-bold tracking-wider py-6 px-8' : ''}
            ${type === 'tickets' ? 'animate-pulse-glow' : ''}
            transition-all duration-300 relative overflow-hidden group
            ${isHovered ? 'shadow-lg' : ''}
          `}
        >
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
            animate={isHovered ? { x: ['-100%', '100%'] } : {}}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
          
          <div className="relative z-10 flex items-center gap-2">
            {content.icon}
            <span>{content.text}</span>
            {href?.startsWith('http') && <ExternalLink className="h-4 w-4" />}
          </div>

          {/* Pulse effect for high-priority CTAs */}
          {type === 'tickets' && ticketVariant === 'scarcity' && (
            <motion.div
              className="absolute inset-0 border-2 border-destructive rounded-lg"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </Button>

        {/* Message tooltip */}
        {content.message && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-sm text-muted-foreground whitespace-nowrap z-20"
          >
            {content.message}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-card border-l border-t border-border rotate-45" />
          </motion.div>
        )}
      </motion.div>

      {/* Personalization indicator for return visitors */}
      {insights && insights.sessionCount > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-center"
        >
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Personalized for you
          </Badge>
        </motion.div>
      )}

      {children}
    </div>
  );
}

// Specialized CTA components
export function NewsletterCTA({ urgency, className, testId }: {
  urgency?: OptimizedCTAProps['urgency'];
  className?: string;
  testId?: string;
}) {
  return (
    <OptimizedCTA 
      type="newsletter"
      primary
      urgency={urgency}
      className={className}
      testId={testId || 'newsletter-cta'}
    />
  );
}

export function TicketCTA({ urgency, className, testId }: {
  urgency?: OptimizedCTAProps['urgency'];
  className?: string;
  testId?: string;
}) {
  return (
    <OptimizedCTA 
      type="tickets"
      primary
      urgency={urgency}
      className={className}
      testId={testId || 'ticket-cta'}
    />
  );
}

export function SocialFollowCTA({ platform, className }: {
  platform: 'instagram' | 'tiktok' | 'discord' | 'youtube';
  className?: string;
}) {
  const urls = {
    instagram: 'https://instagram.com/panickinskywalker',
    tiktok: 'https://tiktok.com/@panickinskywalker',
    discord: 'https://discord.gg/panickinskywalker',
    youtube: 'https://youtube.com/@panickinskywalker'
  };

  return (
    <OptimizedCTA 
      type="social"
      primary={false}
      href={urls[platform]}
      customText={`FOLLOW ON ${platform.toUpperCase()}`}
      className={className}
      testId={`social-cta-${platform}`}
    />
  );
}

export function MusicStreamCTA({ platform, href, className }: {
  platform: 'spotify' | 'apple' | 'youtube';
  href: string;
  className?: string;
}) {
  return (
    <OptimizedCTA 
      type="music"
      primary={false}
      href={href}
      customText={`STREAM ON ${platform.toUpperCase()}`}
      className={className}
      testId={`music-cta-${platform}`}
    />
  );
}