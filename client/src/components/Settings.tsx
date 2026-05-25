import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
              <input
                type="email"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Name</label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 Automation</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-Apply</p>
                <p className="text-sm text-gray-600">Automatically apply to matching jobs</p>
              </div>
              <input type="checkbox" disabled className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts for interviews and offers</p>
              </div>
              <input type="checkbox" disabled className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Coming in Phase 2</p>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Subscription</h2>
          <div className="mb-4">
            <p className="text-lg font-bold text-gray-900">Free Plan</p>
            <p className="text-sm text-gray-600">Upgrade coming soon for premium features</p>
          </div>
          <button disabled className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
            Upgrade (Coming Soon)
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-red-600 mb-4">🔴 Danger Zone</h2>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
