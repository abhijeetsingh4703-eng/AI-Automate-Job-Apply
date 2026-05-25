import api from './api';

export interface Application {
  _id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'applied' | 'rejected' | 'interview' | 'offer' | 'pending';
  sourcePortal: string;
  automatedApply: boolean;
}

export const applicationService = {
  applyToJob: async (data: {
    jobId: string;
    sourcePortal: string;
    resumeUsed?: string;
    automatedApply?: boolean;
  }) => {
    const response = await api.post('/applications/apply', data);
    return response.data.data;
  },

  getUserApplications: async (filters?: {
    status?: string;
    sourcePortal?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sourcePortal) params.append('sourcePortal', filters.sourcePortal);
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await api.get(`/applications?${params}`);
    return response.data.data;
  },

  updateStatus: async (applicationId: string, status: string) => {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/applications/stats');
    return response.data.data;
  },
};
