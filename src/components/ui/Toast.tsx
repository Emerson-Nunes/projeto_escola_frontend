import React, { createContext, useContext, useState, useCallback } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-border bg-card',
  success: 'border-green-500/30 bg-green-500/10 dark:bg-green-900/20',
  error: 'border-red-500/30 bg-red-500/10 dark:bg-red-900/20',
  warning: 'border-yellow-500/30 bg-yellow-500/10 dark:bg-yellow-900/20',
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
  success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
};

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: 'error' });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: 'warning' });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ title, description, variant: 'default' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <RadixToast.Root
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
              'data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-5',
              variantStyles[toast.variant || 'default']
            )}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            duration={4000}
          >
            <div className="flex-shrink-0">{variantIcons[toast.variant || 'default']}</div>
            <div className="flex-1">
              <RadixToast.Title className="text-sm font-semibold text-foreground">
                {toast.title}
              </RadixToast.Title>
              {toast.description && (
                <RadixToast.Description className="mt-1 text-sm text-muted-foreground">
                  {toast.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close
              className="flex-shrink-0 rounded opacity-70 hover:opacity-100"
              onClick={() => removeToast(toast.id)}
            >
              <X className="h-4 w-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-6 sm:max-w-sm" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
