import api from './api';

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  sourcePortal: string;
  externalUrl: string;
  postedDate: string;
}

export const jobService = {
  searchJobs: async (filters?: {
    search?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    sourcePortal?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.minSalary) params.append('minSalary', filters.minSalary.toString());
    if (filters?.maxSalary) params.append('maxSalary', filters.maxSalary.toString());
    if (filters?.sourcePortal) params.append('sourcePortal', filters.sourcePortal);
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await api.get(`/jobs/search?${params}`);
    return response.data.data;
  },

  getJob: async (jobId: string) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data.data;
  },
};
