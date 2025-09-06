import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  Play,
  Camera,
  Hash,
  Instagram,
  TrendingUp
} from "lucide-react";
import { SiInstagram, SiTiktok } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface InstagramPost {
  id: string;
  caption: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  hashtags: string[];
  is_viral?: boolean;
  tiktok_potential?: boolean;
}

interface InstagramFeedProps {
  hashtag?: string;
  maxPosts?: number;
  showTikTokPotential?: boolean;
  className?: string;
}

// Mock data for demonstration (replace with real Instagram API)
const mockInstagramPosts: InstagramPost[] = [
  {
    id: "1",
    caption: "Live from the studio! Working on something SPECIAL 🎸✨ Can you guess what's coming next? #PanickinSkywalker #StudioLife #NewMusic #AnxiousSuperhero",
    media_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    media_type: "IMAGE",
    permalink: "https://instagram.com/p/example1",
    timestamp: "2024-03-10T15:30:00Z",
    like_count: 2847,
    comments_count: 156,
    hashtags: ["PanickinSkywalker", "StudioLife", "NewMusic", "AnxiousSuperhero"],
    is_viral: true,
    tiktok_potential: true
  },
  {
    id: "2",
    caption: "Behind the scenes: Penny Panick teaching Alex how to do the signature guitar spin 😂 Practice makes perfect (or at least less dizzy) 🎸",
    media_url: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    media_type: "VIDEO",
    permalink: "https://instagram.com/p/example2",
    timestamp: "2024-03-08T12:15:00Z",
    like_count: 4521,
    comments_count: 289,
    hashtags: ["BehindTheScenes", "BandLife", "GuitarTricks"],
    is_viral: false,
    tiktok_potential: true
  },
  {
    id: "3",
    caption: "Fan art Friday! This incredible piece by @anxious_artist captures our energy perfectly 🔥 Tag us in your art for a chance to be featured!",
    media_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    media_type: "IMAGE",
    permalink: "https://instagram.com/p/example3",
    timestamp: "2024-03-06T18:45:00Z",
    like_count: 1967,
    comments_count: 93,
    hashtags: ["FanArtFriday", "PanickinArt", "Community"],
    is_viral: false,
    tiktok_potential: false
  },
  {
    id: "4",
    caption: "Tour rehearsal vibes! Can't wait to bring these songs to life on stage 🎤⚡ Which song are you most excited to hear live?",
    media_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    media_type: "CAROUSEL_ALBUM",
    permalink: "https://instagram.com/p/example4",
    timestamp: "2024-03-04T20:30:00Z",
    like_count: 3234,
    comments_count: 178,
    hashtags: ["TourRehearsal", "LiveMusic", "ComingSoon"],
    is_viral: false,
    tiktok_potential: true
  }
];

