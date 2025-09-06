import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Star, 
  Heart, 
  Camera, 
  Instagram,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Hash
} from "lucide-react";
import { SiTiktok, SiInstagram } from "react-icons/si";
import { LazyImage } from "@/components/ui/lazy-image";

interface FanPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  submitterName: string;
  submitterHandle?: string;
  platform?: 'instagram' | 'tiktok' | 'website';
  isApproved: boolean;
  isFeatured: boolean;
  likeCount: number;
  submittedAt: string;
  hashtags: string[];
  location?: string;
  tiktokPotential?: boolean;
  viralScore?: number;
}

interface SubmissionFormData {
  image: File | null;
  caption: string;
  name: string;
  handle: string;
  platform: 'instagram' | 'tiktok' | 'website';
  location: string;
  hashtags: string[];
  agreedToTerms: boolean;
  allowRepost: boolean;
  allowCommercialUse: boolean;
}

// Mock data for featured submissions
const mockFeaturedPhotos: FanPhoto[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    caption: "Concert vibes were UNREAL! Thank you @panickinskywalker for the best night ever 🎸⚡ #PanickinSkywalker #ConcertLife #AnxiousSuperhero",
    submitterName: "Sarah M.",
    submitterHandle: "@sarahmusic",
    platform: "instagram",
    isApproved: true,
    isFeatured: true,
    likeCount: 847,
    submittedAt: "2024-03-10T20:30:00Z",
    hashtags: ["PanickinSkywalker", "ConcertLife", "AnxiousSuperhero"],
    location: "Portland, OR",
    tiktokPotential: true,
    viralScore: 8.5
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    caption: "My anxiety superhero costume for Halloween! Thanks for the inspiration 💗 #PanickinCosplay #AnxiousSuperhero #Halloween",
    submitterName: "Alex R.",
    submitterHandle: "@alexcreates",
    platform: "tiktok",
    isApproved: true,
    isFeatured: true,
    likeCount: 1234,
    submittedAt: "2024-03-08T14:15:00Z",
    hashtags: ["PanickinCosplay", "AnxiousSuperhero", "Halloween"],
    location: "Austin, TX",
    tiktokPotential: true,
    viralScore: 9.2
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    caption: "Fan art of Penny Panick! 🎨 This took 20 hours but it was worth every minute #PanickinArt #FanArt #DigitalArt",
    submitterName: "Maya L.",
    submitterHandle: "@mayaarts",
    platform: "instagram",
    isApproved: true,
    isFeatured: true,
    likeCount: 692,
    submittedAt: "2024-03-06T16:45:00Z",
    hashtags: ["PanickinArt", "FanArt", "DigitalArt"],
    location: "Seattle, WA",
    tiktokPotential: false,
    viralScore: 7.1
  }
];

interface FanPhotoSubmissionProps {
  showFeatured?: boolean;
  maxFeatured?: number;
  className?: string;
}

