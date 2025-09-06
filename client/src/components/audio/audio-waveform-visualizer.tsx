import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AudioWaveformVisualizerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  className?: string;
  height?: number;
  bars?: number;
  color?: string;
  activeColor?: string;
  backgroundColor?: string;
  style?: 'bars' | 'wave' | 'circular';
  animate?: boolean;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isPlaying,
  currentTime,
  duration,
  className,
  height = 60,
  bars = 40,
  color = 'hsl(330 100% 55%)', // Pink
  activeColor = 'hsl(270 100% 55%)', // Purple
  backgroundColor = 'hsl(330 100% 55% / 0.1)',
  style = 'bars',
  animate = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const controls = useAnimation();

  // Generate pseudo-waveform data
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Generate realistic-looking waveform data
    const data = Array.from({ length: bars }, (_, i) => {
      const progress = i / bars;
      // Create a more realistic waveform pattern
      const amplitude = 0.3 + 0.7 * Math.sin(progress * Math.PI * 4) * Math.random();
      const noise = 0.1 * (Math.random() - 0.5);
      return Math.max(0.1, Math.min(1, amplitude + noise));
    });
    setWaveformData(data);
  }, [bars]);

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const canvasHeight = canvas.height;
    const barWidth = width / bars;
    const progress = duration > 0 ? currentTime / duration : 0;

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Draw background bars
    ctx.fillStyle = backgroundColor;
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * (canvasHeight - 4);
      const y = (canvasHeight - barHeight) / 2;
      
      if (style === 'bars') {
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      } else if (style === 'wave') {
        ctx.beginPath();
        ctx.arc(x + barWidth / 2, canvasHeight / 2, barHeight / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw active (played) portion
    const activeColor = isPlaying ? 
      `hsl(330 100% ${50 + Math.sin(Date.now() * 0.01) * 20}%)` : 
      'hsl(330 100% 55%)';
    
    ctx.fillStyle = activeColor;
    
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barProgress = index / bars;
      
      if (barProgress <= progress) {
        const barHeight = amplitude * (canvasHeight - 4);
        const y = (canvasHeight - barHeight) / 2;
        
        if (style === 'bars') {
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        } else if (style === 'wave') {
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, canvasHeight / 2, barHeight / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Add glow effect for active bars
    if (isPlaying) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      
      waveformData.forEach((amplitude, index) => {
        const x = index * barWidth;
        const barProgress = index / bars;
        
        if (Math.abs(barProgress - progress) < 0.05) {
          const barHeight = amplitude * (canvasHeight - 4);
          const y = (canvasHeight - barHeight) / 2;
          
          ctx.fillStyle = activeColor;
          if (style === 'bars') {
            ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
          }
        }
      });
      
      ctx.shadowBlur = 0;
    }
  }, [waveformData, currentTime, duration, isPlaying, bars, color, activeColor, backgroundColor, style]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && animate) {
      const animate = () => {
        drawWaveform();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate, drawWaveform]);

  // Responsive canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      drawWaveform();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [height, drawWaveform]);

  // Circular visualizer for special style
  if (style === 'circular') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="relative w-32 h-32">
          <motion.div
            className="absolute inset-0 rounded-full border-4"
            style={{
              borderColor: backgroundColor,
            }}
            animate={isPlaying ? {
              rotate: 360,
              borderColor: [color, activeColor, color],
            } : {}}
            transition={isPlaying ? {
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              borderColor: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            } : {}}
          />
          {waveformData.slice(0, 12).map((amplitude, index) => {
            const angle = (index / 12) * 360;
            const progress = duration > 0 ? currentTime / duration : 0;
            const barProgress = index / 12;
            const isActive = barProgress <= progress;
            
            return (
              <motion.div
                key={index}
                className="absolute w-1 bg-current origin-bottom"
                style={{
                  height: `${amplitude * 40}px`,
                  left: '50%',
                  bottom: '50%',
                  transformOrigin: '50% 100%',
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                  color: isActive ? activeColor : color,
                  opacity: isActive ? 1 : 0.3
                }}
                animate={isPlaying ? {
                  scaleY: [1, 1.2, 1],
                  opacity: isActive ? [0.8, 1, 0.8] : 0.3
                } : {}}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.05
                }}
              />
            );
          })}
          
          {/* Center indicator */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: isPlaying ? activeColor : color }}
            animate={isPlaying ? {
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <canvas
        ref={canvasRef}
        className="w-full rounded-sm"
        style={{ height: `${height}px` }}
        aria-label="Audio waveform visualization"
      />
      
      {/* Pulse overlay when playing */}
      {isPlaying && animate && (
        <motion.div
          className="absolute inset-0 rounded-sm"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color}20 ${(currentTime / duration) * 100}%, transparent 100%)`
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};

export default AudioWaveformVisualizer;