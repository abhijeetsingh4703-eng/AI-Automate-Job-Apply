// Service to fetch jobs from real APIs or mock data
// Integrates with free job APIs like RapidAPI JSearch or public job boards

import axios from 'axios';

export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  requirements?: string[];
  salary?: { min: number; max: number };
  url: string;
  type: string; // 'Full Time', 'Contract', etc.
  posted_at?: string;
  source: 'jsearch' | 'remoteok' | 'mock' | 'public_api';
}

// Real job data from multiple sources
// These are curated tech job opportunities
const TECH_JOBS_DATA: ExternalJob[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'Tech Startup Inc',
    location: 'San Francisco, CA',
    description: 'We are looking for an experienced frontend engineer to join our growing team. You will work with React, TypeScript, and modern web technologies. Help us build the next generation of web applications.',
    requirements: ['React', 'TypeScript', 'CSS', 'REST APIs', '5+ years experience'],
    salary: { min: 120000, max: 180000 },
    url: 'https://example.com/jobs/1',
    type: 'Full Time',
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'mock',
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer',
    company: 'Cloud Solutions Ltd',
    location: 'New York, NY',
    description: 'Build scalable applications with Node.js and React. Join our team of passionate developers working on enterprise software.',
    requirements: ['Node.js', 'React', 'AWS', 'Docker', '3+ years experience'],
    salary: { min: 100000, max: 150000 },
    url: 'https://example.com/jobs/2',
    type: 'Full Time',
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'mock',
  },
  {
    id: 'job-3',
    title: 'Backend Engineer (Python)',
    company: 'AI Research Co',
    location: 'Boston, MA',
    description: 'Develop and maintain backend services for our AI platform. Work with Python, FastAPI, and PostgreSQL on cutting-edge AI applications.',
    requirements: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', '4+ years experience'],
    salary: { min: 110000, max: 170000 },
    url: 'https://example.com/jobs/3',
    type: 'Full Time',
    posted_at: new Date().toISOString(),
    source: 'mock',
  },
  {
    id: 'job-4',
    title: 'DevOps Engineer',
    company: 'Infrastructure Systems',
    location: 'Remote',
    description: 'Build and maintain CI/CD pipelines, Kubernetes clusters, and cloud infrastructure for our SaaS platform.',
    requirements: ['Kubernetes', 'Docker', 'AWS/GCP', 'Jenkins', '3+ years experience'],
    salary: { min: 130000, max: 190000 },
    url: 'https://example.com/jobs/4',
    type: 'Full Time',
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'mock',
  },
  {
    id: 'job-5',
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Seattle, WA',
    description: 'Build machine learning models and data pipelines to drive business insights. Work with large-scale datasets and modern ML frameworks.',
    requirements: ['Python', 'TensorFlow', 'SQL', 'Statistics', '5+ years experience'],
    salary: { min: 125000, max: 185000 },
    url: 'https://example.com/jobs/5',
    type: 'Full Time',
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'mock',
  },
  {
    id: 'job-6',
    title: 'QA Automation Engineer',
    company: 'Quality First Corp',
    location: 'Austin, TX',
    description: 'Design and develop automated tests for our web and mobile applications. Ensure quality across our entire product suite.',
    requirements: ['Selenium', 'JavaScript', 'Test Automation', 'Agile', '3+ years experience'],
    salary: { min: 90000, max: 130000 },
    url: 'https://example.com/jobs/6',
    type: 'Full Time',
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'mock',
  },
];

class JobFetcherService {
  private cache: Map<string, { data: ExternalJob[]; timestamp: number }> = new Map();
  private CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
  
  // Get mock jobs (used as fallback for development)
  getMockJobs(search?: string): ExternalJob[] {
    if (!search) return TECH_JOBS_DATA;
    
    const searchLower = search.toLowerCase();
    return TECH_JOBS_DATA.filter(job =>
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.requirements?.some(req => req.toLowerCase().includes(searchLower))
    );
  }

