import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LazyImage } from "@/components/ui/lazy-image";
import { 
  TrendingUp, 
  Flame, 
  Users, 
  Share2, 
  Heart, 
  MessageCircle,
  Play,
  Eye,
  Clock,
  Award,
  Target,
  Rocket,
  Zap,
  Star
} from "lucide-react";
import { SiTiktok, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ViralMoment {
  id: string;
  title: string;
  description: string;
  platform: 'tiktok' | 'instagram' | 'twitter' | 'youtube';
  contentType: 'video' | 'image' | 'text' | 'audio';
  mediaUrl?: string;
  thumbnailUrl: string;
  createdAt: string;
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    saves?: number;
    engagementRate: number;
    viralScore: number; // 0-100
    growthRate: number; // percentage growth in last 24h
  };
  hashtags: string[];
  isActive: boolean;
  peakTime?: string;
  estimatedReach: number;
  audienceDemographics: {
    ageGroups: { [key: string]: number };
    locations: { [key: string]: number };
    interests: string[];
  };
  tiktokPotential: number; // 0-100
  shareableQuotes?: string[];
}

// Mock viral moments data
const mockViralMoments: ViralMoment[] = [
  {
    id: "1",
    title: "Alex's Anxiety Attack on Stage Goes Viral",
    description: "Raw, honest moment during 'Superhero Complex' performance resonates with millions",
    platform: "tiktok",
    contentType: "video",
    thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    createdAt: "2024-03-10T15:30:00Z",
    metrics: {
      views: 2400000,
      likes: 456000,
      shares: 89000,
      comments: 23400,
      saves: 67000,
      engagementRate: 18.7,
      viralScore: 94,
      growthRate: 340
    },
    hashtags: ["AnxietyIsReal", "MentalHealthMatters", "PanickinSkywalker", "Authentic", "Vulnerable"],
    isActive: true,
    peakTime: "2024-03-10T20:15:00Z",
    estimatedReach: 15000000,
    audienceDemographics: {
      ageGroups: { "16-24": 45, "25-34": 35, "35-44": 15, "45+": 5 },
      locations: { "US": 60, "UK": 15, "Canada": 10, "Australia": 8, "Other": 7 },
      interests: ["Mental Health", "Music", "Pop Punk", "Concerts", "Authenticity"]
    },
    tiktokPotential: 98,
    shareableQuotes: [
      "It's okay to not be okay - even on stage",
      "Anxiety doesn't make you weak, it makes you human",
      "Sometimes the most powerful moments are the most vulnerable ones"
    ]
  },
  {
    id: "2", 
    title: "Penny's Guitar Solo Behind-the-Head Trick",
    description: "Guitar trick goes wrong in the most perfect way, creating instant meme material",
    platform: "instagram",
    contentType: "video",
    thumbnailUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    createdAt: "2024-03-08T12:15:00Z",
    metrics: {
      views: 890000,
      likes: 123000,
      shares: 34000,
      comments: 8900,
      saves: 45000,
      engagementRate: 22.3,
      viralScore: 78,
      growthRate: 156
    },
    hashtags: ["GuitarFail", "BehindTheScenes", "PennyPanick", "MusicMemes", "Authentic"],
    isActive: true,
    estimatedReach: 4500000,
    audienceDemographics: {
      ageGroups: { "16-24": 55, "25-34": 30, "35-44": 12, "45+": 3 },
      locations: { "US": 50, "UK": 20, "Canada": 12, "Australia": 10, "Other": 8 },
      interests: ["Guitar", "Music", "Comedy", "Behind the Scenes", "Musicians"]
    },
    tiktokPotential: 85,
    shareableQuotes: [
      "When your guitar skills exceed your coordination 😅",
      "Practice makes... interesting content",
      "Not all heroes wear capes, some just drop their guitars"
    ]
  },
  {
    id: "3",
    title: "Fan Covers 'Panic Attack' in Sign Language",
    description: "Deaf fan's ASL cover creates beautiful accessibility moment, gets band's attention",
    platform: "tiktok",
    contentType: "video", 
    thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    createdAt: "2024-03-06T18:45:00Z",
    metrics: {
      views: 1200000,
      likes: 234000,
      shares: 67000,
      comments: 12000,
      saves: 89000,
      engagementRate: 25.1,
      viralScore: 87,
      growthRate: 89
    },
    hashtags: ["ASL", "SignLanguage", "Accessibility", "InclusiveMusic", "PanickinSkywalker"],
    isActive: false,
    estimatedReach: 6800000,
    audienceDemographics: {
      ageGroups: { "16-24": 40, "25-34": 35, "35-44": 20, "45+": 5 },
      locations: { "US": 65, "UK": 12, "Canada": 8, "Australia": 7, "Other": 8 },
      interests: ["Sign Language", "Accessibility", "Music", "Inclusion", "Community"]
    },
    tiktokPotential: 92,
    shareableQuotes: [
      "Music has no barriers when we make it accessible",
      "Every fan deserves to feel the music",
      "This is what inclusive community looks like"
    ]
  }
];

