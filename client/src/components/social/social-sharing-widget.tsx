import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Share2, 
  Copy, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Download,
  Camera,
  Sparkles,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Music,
  Video,
  Hash,
  AtSign
} from "lucide-react";
import { 
  SiTiktok, 
  SiInstagram, 
  SiX, 
  SiFacebook, 
  SiSnapchat,
  SiWhatsapp,
  SiTelegram
} from "react-icons/si";

interface ShareableContent {
  id: string;
  type: 'song' | 'album' | 'concert' | 'fan-photo' | 'announcement' | 'merch';
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  hashtags: string[];
  tiktokOptimized: boolean;
  instagramOptimized: boolean;
  stats?: {
    shares: number;
    likes: number;
    comments: number;
  };
}

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  isOptimal: boolean;
  format: 'square' | 'vertical' | 'horizontal';
  maxChars?: number;
  features: string[];
}

// Platform configurations for optimal sharing
const sharePlatforms: SharePlatform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: SiTiktok,
    color: 'bg-black hover:bg-gray-800',
    isOptimal: true,
    format: 'vertical',
    maxChars: 150,
    features: ['Video-first', 'Viral potential', 'Gen Z audience', 'Music discovery']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: SiInstagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    isOptimal: true,
    format: 'square',
    maxChars: 125,
    features: ['Visual-first', 'Stories', 'Reels', 'High engagement']
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: SiX,
    color: 'bg-blue-500 hover:bg-blue-600',
    isOptimal: false,
    format: 'horizontal',
    maxChars: 280,
    features: ['News sharing', 'Real-time', 'Link sharing', 'Conversations']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: SiFacebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    isOptimal: false,
    format: 'horizontal',
    maxChars: 400,
    features: ['Event sharing', 'Community groups', 'Older demographics']
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: SiSnapchat,
    color: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    isOptimal: true,
    format: 'vertical',
    features: ['Stories', 'AR filters', 'Young audience', 'Ephemeral']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: SiWhatsapp,
    color: 'bg-green-500 hover:bg-green-600',
    isOptimal: false,
    format: 'square',
    features: ['Direct sharing', 'Group chats', 'Personal networks']
  }
];

// Mock shareable content
const mockShareableContent: ShareableContent[] = [
  {
    id: 'panic-attack-single',
    type: 'song',
    title: 'PANIC ATTACK - New Single',
    description: 'Our anxious anthem is here! Stream PANIC ATTACK now 🎸⚡',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    url: 'https://panickinskywalker.com/panic-attack',
    hashtags: ['PanickinSkywalker', 'PanicAttack', 'NewMusic', 'PopPunk', 'AnxiousSuperhero'],
    tiktokOptimized: true,
    instagramOptimized: true,
    stats: {
      shares: 2847,
      likes: 15690,
      comments: 456
    }
  },
  {
    id: 'tour-announcement',
    type: 'concert',
    title: 'TOUR DATES ANNOUNCED!',
    description: 'We\'re coming to a city near you! Get your tickets before they\'re gone 🎟️',
    imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    url: 'https://panickinskywalker.com/tour',
    hashtags: ['PanickinTour', 'LiveMusic', 'ConcertTickets', 'AnxiousSuperhero'],
    tiktokOptimized: true,
    instagramOptimized: true,
    stats: {
      shares: 1234,
      likes: 8901,
      comments: 234
    }
  }
];

interface SocialSharingWidgetProps {
  content?: ShareableContent;
  showStats?: boolean;
  showPreview?: boolean;
  className?: string;
}