export function FanPhotoSubmission({ 
  showFeatured = true, 
  maxFeatured = 6,
  className = "" 
}: FanPhotoSubmissionProps) {
  const [formData, setFormData] = useState<SubmissionFormData>({
    image: null,
    caption: "",
    name: "",
    handle: "",
    platform: "instagram",
    location: "",
    hashtags: [],
    agreedToTerms: false,
    allowRepost: false,
    allowCommercialUse: false
  });
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentHashtag, setCurrentHashtag] = useState("");
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch featured photos
  const { data: featuredPhotos } = useQuery({
    queryKey: ["fan-photos", "featured"],
    queryFn: async () => {
      // In real implementation, this would call your API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockFeaturedPhotos.slice(0, maxFeatured);
    },
    enabled: showFeatured
  });

  // Submit photo mutation
  const submitPhotoMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/fan-photos/submit", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo Submitted! 📸",
        description: "Your photo has been submitted for review. We'll notify you if it gets featured!",
      });
      setShowSubmissionForm(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      image: null,
      caption: "",
      name: "",
      handle: "",
      platform: "instagram",
      location: "",
      hashtags: [],
      agreedToTerms: false,
      allowRepost: false,
      allowCommercialUse: false
    });
    setPreviewUrl("");
    setCurrentHashtag("");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, WebP).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addHashtag = () => {
    if (currentHashtag && !formData.hashtags.includes(currentHashtag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, currentHashtag]
      }));
      setCurrentHashtag("");
    }
  };

  const removeHashtag = (hashtag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image || !formData.caption || !formData.name || !formData.agreedToTerms) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and agree to the terms.",
        variant: "destructive"
      });
      return;
    }

    const submitData = new FormData();
    submitData.append('image', formData.image);
    submitData.append('caption', formData.caption);
    submitData.append('name', formData.name);
    submitData.append('handle', formData.handle);
    submitData.append('platform', formData.platform);
    submitData.append('location', formData.location);
    submitData.append('hashtags', JSON.stringify(formData.hashtags));
    submitData.append('allowRepost', formData.allowRepost.toString());
    submitData.append('allowCommercialUse', formData.allowCommercialUse.toString());

    submitPhotoMutation.mutate(submitData);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getViralBadge = (viralScore?: number) => {
    if (!viralScore) return null;
    
    if (viralScore >= 9) return { text: "🔥 VIRAL", color: "bg-red-500" };
    if (viralScore >= 7) return { text: "📈 TRENDING", color: "bg-orange-500" };
    if (viralScore >= 5) return { text: "⭐ POPULAR", color: "bg-blue-500" };
    return null;
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient mb-4">FAN PHOTO SHOWCASE</h2>
        <p className="text-muted-foreground text-lg mb-6">
          Share your Panickin' Skywalker moments and get featured!
        </p>
        
        <Button
          onClick={() => setShowSubmissionForm(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
        >
          <Camera className="mr-2 h-4 w-4" />
          Submit Your Photo
        </Button>
      </div>

      {/* Featured Photos */}
      {showFeatured && featuredPhotos && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Award className="text-2xl text-yellow-500" />
            <h3 className="text-2xl font-bold">Featured Fan Photos</h3>
            <Badge variant="secondary" className="ml-auto">
              {featuredPhotos.length} Featured
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300">
                  <div className="relative aspect-square">
                    <LazyImage
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      width={300}
                      height={300}
                    />
                    
                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {photo.isFeatured && (
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {photo.tiktokPotential && (
                        <Badge className="bg-black text-white">
                          <SiTiktok className="mr-1 h-3 w-3" />
                          TikTok Ready
                        </Badge>
                      )}
                      {getViralBadge(photo.viralScore) && (
                        <Badge className={getViralBadge(photo.viralScore)?.color}>
                          {getViralBadge(photo.viralScore)?.text}
                        </Badge>
                      )}
                    </div>

                    {/* Platform Badge */}
                    <div className="absolute top-3 right-3">
                      {photo.platform === 'instagram' && (
                        <SiInstagram className="text-pink-500 text-xl" />
                      )}
                      {photo.platform === 'tiktok' && (
                        <SiTiktok className="text-white text-xl" />
                      )}
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{photo.likeCount}</span>
                          <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                          <span className="text-sm">{photo.viralScore}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm mb-3 line-clamp-2">{photo.caption}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{photo.submitterName}</span>
                        {photo.submitterHandle && (
                          <span>{photo.submitterHandle}</span>
                        )}
                      </div>
                      <span>{formatTimestamp(photo.submittedAt)}</span>
                    </div>
                    
                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {photo.hashtags.slice(0, 3).map((hashtag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          #{hashtag}
                        </Badge>
                      ))}
                    </div>
                    
                    {photo.location && (
                      <p className="text-xs text-muted-foreground mt-2">📍 {photo.location}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Form Modal */}
      <AnimatePresence>
        {showSubmissionForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSubmissionForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Submit Your Fan Photo
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSubmissionForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Photo Upload <span className="text-red-500">*</span>
                      </Label>
                      
                      {!previewUrl ? (
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            dragActive ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-2">
                            Drag and drop your photo here, or click to select
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Choose Photo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            JPG, PNG, GIF, WebP • Max 10MB
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-h-64 object-contain rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setPreviewUrl("");
                              setFormData(prev => ({ ...prev, image: null }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Caption */}
                    <div>
                      <Label htmlFor="caption" className="text-base font-semibold mb-2 block">
                        Caption <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="caption"
                        value={formData.caption}
                        onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                        placeholder="Tell us about your photo! What makes it special?"
                        className="min-h-[100px]"
                        maxLength={500}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.caption.length}/500 characters
                      </p>
                    </div>

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-base font-semibold mb-2 block">
                          Your Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your first name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="handle" className="text-base font-semibold mb-2 block">
                          Social Handle
                        </Label>
                        <Input
                          id="handle"
                          value={formData.handle}
                          onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                          placeholder="@yourusername"
                        />
                      </div>
                    </div>

                    {/* Platform & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-base font-semibold mb-2 block">Platform</Label>
                        <div className="flex gap-2">
                          {[
                            { value: 'instagram', label: 'Instagram', icon: SiInstagram },
                            { value: 'tiktok', label: 'TikTok', icon: SiTiktok },
                            { value: 'website', label: 'Website', icon: ImageIcon }
                          ].map((platform) => (
                            <Button
                              key={platform.value}
                              type="button"
                              variant={formData.platform === platform.value ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                platform: platform.value as 'instagram' | 'tiktok' | 'website'
                              }))}
                              className="flex-1"
                            >
                              <platform.icon className="mr-1 h-3 w-3" />
                              {platform.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="location" className="text-base font-semibold mb-2 block">
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, State"
                        />
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        Hashtags
                      </Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={currentHashtag}
                          onChange={(e) => setCurrentHashtag(e.target.value)}
                          placeholder="Enter hashtag"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                        />
                        <Button type="button" onClick={addHashtag} disabled={!currentHashtag}>
                          <Hash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.hashtags.map((hashtag, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1">
                            #{hashtag}
                            <button
                              type="button"
                              onClick={() => removeHashtag(hashtag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Suggested: #PanickinSkywalker #AnxiousSuperhero #FanPhoto
                      </p>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Permissions & Rights
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="terms"
                            checked={formData.agreedToTerms}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, agreedToTerms: checked as boolean }))
                            }
                          />
                          <Label htmlFor="terms" className="text-sm">
                            I agree to the <a href="#" className="text-primary underline">Terms of Service</a> and confirm that I own the rights to this photo <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="repost"
                            checked={formData.allowRepost}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, allowRepost: checked as boolean }))
                            }
                          />
                          <Label htmlFor="repost" className="text-sm">
                            I allow Panickin' Skywalker to repost this photo on social media with credit
                          </Label>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="commercial"
                            checked={formData.allowCommercialUse}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, allowCommercialUse: checked as boolean }))
                            }
                          />
                          <Label htmlFor="commercial" className="text-sm">
                            I allow limited commercial use (merchandise, promotional materials) with credit
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6"
                      disabled={submitPhotoMutation.isPending}
                    >
                      {submitPhotoMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Submit for Review
                        </div>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Photos are reviewed within 24-48 hours. We'll email you if your photo is selected!
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}