interface ViralMomentsTrackerProps {
  showMetrics?: boolean;
  maxMoments?: number;
  className?: string;
}

export function ViralMomentsTracker({
  showMetrics = true,
  maxMoments = 3,
  className = ""
}: ViralMomentsTrackerProps) {
  const [selectedMoment, setSelectedMoment] = useState<ViralMoment | null>(null);
  const [sortBy, setSortBy] = useState<'viralScore' | 'views' | 'engagement' | 'recent'>('viralScore');

  // Fetch viral moments
  const { data: viralMoments, isLoading } = useQuery({
    queryKey: ["viral-moments"],
    queryFn: async () => {
      // In real implementation, this would call your analytics API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockViralMoments.slice(0, maxMoments);
    },
    refetchInterval: 30000 // Update every 30 seconds for live tracking
  });

  const sortedMoments = viralMoments?.sort((a, b) => {
    switch (sortBy) {
      case 'viralScore':
        return b.metrics.viralScore - a.metrics.viralScore;
      case 'views':
        return b.metrics.views - a.metrics.views;
      case 'engagement':
        return b.metrics.engagementRate - a.metrics.engagementRate;
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const getPlatformIcon = (platform: ViralMoment['platform']) => {
    switch (platform) {
      case 'tiktok': return SiTiktok;
      case 'instagram': return SiInstagram;
      case 'twitter': return SiX;
      case 'youtube': return SiYoutube;
    }
  };

  const getPlatformColor = (platform: ViralMoment['platform']) => {
    switch (platform) {
      case 'tiktok': return 'text-black';
      case 'instagram': return 'text-pink-500';
      case 'twitter': return 'text-blue-500';
      case 'youtube': return 'text-red-500';
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-500';
    if (score >= 70) return 'text-orange-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="w-48 h-6 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-20 h-20 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="w-full h-4 bg-muted rounded" />
                  <div className="w-2/3 h-4 bg-muted rounded" />
                  <div className="flex gap-2">
                    <div className="w-16 h-6 bg-muted rounded" />
                    <div className="w-16 h-6 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gradient">Viral Moments Tracker</h2>
            <p className="text-muted-foreground">Real-time tracking of your viral content</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          {[
            { value: 'viralScore', label: 'Viral Score', icon: Flame },
            { value: 'views', label: 'Views', icon: Eye },
            { value: 'engagement', label: 'Engagement', icon: Heart },
            { value: 'recent', label: 'Recent', icon: Clock }
          ].map((option) => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(option.value as any)}
              className="text-xs"
            >
              <option.icon className="mr-1 h-3 w-3" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Viral Moments List */}
      <div className="space-y-4">
        {sortedMoments?.map((moment, index) => {
          const PlatformIcon = getPlatformIcon(moment.platform);
          
          return (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                moment.isActive ? 'ring-2 ring-red-200 border-red-300' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative">
                      <LazyImage
                        src={moment.thumbnailUrl}
                        alt={moment.title}
                        className="w-24 h-24 rounded-lg object-cover"
                        width={96}
                        height={96}
                      />
                      
                      {/* Platform Badge */}
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center`}>
                        <PlatformIcon className={`h-3 w-3 ${getPlatformColor(moment.platform)}`} />
                      </div>
                      
                      {/* Active Indicator */}
                      {moment.isActive && (
                        <div className="absolute -bottom-1 -left-1">
                          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                          {moment.title}
                          {moment.metrics.viralScore >= 90 && (
                            <Badge className="bg-red-500 text-white">
                              <Flame className="mr-1 h-3 w-3" />
                              VIRAL
                            </Badge>
                          )}
                        </h3>
                        <p className="text-muted-foreground text-sm">{moment.description}</p>
                      </div>

                      {/* Metrics Grid */}
                      {showMetrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-2 bg-secondary/30 rounded">
                            <Eye className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                            <div className="font-bold text-sm">{formatNumber(moment.metrics.views)}</div>
                            <div className="text-xs text-muted-foreground">Views</div>
                          </div>
                          <div className="text-center p-2 bg-secondary/30 rounded">
                            <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                            <div className="font-bold text-sm">{formatNumber(moment.metrics.likes)}</div>
                            <div className="text-xs text-muted-foreground">Likes</div>
                          </div>
                          <div className="text-center p-2 bg-secondary/30 rounded">
                            <Share2 className="h-4 w-4 mx-auto mb-1 text-green-500" />
                            <div className="font-bold text-sm">{formatNumber(moment.metrics.shares)}</div>
                            <div className="text-xs text-muted-foreground">Shares</div>
                          </div>
                          <div className="text-center p-2 bg-secondary/30 rounded">
                            <TrendingUp className={`h-4 w-4 mx-auto mb-1 ${getViralScoreColor(moment.metrics.viralScore)}`} />
                            <div className="font-bold text-sm">{moment.metrics.viralScore}/100</div>
                            <div className="text-xs text-muted-foreground">Viral Score</div>
                          </div>
                        </div>
                      )}

                      {/* Progress Bars */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Viral Score</span>
                          <span className={`font-bold ${getViralScoreColor(moment.metrics.viralScore)}`}>
                            {moment.metrics.viralScore}/100
                          </span>
                        </div>
                        <Progress value={moment.metrics.viralScore} className="h-2" />
                        
                        <div className="flex items-center justify-between text-sm">
                          <span>TikTok Potential</span>
                          <span className="font-bold">{moment.tiktokPotential}/100</span>
                        </div>
                        <Progress value={moment.tiktokPotential} className="h-2" />
                      </div>

                      {/* Tags & Metrics */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {moment.hashtags.slice(0, 3).map((hashtag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              #{hashtag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {moment.metrics.growthRate > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-3 w-3" />
                              +{moment.metrics.growthRate}% (24h)
                            </div>
                          )}
                          <span>{formatTimeAgo(moment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {selectedMoment?.id === moment.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 pt-6 border-t border-border space-y-4"
                    >
                      {/* Audience Demographics */}
                      <div>
                        <h4 className="font-semibold mb-3">Audience Breakdown</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Age Groups</h5>
                            <div className="space-y-2">
                              {Object.entries(moment.audienceDemographics.ageGroups).map(([age, percentage]) => (
                                <div key={age} className="flex items-center justify-between">
                                  <span className="text-sm">{age}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={percentage} className="w-16 h-2" />
                                    <span className="text-sm font-medium">{percentage}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Top Locations</h5>
                            <div className="space-y-2">
                              {Object.entries(moment.audienceDemographics.locations).map(([location, percentage]) => (
                                <div key={location} className="flex items-center justify-between">
                                  <span className="text-sm">{location}</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={percentage} className="w-16 h-2" />
                                    <span className="text-sm font-medium">{percentage}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shareable Quotes */}
                      {moment.shareableQuotes && (
                        <div>
                          <h4 className="font-semibold mb-3">Shareable Quotes</h4>
                          <div className="space-y-2">
                            {moment.shareableQuotes.map((quote, i) => (
                              <Card key={i} className="bg-secondary/30">
                                <CardContent className="p-3">
                                  <p className="text-sm italic">"{quote}"</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-6 text-xs"
                                    onClick={() => navigator.clipboard.writeText(quote)}
                                  >
                                    Copy Quote
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Toggle Details Button */}
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMoment(selectedMoment?.id === moment.id ? null : moment)}
                    >
                      {selectedMoment?.id === moment.id ? 'Show Less' : 'Show Details'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {viralMoments && viralMoments.length > 0 && (
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-200/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Viral Performance Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500 mb-1">
                    {viralMoments.filter(m => m.metrics.viralScore >= 90).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Viral Moments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500 mb-1">
                    {formatNumber(viralMoments.reduce((sum, m) => sum + m.metrics.views, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    {formatNumber(viralMoments.reduce((sum, m) => sum + m.estimatedReach, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500 mb-1">
                    {viralMoments.filter(m => m.isActive).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Currently Trending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}