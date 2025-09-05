import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
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
} from "lucide-react";

interface NewsletterSignup {
  email: string;
  name?: string;
  wantsUpdates: boolean;
}

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
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  },
  {
    name: "PENNY PANICK",
    role: "RHYTHM GUITAR",
    description: "Band mascot and comedic anxiety representation with killer riffs and infectious energy",
    imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  },
  {
    name: "JAX",
    role: "LEAD GUITAR",
    description: "Lead guitarist with pure punk aesthetic and solos that cut through the noise",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  },
  {
    name: "ZEE",
    role: "BASS GUITAR",
    description: "Non-binary bassist with cool presence and bass lines that anchor the chaos",
    imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
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
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const newsletterMutation = useMutation({
    mutationFn: async (data: NewsletterSignup) => {
      const response = await apiRequest("POST", "/api/newsletter/signup", data);
      return response.json();
    },
    onSuccess: () => {
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

  useEffect(() => {
    const handleScroll = () => {
      setHeaderBlurred(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
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
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBlurred ? 'header-blur' : ''}`}>
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PS</span>
            </div>
            <span className="text-xl font-bold tracking-wider">PANICKIN' SKYWALKER</span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-widest">
            <li>
              <button 
                onClick={() => scrollToSection('home')}
                className="hover:text-primary transition-colors"
                data-testid="nav-home"
              >
                HOME
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('music')}
                className="hover:text-primary transition-colors"
                data-testid="nav-music"
              >
                MUSIC
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('band')}
                className="hover:text-primary transition-colors"
                data-testid="nav-band"
              >
                BAND
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('tour')}
                className="hover:text-primary transition-colors"
                data-testid="nav-tour"
              >
                TOUR
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('contact')}
                className="hover:text-primary transition-colors"
                data-testid="nav-contact"
              >
                CONTACT
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="container mx-auto px-4 py-6">
              <ul className="space-y-4 text-center font-semibold tracking-widest">
                <li>
                  <button 
                    onClick={() => scrollToSection('home')}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-home"
                  >
                    HOME
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('music')}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-music"
                  >
                    MUSIC
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('band')}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-band"
                  >
                    BAND
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('tour')}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-tour"
                  >
                    TOUR
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-contact"
                  >
                    CONTACT
                  </button>
                </li>
              </ul>
              <div className="flex justify-center items-center space-x-6 mt-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={social.label}
                    data-testid={`mobile-social-${social.label.toLowerCase()}`}
                  >
                    <social.icon className="text-xl" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold tracking-widest mb-4 glow-pink">
              NEW SINGLE OUT NOW
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wider mb-6 text-gradient">
            PANICKIN'<br />SKYWALKER
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The anxious superheroes of pop-punk are back with their most electrifying release yet
          </p>
          
          {/* Latest Release */}
          <Card className="bg-card border border-border rounded-lg p-6 mb-8 max-w-md mx-auto">
            <CardContent className="p-0">
              <h3 className="text-xl font-bold mb-2">PANIC ATTACK</h3>
              <p className="text-muted-foreground text-sm mb-4">Latest Single</p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
                  data-testid="hero-spotify-button"
                >
                  <SiSpotify className="mr-2 h-4 w-4" />
                  Spotify
                </Button>
                <Button 
                  className="bg-gradient-to-r from-[#fa233b] to-[#fb5c74] hover:from-[#fb5c74] hover:to-[#fa233b] text-white"
                  data-testid="hero-apple-button"
                >
                  <SiApplemusic className="mr-2 h-4 w-4" />
                  Apple Music
                </Button>
                <Button 
                  className="bg-[#FF0000] hover:bg-[#ff3333] text-white"
                  data-testid="hero-youtube-button"
                >
                  <SiYoutube className="mr-2 h-4 w-4" />
                  YouTube
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="animate-bounce">
            <ChevronDown className="text-primary text-2xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Featured Album Section */}
      <section id="music" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-secondary">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full text-lg font-bold tracking-widest mb-6 glow-pink">
              FEATURED ALBUM
            </span>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-wider mb-8 text-gradient">
            INNER SPACE
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            A journey through the depths of millennial consciousness, exploring the space between anxiety and hope
          </p>
          
          {/* Album Cover and Streaming */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-12">
            <div className="relative group">
              <div className="w-80 h-80 md:w-96 md:h-96 rounded-lg overflow-hidden border-4 border-primary group-hover:border-accent transition-colors duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  alt="Inner Space Album Cover"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Play className="text-primary text-6xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-4">STREAM NOW</h3>
              <div className="flex flex-col gap-4 w-64">
                <Button 
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white text-lg py-6"
                  data-testid="inner-space-spotify"
                >
                  <SiSpotify className="mr-3 h-6 w-6" />
                  Listen on Spotify
                </Button>
                <Button 
                  className="bg-[#FF0000] hover:bg-[#ff3333] text-white text-lg py-6"
                  data-testid="inner-space-youtube"
                >
                  <SiYoutube className="mr-3 h-6 w-6" />
                  Watch on YouTube
                </Button>
                <Button 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg py-6"
                  data-testid="inner-space-all-platforms"
                >
                  <Music className="mr-3 h-6 w-6" />
                  All Platforms
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Band Section */}
      <section id="band" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">THE BAND</h2>
            <p className="text-muted-foreground text-lg">Meet the anxious superheroes behind the music</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {bandMembers.map((member, index) => (
              <div key={index} className="text-center group" data-testid={`member-${index}`}>
                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-primary group-hover:border-accent transition-colors duration-300">
                  <img 
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-primary font-semibold mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour Section */}
      <section id="tour" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">TOUR DATES</h2>
            <p className="text-muted-foreground text-lg">Catch us live and experience the anxiety in person</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {tourDates.map((show, index) => (
              <div 
                key={index}
                className={`bg-card border border-border rounded-lg p-6 mb-4 flex flex-col md:flex-row md:items-center justify-between transition-colors ${
                  show.available ? 'hover:border-primary' : 'opacity-60'
                }`}
                data-testid={`tour-${index}`}
              >
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`px-3 py-1 rounded text-sm font-bold ${
                      show.available ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-background'
                    }`}>
                      {show.date}
                    </span>
                    <h3 className="text-xl font-bold">{show.venue}</h3>
                  </div>
                  <p className="text-muted-foreground">{show.location}</p>
                  <p className="text-sm text-muted-foreground mt-1">{show.time}</p>
                </div>
                {show.available ? (
                  <Button 
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    data-testid={`tour-${index}-tickets`}
                  >
                    GET TICKETS
                  </Button>
                ) : (
                  <span className="text-muted-foreground font-semibold">SOLD OUT</span>
                )}
              </div>
            ))}
            
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Want to be the first to know about new tour dates?</p>
              <Button 
                className="bg-accent hover:bg-primary text-accent-foreground"
                onClick={() => scrollToSection('contact')}
                data-testid="tour-mailing-list"
              >
                JOIN OUR MAILING LIST
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">GET IN TOUCH</h2>
            <p className="text-muted-foreground text-lg">Connect with us and join our community of anxious superheroes</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div>
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
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-card border border-border rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                      aria-label={social.label}
                      data-testid={`contact-social-${social.label.toLowerCase()}`}
                    >
                      <social.icon className="text-xl" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <Card className="bg-card border border-border rounded-lg p-8">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold mb-4">JOIN THE SUPERHERO SQUAD</h3>
                <p className="text-muted-foreground mb-6">Get exclusive updates, early access to tickets, and behind-the-scenes content delivered to your inbox.</p>
                
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-accent text-primary-foreground"
                    disabled={newsletterMutation.isPending}
                    data-testid="newsletter-submit"
                  >
                    {newsletterMutation.isPending ? "JOINING..." : "JOIN THE SQUAD"}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                <span className="text-xl font-bold tracking-wider">PANICKIN' SKYWALKER</span>
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
    </div>
  );
}
