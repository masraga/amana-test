import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboardApi';
import Spinner from '../../components/common/Spinner';
import { useAuthStore } from '../../store/authStore';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${color}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data.data),
  });

  if (isLoading) return <Spinner className="mt-12" />;

  const isAdmin = user?.role === 'administrator';

  return (
    <div>
      <p className="text-gray-600 mb-6">Welcome back, <strong>{user?.name}</strong></p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Reports" value={data?.total ?? 0} color="border-gray-400" />
        <StatCard label="Submitted" value={data?.submitted ?? 0} color="border-blue-500" />
        <StatCard label="Under Review" value={data?.under_review ?? 0} color="border-yellow-500" />
        <StatCard label="Resolved" value={data?.resolved ?? 0} color="border-green-500" />
      </div>

      {!isAdmin && data?.draft !== undefined && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Drafts" value={data.draft} color="border-gray-300" />
        </div>
      )}
    </div>
  );
}
