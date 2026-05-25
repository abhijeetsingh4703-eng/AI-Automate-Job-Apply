import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Job {
  _id: string;
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: { min: number; max: number };
  sourcePortal?: string;
  source?: string;
  externalUrl?: string;
  url?: string;
  postedDate?: string;
  posted_at?: string;
}

export function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${jobId}`);
      const jobData = response.data.data || response.data;
      setJob(jobData);
      setError('');
    } catch (err: any) {
      console.error('Error loading job:', err);
      setError(err.response?.data?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!job) return;
    
    setApplying(true);
    try {
      await api.post('/applications/apply', {
        jobId: job._id || job.id,
        jobTitle: job.title,
        company: job.company,
      });
      alert('✅ Applied successfully!');
      navigate('/applications');
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to apply'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-gray-600">⏳ Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow p-8">
          <p className="text-xl text-red-600 mb-4">❌ {error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const salary = job.salary;
  const externalUrl = job.externalUrl || job.url;
  const portal = job.sourcePortal || job.source || 'Job Board';

  return (
    <div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-gray-200 p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{job.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-gray-600 text-sm">Company</p>
                  <p className="text-xl font-semibold text-gray-900">{job.company}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-gray-600 text-sm">Location</p>
                  <p className="text-xl font-semibold text-gray-900">{job.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">💼</span>
                <div>
                  <p className="text-gray-600 text-sm">Source</p>
                  <p className="text-xl font-semibold text-gray-900">{portal}</p>
                </div>
              </div>
            </div>

            {salary && (
              <div className="inline-block bg-green-100 border border-green-300 rounded-lg px-4 py-3">
                <p className="text-gray-700 text-sm">Salary Range</p>
                <p className="text-2xl font-bold text-green-700">
                  ${salary.min?.toLocaleString() || '0'} - ${salary.max?.toLocaleString() || '0'}/year
                </p>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Requirements Section */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements & Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-blue-600 text-xl font-bold">✓</span>
                    <span className="text-gray-700">
                      {typeof req === 'string' ? req : JSON.stringify(req)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="p-8 bg-gray-50 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {applying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Applying...
                </>
              ) : (
                '✅ Apply to This Job'
              )}
            </button>
            
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-center"
              >
                🔗 View on {portal}
              </a>
            )}
            
            <button
              onClick={() => navigate('/jobs')}
              className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-lg transition text-center"
            >
              ← See More Jobs
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Tip</h3>
            <p className="text-gray-700">
              Customize your resume for this role before applying to increase your chances of getting selected.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Next Steps</h3>
            <p className="text-gray-700">
              After applying, check your applications page to track the status of this and other applications.
            </p>
          </div>
        </div>
    </div>
  );
}
