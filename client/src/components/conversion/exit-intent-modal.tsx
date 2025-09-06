import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Users, Star, Mail, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'newsletter' | 'tour-alert' | 'exclusive-content' | 'social-follow';
  offerData?: {
    title?: string;
    subtitle?: string;
    incentive?: string;
    urgency?: string;
  };
}

export function ExitIntentModal({ 
  isOpen, 
  onClose, 
  variant = 'newsletter',
  offerData = {} 
}: ExitIntentModalProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'initial' | 'submitting' | 'success'>('initial');
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (data: { email: string; source: string; variant: string }) => {
      const response = await apiRequest("POST", "/api/newsletter/signup", data);
      return response.json();
    },
    onSuccess: () => {
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('initial');
        setEmail('');
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setStep('initial');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setStep('submitting');
    newsletterMutation.mutate({ 
      email: email.trim(), 
      source: 'exit_intent_modal',
      variant 
    });
  };

  const getVariantContent = () => {
    switch (variant) {
      case 'newsletter':
        return {
          icon: <Mail className="h-8 w-8 text-primary" />,
          title: offerData.title || "Wait! Don't Miss Out!",
          subtitle: offerData.subtitle || "Join 156K+ anxious superheroes and get exclusive updates",
          incentive: offerData.incentive || "Get early access to tickets, exclusive content, and behind-the-scenes updates",
          urgency: offerData.urgency || "Limited time: Free bonus content for new subscribers!",
          benefits: [
            "Early ticket access (24 hours before public)",
            "Exclusive unreleased tracks & demos",
            "Behind-the-scenes content & photos",
            "Direct updates from the band"
          ],
          cta: "JOIN THE SQUAD"
        };
      
      case 'tour-alert':
        return {
          icon: <Star className="h-8 w-8 text-yellow-500" />,
          title: offerData.title || "New Tour Dates Incoming!",
          subtitle: offerData.subtitle || "Be the first to know when we announce new shows",
          incentive: offerData.incentive || "Get exclusive presale access and never miss a show",
          urgency: offerData.urgency || "Shows sell out fast - get priority access!",
          benefits: [
            "Presale ticket access",
            "Tour date notifications",
            "VIP package opportunities",
            "Meet & greet chances"
          ],
          cta: "GET TOUR ALERTS"
        };
      
      case 'exclusive-content':
        return {
          icon: <Music className="h-8 w-8 text-purple-500" />,
          title: offerData.title || "Exclusive Content Awaits!",
          subtitle: offerData.subtitle || "Get access to unreleased tracks and studio sessions",
          incentive: offerData.incentive || "Free exclusive EP with your email signup",
          urgency: offerData.urgency || "Limited time: Bonus acoustic versions included!",
          benefits: [
            "Unreleased tracks & demos",
            "Studio session recordings",
            "Acoustic versions",
            "Production insights"
          ],
          cta: "GET EXCLUSIVE ACCESS"
        };
      
      case 'social-follow':
        return {
          icon: <Users className="h-8 w-8 text-blue-500" />,
          title: offerData.title || "Join Our Community!",
          subtitle: offerData.subtitle || "Connect with fellow anxious superheroes",
          incentive: offerData.incentive || "Get updates and connect with the community",
          urgency: offerData.urgency || "Join 45K+ fans in our Discord community!",
          benefits: [
            "Community discussions",
            "Fan art sharing",
            "Live Q&A sessions",
            "Exclusive announcements"
          ],
          cta: "JOIN COMMUNITY"
        };
    }
  };

  const content = getVariantContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'initial' && (
              <Card className="bg-gradient-to-br from-card to-card/95 border-primary/20 shadow-2xl">
                <CardContent className="p-0">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-foreground/10 rounded-full transition-colors z-10"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>

                  {/* Header */}
                  <div className="text-center p-8 pb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mb-4 flex justify-center"
                    >
                      {content.icon}
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold mb-2 text-gradient"
                    >
                      {content.title}
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-muted-foreground mb-4"
                    >
                      {content.subtitle}
                    </motion.p>

                    {/* Urgency indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-full text-sm font-bold mb-6"
                    >
                      <Zap className="h-4 w-4" />
                      {content.urgency}
                    </motion.div>
                  </div>

                  {/* Benefits */}
                  <div className="px-8 pb-4">
                    <div className="grid grid-cols-1 gap-2">
                      {content.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="p-8 pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="exit-email" className="sr-only">
                          Email Address
                        </Label>
                        <Input
                          id="exit-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-center"
                          required
                        />
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg"
                          disabled={!email.trim()}
                        >
                          {content.cta}
                        </Button>
                      </motion.div>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4 opacity-75">
                      No spam, just superhero updates. Unsubscribe anytime.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'submitting' && (
              <Card className="bg-card border-primary/20 shadow-2xl">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold mb-2">Joining the Squad...</h3>
                  <p className="text-muted-foreground">
                    Adding you to our community of anxious superheroes!
                  </p>
                </CardContent>
              </Card>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Card className="bg-gradient-to-br from-green-500/20 to-primary/20 border-green-500/30 shadow-2xl">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-2 text-green-400">
                      Welcome to the Squad!
                    </h3>
                    
                    <p className="text-muted-foreground mb-4">
                      You've successfully joined our community of 156K+ anxious superheroes.
                    </p>

                    <p className="text-sm text-green-400 font-medium">
                      Check your email for your welcome message and exclusive content!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage exit intent detection
export function useExitIntent(
  onExitIntent: () => void,
  options: {
    enabled?: boolean;
    delay?: number;
    sessionLimit?: number;
  } = {}
) {
  const {
    enabled = true,
    delay = 1000,
    sessionLimit = 1
  } = options;

  useEffect(() => {
    if (!enabled) return;

    // Check if we've already shown the modal this session
    const sessionKey = 'ps_exit_intent_shown';
    const shownCount = parseInt(sessionStorage.getItem(sessionKey) || '0');
    
    if (shownCount >= sessionLimit) return;

    let hasShown = false;
    let delayTimer: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from the top of the page
      if (e.clientY <= 0 && !hasShown) {
        if (delayTimer) clearTimeout(delayTimer);
        
        delayTimer = setTimeout(() => {
          hasShown = true;
          sessionStorage.setItem(sessionKey, (shownCount + 1).toString());
          onExitIntent();
        }, delay);
      }
    };

    const handleMouseEnter = () => {
      if (delayTimer) {
        clearTimeout(delayTimer);
      }
    };

    // Also trigger on tab visibility change (mobile-friendly)
    const handleVisibilityChange = () => {
      if (document.hidden && !hasShown) {
        hasShown = true;
        sessionStorage.setItem(sessionKey, (shownCount + 1).toString());
        onExitIntent();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [enabled, delay, sessionLimit, onExitIntent]);
}

// Exit Intent Manager Component
interface ExitIntentManagerProps {
  children: React.ReactNode;
  variant?: 'newsletter' | 'tour-alert' | 'exclusive-content' | 'social-follow';
  enabled?: boolean;
  delay?: number;
  sessionLimit?: number;
  offerData?: {
    title?: string;
    subtitle?: string;
    incentive?: string;
    urgency?: string;
  };
}

export function ExitIntentManager({ 
  children, 
  variant = 'newsletter',
  enabled = true,
  delay = 1000,
  sessionLimit = 1,
  offerData = {}
}: ExitIntentManagerProps) {
  const [showModal, setShowModal] = useState(false);

  useExitIntent(() => setShowModal(true), {
    enabled,
    delay,
    sessionLimit
  });

  return (
    <>
      {children}
      <ExitIntentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        variant={variant}
        offerData={offerData}
      />
    </>
  );
}