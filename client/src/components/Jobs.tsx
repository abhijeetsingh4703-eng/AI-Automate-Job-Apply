import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';

export function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    sourcePortal: '',
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobService.searchJobs({ ...filters, page });
      setJobs(response?.jobs || []);
      setTotal(response?.total || 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  const handleApply = async (job: any) => {
    try {
      await applicationService.applyToJob({
        jobId: job.id || job._id,
        sourcePortal: job.sourcePortal || job.source || 'github',
      });
      alert('✅ Applied successfully!');
      setJobs(jobs.filter(j => (j.id || j._id) !== (job.id || job._id)));
    } catch (error: any) {
      console.error('Error applying:', error);
      alert('❌ ' + (error.response?.data?.message || 'Failed to apply'));
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => {
                setFilters({ ...filters, location: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.sourcePortal}
              onChange={(e) => {
                setFilters({ ...filters, sourcePortal: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Portals</option>
              <option value="indeed">Indeed</option>
              <option value="linkedin">LinkedIn</option>
              <option value="glassdoor">Glassdoor</option>
              <option value="angellist">AngelList</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No jobs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <div key={job.id || job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/jobs/${job.id || job._id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <div className="mt-2 flex gap-2 flex-wrap text-sm text-gray-500">
                      <span>📍 {job.location}</span>
                      <span>💼 {job.sourcePortal || job.source || 'Job Board'}</span>
                      {job.salary && <span>💰 ${job.salary.min?.toLocaleString() || '0'} - ${job.salary.max?.toLocaleString() || '0'}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                </div>
                <p className="text-gray-700 line-clamp-3 mb-4">{job.description || 'No description'}</p>
                <div className="flex gap-2 flex-wrap">
                  {job.requirements?.slice(0, 5).map((req: any, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {typeof req === 'string' ? req : JSON.stringify(req).substring(0, 20)}
                    </span>
                  ))}
                  {job.requirements?.length > 5 && (
                    <span className="text-gray-500 text-sm">+{job.requirements.length - 5} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {page} of {Math.ceil(total / 20)}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