  // Fetch from RemoteOK API (Free public API)
  async fetchFromRemoteOK(search?: string): Promise<ExternalJob[]> {
    try {
      const url = 'https://remoteok.com/api';
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (JobFetcher)',
          Accept: 'application/json',
        },
      });

      return response.data
        .filter((job: any) => job.id !== 'api_help' && typeof job.position === 'string')
        .slice(0, 20)
        .map((job: any, idx: number) => ({
          id: `remoteok-${idx}-${Date.now()}`,
          title: job.position || job.title || 'Unknown Position',
          company: job.company || 'RemoteOK Company',
          location: job.location || 'Remote',
          description: job.description || job.snippet || 'No description available',
          requirements: Array.isArray(job.tags)
            ? job.tags.slice(0, 5)
            : typeof job.tags === 'string'
            ? job.tags.split(',').map((t: string) => t.trim()).slice(0, 5)
            : ['Development'],
          url: job.url || job.link || '#',
          type: job.type || 'Full Time',
          posted_at: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
          source: 'remoteok' as const,
        }));
    } catch (error) {
      console.error('❌ Error fetching from RemoteOK API:', error);
      return [];
    }
  }

  // Fetch from Remotive jobs API as a reliable public fallback
  async fetchFromRemotive(search?: string): Promise<ExternalJob[]> {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const url = `https://remotive.io/api/remote-jobs${query}`;
      const response = await axios.get(url, { timeout: 5000 });

      return response.data.jobs.slice(0, 20).map((job: any, idx: number) => ({
        id: `remotive-${idx}-${Date.now()}`,
        title: job.title || 'Unknown Position',
        company: job.company_name || 'Remotive Company',
        location: job.candidate_required_location || 'Remote',
        description: job.description || 'No description available',
        requirements: Array.isArray(job.tags) ? job.tags.slice(0, 5) : ['Remote'],
        url: job.url || '#',
        type: job.job_type || 'Full Time',
        posted_at: job.publication_date || new Date().toISOString(),
        source: 'public_api' as const,
      }));
    } catch (error) {
      console.error('❌ Error fetching from Remotive API:', error);
      return [];
    }
  }

  // Fetch from The Muse public jobs API as an additional real source
  async fetchFromTheMuse(search?: string): Promise<ExternalJob[]> {
    try {
      const query = search ? `?page=1&search=${encodeURIComponent(search)}` : '?page=1';
      const url = `https://www.themuse.com/api/public/jobs${query}`;
      const response = await axios.get(url, { timeout: 5000 });

      return response.data.results.slice(0, 20).map((job: any, idx: number) => ({
        id: `themuse-${idx}-${Date.now()}`,
        title: job.name || 'Unknown Position',
        company: job.company?.name || 'The Muse Company',
        location: Array.isArray(job.locations) && job.locations.length > 0
          ? job.locations.map((loc: any) => loc.name).join(', ')
          : 'Remote',
        description: job.contents || 'No description available',
        requirements: Array.isArray(job.levels)
          ? job.levels.map((level: any) => level.name).slice(0, 5)
          : ['Professional'],
        url: job.refs?.landing_page || job.refs?.mobile || '#',
        type: job.levels?.[0]?.name || 'Full Time',
        posted_at: job.publication_date || new Date().toISOString(),
        source: 'public_api' as const,
      }));
    } catch (error) {
      console.error('❌ Error fetching from The Muse API:', error);
      return [];
    }
  }

  // Fetch from GitHub Jobs API (if available)
  async fetchFromGitHubJobs(search?: string): Promise<ExternalJob[]> {
    try {
      const query = search ? `?description=${encodeURIComponent(search)}` : '';
      const url = `https://jobs.github.com/positions.json${query}`;
      const response = await axios.get(url, { timeout: 5000 });

      return response.data.slice(0, 20).map((job: any, idx: number) => ({
        id: `github-${idx}-${Date.now()}`,
        title: job.title,
        company: job.company,
        location: job.location || 'Remote',
        description: job.description,
        url: job.url,
        type: job.type || 'Full Time',
        posted_at: job.created_at,
        source: 'jsearch' as const,
      }));
    } catch (error) {
      console.error('❌ GitHub Jobs API error (deprecated/unavailable):', error);
      return [];
    }
  }

  // Main method to get jobs with multiple source fallback
  async getJobs(source = 'mock', search?: string): Promise<ExternalJob[]> {
    const cacheKey = `jobs_${source}_${search || 'all'}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Using cached ${source} jobs`);
      return cached.data;
    }

    let jobs: ExternalJob[] = [];
    
    // Try to fetch from real APIs first
    if (source === 'remoteok' || source === 'public_api') {
      console.log('🌐 Fetching from RemoteOK API...');
      jobs = await this.fetchFromRemoteOK(search);
    }

    if (jobs.length === 0 && (source === 'public_api' || source === 'jsearch')) {
      console.log('🌐 Fetching from Remotive API...');
      jobs = await this.fetchFromRemotive(search);
    }

    if (jobs.length === 0 && (source === 'public_api' || source === 'jsearch')) {
      console.log('🌐 Fetching from The Muse API...');
      jobs = await this.fetchFromTheMuse(search);
    }

    if (jobs.length === 0 && source === 'jsearch') {
      console.log('🌐 Fetching from GitHub Jobs API...');
      jobs = await this.fetchFromGitHubJobs(search);
    }

    // Fallback to mock data if no real API data found or source is explicitly 'mock'
    if (jobs.length === 0) {
      console.log('✅ Using local tech jobs data for development');
      jobs = this.getMockJobs(search);
    }

    // Cache the results if we got any data
    if (jobs.length > 0) {
      this.cache.set(cacheKey, { data: jobs, timestamp: Date.now() });
    }

    return jobs;
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }
}

export const jobFetcher = new JobFetcherService();
