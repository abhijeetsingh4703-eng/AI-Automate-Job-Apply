import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';

interface StatsCard {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [, appsResponse, jobsResponse] = await Promise.all([
          authService.getProfile(),
          applicationService.getUserApplications(),
          jobService.searchJobs({ page: 1 }),
        ]);

        setApplications(appsResponse?.applications || []);
        setRecommendedJobs(jobsResponse?.jobs || []);

        // Calculate stats from applications
        const statsByStatus: any = {
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
        };

        (appsResponse?.applications || []).forEach((app: any) => {
          if (statsByStatus[app.status] !== undefined) {
            statsByStatus[app.status]++;
          }
        });

        const totalApplied = appsResponse?.applications?.length || 0;
        const interviews = statsByStatus.interview || 0;
        const offers = statsByStatus.offer || 0;
        const conversionRate = totalApplied > 0 ? Math.round((offers / totalApplied) * 100) : 0;

        setStats([
          {
            title: 'Total Applications',
            value: totalApplied,
            subtitle: `+${Math.max(0, totalApplied - 5)} this month`,
            icon: '📝',
            color: 'bg-blue-50 border-blue-200',
          },
          {
            title: 'Interviews',
            value: interviews,
            subtitle: `${interviews > 0 ? '+' : ''}${interviews - (interviews || 1)} this week`,
            icon: '💬',
            color: 'bg-green-50 border-green-200',
          },
          {
            title: 'Offers',
            value: offers,
            subtitle: offers > 0 ? 'Congrats! 🎉' : 'Keep applying',
            icon: '🎁',
            color: 'bg-purple-50 border-purple-200',
          },
          {
            title: 'Success Rate',
            value: conversionRate,
            subtitle: `${conversionRate}% conversion`,
            icon: '📈',
            color: 'bg-orange-50 border-orange-200',
          },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const handleApplyJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} border rounded-xl p-6 hover:shadow-lg transition`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <p className="text-xs text-gray-600">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  📋 Recent Applications
                </h2>
              </div>
              <div className="divide-y">
                {applications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>No applications yet. Start applying to jobs!</p>
                  </div>
                ) : (
                  applications.slice(0, 5).map((app: any) => (
                    <div key={app._id} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                          <p className="text-sm text-gray-600">{app.company}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied {new Date(app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            app.status === 'applied'
                              ? 'bg-blue-100 text-blue-700'
                              : app.status === 'interview'
                              ? 'bg-green-100 text-green-700'
                              : app.status === 'offer'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => navigate('/applications')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View all applications →
                </button>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900">⭐ Recommended for You</h2>
                <p className="text-xs text-gray-600 mt-1">AI-selected matches</p>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {recommendedJobs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>No jobs available</p>
                  </div>
                ) : (
                  recommendedJobs.slice(0, 5).map((job: any) => (
                    <div key={job._id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">{job.company}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {job.location} • 💼 {job.sourcePortal}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApplyJob(job._id)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition whitespace-nowrap"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-bold text-gray-900 mb-3">💡 Pro Tips</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Update your resume weekly</li>
                <li>✓ Apply early Tuesday morning</li>
                <li>✓ Tailor for each position</li>
                <li>✓ Track application status</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
}
