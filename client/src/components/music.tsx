import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSwipe } from "@/hooks/use-swipe";
import { useTouchFeedback } from "@/hooks/use-touch-feedback";
import { useIsMobile } from "@/hooks/use-mobile";

const releases = [
  {
    id: 1,
    title: "PANIC ATTACK",
    type: "Single",
    year: "2024",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: true,
    spotifyUrl: "#",
    appleMusicUrl: "#",
    youtubeUrl: "#"
  },
  {
    id: 2,
    title: "SUPERHERO COMPLEX",
    type: "Album",
    year: "2023",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
    spotifyUrl: "#",
    appleMusicUrl: "#",
    youtubeUrl: "#"
  },
  {
    id: 3,
    title: "MILLENNIAL MELTDOWN",
    type: "EP",
    year: "2022",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
    spotifyUrl: "#",
    appleMusicUrl: "#",
    youtubeUrl: "#"
  },
  {
    id: 4,
    title: "ANXIETY ANTHEM",
    type: "Single",
    year: "2022",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
    spotifyUrl: "#",
    appleMusicUrl: "#",
    youtubeUrl: "#"
  },
  {
    id: 5,
    title: "DIGITAL BREAKDOWN",
    type: "Album",
    year: "2021",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
    spotifyUrl: "#",
    appleMusicUrl: "#",
    youtubeUrl: "#"
  },
  {
    id: 6,
    title: "REBEL HEART",
    type: "EP",
    year: "2021",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    isNew: false,
    spotifyUrl: "#",
    appleMusicUrl: "#",
    youtubeUrl: "#"
  }
];

export default function Music() {
  const [currentAlbum, setCurrentAlbum] = useState(0);
  const [albumsPerView, setAlbumsPerView] = useState(1);
  const isMobile = useIsMobile();
  
  // Touch feedback for album cards
  const albumTouchFeedback = useTouchFeedback({
    rippleColor: 'rgba(255, 26, 107, 0.2)',
    enableHaptics: true,
    scaleEffect: 0.98,
    glowEffect: true,
  });
  
  // Swipe handlers for mobile carousel
  const handleSwipeLeft = () => {
    if (currentAlbum < releases.length - albumsPerView) {
      setCurrentAlbum(prev => prev + 1);
    } else {
      setCurrentAlbum(0); // Loop back to start
    }
  };
  
  const handleSwipeRight = () => {
    if (currentAlbum > 0) {
      setCurrentAlbum(prev => prev - 1);
    } else {
      setCurrentAlbum(releases.length - albumsPerView); // Loop to end
    }
  };
  
  // Swipe gestures for album carousel
  const albumSwipe = useSwipe({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    swipeThreshold: 50,
    trackTouch: true,
    trackMouse: false,
  });
  
  // Responsive albums per view
  React.useEffect(() => {
    const updateAlbumsPerView = () => {
      if (window.innerWidth >= 1024) {
        setAlbumsPerView(3);
      } else if (window.innerWidth >= 768) {
        setAlbumsPerView(2);
      } else {
        setAlbumsPerView(1);
      }
    };
    
    updateAlbumsPerView();
    window.addEventListener('resize', updateAlbumsPerView);
    return () => window.removeEventListener('resize', updateAlbumsPerView);
  }, []);
  
  return (
    <section id="music" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-4">
            DISCOGRAPHY
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore our collection of anxiety-driven anthems
          </p>
        </motion.div>

        {/* Mobile and Tablet Carousel */}
        {isMobile || window.innerWidth < 1024 ? (
          <div className="relative max-w-4xl mx-auto">
            <div 
              ref={albumSwipe.ref}
              className="relative overflow-hidden touch-pan-x"
              style={{ touchAction: 'pan-x pinch-zoom' }}
            >
              <motion.div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(-${currentAlbum * (100 / albumsPerView)}%)`,
                  width: `${(releases.length / albumsPerView) * 100}%`,
                }}
              >
                {releases.map((release, index) => (
                  <div
                    key={release.id}
                    className="flex-shrink-0 px-4"
                    style={{ width: `${100 / releases.length * albumsPerView}%` }}
                  >
                    <AlbumCard release={release} index={index} isMobile={true} />
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Navigation dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(releases.length / albumsPerView) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAlbum(index)}
                  className={`w-3 h-3 rounded-full transition-all touch-target ${
                    index === currentAlbum 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`View albums ${index * albumsPerView + 1}-${Math.min((index + 1) * albumsPerView, releases.length)}`}
                />
              ))}
            </div>
            
            {/* Swipe indicators */}
            <div className="swipe-indicator left">
              <ChevronLeft className="w-6 h-6 text-primary/70" />
            </div>
            <div className="swipe-indicator right">
              <ChevronRight className="w-6 h-6 text-primary/70" />
            </div>
          </div>
        ) : (
          /* Desktop Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {releases.map((release, index) => (
              <AlbumCard key={release.id} release={release} index={index} isMobile={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// AlbumCard component for reusable album display
function AlbumCard({ 
  release, 
  index, 
  isMobile 
}: { 
  release: typeof releases[0]; 
  index: number; 
  isMobile: boolean; 
}) {
  const touchFeedback = useTouchFeedback({
    rippleColor: 'rgba(255, 26, 107, 0.2)',
    enableHaptics: true,
    scaleEffect: 0.98,
    glowEffect: true,
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group cursor-pointer ${isMobile ? 'mobile-card-enhanced touch-ripple-container' : 'interactive-hover'}`}
      data-testid={`release-${release.title.toLowerCase().replace(/\s+/g, '-')}`}
      ref={isMobile ? touchFeedback.ref : undefined}
      style={isMobile ? touchFeedback.styles : undefined}
    >
      {isMobile && touchFeedback.ripples}
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-square">
        <img
          src={release.image || ""}
          alt={`${release.title} Cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <Play className="text-primary text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {release.isNew && (
          <span className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold hot-badge">
            NEW
          </span>
        )}
      </div>
      <h3 className={`text-xl font-bold mb-1 ${isMobile ? 'mobile-text-enhanced' : ''}`}>{release.title}</h3>
      <p className={`text-muted-foreground text-sm mb-2 capitalize ${isMobile ? 'mobile-text-enhanced' : ''}`}>
        {release.type} • {release.year}
      </p>
      <div className="flex gap-2 justify-center">
        {release.spotifyUrl && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={`p-0 h-auto text-primary hover:text-accent ${isMobile ? 'touch-target mobile-button-enhanced' : ''}`}
            data-testid={`spotify-${release.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <a href={release.spotifyUrl} aria-label={`Listen to ${release.title} on Spotify`}>
              <svg className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          </Button>
        )}
        {release.appleMusicUrl && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={`p-0 h-auto text-primary hover:text-accent ${isMobile ? 'touch-target mobile-button-enhanced' : ''}`}
            data-testid={`apple-${release.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <a href={release.appleMusicUrl} aria-label={`Listen to ${release.title} on Apple Music`}>
              <svg className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </a>
          </Button>
        )}
        {release.youtubeUrl && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={`p-0 h-auto text-primary hover:text-accent ${isMobile ? 'touch-target mobile-button-enhanced' : ''}`}
            data-testid={`youtube-${release.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <a href={release.youtubeUrl} aria-label={`Watch ${release.title} on YouTube`}>
              <svg className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
      </div>
    </section>
  );
}
