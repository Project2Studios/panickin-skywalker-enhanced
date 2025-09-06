import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl, Howler } from 'howler';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, RotateCcw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPreviewPlayerProps {
  trackId: string;
  title: string;
  artist: string;
  albumArt: string;
  previewUrl: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: string) => void;
}

interface AudioState {
  isLoading: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  error: string | null;
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
  trackId,
  title,
  artist,
  albumArt,
  previewUrl,
  spotifyUrl,
  youtubeUrl,
  className,
  size = 'md',
  autoPlay = false,
  onPlay,
  onPause,
  onError
}) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isLoading: false,
    isPlaying: false,
    isMuted: false,
    duration: 30, // 30-second previews
    currentTime: 0,
    volume: 0.7,
    error: null
  });

  const howlRef = useRef<Howl | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio
  useEffect(() => {
    if (!previewUrl) return;

    const sound = new Howl({
      src: [previewUrl],
      preload: true,
      volume: audioState.volume,
      html5: true,
      format: ['mp3', 'webm'],
      onload: () => {
        setAudioState(prev => ({
          ...prev,
          isLoading: false,
          duration: sound.duration() || 30,
          error: null
        }));
        if (autoPlay) {
          handlePlay();
        }
      },
      onplay: () => {
        setAudioState(prev => ({ ...prev, isPlaying: true }));
        startProgressTracking();
        onPlay?.();
      },
      onpause: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        stopProgressTracking();
        onPause?.();
      },
      onstop: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        stopProgressTracking();
        onPause?.();
      },
      onend: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        stopProgressTracking();
        onPause?.();
      },
      onloaderror: (id, error) => {
        const errorMsg = 'Failed to load audio preview';
        setAudioState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        onError?.(errorMsg);
      },
      onplayerror: (id, error) => {
        const errorMsg = 'Error playing audio';
        setAudioState(prev => ({ ...prev, error: errorMsg, isPlaying: false }));
        onError?.(errorMsg);
      }
    });

    howlRef.current = sound;
    setAudioState(prev => ({ ...prev, isLoading: true }));

    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
      stopProgressTracking();
    };
  }, [previewUrl, autoPlay]);

  const startProgressTracking = useCallback(() => {
    if (progressInterval.current) return;
    
    progressInterval.current = setInterval(() => {
      if (howlRef.current && howlRef.current.playing()) {
        const currentTime = howlRef.current.seek() || 0;
        setAudioState(prev => ({ ...prev, currentTime }));
      }
    }, 100);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (!howlRef.current) return;
    
    // Stop other sounds
    Howler.stop();
    
    howlRef.current.play();
  }, []);

  const handlePause = useCallback(() => {
    if (!howlRef.current) return;
    howlRef.current.pause();
  }, []);

  const handleStop = useCallback(() => {
    if (!howlRef.current) return;
    howlRef.current.stop();
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!howlRef.current) return;
    const seekTime = value[0];
    howlRef.current.seek(seekTime);
    setAudioState(prev => ({ ...prev, currentTime: seekTime }));
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const volume = value[0];
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
    setAudioState(prev => ({ 
      ...prev, 
      volume, 
      isMuted: volume === 0 
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!howlRef.current) return;
    
    const newMuted = !audioState.isMuted;
    const volume = newMuted ? 0 : audioState.volume > 0 ? audioState.volume : 0.7;
    
    howlRef.current.volume(volume);
    setAudioState(prev => ({ 
      ...prev, 
      isMuted: newMuted,
      volume: newMuted ? prev.volume : volume
    }));
  }, [audioState.isMuted, audioState.volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'p-3',
      artwork: 'w-12 h-12',
      button: 'w-8 h-8',
      icon: 'w-3 h-3',
      text: 'text-xs',
      title: 'text-sm'
    },
    md: {
      container: 'p-4',
      artwork: 'w-16 h-16',
      button: 'w-10 h-10',
      icon: 'w-4 h-4',
      text: 'text-sm',
      title: 'text-base'
    },
    lg: {
      container: 'p-6',
      artwork: 'w-20 h-20',
      button: 'w-12 h-12',
      icon: 'w-5 h-5',
      text: 'text-base',
      title: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  if (audioState.error) {
    return (
      <Card className={cn("bg-muted/50 border-destructive/20", className)}>
        <CardContent className={currentSize.container}>
          <div className="flex items-center gap-3">
            <div className={cn(currentSize.artwork, "bg-muted rounded-md flex items-center justify-center")}>
              <VolumeX className={cn(currentSize.icon, "text-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(currentSize.title, "font-semibold text-destructive truncate")}>
                Preview Unavailable
              </p>
              <p className={cn(currentSize.text, "text-muted-foreground")}>
                {audioState.error}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-card border border-border hover:border-primary/30 transition-colors", className)}>
      <CardContent className={currentSize.container}>
        <div className="flex items-center gap-3 mb-3">
          {/* Album Artwork */}
          <div className={cn(currentSize.artwork, "relative rounded-md overflow-hidden flex-shrink-0")}>
            <img 
              src={albumArt} 
              alt={`${title} artwork`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {audioState.isPlaying && (
              <motion.div 
                className="absolute inset-0 bg-black/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className={cn(currentSize.title, "font-semibold truncate text-foreground")}>
              {title}
            </h4>
            <p className={cn(currentSize.text, "text-muted-foreground truncate")}>
              {artist}
            </p>
          </div>

          {/* Main Play Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={audioState.isPlaying ? handlePause : handlePlay}
            disabled={audioState.isLoading}
            className={cn(
              currentSize.button,
              "rounded-full bg-primary/10 hover:bg-primary/20 text-primary",
              "disabled:opacity-50"
            )}
            aria-label={audioState.isPlaying ? 'Pause' : 'Play'}
          >
            <AnimatePresence mode="wait">
              {audioState.isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className={cn(currentSize.icon, "border-2 border-primary border-t-transparent rounded-full")}
                />
              ) : audioState.isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Pause className={currentSize.icon} />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Play className={currentSize.icon} />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn(currentSize.text, "text-muted-foreground w-8 text-center")}>
              {formatTime(audioState.currentTime)}
            </span>
            <Slider
              value={[audioState.currentTime]}
              max={audioState.duration}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
              disabled={audioState.isLoading}
            />
            <span className={cn(currentSize.text, "text-muted-foreground w-8 text-center")}>
              {formatTime(audioState.duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Volume Control */}
            <div className="flex items-center gap-2 flex-1 max-w-[120px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="w-6 h-6 p-0"
                aria-label={audioState.isMuted ? 'Unmute' : 'Mute'}
              >
                {audioState.isMuted || audioState.volume === 0 ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </Button>
              <Slider
                value={[audioState.isMuted ? 0 : audioState.volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="flex-1"
                disabled={audioState.isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground"
                aria-label="Stop and restart"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>

              {/* External Links */}
              {(spotifyUrl || youtubeUrl) && (
                <div className="flex items-center gap-1 ml-1">
                  {spotifyUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(spotifyUrl, '_blank')}
                      className="w-6 h-6 p-0 text-green-500 hover:text-green-400"
                      aria-label="Open in Spotify"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                  {youtubeUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(youtubeUrl, '_blank')}
                      className="w-6 h-6 p-0 text-red-500 hover:text-red-400"
                      aria-label="Open in YouTube"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioPreviewPlayer;