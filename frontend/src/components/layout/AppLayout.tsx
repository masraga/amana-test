import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from '../common/ToastContainer';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reports': 'My Reports',
  '/reports/new': 'New Report',
  '/admin/reports': 'All Reports',
};

function getTitle(pathname: string): string {
  if (pathname.includes('/edit')) return 'Edit Report';
  if (pathname.includes('/reports/') && !pathname.includes('/admin')) return 'Report Details';
  if (pathname.includes('/admin/reports/')) return 'Report Details';
  return pageTitles[pathname] ?? 'Amana';
}

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={getTitle(location.pathname)} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
