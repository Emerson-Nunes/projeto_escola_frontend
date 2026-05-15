import React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import GuardianDashboard from './GuardianDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'PROFESSOR':
      return <TeacherDashboard />;
    case 'ALUNO':
      return <StudentDashboard />;
    case 'RESPONSAVEL':
      return <GuardianDashboard />;
    default:
      return <AdminDashboard />;
  }
}
