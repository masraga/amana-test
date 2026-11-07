import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { DashboardStats } from '../types/report';

export const dashboardApi = {
  getStats: () =>
    axiosClient.get<ApiResponse<DashboardStats>>('/dashboard'),
};
