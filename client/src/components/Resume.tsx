import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Resume() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await api.get('/resume');
      setResumes(response.data.data || []);
    } catch (err) {
      console.error('Failed to load resumes', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/msword' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Only PDF and DOC files are allowed');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('✅ Resume uploaded successfully!');
      setFile(null);
      await loadResumes();
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError('❌ ' + (err.response?.data?.message || 'Failed to upload resume'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Delete this resume?')) return;

    try {
      await api.delete(`/resume/${resumeId}`);
      setMessage('✅ Resume deleted');
      await loadResumes();
    } catch (err: any) {
      setError('❌ Failed to delete resume');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">📄 Resume Manager</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-5xl mb-4 text-center">📤</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Upload Resume</h2>
            <p className="text-gray-600 mb-4 text-center">PDF or DOC files only</p>
            
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resumeInput"
              />
              <label htmlFor="resumeInput" className="cursor-pointer block">
                <p className="text-gray-700 font-semibold">
                  {file ? file.name : 'Click to upload file'}
                </p>
              </label>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded mb-4 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? '⏳ Uploading...' : 'Upload Resume'}
            </button>
          </div>

          {/* Resume List */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Resumes ({resumes.length})</h2>
            {resumes.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No resumes uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume: any) => (
                  <div key={resume._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{resume.fileName}</p>
                      <p className="text-xs text-gray-500">{(resume.fileSize / 1024).toFixed(1)} KB • {new Date(resume.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Features Coming */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-gray-900 mb-2">Resume Tailor</h3>
            <p className="text-sm text-gray-700">Coming soon: AI will tailor your resume for each job</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-900 mb-2">Cover Letter</h3>
            <p className="text-sm text-gray-700">Coming soon: Generate custom cover letters with AI</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-sm text-gray-700">Coming soon: Get AI feedback on your resume</p>
          </div>
        </div>
      </main>
    </div>
  );
}
