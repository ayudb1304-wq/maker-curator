import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text' | 'avatar' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  ...props
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-muted rounded-md";
  
  const variantStyles = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4",
    avatar: "rounded-full aspect-square",
    card: "rounded-lg"
  };

  const style = {
    width: width,
    height: height
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseStyles,
              variantStyles.text,
              index === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
            )}
            style={index === 0 ? style : { height: height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
      {...props}
    />
  );
}

// Skeleton composition components for common layouts
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 p-6 border rounded-lg", className)} {...props}>
      <Skeleton variant="rectangular" height={200} />
      <div className="space-y-2">
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" lines={3} height={16} />
      </div>
      <div className="flex justify-between">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={120} height={32} />
      </div>
    </div>
  );
}

export function SkeletonProfile({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center space-x-4", className)} {...props}>
      <Skeleton variant="avatar" width={64} height={64} />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={16} width="40%" />
      </div>
    </div>
  );
}

export function SkeletonList({ 
  items = 3, 
  className, 
  ...props 
}: { items?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonProfile key={index} />
      ))}
    </div>
  );
}