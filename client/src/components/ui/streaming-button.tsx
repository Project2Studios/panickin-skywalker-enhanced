import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface StreamingButtonProps extends Omit<ButtonProps, 'variant' | 'isLoading'> {
  platform: 'spotify' | 'apple' | 'youtube' | 'generic';
  icon?: React.ReactNode;
  loadingText?: string;
  successText?: string;
  simulateDelay?: boolean;
}

const platformConfigs = {
  spotify: {
    colors: 'bg-[#1DB954] hover:bg-[#1ed760]',
    loadingColors: 'bg-[#1ed760]',
    successColors: 'bg-green-600',
    punkEffect: 'glow' as const,
  },
  apple: {
    colors: 'bg-gradient-to-r from-[#fa233b] to-[#fb5c74] hover:from-[#fb5c74] hover:to-[#fa233b]',
    loadingColors: 'bg-gradient-to-r from-[#fb5c74] to-[#fa233b]',
    successColors: 'bg-gradient-to-r from-green-500 to-green-600',
    punkEffect: 'pulse' as const,
  },
  youtube: {
    colors: 'bg-[#FF0000] hover:bg-[#ff3333]',
    loadingColors: 'bg-[#ff3333]',
    successColors: 'bg-green-600',
    punkEffect: 'bounce' as const,
  },
  generic: {
    colors: 'bg-primary hover:bg-primary/90',
    loadingColors: 'bg-primary/90',
    successColors: 'bg-green-600',
    punkEffect: 'glow' as const,
  },
};

export const StreamingButton = React.forwardRef<HTMLButtonElement, StreamingButtonProps>(
  ({ 
    platform, 
    icon, 
    children, 
    loadingText = 'Loading...', 
    successText = 'Success!',
    simulateDelay = true,
    onClick,
    className,
    ...props 
  }, ref) => {
    const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const config = platformConfigs[platform];

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonState !== 'idle') return;
      
      setButtonState('loading');
      
      try {
        // Simulate loading delay if enabled
        if (simulateDelay) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // Call the original onClick handler
        if (onClick) {
          await onClick(e);
        }
        
        setButtonState('success');
        
        // Reset to idle after showing success
        setTimeout(() => {
          setButtonState('idle');
        }, 2000);
        
      } catch (error) {
        setButtonState('error');
        
        // Reset to idle after showing error
        setTimeout(() => {
          setButtonState('idle');
        }, 2000);
      }
    };

    const getButtonContent = () => {
      switch (buttonState) {
        case 'loading':
          return (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              {loadingText}
            </motion.div>
          );
          
        case 'success':
          return (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
              {successText}
            </motion.div>
          );
          
        case 'error':
          return (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
            >
              <motion.svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </motion.svg>
              Try Again
            </motion.div>
          );
          
        default:
          return (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {icon}
              {children}
            </motion.div>
          );
      }
    };

    const getButtonColors = () => {
      switch (buttonState) {
        case 'loading':
          return config.loadingColors;
        case 'success':
          return config.successColors;
        case 'error':
          return 'bg-red-600 hover:bg-red-700';
        default:
          return config.colors;
      }
    };

    const getPunkEffect = () => {
      switch (buttonState) {
        case 'loading':
          return 'pulse';
        case 'success':
          return 'glow';
        case 'error':
          return 'shake';
        default:
          return config.punkEffect;
      }
    };

    return (
      <Button
        ref={ref}
        variant="streaming"
        className={cn(
          getButtonColors(),
          'text-white relative overflow-hidden transition-all duration-300',
          buttonState === 'loading' && 'cursor-wait',
          buttonState === 'success' && 'cursor-default',
          className
        )}
        onClick={handleClick}
        disabled={buttonState === 'loading'}
        punkEffect={getPunkEffect()}
        withRipple={buttonState === 'idle'}
        {...props}
      >
        <AnimatePresence mode="wait">
          {getButtonContent()}
        </AnimatePresence>
        
        {/* Streaming indicator animation */}
        {buttonState === 'loading' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        )}
        
        {/* Success confetti effect */}
        {buttonState === 'success' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: '50%',
                }}
                initial={{ scale: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  y: [-10, -20, -10],
                  x: [0, Math.random() * 20 - 10, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </Button>
    );
  }
);

StreamingButton.displayName = "StreamingButton";