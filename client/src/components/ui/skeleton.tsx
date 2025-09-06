import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'shimmer' | 'none';
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = 'default',
  animation = 'shimmer',
  width,
  height,
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-muted via-muted-foreground/20 to-muted";
  
  const variantClasses = {
    default: "rounded-md",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none"
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer relative overflow-hidden",
    none: ""
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{ width, height }}
      {...props}
    >
      {animation === 'shimmer' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </div>
  );
}

// Skeleton compositions for common use cases
export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? "w-3/4" : ""}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="space-y-2">
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="text" width="80px" />
        </div>
      </div>
      <TextSkeleton lines={2} />
    </div>
  );
}

export function ImageSkeleton({ 
  width = "100%", 
  height = "200px", 
  className 
}: { 
  width?: string | number; 
  height?: string | number; 
  className?: string; 
}) {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      className={className}
    />
  );
}

export function BandMemberSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("text-center space-y-4", className)}>
      <Skeleton variant="circular" width="192px" height="192px" className="mx-auto" />
      <Skeleton variant="text" width="150px" className="mx-auto" />
      <Skeleton variant="text" width="100px" className="mx-auto" />
      <TextSkeleton lines={2} className="max-w-xs mx-auto" />
    </div>
  );
}

export function TourDateSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border border-border rounded-lg space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton variant="text" width="60px" />
          <Skeleton variant="text" width="200px" />
        </div>
        <Skeleton variant="rectangular" width="100px" height="40px" />
      </div>
      <Skeleton variant="text" width="150px" />
      <Skeleton variant="text" width="120px" />
    </div>
  );
}

export function NewsUpdateSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border border-border rounded-lg space-y-4", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width="32px" height="32px" />
        <Skeleton variant="text" width="80px" />
      </div>
      <Skeleton variant="text" width="250px" />
      <TextSkeleton lines={3} />
    </div>
  );
}

export function AlbumSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("text-center space-y-4", className)}>
      <Skeleton variant="rectangular" width="300px" height="300px" className="mx-auto rounded-lg" />
      <Skeleton variant="text" width="200px" className="mx-auto" />
      <Skeleton variant="text" width="100px" className="mx-auto" />
      <div className="space-y-2 max-w-xs mx-auto">
        <Skeleton variant="rectangular" width="100%" height="48px" />
        <Skeleton variant="rectangular" width="100%" height="48px" />
      </div>
    </div>
  );
}

export { Skeleton };
