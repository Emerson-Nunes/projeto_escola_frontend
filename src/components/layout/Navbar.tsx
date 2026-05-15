import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../services/auth.service';
import { cn } from '../../utils/cn';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Alunos',
  '/teachers': 'Professores',
  '/guardians': 'Responsáveis',
  '/classrooms': 'Turmas',
  '/subjects': 'Disciplinas',
  '/grades': 'Notas',
  '/attendance': 'Frequência',
  '/reports': 'Relatórios',
  '/settings': 'Configurações',
  '/profile': 'Meu Perfil',
};

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Sistema Escolar';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center border-b border-border bg-card px-6">
      <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>

      <div className="ml-auto flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Notificações"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-md border border-border bg-card shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Notificações</p>
              </div>
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação no momento.
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block">{user?.name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[160px] rounded-md border border-border bg-card p-1 shadow-md"
              align="end"
              sideOffset={4}
            >
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-foreground outline-none hover:bg-secondary"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4" />
                Perfil
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none',
                  'text-destructive hover:bg-secondary'
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
