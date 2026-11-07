import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatDate';
import { toast } from '../../store/toastStore';
import { extractErrorMessage } from '../../utils/apiError';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportApi.getReport(Number(id)).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => reportApi.deleteReport(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report deleted.');
      navigate('/reports');
    },
    onError: (err) => {
      setShowDelete(false);
      toast.error(extractErrorMessage(err, 'Failed to delete report.'));
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => reportApi.submitReport(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Report submitted successfully.');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to submit report.'));
    },
  });

  if (isLoading) return <Spinner className="mt-12" />;
  if (isError) return <div className="text-red-500">Failed to load report. Please go back and try again.</div>;
  if (!report) return <div className="text-gray-500">Report not found.</div>;

  const isDraft = report.status === 'draft';

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

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          {isDraft && (
            <>
              <button
                onClick={() => navigate(`/reports/${id}/edit`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
