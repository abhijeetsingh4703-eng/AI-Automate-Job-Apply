import { useState, useEffect } from 'react';
import api from '../services/api';

interface Resume {
  _id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resume');
      setResumes(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      setDeletingId(resumeId);
      await api.delete(`/resume/${resumeId}`);
      setResumes(resumes.filter(r => r._id !== resumeId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center">Loading resumes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-600">
          No resumes uploaded yet. Upload one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Resumes</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                File Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Size
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Uploaded
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {resumes.map((resume) => (
              <tr key={resume._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"></path>
                    </svg>
                    {resume.fileName}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {(resume.fileSize / 1024).toFixed(2)} KB
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(resume._id)}
                    disabled={deletingId === resume._id}
                    className="text-red-600 hover:text-red-900 text-sm font-semibold disabled:text-gray-400"
                  >
                    {deletingId === resume._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
