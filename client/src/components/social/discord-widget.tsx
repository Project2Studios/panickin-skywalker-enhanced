import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageCircle, 
  Mic, 
  Volume2, 
  Crown, 
  Headphones,
  UserCheck,
  Activity,
  ExternalLink,
  Hash,
  Calendar,
  Music,
  GamepadIcon as Game,
  Coffee
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DiscordMember {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activity?: {
    name: string;
    type: 'playing' | 'listening' | 'watching' | 'custom';
  };
  isBot: boolean;
  roles: string[];
  joinedAt: string;
}

interface DiscordChannel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  memberCount?: number;
  isActive?: boolean;
}

interface DiscordEvent {
  id: string;
  name: string;
  description: string;
  scheduledStartTime: string;
  memberCount: number;
  coverImage?: string;
}

interface DiscordStats {
  memberCount: number;
  onlineCount: number;
  totalMessages: number;
  activeChannels: number;
  serverBoosts: number;
}

// Mock data for demonstration
const mockDiscordStats: DiscordStats = {
  memberCount: 15673,
  onlineCount: 2847,
  totalMessages: 125690,
  activeChannels: 12,
  serverBoosts: 47
};

const mockDiscordMembers: DiscordMember[] = [
  {
    id: "1",
    username: "alex_skywalker",
    discriminator: "0001",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    status: "online",
    activity: {
      name: "Recording in Studio",
      type: "custom"
    },
    isBot: false,
    roles: ["Band Member", "Admin"],
    joinedAt: "2021-01-01T00:00:00Z"
  },
  {
    id: "2", 
    username: "penny_panick",
    discriminator: "0002",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    status: "online",
    activity: {
      name: "Practicing Guitar",
      type: "custom"
    },
    isBot: false,
    roles: ["Band Member", "Moderator"],
    joinedAt: "2021-01-01T00:00:00Z"
  },
  {
    id: "3",
    username: "anxious_fan_247",
    discriminator: "4567",
    status: "online",
    activity: {
      name: "Listening to PANIC ATTACK",
      type: "listening"
    },
    isBot: false,
    roles: ["Superhero"],
    joinedAt: "2024-03-01T00:00:00Z"
  },
  {
    id: "4",
    username: "super_sarah",
    discriminator: "8901",
    status: "idle",
    activity: {
      name: "Creating Fan Art",
      type: "custom"
    },
    isBot: false,
    roles: ["Artist", "Superhero"],
    joinedAt: "2023-11-15T00:00:00Z"
  },
  {
    id: "5",
    username: "concert_hunter",
    discriminator: "2345",
    status: "dnd",
    activity: {
      name: "Buying Concert Tickets",
      type: "custom"
    },
    isBot: false,
    roles: ["Concert Goer", "Superhero"],
    joinedAt: "2023-08-22T00:00:00Z"
  }
];

const mockDiscordChannels: DiscordChannel[] = [
  { id: "1", name: "general", type: "text", memberCount: 234, isActive: true },
  { id: "2", name: "new-music-discussion", type: "text", memberCount: 89, isActive: true },
  { id: "3", name: "concert-meetups", type: "text", memberCount: 156, isActive: false },
  { id: "4", name: "fan-art", type: "text", memberCount: 67, isActive: true },
  { id: "5", name: "anxiety-support", type: "text", memberCount: 203, isActive: false },
  { id: "6", name: "listening-party", type: "voice", memberCount: 12, isActive: true },
  { id: "7", name: "band-hangout", type: "voice", memberCount: 3, isActive: true }
];

const mockDiscordEvents: DiscordEvent[] = [
  {
    id: "1",
    name: "Listening Party: New Single Premiere",
    description: "Join us for the exclusive premiere of our latest track! 🎵",
    scheduledStartTime: "2024-03-15T20:00:00Z",
    memberCount: 347,
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
  },
  {
    id: "2",
    name: "Fan Art Showcase & Contest",
    description: "Show off your creativity! Winners get signed merch 🎨",
    scheduledStartTime: "2024-03-18T19:00:00Z",
    memberCount: 156,
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
  }
];

interface DiscordWidgetProps {
  serverId?: string;
  showMembers?: boolean;
  showChannels?: boolean;
  showEvents?: boolean;
  compact?: boolean;
  className?: string;
}

