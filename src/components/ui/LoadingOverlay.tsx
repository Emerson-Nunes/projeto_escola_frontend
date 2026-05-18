import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ loading, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[1px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      )}
    </div>
  );
}
