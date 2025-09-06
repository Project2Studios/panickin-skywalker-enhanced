// GDPR-Compliant User Behavior Tracking and Personalization System
import { z } from "zod";

// User behavior tracking schema
const UserEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'section_view',
    'click',
    'form_interaction',
    'music_play',
    'social_click',
    'newsletter_signup',
    'ticket_interest',
    'exit_intent',
    'scroll_depth',
    'time_on_page'
  ]),
  elementId: z.string().optional(),
  sectionName: z.string().optional(),
  value: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date(),
  sessionId: z.string(),
  userId: z.string().optional()
});

export type UserEvent = z.infer<typeof UserEventSchema>;

// User preferences and behavior patterns
const UserProfileSchema = z.object({
  userId: z.string(),
  sessionCount: z.number().default(0),
  totalTimeSpent: z.number().default(0),
  interests: z.array(z.enum([
    'music',
    'tours',
    'merchandise', 
    'social',
    'community',
    'exclusive_content',
    'behind_scenes'
  ])).default([]),
  favoriteSection: z.string().optional(),
  preferredContent: z.enum(['visual', 'audio', 'text']).default('visual'),
  engagementLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  conversionLikelihood: z.number().min(0).max(1).default(0.5),
  lastVisit: z.date().optional(),
  gdprConsent: z.boolean().default(false),
  consentDate: z.date().optional(),
  preferences: z.object({
    allowTracking: z.boolean().default(false),
    allowPersonalization: z.boolean().default(false),
    allowMarketing: z.boolean().default(false),
    allowAnalytics: z.boolean().default(false)
  }).default({})
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Personalization rules
interface PersonalizationRule {
  id: string;
  name: string;
  condition: (profile: UserProfile, events: UserEvent[]) => boolean;
  action: {
    type: 'content_swap' | 'cta_change' | 'priority_boost' | 'modal_trigger';
    config: Record<string, any>;
  };
}

class UserTrackingManager {
  private static instance: UserTrackingManager;
  private profile: UserProfile | null = null;
  private events: UserEvent[] = [];
  private sessionId: string;
  private consentGiven: boolean = false;
  private personalizationRules: PersonalizationRule[] = [];

  private constructor() {
    this.sessionId = crypto.randomUUID();
    this.initializeTracking();
    this.setupPersonalizationRules();
  }

  static getInstance(): UserTrackingManager {
    if (!UserTrackingManager.instance) {
      UserTrackingManager.instance = new UserTrackingManager();
    }
    return UserTrackingManager.instance;
  }

  private initializeTracking(): void {
    // Check for existing consent and profile
    const consentData = localStorage.getItem('ps_gdpr_consent');
    if (consentData) {
      try {
        const consent = JSON.parse(consentData);
        this.consentGiven = consent.allowTracking || false;
      } catch (e) {
        console.warn('Failed to parse consent data:', e);
      }
    }

    if (this.consentGiven) {
      this.loadUserProfile();
      this.loadRecentEvents();
      this.startSessionTracking();
    }
  }

  // GDPR Consent Management
  setConsent(preferences: {
    allowTracking: boolean;
    allowPersonalization: boolean;
    allowMarketing: boolean;
    allowAnalytics: boolean;
  }): void {
    const consentData = {
      ...preferences,
      consentDate: new Date().toISOString(),
      version: '1.0'
    };

    localStorage.setItem('ps_gdpr_consent', JSON.stringify(consentData));
    this.consentGiven = preferences.allowTracking;

    if (this.consentGiven) {
      this.initializeUserProfile();
      this.startSessionTracking();
    } else {
      this.clearAllData();
    }
  }

  getConsentStatus(): {
    given: boolean;
    preferences?: Record<string, boolean>;
    date?: Date;
  } {
    const consentData = localStorage.getItem('ps_gdpr_consent');
    if (!consentData) return { given: false };

    try {
      const consent = JSON.parse(consentData);
      return {
        given: consent.allowTracking || false,
        preferences: {
          allowTracking: consent.allowTracking,
          allowPersonalization: consent.allowPersonalization,
          allowMarketing: consent.allowMarketing,
          allowAnalytics: consent.allowAnalytics
        },
        date: new Date(consent.consentDate)
      };
    } catch (e) {
      return { given: false };
    }
  }

  private initializeUserProfile(): void {
    let userId = localStorage.getItem('ps_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('ps_user_id', userId);
    }

    this.profile = {
      userId,
      sessionCount: 1,
      totalTimeSpent: 0,
      interests: [],
      preferredContent: 'visual',
      engagementLevel: 'medium',
      conversionLikelihood: 0.5,
      gdprConsent: true,
      consentDate: new Date(),
      preferences: {
        allowTracking: true,
        allowPersonalization: true,
        allowMarketing: true,
        allowAnalytics: true
      }
    };

    this.saveUserProfile();
  }

  private loadUserProfile(): void {
    const profileData = localStorage.getItem('ps_user_profile');
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        this.profile = UserProfileSchema.parse(parsed);
        this.profile.sessionCount += 1;
        this.saveUserProfile();
      } catch (e) {
        console.warn('Failed to load user profile:', e);
        this.initializeUserProfile();
      }
    } else {
      this.initializeUserProfile();
    }
  }

  private saveUserProfile(): void {
    if (!this.consentGiven || !this.profile) return;
    localStorage.setItem('ps_user_profile', JSON.stringify(this.profile));
  }

  private loadRecentEvents(): void {
    const eventsData = localStorage.getItem('ps_user_events');
    if (eventsData) {
      try {
        const parsed = JSON.parse(eventsData);
        // Only keep events from the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.events = parsed
          .map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) }))
          .filter((e: UserEvent) => e.timestamp > thirtyDaysAgo);
      } catch (e) {
        console.warn('Failed to load user events:', e);
      }
    }
  }

  private saveEvents(): void {
    if (!this.consentGiven) return;
    localStorage.setItem('ps_user_events', JSON.stringify(this.events));
  }

  private startSessionTracking(): void {
    if (!this.consentGiven) return;

    // Track page load
    this.trackEvent({
      eventType: 'page_view',
      sectionName: 'page_load',
      timestamp: new Date(),
      sessionId: this.sessionId
    });

    // Track time spent on page
    let timeStart = Date.now();
    
    const trackTimeSpent = () => {
      if (this.profile) {
        const timeSpent = Date.now() - timeStart;
        this.profile.totalTimeSpent += timeSpent;
        this.saveUserProfile();
      }
    };

    // Save time spent when leaving page
    window.addEventListener('beforeunload', trackTimeSpent);
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackTimeSpent();
      } else {
        timeStart = Date.now();
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.trackEvent({
          eventType: 'scroll_depth',
          value: scrollDepth,
          timestamp: new Date(),
          sessionId: this.sessionId
        });
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
  }

  // Track user events
  trackEvent(eventData: Omit<UserEvent, 'timestamp' | 'sessionId'> & {
    timestamp?: Date;
    sessionId?: string;
  }): void {
    if (!this.consentGiven) return;

    const event: UserEvent = {
      ...eventData,
      timestamp: eventData.timestamp || new Date(),
      sessionId: eventData.sessionId || this.sessionId,
      userId: this.profile?.userId
    };

    this.events.push(event);
    this.updateUserProfile(event);
    this.saveEvents();
    this.saveUserProfile();

    // Send to analytics if consent given
    this.sendToAnalytics(event);
  }

  private updateUserProfile(event: UserEvent): void {
    if (!this.profile) return;

    // Update interests based on interactions
    switch (event.eventType) {
      case 'music_play':
        this.addInterest('music');
        break;
      case 'ticket_interest':
        this.addInterest('tours');
        break;
      case 'social_click':
        this.addInterest('social');
        break;
      case 'newsletter_signup':
        this.addInterest('community');
        this.profile.conversionLikelihood = Math.min(this.profile.conversionLikelihood + 0.2, 1);
        break;
    }

    // Update engagement level based on session activity
    const sessionEvents = this.events.filter(e => e.sessionId === this.sessionId);
    if (sessionEvents.length > 10) {
      this.profile.engagementLevel = 'high';
    } else if (sessionEvents.length > 5) {
      this.profile.engagementLevel = 'medium';
    }

    // Update favorite section
    if (event.sectionName) {
      const sectionEvents = this.events.filter(e => e.sectionName === event.sectionName);
      if (sectionEvents.length >= 3) {
        this.profile.favoriteSection = event.sectionName;
      }
    }
  }

  private addInterest(interest: UserProfile['interests'][0]): void {
    if (!this.profile) return;
    if (!this.profile.interests.includes(interest)) {
      this.profile.interests.push(interest);
    }
  }

  private sendToAnalytics(event: UserEvent): void {
    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', event.eventType, {
        element_id: event.elementId,
        section_name: event.sectionName,
        value: event.value,
        session_id: event.sessionId
      });
    }

    // Send to custom analytics endpoint
    if (this.getConsentStatus().preferences?.allowAnalytics) {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(e => console.warn('Failed to send analytics:', e));
    }
  }

  private setupPersonalizationRules(): void {
    this.personalizationRules = [
      {
        id: 'music-lover',
        name: 'Music-focused user',
        condition: (profile) => profile.interests.includes('music'),
        action: {
          type: 'priority_boost',
          config: { section: 'music', boost: 1.5 }
        }
      },
      {
        id: 'tour-interested',
        name: 'Tour-interested user',
        condition: (profile) => profile.interests.includes('tours'),
        action: {
          type: 'cta_change',
          config: { 
            element: 'newsletter-cta',
            text: 'GET TOUR ALERTS FIRST',
            variant: 'tour-focused'
          }
        }
      },
      {
        id: 'high-engagement',
        name: 'Highly engaged user',
        condition: (profile) => profile.engagementLevel === 'high',
        action: {
          type: 'modal_trigger',
          config: { 
            type: 'exclusive-content',
            delay: 30000 // 30 seconds
          }
        }
      },
      {
        id: 'return-visitor',
        name: 'Returning visitor',
        condition: (profile) => profile.sessionCount > 1,
        action: {
          type: 'content_swap',
          config: { 
            element: 'hero-subtitle',
            text: 'Welcome back, fellow anxious superhero!'
          }
        }
      }
    ];
  }

  // Get personalization recommendations
  getPersonalization(): Array<{
    ruleId: string;
    action: PersonalizationRule['action'];
  }> {
    if (!this.profile || !this.consentGiven) return [];
    
    const consent = this.getConsentStatus();
    if (!consent.preferences?.allowPersonalization) return [];

    return this.personalizationRules
      .filter(rule => rule.condition(this.profile!, this.events))
      .map(rule => ({
        ruleId: rule.id,
        action: rule.action
      }));
  }

  // Get user insights for conversion optimization
  getUserInsights(): {
    conversionLikelihood: number;
    preferredContent: string;
    interests: string[];
    engagementLevel: string;
    sessionCount: number;
    favoriteSection?: string;
  } | null {
    if (!this.profile || !this.consentGiven) return null;

    return {
      conversionLikelihood: this.profile.conversionLikelihood,
      preferredContent: this.profile.preferredContent,
      interests: this.profile.interests,
      engagementLevel: this.profile.engagementLevel,
      sessionCount: this.profile.sessionCount,
      favoriteSection: this.profile.favoriteSection
    };
  }

  private clearAllData(): void {
    localStorage.removeItem('ps_user_profile');
    localStorage.removeItem('ps_user_events');
    localStorage.removeItem('ps_user_id');
    this.profile = null;
    this.events = [];
  }

  // Export user data (GDPR compliance)
  exportUserData(): string {
    if (!this.consentGiven) return JSON.stringify({ message: 'No consent given for data tracking' });
    
    return JSON.stringify({
      profile: this.profile,
      events: this.events,
      consent: this.getConsentStatus(),
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  // Delete user data (GDPR compliance)
  deleteUserData(): void {
    this.clearAllData();
    localStorage.removeItem('ps_gdpr_consent');
    this.consentGiven = false;
  }
}

// React hooks for user tracking
export function useUserTracking() {
  const manager = UserTrackingManager.getInstance();
  
  return {
    trackEvent: (eventData: Omit<UserEvent, 'timestamp' | 'sessionId'>) => 
      manager.trackEvent(eventData),
    getInsights: () => manager.getUserInsights(),
    getPersonalization: () => manager.getPersonalization(),
    setConsent: (preferences: Parameters<typeof manager.setConsent>[0]) =>
      manager.setConsent(preferences),
    getConsentStatus: () => manager.getConsentStatus(),
    exportData: () => manager.exportUserData(),
    deleteData: () => manager.deleteUserData()
  };
}

export default UserTrackingManager;