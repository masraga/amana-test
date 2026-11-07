import { AxiosError } from 'axios';
import type { ApiError } from '../types/api';

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const axiosErr = error as AxiosError<ApiError>;
  return axiosErr?.response?.data?.message ?? fallback;
}

export function extractFieldErrors(error: unknown): Record<string, string[]> {
  const axiosErr = error as AxiosError<ApiError>;
  return axiosErr?.response?.data?.errors ?? {};
}
