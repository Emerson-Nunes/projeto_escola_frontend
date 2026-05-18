import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  showLoader: (key: string) => void;
  hideLoader: (key: string) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType>({
  showLoader: () => {},
  hideLoader: () => {},
  isLoading: false,
});

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const showLoader = useCallback((key: string) => {
    setLoadingKeys((prev) => new Set(prev).add(key));
  }, []);

  const hideLoader = useCallback((key: string) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = loadingKeys.size > 0;

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-6 shadow-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoader() {
  return useContext(LoadingContext);
}
