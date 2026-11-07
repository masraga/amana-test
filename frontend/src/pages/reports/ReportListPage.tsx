import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatDate';
import { toast } from '../../store/toastStore';
import { extractErrorMessage } from '../../utils/apiError';
import type { Report, ReportFilters, ReportCategory, ReportStatus } from '../../types/report';

const CATEGORIES: ReportCategory[] = ['fraud', 'harassment', 'safety', 'corruption', 'other'];
const STATUSES: ReportStatus[] = ['draft', 'submitted', 'under_review', 'resolved'];

export default function ReportListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ReportFilters>({ page: 1 });
  const [titleInput, setTitleInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, title: titleInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [titleInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportApi.getReports(filters).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reportApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
      toast.success('Report deleted successfully.');
    },
    onError: (err) => {
      setDeleteTarget(null);
      toast.error(extractErrorMessage(err, 'Failed to delete report.'));
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: number) => reportApi.submitReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Report submitted successfully.');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to submit report.'));
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div />
        <Link
          to="/reports/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by title..."
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filters.category ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as ReportCategory || undefined, page: 1 }))}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
        <select
          value={filters.status ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as ReportStatus || undefined, page: 1 }))}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <Spinner className="py-12" />
        ) : isError ? (
          <div className="text-center py-12 text-red-500">Failed to load reports. Please refresh the page.</div>
        ) : !data?.items.length ? (
          <div className="text-center py-12 text-gray-500">No reports found.</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Reference', 'Title', 'Category', 'Incident Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.items.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono whitespace-nowrap">{report.reference_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{report.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{report.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(report.incident_date)}</td>
                    <td className="px-6 py-4"><Badge status={report.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/reports/${report.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {report.status === 'draft' && (
                          <>
                            <button
                              onClick={() => navigate(`/reports/${report.id}/edit`)}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => submitMutation.mutate(report.id)}
                              disabled={submitMutation.isPending}
                              className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-40"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(report)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.meta && (
              <Pagination
                currentPage={data.meta.current_page}
                lastPage={data.meta.last_page}
                total={data.meta.total}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        title="Delete Report"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
