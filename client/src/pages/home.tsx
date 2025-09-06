import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SocialProofCounter } from "@/components/ui/social-proof-counter";
import { FanEngagementWidget } from "@/components/ui/fan-engagement-widget";
import { Button } from "@/components/ui/button";
import { StreamingButton } from "@/components/ui/streaming-button";
// import { TicketButton } from "@/components/ui/ticket-button"; // Temporarily removed
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";
import { 
  TextSkeleton, 
  CardSkeleton, 
  BandMemberSkeleton, 
  NewsUpdateSkeleton,
  AlbumSkeleton 
} from "@/components/ui/skeleton";
import { useOptimizedScroll, useIntersectionObserver } from "@/hooks/use-performance";
import { EnhancedMusicSection } from "@/components/music/enhanced-music-section";
import { InteractiveTourMap } from "@/components/tour/interactive-tour-map";
import { InstagramFeed } from "@/components/social/instagram-feed";
import { DiscordWidget } from "@/components/social/discord-widget";
import { ViralMomentsTracker } from "@/components/social/viral-moments-tracker";
import { OptimizedCTA, NewsletterCTA, TicketCTA, SocialFollowCTA, MusicStreamCTA } from "@/components/conversion/optimized-cta";
import { UrgencyIndicator, TicketScarcity, LiveActivity } from "@/components/conversion/urgency-indicators";
import { useUserTracking } from "@/lib/user-tracking";
import { useABTest, NEWSLETTER_SIGNUP_TEST, TICKET_CTA_TEST } from "@/lib/ab-testing";
import {
  SiSpotify,
  SiApplemusic,
  SiYoutube,
  SiInstagram,
  SiTiktok,
  SiDiscord,
} from "react-icons/si";
import {
  Menu,
  X,
  Play,
  Mail,
  Music,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Globe,
  Heart,
  Calendar,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Quote,
  CheckCircle,
  Share2,
  Camera
} from "lucide-react";

interface NewsletterSignup {
  email: string;
  name?: string;
  wantsUpdates: boolean;
}

// News and Updates Data
const newsUpdates = [
  {
    id: 1,
    title: "New Single 'PANIC ATTACK' Hits #3 on Alternative Charts",
    date: "2024-03-10",
    type: "milestone",
    content: "Our latest single continues to climb! Thank you to everyone streaming and supporting - you're making our anxious superhero dreams come true! 🎸",
    isHot: true,
  },
  {
    id: 2,
    title: "Behind the Scenes: Recording 'Inner Space'",
    date: "2024-03-05",
    type: "content",
    content: "Take a peek at our chaotic but creative studio sessions. Spoiler alert: lots of coffee, anxiety, and killer riffs were involved.",
    isHot: false,
  },
  {
    id: 3,
    title: "Fan Art Feature: Amazing Artwork by @AnxiousArtist",
    date: "2024-02-28",
    type: "community",
    content: "This incredible fan art of Penny Panick just made our entire week! Keep sharing your creativity with #PanickinArt",
    isHot: false,
  },
  {
    id: 4,
    title: "Sold Out Show Alert: Adding Second LA Date!",
    date: "2024-02-20",
    type: "tour",
    content: "LA show sold out in 2 hours! Added a second date at the Hollywood Palladium - tickets on sale Friday at 10am PT.",
    isHot: false,
  },
];

// Social Proof Data
const socialProofStats = {
  monthlyListeners: "847,293",
  totalStreams: "12.4M",
  fanCommunity: "156K",
  concertsSoldOut: "23",
  countries: "42",
};

// Fan Testimonials Data
const fanTestimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "Portland, OR",
    quote: "Panickin' Skywalker perfectly captures what it feels like to be young and anxious in 2024. Their music is my therapy.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b76c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    verified: true,
  },
  {
    id: 2,
    name: "Jake T.",
    location: "Brooklyn, NY",
    quote: "Saw them live three times this year. Each show was an emotional rollercoaster that left me feeling less alone.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    verified: false,
  },
  {
    id: 3,
    name: "Alex R.",
    location: "Austin, TX",
    quote: "As someone dealing with anxiety, their lyrics hit different. It's like they're singing directly to my soul.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    verified: true,
  },
  {
    id: 4,
    name: "Maya L.",
    location: "Seattle, WA",
    quote: "The community around this band is incredible. We're all just anxious superheroes supporting each other.",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    verified: false,
  },
  {
    id: 5,
    name: "Chris P.",
    location: "Chicago, IL",
    quote: "Never thought a punk band would make me feel so understood. Their music saved me during my darkest times.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    verified: true,
  },
];

