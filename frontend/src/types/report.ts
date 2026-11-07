export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'resolved';
export type ReportCategory = 'fraud' | 'harassment' | 'safety' | 'corruption' | 'other';

export interface Report {
  id: number;
  reference_number: string;
  title: string;
  category: ReportCategory;
  description: string;
  incident_date: string;
  status: ReportStatus;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ReportFilters {
  title?: string;
  category?: ReportCategory | '';
  status?: ReportStatus | '';
  page?: number;
}

export interface CreateReportPayload {
  title: string;
  category: ReportCategory;
  description: string;
  incident_date: string;
}

export type UpdateReportPayload = Partial<CreateReportPayload>;

export interface UpdateStatusPayload {
  status: ReportStatus;
}

export interface DashboardStats {
  total: number;
  draft?: number;
  submitted: number;
  under_review: number;
  resolved: number;
}
