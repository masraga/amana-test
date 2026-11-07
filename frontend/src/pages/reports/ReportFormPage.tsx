import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';
import Spinner from '../../components/common/Spinner';
import { toast } from '../../store/toastStore';
import { extractErrorMessage, extractFieldErrors } from '../../utils/apiError';
import type { ReportCategory } from '../../types/report';

const CATEGORIES: ReportCategory[] = ['fraud', 'harassment', 'safety', 'corruption', 'other'];

interface FormState {
  title: string;
  category: ReportCategory | '';
  description: string;
  incident_date: string;
}

export default function ReportFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [form, setForm] = useState<FormState>({
    title: '',
    category: '',
    description: '',
    incident_date: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { data: existing, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportApi.getReport(Number(id)).then((r) => r.data.data),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        category: existing.category,
        description: existing.description,
        incident_date: existing.incident_date.split('T')[0],
      });
    }
  }, [existing]);

  const handleError = (err: unknown) => {
    const fields = extractFieldErrors(err);
    if (Object.keys(fields).length > 0) {
      setFieldErrors(fields);
      toast.error('Please fix the validation errors below.');
    } else {
      toast.error(extractErrorMessage(err, 'Failed to save report. Please try again.'));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: FormState) =>
      reportApi.createReport({ ...data, category: data.category as ReportCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Report saved as draft.');
      navigate('/reports');
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormState) =>
      reportApi.updateReport(Number(id), { ...data, category: data.category as ReportCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      toast.success('Report updated successfully.');
      navigate('/reports');
    },
    onError: handleError,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (isEditing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  if (isEditing && isLoading) return <Spinner className="mt-12" />;

  const isPending = createMutation.isPending || updateMutation.isPending;
  const fieldError = (field: string) => fieldErrors[field]?.[0];

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldError('title') ? 'border-red-400' : 'border-gray-300'}`}
          />
          {fieldError('title') && <p className="text-red-600 text-xs mt-1">{fieldError('title')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ReportCategory })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldError('category') ? 'border-red-400' : 'border-gray-300'}`}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          {fieldError('category') && <p className="text-red-600 text-xs mt-1">{fieldError('category')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            value={form.incident_date}
            onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldError('incident_date') ? 'border-red-400' : 'border-gray-300'}`}
          />
          {fieldError('incident_date') && <p className="text-red-600 text-xs mt-1">{fieldError('incident_date')}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${fieldError('description') ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Describe the incident in detail..."
          />
          {fieldError('description') && <p className="text-red-600 text-xs mt-1">{fieldError('description')}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : isEditing ? 'Update Report' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
