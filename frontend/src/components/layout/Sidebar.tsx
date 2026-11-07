import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const reporterLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reports', label: 'My Reports' },
  { to: '/reports/new', label: 'New Report' },
];

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/admin/reports', label: 'All Reports' },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const links = user?.role === 'administrator' ? adminLinks : reporterLinks;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold">Amana</h1>
        <p className="text-xs text-gray-400 mt-1">Case Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">{user?.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
      </div>
    </aside>
  );
}
