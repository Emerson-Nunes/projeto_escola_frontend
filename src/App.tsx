import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/Toast';
import { queryClient } from './lib/queryClient';
import { AppRoutes } from './routes';
import { useAuthStore } from './stores/auth.store';
import { authService } from './services/auth.service';

function AuthInitializer() {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      authService.me()
        .then((u) => setUser(u))
        .catch(() => logout());
    }
  }, [isAuthenticated, user, setUser, logout]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <Toaster>
            <AuthInitializer />
            <AppRoutes />
          </Toaster>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