export function DiscordWidget({
  serverId = "panickin-skywalker-official",
  showMembers = true,
  showChannels = true,
  showEvents = true,
  compact = false,
  className = ""
}: DiscordWidgetProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'channels' | 'events'>('overview');

  // Fetch Discord server data
  const { data: discordData, isLoading } = useQuery({
    queryKey: ["discord", serverId],
    queryFn: async () => {
      // In real implementation, this would call Discord API or your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        stats: mockDiscordStats,
        members: mockDiscordMembers,
        channels: mockDiscordChannels,
        events: mockDiscordEvents
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getStatusColor = (status: DiscordMember['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'playing': return <Game className="h-3 w-3" />;
      case 'listening': return <Headphones className="h-3 w-3" />;
      case 'watching': return <Activity className="h-3 w-3" />;
      default: return <Coffee className="h-3 w-3" />;
    }
  };

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="w-32 h-6 bg-muted rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, members, channels, events } = discordData || {};

  if (compact) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <SiDiscord className="text-2xl text-indigo-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h3 className="font-bold">Discord Community</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.onlineCount.toLocaleString()} online • {stats?.memberCount.toLocaleString()} members
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full bg-indigo-500 hover:bg-indigo-600"
            onClick={() => window.open("https://discord.gg/panickinskywalker", "_blank")}
          >
            <SiDiscord className="mr-2 h-4 w-4" />
            Join Server
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SiDiscord className="text-3xl text-indigo-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Anxious Superheroes Discord
                <Badge variant="secondary" className="text-xs">
                  Level {Math.floor((stats?.serverBoosts || 0) / 10) + 1}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Official fan community server
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => window.open("https://discord.gg/panickinskywalker", "_blank")}
            className="hover:border-indigo-500 hover:text-indigo-500"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Join
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Server Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{stats?.onlineCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <UserCheck className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{stats?.memberCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <MessageCircle className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <div className="text-lg font-bold">{(stats?.totalMessages || 0) > 999 ? `${Math.floor((stats?.totalMessages || 0) / 1000)}K` : stats?.totalMessages}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <Crown className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold">{stats?.serverBoosts}</div>
            <div className="text-xs text-muted-foreground">Boosts</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-4 bg-secondary/30 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'channels', label: 'Channels', icon: Hash },
            { id: 'events', label: 'Events', icon: Calendar }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 h-8"
            >
              <tab.icon className="mr-1 h-3 w-3" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[200px]"
          >
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Active Channels Preview */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Active Channels
                    </h4>
                    <div className="space-y-2">
                      {channels?.filter(c => c.isActive).slice(0, 3).map((channel) => (
                        <div key={channel.id} className="flex items-center gap-2 text-sm p-2 bg-secondary/20 rounded">
                          {channel.type === 'voice' ? (
                            <Volume2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Hash className="h-3 w-3 text-blue-500" />
                          )}
                          <span>#{channel.name}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {channel.memberCount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Events */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Upcoming Events
                    </h4>
                    <div className="space-y-2">
                      {events?.slice(0, 2).map((event) => (
                        <div key={event.id} className="p-2 bg-secondary/20 rounded">
                          <div className="text-sm font-medium">{event.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatEventTime(event.scheduledStartTime)} • {event.memberCount} interested
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-3">
                <h4 className="font-semibold">Online Members</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members?.filter(m => m.status === 'online').map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-secondary/20 rounded">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{member.username}</span>
                          {member.roles.includes("Band Member") && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        {member.activity && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getActivityIcon(member.activity.type)}
                            <span className="truncate">{member.activity.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'channels' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Text Channels
                    </h4>
                    <div className="space-y-1">
                      {channels?.filter(c => c.type === 'text').map((channel) => (
                        <div key={channel.id} className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">#{channel.name}</span>
                            {channel.isActive && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {channel.memberCount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Voice Channels
                    </h4>
                    <div className="space-y-1">
                      {channels?.filter(c => c.type === 'voice').map((channel) => (
                        <div key={channel.id} className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-3 w-3 text-green-500" />
                            <span className="text-sm">{channel.name}</span>
                            {channel.isActive && (
                              <Mic className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {channel.memberCount || 0}/{channel.memberCount ? Math.max(channel.memberCount + 5, 10) : 10}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {events?.map((event) => (
                  <div key={event.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {event.coverImage && (
                        <img 
                          src={event.coverImage} 
                          alt={event.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{event.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatEventTime(event.scheduledStartTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.memberCount} interested
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Join CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-200/20">
          <div className="text-center">
            <h4 className="font-semibold mb-2">Join Our Community!</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with fellow anxious superheroes, get exclusive updates, and hang out with the band!
            </p>
            <Button 
              className="bg-indigo-500 hover:bg-indigo-600 w-full"
              onClick={() => window.open("https://discord.gg/panickinskywalker", "_blank")}
            >
              <SiDiscord className="mr-2 h-4 w-4" />
              Join Discord Server
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}