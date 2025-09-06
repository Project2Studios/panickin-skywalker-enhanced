import { useCallback, useEffect, useRef, useState } from 'react';

export interface SwipeInput {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwipedUp?: () => void;
  onSwipedDown?: () => void;
  onSwipeStart?: (event: TouchEvent) => void;
  onSwipeMove?: (event: TouchEvent) => void;
  onSwipeEnd?: (event: TouchEvent) => void;
  swipeThreshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
  trackTouch?: boolean;
  delta?: number;
  rotationAngle?: number;
}

export interface SwipeState {
  isSwipingLeft: boolean;
  isSwipingRight: boolean;
  isSwipingUp: boolean;
  isSwipingDown: boolean;
  isSwiping: boolean;
  swipeDistance: { x: number; y: number };
  swipeVelocity: { x: number; y: number };
}

interface TouchInfo {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  endTime: number;
}

export function useSwipe(input: SwipeInput = {}) {
  const {
    onSwipedLeft,
    onSwipedRight,
    onSwipedUp,
    onSwipedDown,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    swipeThreshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
    trackTouch = true,
    delta = 10,
    rotationAngle = 0,
  } = input;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwipingLeft: false,
    isSwipingRight: false,
    isSwipingUp: false,
    isSwipingDown: false,
    isSwiping: false,
    swipeDistance: { x: 0, y: 0 },
    swipeVelocity: { x: 0, y: 0 },
  });

  const touchInfo = useRef<TouchInfo>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTime: 0,
    endTime: 0,
  });

  const elementRef = useRef<HTMLElement | null>(null);

  // Helper function to get touch coordinates
  const getTouchCoordinates = useCallback((event: TouchEvent | MouseEvent) => {
    if ('touches' in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
    return {
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY,
    };
  }, []);

  // Apply rotation angle to coordinates
  const rotateCoordinates = useCallback((x: number, y: number, angle: number) => {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    };
  }, []);

  // Handle start of touch/swipe
  const handleStart = useCallback(
    (event: TouchEvent | MouseEvent) => {
      const { x, y } = getTouchCoordinates(event);
      const rotated = rotateCoordinates(x, y, rotationAngle);
      
      touchInfo.current = {
        startX: rotated.x,
        startY: rotated.y,
        endX: rotated.x,
        endY: rotated.y,
        startTime: Date.now(),
        endTime: Date.now(),
      };

      setSwipeState(prev => ({
        ...prev,
        isSwiping: true,
        swipeDistance: { x: 0, y: 0 },
        swipeVelocity: { x: 0, y: 0 },
      }));

      if (onSwipeStart && 'touches' in event) {
        onSwipeStart(event);
      }
    },
    [getTouchCoordinates, rotateCoordinates, rotationAngle, onSwipeStart]
  );

  // Handle movement during swipe
  const handleMove = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!touchInfo.current.startTime) return;

      const { x, y } = getTouchCoordinates(event);
      const rotated = rotateCoordinates(x, y, rotationAngle);
      
      touchInfo.current.endX = rotated.x;
      touchInfo.current.endY = rotated.y;
      touchInfo.current.endTime = Date.now();

      const deltaX = rotated.x - touchInfo.current.startX;
      const deltaY = rotated.y - touchInfo.current.startY;
      const deltaTime = touchInfo.current.endTime - touchInfo.current.startTime;
      
      const velocityX = deltaTime > 0 ? deltaX / deltaTime : 0;
      const velocityY = deltaTime > 0 ? deltaY / deltaTime : 0;

      setSwipeState(prev => ({
        ...prev,
        swipeDistance: { x: deltaX, y: deltaY },
        swipeVelocity: { x: velocityX, y: velocityY },
        isSwipingLeft: deltaX < -delta,
        isSwipingRight: deltaX > delta,
        isSwipingUp: deltaY < -delta,
        isSwipingDown: deltaY > delta,
      }));

      if (preventDefaultTouchmoveEvent && event.cancelable) {
        event.preventDefault();
      }

      if (onSwipeMove && 'touches' in event) {
        onSwipeMove(event);
      }
    },
    [getTouchCoordinates, rotateCoordinates, rotationAngle, delta, preventDefaultTouchmoveEvent, onSwipeMove]
  );

  // Handle end of swipe
  const handleEnd = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!touchInfo.current.startTime) return;

      const deltaX = touchInfo.current.endX - touchInfo.current.startX;
      const deltaY = touchInfo.current.endY - touchInfo.current.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine if swipe threshold was met
      const isHorizontalSwipe = absDeltaX >= swipeThreshold && absDeltaX > absDeltaY;
      const isVerticalSwipe = absDeltaY >= swipeThreshold && absDeltaY > absDeltaX;

      if (isHorizontalSwipe) {
        if (deltaX > 0 && onSwipedRight) {
          onSwipedRight();
        } else if (deltaX < 0 && onSwipedLeft) {
          onSwipedLeft();
        }
      } else if (isVerticalSwipe) {
        if (deltaY > 0 && onSwipedDown) {
          onSwipedDown();
        } else if (deltaY < 0 && onSwipedUp) {
          onSwipedUp();
        }
      }

      // Reset state
      setSwipeState({
        isSwipingLeft: false,
        isSwipingRight: false,
        isSwipingUp: false,
        isSwipingDown: false,
        isSwiping: false,
        swipeDistance: { x: 0, y: 0 },
        swipeVelocity: { x: 0, y: 0 },
      });

      touchInfo.current = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        startTime: 0,
        endTime: 0,
      };

      if (onSwipeEnd && 'touches' in event) {
        onSwipeEnd(event);
      }
    },
    [swipeThreshold, onSwipedLeft, onSwipedRight, onSwipedUp, onSwipedDown, onSwipeEnd]
  );

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (trackTouch) handleStart(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (trackTouch) handleMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (trackTouch) handleEnd(e);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (trackMouse) handleStart(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (trackMouse) handleMove(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (trackMouse) handleEnd(e);
    };

    // Touch events
    if (trackTouch) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    // Mouse events (for desktop testing)
    if (trackMouse) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (trackTouch) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }

      if (trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [
    trackTouch,
    trackMouse,
    preventDefaultTouchmoveEvent,
    handleStart,
    handleMove,
    handleEnd,
  ]);

  return {
    ref: elementRef,
    swipeState,
  };
}

export default useSwipe;