import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';
import { LoginCredentials } from '../types/auth';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      setAuth(response.user, response.access_token);
      navigate('/dashboard');
    },
    [setAuth, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore errors on logout
    } finally {
      storeLogout();
      navigate('/login');
    }
  }, [storeLogout, navigate]);

  const isAdmin = user?.role === 'ADMIN';
  const isProfessor = user?.role === 'PROFESSOR';
  const isAluno = user?.role === 'ALUNO';
  const isResponsavel = user?.role === 'RESPONSAVEL';

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isProfessor,
    isAluno,
    isResponsavel,
    login,
    logout,
  };
}
