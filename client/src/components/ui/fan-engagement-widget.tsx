import { motion } from "framer-motion";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  ExternalLink,
  Heart,
  Star
} from "lucide-react";
import { SiDiscord, SiInstagram, SiTiktok } from "react-icons/si";

interface FanEngagementWidgetProps {
  className?: string;
}

export function FanEngagementWidget({ className = "" }: FanEngagementWidgetProps) {
  const engagementStats = [
    { 
      icon: Users, 
      label: "Active This Week", 
      value: "12.4K", 
      color: "text-blue-400",
      bgColor: "bg-blue-500/20" 
    },
    { 
      icon: Heart, 
      label: "Fan Love", 
      value: "98%", 
      color: "text-pink-400",
      bgColor: "bg-pink-500/20" 
    },
    { 
      icon: TrendingUp, 
      label: "Growing Daily", 
      value: "+847", 
      color: "text-green-400",
      bgColor: "bg-green-500/20" 
    },
  ];

  const communityLinks = [
    {
      icon: SiDiscord,
      label: "Discord Community",
      description: "Join 23K+ fans for exclusive content & daily chats",
      buttonText: "Join Discord",
      href: "https://discord.gg/example",
      color: "hover:border-indigo-400"
    },
    {
      icon: SiInstagram,
      label: "Behind the Scenes",
      description: "Daily stories, studio sessions & band life",
      buttonText: "Follow @panickin",
      href: "https://instagram.com/example",
      color: "hover:border-pink-400"
    },
    {
      icon: SiTiktok,
      label: "TikTok Exclusives",
      description: "Funny moments, covers & fan challenges",
      buttonText: "Follow TikTok",
      href: "https://tiktok.com/example", 
      color: "hover:border-white"
    }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Community Stats */}
      <div className="grid grid-cols-3 gap-4">
        {engagementStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-card/50 border border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className={`p-3 rounded-full ${stat.bgColor} w-fit mx-auto mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Community Links */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-center text-gradient mb-6">
          Connect with the Community
        </h4>
        
        {communityLinks.map((link, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className={`bg-card/30 border border-border ${link.color} transition-colors cursor-pointer hover:bg-card/50`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <link.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm">{link.label}</h5>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary-foreground hover:bg-primary"
                    onClick={() => window.open(link.href, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Fan Spotlight */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20">
        <CardContent className="p-6 text-center">
          <Star className="h-8 w-8 text-primary mx-auto mb-3" />
          <h4 className="text-lg font-bold text-gradient mb-2">
            Fan of the Week
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Tag us in your Panickin' Skywalker content for a chance to be featured!
          </p>
          <Button 
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => window.open('https://instagram.com/example', '_blank')}
          >
            Share Your Story
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}