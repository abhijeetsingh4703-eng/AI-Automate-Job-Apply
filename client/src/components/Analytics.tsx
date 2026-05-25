import { useEffect, useState } from 'react';
import { applicationService } from '../services/applicationService';

interface ApplicationStats {
  _id: string;
  count: number;
}

export function Analytics() {
  const [stats, setStats] = useState<ApplicationStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await applicationService.getStats();
        setStats(response || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const interviews = stats.find(s => s._id === 'interview')?.count || 0;
  const offers = stats.find(s => s._id === 'offer')?.count || 0;
  const conversionRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  return (
    <div>
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm">Interviews Scheduled</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{interviews}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <p className="text-gray-600 text-sm">Offers Received</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{offers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <p className="text-gray-600 text-sm">Conversion Rate</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{conversionRate}%</p>
            </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Application Status Breakdown</h2>
              <div className="space-y-4">
                {stats.map(stat => {
                  const percentage = total > 0 ? (stat.count / total) * 100 : 0;
                  const colors: any = {
                    applied: 'bg-blue-500',
                    interview: 'bg-green-500',
                    offer: 'bg-purple-500',
                    rejected: 'bg-red-500',
                    pending: 'bg-yellow-500',
                  };

                  return (
                    <div key={stat._id}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">{stat._id}</span>
                        <span className="text-gray-600">{stat.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[stat._id]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">💡 Insights</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {conversionRate < 10 && <li>✓ Tip: Try tailoring more resumes to job descriptions</li>}
                {interviews > 0 && <li>✓ Great job! You have {interviews} interview(s) scheduled</li>}
                {total < 10 && <li>✓ Apply to more jobs to increase chances</li>}
              </ul>
            </div>
          </>
        )}
    </div>
  );
}
