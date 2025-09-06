import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntersectionObserver } from '@/hooks/use-performance';
import { cn } from '@/lib/utils';

interface BackgroundVideoProps {
  videoSrc: string;
  posterImage: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  playButton?: boolean;
  volumeControl?: boolean;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: string) => void;
  priority?: boolean;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  videoSrc,
  posterImage,
  className,
  overlay = true,
  overlayOpacity = 0.4,
  playButton = false,
  volumeControl = false,
  loop = true,
  muted = true,
  autoPlay = true,
  playsInline = true,
  preload = 'metadata',
  onLoadStart,
  onLoadedData,
  onError,
  priority = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Intersection observer to pause video when not visible (performance optimization)
  const { isIntersecting } = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      onLoadStart?.();
    };

    const handleLoadedData = () => {
      setIsLoaded(true);
      setHasError(false);
      onLoadedData?.();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
      onError?.('Failed to load video');
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onLoadStart, onLoadedData, onError]);

  // Handle intersection observer changes for performance
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    if (isIntersecting && autoPlay) {
      video.play().catch(console.warn);
    } else {
      video.pause();
    }
  }, [isIntersecting, autoPlay, isLoaded]);

  // Reduce motion for users who prefer it
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const video = videoRef.current;
    
    if (prefersReducedMotion && video) {
      video.pause();
    }
  }, []);

  const handlePlayToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.warn);
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Battery-conscious approach: use intersection observer to manage playback
  const [isLowBattery, setIsLowBattery] = useState(false);
  
  useEffect(() => {
    // Battery API is experimental and may not be available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryStatus = () => {
          setIsLowBattery(battery.level < 0.2 && !battery.charging);
        };
        
        updateBatteryStatus();
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
        
        return () => {
          battery.removeEventListener('levelchange', updateBatteryStatus);
          battery.removeEventListener('chargingchange', updateBatteryStatus);
        };
      });
    }
  }, []);

  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "relative w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center",
          className
        )}
        style={{ backgroundImage: `url(${posterImage})` }}
      >
        {overlay && (
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        )}
        <div className="relative z-10 text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 opacity-50">
            <Play className="w-full h-full" />
          </div>
          <p className="text-sm opacity-75">Video unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterImage}
        autoPlay={autoPlay && !isLowBattery}
        loop={loop}
        muted={isMuted}
        playsInline={playsInline}
        preload={isLowBattery ? 'none' : preload}
        style={{
          transform: 'scale(1.02)', // Slight scale to avoid edge artifacts
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Loading State */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center"
            style={{ backgroundImage: `url(${posterImage})` }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {overlay && (
              <div 
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity }}
              />
            )}
            <motion.div
              className="relative z-10 w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {(playButton || volumeControl) && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="absolute top-4 right-4 z-20 flex gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {playButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlayToggle}
                  className="bg-black/20 hover:bg-black/40 text-white border-white/20"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              {volumeControl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMuteToggle}
                  className="bg-black/20 hover:bg-black/40 text-white border-white/20"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Performance warning for low battery */}
      {isLowBattery && (
        <motion.div
          className="absolute bottom-4 left-4 right-4 z-20 bg-black/60 text-white p-3 rounded-lg text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <p>Video paused to preserve battery</p>
        </motion.div>
      )}

      {/* Fallback for reduced motion preference */}
      <div className="sr-only">
        Background video showing band performance. Video can be paused for accessibility.
      </div>
    </div>
  );
};

// Optimized video component with lazy loading and performance considerations
export const LazyBackgroundVideo: React.FC<BackgroundVideoProps & { threshold?: number }> = ({
  threshold = 0.1,
  ...props
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const { isIntersecting } = useIntersectionObserver(triggerRef, {
    threshold,
    rootMargin: '200px' // Start loading before it comes into view
  });

  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad]);

  return (
    <div ref={triggerRef} className={cn("w-full h-full", props.className)}>
      {shouldLoad ? (
        <BackgroundVideo {...props} />
      ) : (
        // Placeholder with poster image
        <div 
          className={cn(
            "w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center",
            props.className
          )}
          style={{ backgroundImage: `url(${props.posterImage})` }}
        >
          {props.overlay && (
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: props.overlayOpacity || 0.4 }}
            />
          )}
          <motion.div
            className="relative z-10 w-12 h-12 text-white opacity-50"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Play className="w-full h-full" />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BackgroundVideo;