const releases = [
  {
    id: 1,
    title: "PANIC ATTACK",
    type: "Single",
    year: "2024",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: true,
  },
  {
    id: 2,
    title: "SUPERHERO COMPLEX",
    type: "Album",
    year: "2023",
    imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
  },
  {
    id: 3,
    title: "MILLENNIAL MELTDOWN",
    type: "EP",
    year: "2022",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
  },
  {
    id: 4,
    title: "ANXIETY ANTHEM",
    type: "Single",
    year: "2022",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
  },
  {
    id: 5,
    title: "DIGITAL BREAKDOWN",
    type: "Album",
    year: "2021",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
  },
  {
    id: 6,
    title: "REBEL HEART",
    type: "EP",
    year: "2021",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
  },
];

const bandMembers = [
  {
    name: "ALEX SKYWALKER",
    role: "LEAD VOCALS",
    description: "The anxious superhero with a voice that channels millennial angst into anthemic choruses",
    imageUrl: "/skywalker.png",
    fullBio: "Alex discovered music as a way to cope with anxiety at age 16. Growing up feeling like an outsider, they found solace in punk rock's raw honesty. After years of bedroom recordings and coffee shop open mics, Alex formed Panickin' Skywalker to create a safe space for fellow anxious souls. When not performing, Alex volunteers at mental health advocacy events and collects vintage superhero comics.",
    influences: ["Green Day", "My Chemical Romance", "Paramore"],
    funFact: "Has watched every superhero movie ever made (twice)",
    social: {
      instagram: "@alexskywalker_official",
      twitter: "@anxioussuperhero"
    }
  },
  {
    name: "PENNY PANICK",
    role: "RHYTHM GUITAR",
    description: "Band mascot and comedic anxiety representation with killer riffs and infectious energy",
    imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    fullBio: "Penny started as the band's visual mascot but quickly became the heart and soul of their live performances. A classically trained guitarist who rebelled into punk, Penny brings technical precision to chaotic energy. Known for crowd interactions and making everyone feel included, Penny represents the fun side of dealing with life's overwhelming moments.",
    influences: ["The Ramones", "Joan Jett", "Bikini Kill"],
    funFact: "Can play guitar behind their head while jumping on trampolines",
    social: {
      instagram: "@pennypanick_guitarist",
      tiktok: "@pennypanick"
    }
  },
  {
    name: "JAMES BLONDE",
    role: "LEAD GUITAR",
    description: "Lead guitarist with pure punk aesthetic and solos that cut through the noise",
    imageUrl: "/jamesb.png",
    fullBio: "James Blonde learned guitar by playing along to punk rock albums in their garage at 3am. A minimalist who believes in maximum impact, James crafts solos that hit like emotional lightning bolts. Despite their quiet demeanor offstage, James transforms into a powerhouse during performances, channeling years of social anxiety into pure sonic energy.",
    influences: ["Minor Threat", "Black Flag", "Bad Brains"],
    funFact: "Has a collection of 47 vintage guitar picks from legendary punk shows",
    social: {
      instagram: "@jamesblonde_guitar",
      youtube: "@JamesBlondeShreds"
    }
  },
  {
    name: "DAN SPINNEY",
    role: "DRUMS",
    description: "Drummer with explosive energy and rhythms that drive the band's chaotic sound",
    imageUrl: "/dans.png",
    fullBio: "Dan Spinney brings the groove that keeps everything together. With a background in jazz fusion, he adds sophisticated rhythms that give the band its unique edge. As the band's moral compass and voice of reason, Dan helps navigate the music industry while staying true to their punk roots and maintaining the band's explosive energy.",
    influences: ["Travis Barker", "Dave Grohl", "Josh Dun"],
    funFact: "Can play drum solos with his eyes closed while crowd-surfing",
    social: {
      instagram: "@danspinney_drums",
      twitter: "@DanSpinneyBeats"
    }
  },
];