export function InstagramFeed({ 
  hashtag = "PanickinSkywalker", 
  maxPosts = 6, 
  showTikTokPotential = true,
  className = "" 
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'viral' | 'tiktok'>('all');

  // Share to TikTok mutation
  const shareToTikTokMutation = useMutation({
    mutationFn: async (post: InstagramPost) => {
      const response = await apiRequest("POST", "/api/social/share-to-tiktok", {
        postId: post.id,
        caption: post.caption,
        mediaUrl: post.media_url
      });
      return response.json();
    }
  });

  useEffect(() => {
    // In a real implementation, this would call the Instagram Basic Display API
    const fetchInstagramPosts = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter posts by hashtag if specified
        const filtered = mockInstagramPosts
          .filter(post => 
            hashtag === "PanickinSkywalker" || 
            post.hashtags.some(tag => tag.toLowerCase().includes(hashtag.toLowerCase()))
          )
          .slice(0, maxPosts);
        
        setPosts(filtered);
        setFilteredPosts(filtered);
      } catch (error) {
        console.error("Failed to fetch Instagram posts:", error);
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, [hashtag, maxPosts]);

  useEffect(() => {
    let filtered = posts;
    
    if (activeFilter === 'viral') {
      filtered = posts.filter(post => post.is_viral);
    } else if (activeFilter === 'tiktok') {
      filtered = posts.filter(post => post.tiktok_potential);
    }
    
    setFilteredPosts(filtered);
  }, [posts, activeFilter]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const handleShare = (post: InstagramPost) => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this post from Panickin' Skywalker!",
        text: post.caption,
        url: post.permalink
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(post.permalink);
    }
  };

  const getEngagementRate = (post: InstagramPost) => {
    if (!post.like_count || !post.comments_count) return 0;
    // Simplified engagement rate calculation
    return ((post.like_count + post.comments_count) / 10000 * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <SiInstagram className="text-2xl text-pink-500" />
          <h3 className="text-2xl font-bold text-gradient">@PanickinSkywalker</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SiInstagram className="text-3xl text-pink-500" />
          <div>
            <h3 className="text-2xl font-bold text-gradient">@PanickinSkywalker</h3>
            <p className="text-muted-foreground">Latest from Instagram</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => window.open("https://instagram.com/panickinskywalker", "_blank")}
          className="hover:border-pink-500 hover:text-pink-500"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Follow on IG
        </Button>
      </div>

      {/* Filters */}
      {showTikTokPotential && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="text-xs"
          >
            All Posts
          </Button>
          <Button
            variant={activeFilter === 'viral' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('viral')}
            className="text-xs"
          >
            <TrendingUp className="mr-1 h-3 w-3" />
            Viral
          </Button>
          <Button
            variant={activeFilter === 'tiktok' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('tiktok')}
            className="text-xs"
          >
            <SiTiktok className="mr-1 h-3 w-3" />
            TikTok Worthy
          </Button>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              layout
            >
              <Card 
                className="overflow-hidden cursor-pointer group hover:border-pink-500/50 transition-all duration-300"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative aspect-square">
                  <LazyImage
                    src={post.media_url}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={300}
                    height={300}
                  />
                  
                  {/* Media Type Indicator */}
                  <div className="absolute top-3 right-3">
                    {post.media_type === 'VIDEO' && (
                      <div className="bg-black/70 text-white p-1 rounded-full">
                        <Play className="h-3 w-3" />
                      </div>
                    )}
                    {post.media_type === 'CAROUSEL_ALBUM' && (
                      <div className="bg-black/70 text-white p-1 rounded-full">
                        <Camera className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    {post.is_viral && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        🔥 VIRAL
                      </div>
                    )}
                    {post.tiktok_potential && showTikTokPotential && (
                      <div className="bg-black text-white px-2 py-1 rounded-full text-xs font-bold">
                        TikTok Ready
                      </div>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{post.like_count?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.comments_count}</span>
                        </div>
                      </div>
                      <p className="text-xs opacity-75">
                        {getEngagementRate(post)}% engagement
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Instagram className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No posts found for the current filter.</p>
        </div>
      )}

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="flex-1 max-w-lg">
                <LazyImage
                  src={selectedPost.media_url}
                  alt={selectedPost.caption}
                  className="w-full h-full object-cover"
                  width={400}
                  height={400}
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <SiInstagram className="text-2xl text-pink-500" />
                    <div>
                      <h4 className="font-bold">@PanickinSkywalker</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(selectedPost.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPost(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <p className="mb-4 leading-relaxed">{selectedPost.caption}</p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedPost.hashtags.map((hashtag, i) => (
                      <span key={i} className="text-primary text-sm">
                        #{hashtag}
                      </span>
                    ))}
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 mb-4 p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{selectedPost.like_count?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span>{selectedPost.comments_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{getEngagementRate(selectedPost)}% rate</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedPost.permalink, "_blank")}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Instagram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedPost)}
                    className="flex-1"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  {selectedPost.tiktok_potential && (
                    <Button
                      size="sm"
                      onClick={() => shareToTikTokMutation.mutate(selectedPost)}
                      disabled={shareToTikTokMutation.isPending}
                      className="flex-1 bg-black hover:bg-black/90"
                    >
                      <SiTiktok className="mr-2 h-4 w-4" />
                      {shareToTikTokMutation.isPending ? "Sharing..." : "Share to TikTok"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}