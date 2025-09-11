import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Music } from "lucide-react";
import {
  SiSpotify,
  SiApplemusic,
  SiYoutube,
  SiInstagram,
  SiTiktok,
  SiDiscord,
} from "react-icons/si";

interface NewsletterSignup {
  email: string;
  name?: string;
  wantsUpdates: boolean;
}

export default function Contact() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [wantsUpdates, setWantsUpdates] = useState(false);
  const { toast } = useToast();

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
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">
            GET IN TOUCH
          </h2>
          <p className="text-muted-foreground text-lg">
            Connect with us and join our community of anxious superheroes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
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
                  <p className="text-muted-foreground">
                    Join our Discord server for exclusive content and to connect with other fans
                  </p>
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
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card border border-border p-8">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold mb-4">JOIN THE SUPERHERO SQUAD</h3>
                <p className="text-muted-foreground mb-6">
                  Get exclusive updates, early access to tickets, and behind-the-scenes content delivered to your inbox.
                </p>

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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
