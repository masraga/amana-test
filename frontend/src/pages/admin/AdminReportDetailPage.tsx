import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatDate';
import { toast } from '../../store/toastStore';
import { extractErrorMessage } from '../../utils/apiError';
import type { ReportStatus } from '../../types/report';

const NEXT_STATUSES: ReportStatus[] = ['submitted', 'under_review', 'resolved'];

export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['admin-report', id],
    queryFn: () => reportApi.getAdminReport(Number(id)).then((r) => r.data.data),
  });

  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | ''>('');

  const updateMutation = useMutation({
    mutationFn: (status: ReportStatus) => reportApi.updateReportStatus(Number(id), { status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-report', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedStatus('');
      toast.success(`Status updated to "${res.data.data.status.replace('_', ' ')}".`);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to update status.'));
    },
  });

  if (isLoading) return <Spinner className="mt-12" />;
  if (isError) return <div className="text-red-500">Failed to load report. Please go back and try again.</div>;
  if (!report) return <div className="text-gray-500">Report not found.</div>;

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 font-mono mb-1">{report.reference_number}</p>
            <h2 className="text-xl font-semibold text-gray-900">{report.title}</h2>
          </div>
          <Badge status={report.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide">Reporter</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.user?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide">Category</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{report.category}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide">Incident Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(report.incident_date)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide">Submitted On</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(report.created_at)}</dd>
          </div>
        </dl>

        <div className="mb-6">
          <dt className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</dt>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
        </div>

        {/* Status Update */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Update Investigation Status</p>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select new status...</option>
              {NEXT_STATUSES.filter((s) => s !== report.status).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <button
              onClick={() => selectedStatus && updateMutation.mutate(selectedStatus as ReportStatus)}
              disabled={!selectedStatus || updateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin/reports')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Reports
          </button>
        </div>
      </div>
    </div>
  );
}
