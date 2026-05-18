import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  BookMarked,
  ClipboardList,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  LogOut,
  Bell,
  Phone,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../services/auth.service';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/students', label: 'Alunos', icon: <Users className="h-5 w-5" />, roles: ['ADMIN', 'PROFESSOR'] },
  { to: '/teachers', label: 'Professores', icon: <GraduationCap className="h-5 w-5" />, roles: ['ADMIN'] },
  { to: '/guardians', label: 'Responsáveis', icon: <UserCheck className="h-5 w-5" />, roles: ['ADMIN'] },
  { to: '/classrooms', label: 'Turmas', icon: <BookOpen className="h-5 w-5" />, roles: ['ADMIN', 'PROFESSOR'] },
  { to: '/subjects', label: 'Disciplinas', icon: <BookMarked className="h-5 w-5" />, roles: ['ADMIN', 'PROFESSOR'] },
  { to: '/grades', label: 'Notas', icon: <ClipboardList className="h-5 w-5" /> },
  { to: '/attendance', label: 'Frequência', icon: <Calendar className="h-5 w-5" /> },
  { to: '/reports', label: 'Relatórios', icon: <FileText className="h-5 w-5" />, roles: ['ADMIN', 'PROFESSOR'] },
  { to: '/contact', label: 'Contato', icon: <Phone className="h-5 w-5" /> },
  { to: '/notifications', label: 'Notificações', icon: <Bell className="h-5 w-5" />, roles: ['ADMIN', 'PROFESSOR'] },
  { to: '/settings', label: 'Configurações', icon: <Settings className="h-5 w-5" />, roles: ['ADMIN'] },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onClose?.();
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-64 md:w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <School className="h-8 w-8 flex-shrink-0 text-primary" />
        <span className={cn('ml-3 text-lg font-bold text-foreground', collapsed ? 'hidden md:hidden' : '')}>
          SisEscolar
        </span>
        {/* Collapse button — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hidden md:flex rounded-md p-1 hover:bg-secondary"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={cn('ml-3', collapsed ? 'hidden md:hidden' : '')}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-4">
        <div className={cn('flex items-center', collapsed ? 'md:justify-center' : 'gap-3')}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={cn('flex-1 overflow-hidden', collapsed ? 'hidden md:hidden' : '')}>
            <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
