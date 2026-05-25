import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function CandidateProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    phone: '',
    linkedIn: '',
    careerLevel: 'Mid',
    yearsExperience: 3,
    skills: '',
    jobPreferences: {
      roles: '',
      industries: '',
      locations: '',
      minSalary: 0,
      maxSalary: 200000,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data.data) {
        setProfile(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('jobPreferences.')) {
      const key = name.replace('jobPreferences.', '');
      setProfile({
        ...profile,
        jobPreferences: {
          ...profile.jobPreferences,
          [key]: isNaN(Number(value)) ? value : Number(value),
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: isNaN(Number(value)) ? value : Number(value),
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/profile', profile);
      setMessage('✅ Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('❌ Failed to save profile: ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${message.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {message}
            </div>
          )}

          {/* Contact Info Section */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">📞</span>
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile URL</label>
                <input
                  type="url"
                  name="linkedIn"
                  value={profile.linkedIn}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">This helps employers verify your professional background</p>
              </div>
            </div>
          </div>

          {/* Professional Experience Section */}
          <div className="border-t border-gray-200 pt-10 mb-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">💼</span>
              <h2 className="text-2xl font-bold text-gray-900">Professional Experience</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Career Level</label>
                <select
                  name="careerLevel"
                  value={profile.careerLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Junior">Junior (0-2 years)</option>
                  <option value="Mid">Mid-Level (2-5 years)</option>
                  <option value="Senior">Senior (5-10 years)</option>
                  <option value="Lead">Lead (10-15 years)</option>
                  <option value="Principal">Principal/Architect (15+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Years of Experience</label>
                <input
                  type="number"
                  name="yearsExperience"
                  min="0"
                  max="60"
                  value={profile.yearsExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Key Technical Skills</label>
              <textarea
                name="skills"
                value={profile.skills}
                onChange={handleChange}
                placeholder="JavaScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Add skills separated by commas for better job matching</p>
            </div>
          </div>

          {/* Job Preferences Section */}
          <div className="border-t border-gray-200 pt-10 mb-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">🎯</span>
              <h2 className="text-2xl font-bold text-gray-900">Job Preferences</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Job Roles</label>
                <input
                  type="text"
                  name="jobPreferences.roles"
                  value={profile.jobPreferences.roles}
                  onChange={handleChange}
                  placeholder="e.g., Full Stack Engineer, Backend Engineer, DevOps Engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple roles with commas</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Industries</label>
                <input
                  type="text"
                  name="jobPreferences.industries"
                  value={profile.jobPreferences.industries}
                  onChange={handleChange}
                  placeholder="e.g., Technology, FinTech, AI/ML, E-commerce"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Work Locations</label>
                <input
                  type="text"
                  name="jobPreferences.locations"
                  value={profile.jobPreferences.locations}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, Remote, New York, London"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Use 'Remote' if you prefer remote positions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Salary Expectation</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-semibold">$</span>
                    <input
                      type="number"
                      name="jobPreferences.minSalary"
                      value={profile.jobPreferences.minSalary}
                      onChange={handleChange}
                      placeholder="50000"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-600 text-sm">/year</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Salary Expectation</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-semibold">$</span>
                    <input
                      type="number"
                      name="jobPreferences.maxSalary"
                      value={profile.jobPreferences.maxSalary}
                      onChange={handleChange}
                      placeholder="200000"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-600 text-sm">/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                '💾 Save Profile'
              )}
            </button>
            
            <button
              onClick={() => navigate('/resume')}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
            >
              📄 Upload Resume
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Why is this important?</h3>
                <p className="text-sm text-blue-800">
                  Your profile information helps the system match you with the most relevant job opportunities and enables smarter automation for job applications.
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