export function SocialSharingWidget({ 
  content, 
  showStats = true, 
  showPreview = true,
  className = "" 
}: SocialSharingWidgetProps) {
  const [selectedContent, setSelectedContent] = useState<ShareableContent>(
    content || mockShareableContent[0]
  );
  const [customCaption, setCustomCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram']);
  const [showCustomization, setShowCustomization] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { toast } = useToast();

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async (shareData: {
      contentId: string;
      platforms: string[];
      customCaption?: string;
    }) => {
      const response = await apiRequest("POST", "/api/social/share", shareData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Shared Successfully! 🚀",
        description: "Your content has been optimized and shared across selected platforms.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Share Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (content) {
      setSelectedContent(content);
    }
  }, [content]);

  const generateOptimalCaption = (platform: SharePlatform) => {
    const baseCaption = customCaption || selectedContent.description;
    const hashtags = selectedContent.hashtags.slice(0, platform.id === 'instagram' ? 5 : 3);
    const hashtagString = hashtags.map(h => `#${h}`).join(' ');
    
    let caption = `${baseCaption}\n\n${hashtagString}`;
    
    // Platform-specific optimizations
    if (platform.id === 'tiktok') {
      caption = `${baseCaption} 🎵✨\n\n${hashtagString} #FYP #Music #Viral`;
    } else if (platform.id === 'instagram') {
      caption = `${baseCaption}\n\n${hashtagString}\n\n• • •\n#NewMusic #PopPunk #MusicLovers`;
    } else if (platform.id === 'twitter') {
      const shortCaption = baseCaption.substring(0, 200);
      caption = `${shortCaption}\n\n🎸 ${selectedContent.url}\n\n${hashtagString}`;
    }
    
    // Truncate if needed
    if (platform.maxChars && caption.length > platform.maxChars) {
      caption = caption.substring(0, platform.maxChars - 3) + '...';
    }
    
    return caption;
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleShare = async (platform?: SharePlatform) => {
    const platforms = platform ? [platform.id] : selectedPlatforms;
    
    if (platforms.length === 0) {
      toast({
        title: "Select Platforms",
        description: "Please select at least one platform to share to.",
        variant: "destructive"
      });
      return;
    }

    // For web share API (mobile)
    if (platform && navigator.share) {
      try {
        await navigator.share({
          title: selectedContent.title,
          text: generateOptimalCaption(platform),
          url: selectedContent.url
        });
        return;
      } catch (err) {
        // Fall through to manual share
      }
    }

    // Manual sharing
    shareMutation.mutate({
      contentId: selectedContent.id,
      platforms,
      customCaption
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard."
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const getContentIcon = (type: ShareableContent['type']) => {
    switch (type) {
      case 'song': case 'album': return <Music className="h-4 w-4" />;
      case 'concert': return <Camera className="h-4 w-4" />;
      case 'fan-photo': return <ImageIcon className="h-4 w-4" />;
      case 'announcement': return <Sparkles className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Content Selector (if no specific content provided) */}
      {!content && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockShareableContent.map((item) => (
            <Card 
              key={item.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedContent.id === item.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedContent(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getContentIcon(item.type)}
                      <span className="font-semibold text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {item.tiktokOptimized && (
                        <Badge variant="secondary" className="text-xs">TikTok Ready</Badge>
                      )}
                      {item.instagramOptimized && (
                        <Badge variant="secondary" className="text-xs">IG Optimized</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Sharing Interface */}
      <Card>
        <CardContent className="p-6">
          {/* Content Preview */}
          <div className="flex items-start gap-4 mb-6">
            <img 
              src={selectedContent.imageUrl} 
              alt={selectedContent.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">{selectedContent.title}</h3>
              <p className="text-muted-foreground mb-3">{selectedContent.description}</p>
              
              {/* Stats */}
              {showStats && selectedContent.stats && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    <span>{selectedContent.stats.shares}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{selectedContent.stats.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{selectedContent.stats.comments}</span>
                  </div>
                </div>
              )}
              
              {/* Hashtags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedContent.hashtags.slice(0, 4).map((hashtag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    #{hashtag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Choose Platforms</h4>
              <Badge variant="secondary">
                {selectedPlatforms.length} selected
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sharePlatforms.map((platform) => (
                <motion.div
                  key={platform.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedPlatforms.includes(platform.id) 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center mx-auto mb-2`}>
                          <platform.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{platform.name}</span>
                        {platform.isOptimal && (
                          <Badge variant="secondary" className="text-xs mt-1">Optimal</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Custom Caption */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Custom Caption (Optional)</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomization(!showCustomization)}
              >
                {showCustomization ? 'Hide' : 'Customize'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showCustomization && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Textarea
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    placeholder="Add your custom caption here..."
                    className="mb-4"
                    rows={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Share Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleShare()}
              disabled={shareMutation.isPending || selectedPlatforms.length === 0}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {shareMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sharing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
                </div>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => copyToClipboard(selectedContent.url)}
            >
              {copiedUrl ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Platform Previews */}
          {showPreview && selectedPlatforms.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Preview</h4>
              <div className="space-y-4">
                {selectedPlatforms.slice(0, 2).map((platformId) => {
                  const platform = sharePlatforms.find(p => p.id === platformId)!;
                  const previewCaption = generateOptimalCaption(platform);
                  
                  return (
                    <Card key={platformId} className="bg-secondary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-6 h-6 rounded ${platform.color} flex items-center justify-center`}>
                            <platform.icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="font-medium text-sm">{platform.name} Preview</span>
                        </div>
                        <div className="text-sm space-y-2">
                          <p className="whitespace-pre-wrap">{previewCaption}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            <span>{selectedContent.url}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}