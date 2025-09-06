import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstagramFeed } from "@/components/social/instagram-feed";
import { FanPhotoSubmission } from "@/components/social/fan-photo-submission";
import { DiscordWidget } from "@/components/social/discord-widget";
import { SocialSharingWidget } from "@/components/social/social-sharing-widget";
import { ViralMomentsTracker } from "@/components/social/viral-moments-tracker";
import {
  Share2,
  Users,
  Camera,
  MessageSquare,
  TrendingUp,
  Heart,
  Hash,
  ExternalLink,
  Sparkles,
  Target
} from "lucide-react";
import { SiTiktok, SiInstagram, SiDiscord, SiX } from "react-icons/si";

export default function Social() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gradient">
                  SOCIAL HUB
                </h1>
              </div>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your central hub for all things social - from viral TikToks to community moments,
                we're connecting anxious superheroes across every platform.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <SiTiktok className="mr-2 h-4 w-4" />
                  2.4M TikTok Views
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <SiInstagram className="mr-2 h-4 w-4" />
                  156K IG Followers
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <SiDiscord className="mr-2 h-4 w-4" />
                  15.6K Community
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Heart className="mr-2 h-4 w-4" />
                  94% Engagement
                </Badge>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  className="bg-black hover:bg-gray-800 text-white"
                  onClick={() => window.open("https://tiktok.com/@panickinskywalker", "_blank")}
                >
                  <SiTiktok className="mr-2 h-4 w-4" />
                  Follow on TikTok
                </Button>
                <Button 
                  variant="outline"
                  className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                  onClick={() => window.open("https://instagram.com/panickinskywalker", "_blank")}
                >
                  <SiInstagram className="mr-2 h-4 w-4" />
                  Follow on Instagram
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="viral" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Viral</span>
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <SiInstagram className="h-4 w-4" />
              <span className="hidden sm:inline">Instagram</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <SiDiscord className="h-4 w-4" />
              <span className="hidden sm:inline">Discord</span>
            </TabsTrigger>
            <TabsTrigger value="fan-photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Fan Photos</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <SiTiktok className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-2xl mb-1">2.4M</h3>
                  <p className="text-muted-foreground text-sm">TikTok Views</p>
                  <Badge variant="secondary" className="mt-2 text-xs">+340% this week</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <SiInstagram className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="font-bold text-2xl mb-1">156K</h3>
                  <p className="text-muted-foreground text-sm">Instagram Followers</p>
                  <Badge variant="secondary" className="mt-2 text-xs">+12% this month</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <SiDiscord className="h-6 w-6 text-indigo-500" />
                  </div>
                  <h3 className="font-bold text-2xl mb-1">15.6K</h3>
                  <p className="text-muted-foreground text-sm">Discord Members</p>
                  <Badge variant="secondary" className="mt-2 text-xs">2.8K online now</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="font-bold text-2xl mb-1">94%</h3>
                  <p className="text-muted-foreground text-sm">Engagement Rate</p>
                  <Badge variant="secondary" className="mt-2 text-xs">Industry leading</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Featured Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latest Viral Moments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    Latest Viral Moments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ViralMomentsTracker maxMoments={2} showMetrics={false} />
                </CardContent>
              </Card>

              {/* Discord Community Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SiDiscord className="h-5 w-5 text-indigo-500" />
                    Community Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DiscordWidget compact={true} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Instagram Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SiInstagram className="h-5 w-5 text-pink-500" />
                  Recent Instagram Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InstagramFeed maxPosts={3} showTikTokPotential={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viral">
            <ViralMomentsTracker showMetrics={true} maxMoments={10} />
          </TabsContent>

          <TabsContent value="instagram">
            <InstagramFeed 
              maxPosts={12} 
              showTikTokPotential={true}
              hashtag="PanickinSkywalker"
            />
          </TabsContent>

          <TabsContent value="community">
            <DiscordWidget 
              showMembers={true}
              showChannels={true} 
              showEvents={true}
              compact={false}
            />
          </TabsContent>

          <TabsContent value="fan-photos">
            <FanPhotoSubmission 
              showFeatured={true}
              maxFeatured={12}
            />
          </TabsContent>

          <TabsContent value="share">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Share Your Favorite Moments</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Help spread the anxious superhero energy! Our sharing tools are optimized for maximum reach and engagement across all platforms.
                </p>
              </div>
              
              <SocialSharingWidget 
                showStats={true}
                showPreview={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-pink-500/5 to-purple-500/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of the anxious superhero community across all platforms. Share your moments, 
              connect with fellow fans, and help us create viral content that matters.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => window.open("https://tiktok.com/@panickinskywalker", "_blank")}
              >
                <SiTiktok className="mr-2 h-4 w-4" />
                Follow on TikTok
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                onClick={() => window.open("https://instagram.com/panickinskywalker", "_blank")}
              >
                <SiInstagram className="mr-2 h-4 w-4" />
                Follow on Instagram
              </Button>
              <Button 
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={() => window.open("https://discord.gg/panickinskywalker", "_blank")}
              >
                <SiDiscord className="mr-2 h-4 w-4" />
                Join Discord
              </Button>
              <Button 
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                onClick={() => window.open("https://twitter.com/panickinskywalker", "_blank")}
              >
                <SiX className="mr-2 h-4 w-4" />
                Follow on Twitter
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}