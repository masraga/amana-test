import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedData } from '../types/api';
import type {
  CreateReportPayload,
  Report,
  ReportFilters,
  UpdateReportPayload,
  UpdateStatusPayload,
} from '../types/report';

export const reportApi = {
  getReports: (filters?: ReportFilters) =>
    axiosClient.get<ApiResponse<PaginatedData<Report>>>('/reports', { params: filters }),

  getReport: (id: number) =>
    axiosClient.get<ApiResponse<Report>>(`/reports/${id}`),

  createReport: (payload: CreateReportPayload) =>
    axiosClient.post<ApiResponse<Report>>('/reports', payload),

  updateReport: (id: number, payload: UpdateReportPayload) =>
    axiosClient.put<ApiResponse<Report>>(`/reports/${id}`, payload),

  submitReport: (id: number) =>
    axiosClient.patch<ApiResponse<Report>>(`/reports/${id}/submit`),

  deleteReport: (id: number) =>
    axiosClient.delete(`/reports/${id}`),

  getAdminReports: (filters?: ReportFilters) =>
    axiosClient.get<ApiResponse<PaginatedData<Report>>>('/admin/reports', { params: filters }),

  getAdminReport: (id: number) =>
    axiosClient.get<ApiResponse<Report>>(`/admin/reports/${id}`),

  updateReportStatus: (id: number, payload: UpdateStatusPayload) =>
    axiosClient.patch<ApiResponse<Report>>(`/admin/reports/${id}/status`, payload),
};