const tourDates = [
  {
    date: "MAR 15",
    venue: "THE FILLMORE",
    location: "San Francisco, CA",
    time: "8:00 PM • All Ages",
    available: true,
  },
  {
    date: "MAR 22",
    venue: "HOLLYWOOD PALLADIUM",
    location: "Los Angeles, CA",
    time: "7:30 PM • All Ages",
    available: true,
  },
  {
    date: "APR 05",
    venue: "MUSIC HALL OF WILLIAMSBURG",
    location: "Brooklyn, NY",
    time: "8:00 PM • 18+",
    available: true,
  },
  {
    date: "FEB 28",
    venue: "SOLD OUT - THE ROXY",
    location: "West Hollywood, CA",
    time: "Sold Out Show",
    available: false,
  },
  {
    date: "FEB 14",
    venue: "SOLD OUT - THE INDEPENDENT",
    location: "San Francisco, CA",
    time: "Valentine's Day Special",
    available: false,
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerBlurred, setHeaderBlurred] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [wantsUpdates, setWantsUpdates] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof bandMembers[0] | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Conversion optimization hooks
  const { trackEvent, getInsights } = useUserTracking();
  const { variant: newsletterVariant, trackMetric: trackNewsletterMetric } = useABTest(
    'newsletter-signup-optimization', 
    NEWSLETTER_SIGNUP_TEST
  );
  const { variant: ticketVariant, trackMetric: trackTicketMetric } = useABTest(
    'ticket-cta-optimization',
    TICKET_CTA_TEST
  );
  
  const userInsights = getInsights();
  
  // Sample urgency and social proof data
  const [recentActivity] = useState([
    { action: 'Someone from Brooklyn signed up', timeAgo: '2 min ago' },
    { action: 'Ticket purchased for SF show', timeAgo: '5 min ago' },
    { action: 'New Discord member joined', timeAgo: '8 min ago' },
    { action: 'Instagram story shared', timeAgo: '12 min ago' },
    { action: 'Playlist saved by fan in LA', timeAgo: '15 min ago' }
  ]);
  
  const urgencyData = {
    newsletter: {
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      message: "Limited Time: Free Exclusive EP!"
    },
    tickets: {
      remaining: 47,
      total: 200
    }
  };
  
  // Optimized scroll handling
  const { scrollY } = useOptimizedScroll();
  const { scrollYProgress } = useScroll({
    container: containerRef
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const newsletterMutation = useMutation({
    mutationFn: async (data: NewsletterSignup) => {
      const response = await apiRequest("POST", "/api/newsletter/signup", data);
      return response.json();
    },
    onSuccess: () => {
      // Track successful newsletter conversion
      trackEvent({
        eventType: 'newsletter_signup',
        elementId: 'newsletter-form',
        sectionName: 'contact',
        metadata: { variant: newsletterVariant }
      });
      trackNewsletterMetric('signup_conversion', 1);
      
      toast({
        title: "Welcome to the Squad!",
        description: "You've successfully joined our mailing list.",
      });
      setEmail("");
      setName("");
      setWantsUpdates(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Enhanced scroll detection with section highlighting, back-to-top, and tracking
  const detectActiveSection = useCallback(() => {
    const sections = ['home', 'music', 'band', 'tour', 'social', 'contact'];
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const threshold = windowHeight * 0.3; // 30% of viewport height
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollTop >= sectionTop - threshold && 
            scrollTop < sectionTop + sectionHeight - threshold) {
          // Only track if section changed
          if (activeSection !== sections[i]) {
            setActiveSection(sections[i]);
            
            // Track section view
            trackEvent({
              eventType: 'section_view',
              sectionName: sections[i],
              value: Math.round(scrollTop),
              metadata: { 
                scrollDepth: Math.round((scrollTop / document.body.scrollHeight) * 100),
                timeOnPreviousSection: Date.now() // Could be enhanced to track actual time
              }
            });
          }
          break;
        }
      }
    }
  }, [activeSection, trackEvent]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setHeaderBlurred(scrollTop > 100);
      setShowBackToTop(scrollTop > 800);
      detectActiveSection();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call to set correct section on page load
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [detectActiveSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Testimonial carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % fanTestimonials.length);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % fanTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + fanTestimonials.length) % fanTestimonials.length);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    newsletterMutation.mutate({ email, name, wantsUpdates });
  };

  const socialLinks = [
    { icon: SiSpotify, href: "#", label: "Spotify" },
    { icon: SiYoutube, href: "#", label: "YouTube" },
    { icon: SiInstagram, href: "#", label: "Instagram" },
    { icon: SiTiktok, href: "#", label: "TikTok" },
    { icon: SiDiscord, href: "#", label: "Discord" },
  ];

  return (
    <div ref={containerRef} className="bg-background text-foreground overflow-x-hidden">
      {/* Header with Progress Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBlurred ? 'header-blur' : ''}`}>
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 scroll-progress origin-left z-10"
          style={{ scaleX }}
          initial={{ scaleX: 0 }}
        />
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PS</span>
            </div>
            <span className="text-xl font-bold tracking-wider text-gradient-animated">PANICKIN' SKYWALKER</span>
          </div>

          {/* Desktop Navigation with Active Section Highlighting */}
          <ul className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-widest">
            <li>
              <button 
                onClick={() => scrollToSection('home')}
                className={`transition-colors relative ${
                  activeSection === 'home' ? 'text-primary' : 'hover:text-primary'
                }`}
                data-testid="nav-home"
              >
                HOME
                {activeSection === 'home' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 nav-indicator"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('music')}
                className={`transition-colors relative ${
                  activeSection === 'music' ? 'text-primary' : 'hover:text-primary'
                }`}
                data-testid="nav-music"
              >
                MUSIC
                {activeSection === 'music' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 nav-indicator"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('band')}
                className={`transition-colors relative ${
                  activeSection === 'band' ? 'text-primary' : 'hover:text-primary'
                }`}
                data-testid="nav-band"
              >
                BAND
                {activeSection === 'band' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 nav-indicator"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('tour')}
                className={`transition-colors relative ${
                  activeSection === 'tour' ? 'text-primary' : 'hover:text-primary'
                }`}
                data-testid="nav-tour"
              >
                TOUR
                {activeSection === 'tour' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 nav-indicator"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('social')}
                className={`transition-colors relative ${
                  activeSection === 'social' ? 'text-primary' : 'hover:text-primary'
                }`}
                data-testid="nav-social"
              >
                SOCIAL
                {activeSection === 'social' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 nav-indicator"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('contact')}
                className={`transition-colors relative ${
                  activeSection === 'contact' ? 'text-primary' : 'hover:text-primary'
                }`}
                data-testid="nav-contact"
              >
                CONTACT
                {activeSection === 'contact' && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 nav-indicator"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
                data-testid={`social-${social.label.toLowerCase()}`}
              >
                <social.icon className="text-lg" />
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>

        {/* Enhanced Mobile Menu with Slide Animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                height: { duration: 0.4 }
              }}
              className="md:hidden bg-background border-t border-border overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6">
                <motion.ul 
                  className="space-y-4 text-center font-semibold tracking-widest"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    },
                    hidden: {
                      transition: {
                        staggerChildren: 0.02,
                        staggerDirection: -1
                      }
                    }
                  }}
                >
                  {[
                    { id: 'home', label: 'HOME' },
                    { id: 'music', label: 'MUSIC' },
                    { id: 'band', label: 'BAND' },
                    { id: 'tour', label: 'TOUR' },
                    { id: 'social', label: 'SOCIAL' },
                    { id: 'contact', label: 'CONTACT' }
                  ].map((item) => (
                    <motion.li
                      key={item.id}
                      className="mobile-menu-item"
                      variants={{
                        visible: { opacity: 1, y: 0 },
                        hidden: { opacity: 0, y: 10 }
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <button 
                        onClick={() => scrollToSection(item.id)}
                        className={`block transition-colors ${
                          activeSection === item.id ? 'text-primary' : 'hover:text-primary'
                        }`}
                        data-testid={`mobile-nav-${item.id}`}
                      >
                        {item.label}
                        {activeSection === item.id && (
                          <motion.div 
                            className="w-8 h-0.5 bg-primary mx-auto mt-1"
                            layoutId="activeMobileTab"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div 
                  className="flex justify-center items-center space-x-6 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={social.label}
                      data-testid={`mobile-social-${social.label.toLowerCase()}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <social.icon className="text-xl" />
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
            alt="Hero background"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 md:pt-32">
          
          <motion.h1 
            className="text-display text-gradient-animated mb-8 animate-text-glow"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1.2, 
              delay: 0.5,
              type: "spring",
              bounce: 0.3
            }}
          >
            PANICKIN'<br />SKYWALKER
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-medium tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            The anxious superheroes of pop-punk are back with their most electrifying release yet
          </motion.p>
          
          {/* Latest Release */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <Card className="bg-card border border-border rounded-lg p-6 mb-8 max-w-md mx-auto animate-pulse-glow">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold mb-3 text-gradient tracking-wider">PANIC ATTACK</h3>
                <p className="text-muted-foreground text-base mb-6 font-medium tracking-wide">Latest Single</p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <MusicStreamCTA
                  platform="spotify"
                  href="https://open.spotify.com/artist/example"
                  className=""
                />
                <MusicStreamCTA
                  platform="apple"
                  href="https://music.apple.com/artist/example"
                  className=""
                />
                <MusicStreamCTA
                  platform="youtube"
                  href="https://youtube.com/watch?v=example"
                  className=""
                />
              </div>
            </CardContent>
          </Card>
          </motion.div>
          
          {/* New Single Out Now Button */}
          {/* <motion.div
            className="mb-8 pr-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold tracking-widest glow-pink">
              NEW SINGLE OUT NOW
            </span>
          </motion.div> */}
          
          <div className="animate-bounce">
            <ChevronDown className="text-primary text-2xl mx-auto" />
          </div>
        </div>
      </section>


      {/* Dynamic News & Updates Section */}
      <section className="py-16 lg:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-section text-gradient mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              WHAT'S HAPPENING
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-lg font-medium tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Latest updates from the anxious superhero headquarters
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {newsUpdates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Card className={`bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors duration-300 relative overflow-hidden ${
                  update.isHot ? 'ring-2 ring-primary/20' : ''
                }`}>
                  {update.isHot && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold tracking-widest rounded-bl-lg">
                      HOT
                    </div>
                  )}
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          update.type === 'milestone' ? 'bg-primary/20 text-primary' :
                          update.type === 'tour' ? 'bg-purple-500/20 text-purple-400' :
                          update.type === 'content' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {update.type === 'milestone' && <TrendingUp className="h-4 w-4" />}
                          {update.type === 'tour' && <Calendar className="h-4 w-4" />}
                          {update.type === 'content' && <Play className="h-4 w-4" />}
                          {update.type === 'community' && <Heart className="h-4 w-4" />}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(update.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
                      {update.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {update.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Stats Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            <SocialProofCounter 
              icon={Users} 
              label="Monthly Listeners" 
              targetValue={socialProofStats.monthlyListeners}
              delay={0}
            />
            <SocialProofCounter 
              icon={Play} 
              label="Total Streams" 
              targetValue={socialProofStats.totalStreams}
              delay={0.1}
            />
            <SocialProofCounter 
              icon={Heart} 
              label="Fan Community" 
              targetValue={socialProofStats.fanCommunity}
              delay={0.2}
            />
            <SocialProofCounter 
              icon={Star} 
              label="Sold Out Shows" 
              targetValue={socialProofStats.concertsSoldOut}
              delay={0.3}
            />
            <SocialProofCounter 
              icon={Globe} 
              label="Countries" 
              targetValue={socialProofStats.countries}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Enhanced Music Section with Audio Previews and Visualizations */}
      <EnhancedMusicSection 
        className="bg-secondary"
        showVideoBackground={true}
        autoPlayAudio={false}
      />

      {/* Band Section */}
      <section id="band" className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.h2 
              className="text-section text-gradient mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              THE BAND
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-xl font-medium tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Meet the anxious superheroes behind the music
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {bandMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="text-center group cursor-pointer" 
                data-testid={`member-${index}`}
                onClick={() => setSelectedMember(member)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-primary group-hover:border-accent transition-colors duration-300">
                  <LazyImage
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={192}
                    height={192}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold">
                      Learn More
                    </div>
                  </div>
                </div>
                <motion.h3 
                  className="text-2xl font-bold mb-3 text-member-hover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {member.name}
                </motion.h3>
                <div className="role-badge text-primary-foreground mb-3">
                  {member.role}
                </div>
                <p className="text-muted-foreground text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Band Member Modal */}
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-2xl">
              {selectedMember && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                        <LazyImage
                          src={selectedMember.imageUrl}
                          alt={selectedMember.name}
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-gradient">
                          {selectedMember.name}
                        </DialogTitle>
                        <div className="role-badge text-xs px-3 py-1 mt-1 inline-block">
                          {selectedMember.role}
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                  <DialogDescription asChild>
                    <div className="space-y-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedMember.fullBio}
                      </p>
                      
                      <div>
                        <h4 className="font-bold mb-2 text-primary">Musical Influences</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.influences.map((influence, i) => (
                            <span key={i} className="bg-secondary px-3 py-1 rounded-full text-sm">
                              {influence}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <h4 className="font-bold mb-2 text-primary flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Fun Fact
                        </h4>
                        <p className="text-sm text-muted-foreground italic">
                          {selectedMember.funFact}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-bold mb-3 text-primary">Connect with {selectedMember.name.split(' ')[0]}</h4>
                        <div className="flex gap-3">
                          {selectedMember.social.instagram && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2"
                              onClick={() => window.open('https://instagram.com', '_blank')}
                            >
                              <SiInstagram className="h-4 w-4" />
                              Instagram
                            </Button>
                          )}
                          {selectedMember.social.twitter && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2"
                              onClick={() => window.open('https://twitter.com', '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Twitter
                            </Button>
                          )}
                          {selectedMember.social.tiktok && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2"
                              onClick={() => window.open('https://tiktok.com', '_blank')}
                            >
                              <SiTiktok className="h-4 w-4" />
                              TikTok
                            </Button>
                          )}
                          {selectedMember.social.youtube && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-2"
                              onClick={() => window.open('https://youtube.com', '_blank')}
                            >
                              <SiYoutube className="h-4 w-4" />
                              YouTube
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogDescription>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Interactive Tour Map Section */}
      {/* TOUR SECTION TEMPORARILY COMMENTED OUT */}
      {/* <section id="tour" className="py-24 lg:py-32 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-section text-gradient mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              TOUR DATES
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-xl font-medium tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Experience the interactive tour map and get tickets for upcoming shows
            </motion.p>
          </div>
          
          <InteractiveTourMap 
            showControls={true}
            autoRotate={false}
            className="max-w-7xl mx-auto"
          />
          
          <div className="text-center mt-12">
            <div className="mb-6">
              <TicketScarcity 
                remaining={urgencyData.tickets.remaining} 
                total={urgencyData.tickets.total}
              />
            </div>
            
            <p className="text-muted-foreground mb-4">Want to be the first to know about new tour dates?</p>
            <TicketCTA
              urgency={{
                type: 'scarcity',
                data: {
                  remainingCount: urgencyData.tickets.remaining,
                  totalCount: urgencyData.tickets.total
                }
              }}
              testId="tour-ticket-cta"
            />
            
            <div className="mt-4">
              <OptimizedCTA
                type="newsletter"
                primary={false}
                onClick={() => scrollToSection('contact')}
                customText="GET TOUR ALERTS"
                testId="tour-newsletter-cta"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Fan Testimonials Section */}
      <section className="py-20 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-section text-gradient mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              WHAT FANS ARE SAYING
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-xl font-medium tracking-wide max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Real stories from our community of anxious superheroes
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-center"
              >
                <Card className="bg-card border border-border rounded-lg p-8 mb-8">
                  <CardContent className="p-0">
                    <Quote className="h-12 w-12 text-primary mx-auto mb-6 opacity-50" />
                    <blockquote className="text-lg md:text-xl leading-relaxed mb-8 italic">
                      "{fanTestimonials[currentTestimonial].quote}"
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                        <LazyImage
                          src={fanTestimonials[currentTestimonial].avatar}
                          alt={fanTestimonials[currentTestimonial].name}
                          className="w-full h-full object-cover"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-primary">
                            {fanTestimonials[currentTestimonial].name}
                          </h4>
                          {fanTestimonials[currentTestimonial].verified && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {fanTestimonials[currentTestimonial].location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="hover:border-primary hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-2">
                {fanTestimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="hover:border-primary hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Community Call-to-Action */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Want to share your story with our community?
              </p>
              <Button 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => window.open('https://discord.gg/example', '_blank')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Join Our Discord
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social & Community Hub Section */}
      {/* TODO: Clean up and re-enable the full social hub section later. Currently showing only Discord community. */}
      <section id="social" className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          {/* COMMENTED OUT: Full social hub header and other sections
          <div className="text-center mb-20">
            <motion.h2 
              className="text-section text-gradient mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              SOCIAL HUB
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-xl font-medium tracking-wide max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Connect with us across all platforms - from TikTok viral moments to Instagram highlights and Discord community hangouts
            </motion.p>
          </div>
          
          <div className="space-y-16">
            {/* COMMENTED OUT: Viral Moments Tracker */}
            {/*
            <div>
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                  Trending Now
                </h3>
                <p className="text-muted-foreground">
                  Our latest viral moments across TikTok and Instagram
                </p>
              </div>
              <ViralMomentsTracker maxMoments={2} showMetrics={false} />
            </div>
            */}

            {/* COMMENTED OUT: Instagram Feed */}
            {/*
            <div>
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <SiInstagram className="h-6 w-6 text-pink-500" />
                  Latest Instagram Posts
                </h3>
                <p className="text-muted-foreground">
                  Behind-the-scenes moments and fan interactions
                </p>
              </div>
              <InstagramFeed maxPosts={6} showTikTokPotential={true} />
            </div>
            */}
          */}

            {/* Discord Community - KEEPING THIS ACTIVE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                    <SiDiscord className="h-6 w-6 text-indigo-500" />
                    Join Our Community
                  </h3>
                  <p className="text-muted-foreground">
                    Connect with fellow anxious superheroes in our Discord server
                  </p>
                </div>
                <DiscordWidget compact={false} />
              </div>

              {/* Social Call-to-Action */}
              <div className="lg:col-span-1 flex flex-col justify-center">
                <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-200/20">
                  <CardContent className="p-6 text-center">
                    <h4 className="text-xl font-bold mb-4">Follow Us Everywhere</h4>
                    <p className="text-muted-foreground mb-6 text-sm">
                      Stay connected across all platforms for exclusive content, behind-the-scenes moments, and community events.
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <SocialFollowCTA platform="tiktok" className="w-full" />
                      <SocialFollowCTA platform="instagram" className="w-full" />
                      <SocialFollowCTA platform="discord" className="w-full" />
                      <SocialFollowCTA platform="youtube" className="w-full" />
                    </div>

                    <Button 
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                      onClick={() => window.location.href = '/social'}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Explore Full Social Hub
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          {/* </div> - Closing the commented out space-y-16 div */}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <motion.h2 
              className="text-section text-gradient mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              GET IN TOUCH
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-xl font-medium tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Connect with us and join our community of anxious superheroes
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold mb-6">CONTACT INFO</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="text-primary text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Business Inquiries</h4>
                    <p className="text-muted-foreground">booking@panickinskywalker.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Music className="text-primary text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Press & Media</h4>
                    <p className="text-muted-foreground">press@panickinskywalker.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <SiDiscord className="text-primary text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Fan Community</h4>
                    <p className="text-muted-foreground">Join our Discord server for exclusive content and to connect with other fans</p>
                    <a 
                      href="#" 
                      className="text-primary hover:text-accent transition-colors font-semibold"
                      data-testid="discord-link"
                    >
                      Join Discord →
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4">FOLLOW US</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-card border border-border rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors social-button relative overflow-hidden"
                      aria-label={social.label}
                      data-testid={`contact-social-${social.label.toLowerCase()}`}
                      whileHover={{ scale: 1.1, borderColor: 'hsl(330 100% 55%)' }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <social.icon className="text-xl relative z-10" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Enhanced Newsletter Signup */}
            <div className="lg:col-span-1">
            <Card className="bg-card border border-border rounded-lg p-8 animate-pulse-glow newsletter-enhanced">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold tracking-widest mb-4">
                    <Users className="h-4 w-4" />
                    156K+ SUPERHEROES STRONG
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gradient">JOIN THE SUPERHERO SQUAD</h3>
                  <p className="text-muted-foreground mb-6">Get exclusive updates, early access to tickets, behind-the-scenes content, and connect with fellow anxious superheroes.</p>
                  
                  {/* Urgency Indicator for Newsletter */}
                  <div className="mb-6">
                    <UrgencyIndicator
                      type="time-sensitive"
                      data={{ message: "Limited Time: Free Exclusive EP with Signup!" }}
                      variant="prominent"
                    />
                  </div>
                  
                  {/* Live Activity for High Engagement Users */}
                  {userInsights?.engagementLevel === 'high' && (
                    <div className="mb-6">
                      <LiveActivity activities={recentActivity.slice(0, 3)} />
                    </div>
                  )}
                  
                  {/* Benefits List */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-left">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Early ticket access</span>
                    </div>
                    <div className="flex items-center gap-2 text-left">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Exclusive content</span>
                    </div>
                    <div className="flex items-center gap-2 text-left">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>New release alerts</span>
                    </div>
                    <div className="flex items-center gap-2 text-left">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Community events</span>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="block text-sm font-semibold mb-2">
                      Email Address
                    </Label>
                    <Input 
                      type="email" 
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-input border border-border"
                      placeholder="your@email.com"
                      data-testid="newsletter-email"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="name" className="block text-sm font-semibold mb-2">
                      Name (Optional)
                    </Label>
                    <Input 
                      type="text" 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-input border border-border"
                      placeholder="Your name"
                      data-testid="newsletter-name"
                    />
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="updates"
                      checked={wantsUpdates}
                      onCheckedChange={(checked) => setWantsUpdates(checked as boolean)}
                      data-testid="newsletter-updates"
                    />
                    <Label htmlFor="updates" className="text-sm text-muted-foreground">
                      I want to receive updates about tour dates, new releases, and exclusive content.
                    </Label>
                  </div>
                  
                  {/* Use OptimizedCTA for better conversion */}
                  <OptimizedCTA
                    type="newsletter"
                    primary
                    onClick={() => {
                      if (email.trim()) {
                        handleNewsletterSubmit({ preventDefault: () => {} } as React.FormEvent);
                      } else {
                        // Track form interaction
                        trackEvent({
                          eventType: 'form_interaction',
                          elementId: 'newsletter-form',
                          sectionName: 'contact',
                          metadata: { action: 'attempted_submit_no_email' }
                        });
                        trackNewsletterMetric('form_interactions');
                      }
                    }}
                    testId="optimized-newsletter-submit"
                    className="w-full"
                    disabled={newsletterMutation.isPending}
                  >
                    {newsletterMutation.isPending && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        JOINING THE SQUAD...
                      </div>
                    )}
                  </OptimizedCTA>
                  
                  <p className="text-xs text-muted-foreground mt-4 opacity-75">
                    No spam, just superhero updates. Unsubscribe anytime.
                  </p>
                </form>
              </CardContent>
            </Card>
            </div>
            
            {/* Fan Engagement Widgets */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold mb-6 text-gradient">COMMUNITY HUB</h3>
              <FanEngagementWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PS</span>
                </div>
                <span className="text-xl font-bold tracking-wider text-gradient-animated">PANICKIN' SKYWALKER</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                The anxious superheroes of pop-punk, channeling millennial anxiety into anthemic choruses since 2021.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={social.label}
                    data-testid={`footer-social-${social.label.toLowerCase()}`}
                  >
                    <social.icon className="text-xl" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button 
                    onClick={() => scrollToSection('music')}
                    className="hover:text-primary transition-colors text-left"
                    data-testid="footer-music"
                  >
                    Music
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('band')}
                    className="hover:text-primary transition-colors text-left"
                    data-testid="footer-band"
                  >
                    Band
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('tour')}
                    className="hover:text-primary transition-colors text-left"
                    data-testid="footer-tour"
                  >
                    Tour
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('social')}
                    className="hover:text-primary transition-colors text-left"
                    data-testid="footer-social"
                  >
                    Social
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="hover:text-primary transition-colors text-left"
                    data-testid="footer-contact"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors" data-testid="footer-store">
                    Store
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-bold mb-4">SUPPORT</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-faq">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-privacy">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-terms">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-press">Press Kit</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              © 2024 Panickin' Skywalker. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs opacity-50">
              Designed with ❤️ for anxious superheroes everywhere
            </p>
          </div>
        </div>
      </footer>
      
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className={
              "fixed bottom-8 right-8 z-50 w-12 h-12 bg-primary text-primary-foreground " +
              "rounded-full shadow-lg hover:shadow-xl back-to-top-btn " +
              "flex items-center justify-center group"
            }
            aria-label="Back to top"
            data-testid="back-to-top"
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronUp className="h-5 w-5" />
            </motion.div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-primary opacity-20 group-hover:opacity-30 transition-opacity glow-pink" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}