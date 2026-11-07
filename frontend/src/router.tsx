import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ReportListPage from './pages/reports/ReportListPage';
import ReportFormPage from './pages/reports/ReportFormPage';
import ReportDetailPage from './pages/reports/ReportDetailPage';
import AdminReportListPage from './pages/admin/AdminReportListPage';
import AdminReportDetailPage from './pages/admin/AdminReportDetailPage';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RoleRoute({ role }: { role: string }) {
  const user = useAuthStore((s) => s.user);
  return user?.role === role ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },

          // Reporter routes
          { path: '/reports', element: <ReportListPage /> },
          { path: '/reports/new', element: <ReportFormPage /> },
          { path: '/reports/:id', element: <ReportDetailPage /> },
          { path: '/reports/:id/edit', element: <ReportFormPage /> },

          // Admin routes
          {
            element: <RoleRoute role="administrator" />,
            children: [
              { path: '/admin/reports', element: <AdminReportListPage /> },
              { path: '/admin/reports/:id', element: <AdminReportDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
