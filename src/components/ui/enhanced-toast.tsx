import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle, Info, Loader2 } from 'lucide-react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const toastVariants = {
  default: {
    className: "border-border bg-background text-foreground",
    icon: null
  },
  success: {
    className: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
    icon: Check
  },
  error: {
    className: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
    icon: X
  },
  warning: {
    className: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-100",
    icon: AlertCircle
  },
  info: {
    className: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
    icon: Info
  }
};

export function EnhancedToast({
  id,
  title,
  description,
  type = 'default',
  duration = 5000,
  action,
  onClose,
  className
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const variant = toastVariants[type];
  const Icon = variant.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variant.className,
        isRemoving && "animate-exit",
        !isRemoving && "animate-enter",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start space-x-3">
        {Icon && (
          <div className={cn(
            "flex-shrink-0 w-5 h-5 mt-0.5",
            type === 'success' && "text-green-600 dark:text-green-400",
            type === 'error' && "text-red-600 dark:text-red-400",
            type === 'warning' && "text-orange-600 dark:text-orange-400",
            type === 'info' && "text-blue-600 dark:text-blue-400"
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="grid gap-1">
          {title && (
            <div className="text-sm font-semibold">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
        </div>
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}

      <button
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
          type === 'success' && "text-green-600/50 hover:text-green-600 dark:text-green-400/50 dark:hover:text-green-400",
          type === 'error' && "text-red-600/50 hover:text-red-600 dark:text-red-400/50 dark:hover:text-red-400",
          type === 'warning' && "text-orange-600/50 hover:text-orange-600 dark:text-orange-400/50 dark:hover:text-orange-400",
          type === 'info' && "text-blue-600/50 hover:text-blue-600 dark:text-blue-400/50 dark:hover:text-blue-400"
        )}
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar for timed toasts */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
          <div
            className={cn(
              "h-full transition-all ease-linear",
              type === 'success' && "bg-green-600 dark:bg-green-400",
              type === 'error' && "bg-red-600 dark:bg-red-400",
              type === 'warning' && "bg-orange-600 dark:bg-orange-400",
              type === 'info' && "bg-blue-600 dark:bg-blue-400",
              type === 'default' && "bg-primary"
            )}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}

// Loading toast variant
export function LoadingToast({
  title = "Loading...",
  description,
  className,
  ...props
}: Omit<ToastProps, 'type' | 'duration'>) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        "border-border bg-background text-foreground",
        "animate-enter",
        className
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
        <div className="grid gap-1">
          <div className="text-sm font-semibold">
            {title}
          </div>
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}