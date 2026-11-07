import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload),

  logout: () =>
    axiosClient.post<ApiResponse<null>>('/auth/logout'),

  me: () =>
    axiosClient.get<ApiResponse<User>>('/auth/me'),
};
