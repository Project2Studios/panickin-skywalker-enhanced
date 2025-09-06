import { useCallback, useRef, useState } from 'react';

export interface TouchFeedbackOptions {
  rippleColor?: string;
  rippleDuration?: number;
  vibrationPattern?: number | number[];
  enableHaptics?: boolean;
  enableVisualFeedback?: boolean;
  scaleEffect?: number;
  glowEffect?: boolean;
  bounceEffect?: boolean;
}

export interface TouchFeedbackState {
  isPressed: boolean;
  ripples: Array<{
    id: string;
    x: number;
    y: number;
    timestamp: number;
  }>;
}

export function useTouchFeedback(options: TouchFeedbackOptions = {}) {
  const {
    rippleColor = 'rgba(255, 26, 107, 0.3)',
    rippleDuration = 600,
    vibrationPattern = 10,
    enableHaptics = true,
    enableVisualFeedback = true,
    scaleEffect = 0.95,
    glowEffect = true,
    bounceEffect = false,
  } = options;

  const [feedbackState, setFeedbackState] = useState<TouchFeedbackState>({
    isPressed: false,
    ripples: [],
  });

  const elementRef = useRef<HTMLElement | null>(null);
  const rippleTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Trigger haptic feedback (if supported)
  const triggerHaptics = useCallback(() => {
    if (!enableHaptics) return;

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(vibrationPattern);
      }
      
      // Try to use webkit haptic feedback for iOS
      if ('webkitHapticFeedback' in window) {
        (window as any).webkitHapticFeedback();
      }
    } catch (error) {
      // Haptics not supported, fail silently
      console.debug('Haptic feedback not supported:', error);
    }
  }, [enableHaptics, vibrationPattern]);

  // Create ripple effect
  const createRipple = useCallback((x: number, y: number) => {
    if (!enableVisualFeedback) return;

    const rippleId = `ripple_${Date.now()}_${Math.random()}`;
    
    setFeedbackState(prev => ({
      ...prev,
      ripples: [
        ...prev.ripples,
        {
          id: rippleId,
          x,
          y,
          timestamp: Date.now(),
        },
      ],
    }));

    // Remove ripple after animation
    const timeout = setTimeout(() => {
      setFeedbackState(prev => ({
        ...prev,
        ripples: prev.ripples.filter(ripple => ripple.id !== rippleId),
      }));
      rippleTimeouts.current.delete(rippleId);
    }, rippleDuration);

    rippleTimeouts.current.set(rippleId, timeout);
  }, [enableVisualFeedback, rippleDuration]);

  // Handle touch/click start
  const handleTouchStart = useCallback((event: TouchEvent | MouseEvent) => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in event && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = (event as MouseEvent).clientX - rect.left;
      y = (event as MouseEvent).clientY - rect.top;
    }

    // Set pressed state
    setFeedbackState(prev => ({
      ...prev,
      isPressed: true,
    }));

    // Trigger haptic feedback
    triggerHaptics();

    // Create visual ripple effect
    createRipple(x, y);
  }, [triggerHaptics, createRipple]);

  // Handle touch/click end
  const handleTouchEnd = useCallback(() => {
    setFeedbackState(prev => ({
      ...prev,
      isPressed: false,
    }));
  }, []);

  // Get computed styles based on current state
  const getTouchStyles = useCallback(() => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
    };

    if (!feedbackState.isPressed) {
      return baseStyles;
    }

    const activeStyles: React.CSSProperties = {
      ...baseStyles,
      transform: `scale(${scaleEffect})`,
    };

    if (glowEffect) {
      activeStyles.boxShadow = `0 0 20px ${rippleColor.replace('0.3', '0.6')}`;
    }

    if (bounceEffect) {
      activeStyles.animation = 'touchBounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }

    return activeStyles;
  }, [feedbackState.isPressed, scaleEffect, glowEffect, bounceEffect, rippleColor]);

  // Generate ripple elements
  const getRippleElements = useCallback(() => {
    return feedbackState.ripples.map(ripple => (
      <div
        key={ripple.id}
        className="absolute pointer-events-none"
        style={{
          left: ripple.x - 50,
          top: ripple.y - 50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: rippleColor,
          transform: 'scale(0)',
          animation: `rippleEffect ${rippleDuration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        }}
      />
    ));
  }, [feedbackState.ripples, rippleColor, rippleDuration]);

  // Bind events to element
  const bindTouchFeedback = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      // Clean up previous element
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
      elementRef.current.removeEventListener('mousedown', handleTouchStart);
      elementRef.current.removeEventListener('mouseup', handleTouchEnd);
    }

    elementRef.current = element;

    if (element) {
      // Add touch events
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
      element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
      
      // Add mouse events for desktop testing
      element.addEventListener('mousedown', handleTouchStart);
      element.addEventListener('mouseup', handleTouchEnd);
      element.addEventListener('mouseleave', handleTouchEnd);
    }
  }, [handleTouchStart, handleTouchEnd]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear all timeouts
    rippleTimeouts.current.forEach(timeout => clearTimeout(timeout));
    rippleTimeouts.current.clear();

    // Remove event listeners
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
      elementRef.current.removeEventListener('mousedown', handleTouchStart);
      elementRef.current.removeEventListener('mouseup', handleTouchEnd);
    }

    // Reset state
    setFeedbackState({
      isPressed: false,
      ripples: [],
    });
  }, [handleTouchStart, handleTouchEnd]);

  return {
    ref: bindTouchFeedback,
    isPressed: feedbackState.isPressed,
    styles: getTouchStyles(),
    ripples: getRippleElements(),
    cleanup,
  };
}

export default useTouchFeedback;