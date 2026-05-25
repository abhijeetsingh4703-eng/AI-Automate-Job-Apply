import { useNavigate } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Jobs', path: '/jobs', icon: '🔍' },
    { label: 'Applications', path: '/applications', icon: '📋' },
    { label: 'Resume', path: '/resume', icon: '📄' },
    { label: 'Analytics', path: '/analytics', icon: '📈' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="px-4 py-3 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition font-medium text-sm"
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
