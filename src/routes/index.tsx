import React, { lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Skeleton } from '../components/ui/Skeleton';

// Auth
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));

// Dashboard
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));

// Students
const StudentsListPage = lazy(() => import('../pages/students/StudentsListPage'));
const StudentFormPage = lazy(() => import('../pages/students/StudentFormPage'));
const StudentDetailPage = lazy(() => import('../pages/students/StudentDetailPage'));

// Teachers
const TeachersListPage = lazy(() => import('../pages/teachers/TeachersListPage'));
const TeacherFormPage = lazy(() => import('../pages/teachers/TeacherFormPage'));
const TeacherDetailPage = lazy(() => import('../pages/teachers/TeacherDetailPage'));

// Guardians
const GuardiansListPage = lazy(() => import('../pages/guardians/GuardiansListPage'));
const GuardianFormPage = lazy(() => import('../pages/guardians/GuardianFormPage'));
const GuardianDetailPage = lazy(() => import('../pages/guardians/GuardianDetailPage'));

// Classrooms
const ClassroomsListPage = lazy(() => import('../pages/classrooms/ClassroomsListPage'));
const ClassroomFormPage = lazy(() => import('../pages/classrooms/ClassroomFormPage'));
const ClassroomDetailPage = lazy(() => import('../pages/classrooms/ClassroomDetailPage'));

// Subjects
const SubjectsListPage = lazy(() => import('../pages/subjects/SubjectsListPage'));
const SubjectFormPage = lazy(() => import('../pages/subjects/SubjectFormPage'));

// Grades
const GradeLaunchPage = lazy(() => import('../pages/grades/GradeLaunchPage'));
const ReportCardPage = lazy(() => import('../pages/grades/ReportCardPage'));

// Attendance
const AttendancePage = lazy(() => import('../pages/attendance/AttendancePage'));
const AttendanceReportPage = lazy(() => import('../pages/attendance/AttendanceReportPage'));

// Reports
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));

// Profile & Settings
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));

// Contact
const ContactPage = lazy(() => import('../pages/contact/ContactPage'));

// ErrorBoundary
interface ErrorBoundaryState { hasError: boolean; error?: Error }
class PageErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <p className="text-lg font-semibold text-foreground">Algo deu errado nesta página.</p>
          <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            onClick={() => this.setState({ hasError: false })}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Settings (admin only) */}
              <Route path="/settings" element={<SettingsPage />} />

              {/* Students */}
              <Route path="/students" element={<StudentsListPage />} />
              <Route path="/students/new" element={<StudentFormPage />} />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/students/:id/edit" element={<StudentFormPage />} />

              {/* Teachers */}
              <Route path="/teachers" element={<TeachersListPage />} />
              <Route path="/teachers/new" element={<TeacherFormPage />} />
              <Route path="/teachers/:id" element={<TeacherDetailPage />} />
              <Route path="/teachers/:id/edit" element={<TeacherFormPage />} />

              {/* Guardians */}
              <Route path="/guardians" element={<GuardiansListPage />} />
              <Route path="/guardians/new" element={<GuardianFormPage />} />
              <Route path="/guardians/:id" element={<GuardianDetailPage />} />
              <Route path="/guardians/:id/edit" element={<GuardianFormPage />} />

              {/* Classrooms */}
              <Route path="/classrooms" element={<ClassroomsListPage />} />
              <Route path="/classrooms/new" element={<ClassroomFormPage />} />
              <Route path="/classrooms/:id" element={<ClassroomDetailPage />} />
              <Route path="/classrooms/:id/edit" element={<ClassroomFormPage />} />

              {/* Subjects */}
              <Route path="/subjects" element={<SubjectsListPage />} />
              <Route path="/subjects/new" element={<SubjectFormPage />} />
              <Route path="/subjects/:id/edit" element={<SubjectFormPage />} />

              {/* Grades */}
              <Route path="/grades" element={<GradeLaunchPage />} />
              <Route path="/grades/report-card" element={<ReportCardPage />} />

              {/* Attendance */}
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/attendance/report" element={<AttendanceReportPage />} />

              {/* Reports */}
              <Route path="/reports" element={<ReportsPage />} />

              {/* Notifications */}
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Contact */}
              <Route path="/contact" element={<ContactPage />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </PageErrorBoundary>
  );
}
