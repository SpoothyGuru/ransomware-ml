import { Link, useNavigate } from 'react-router-dom';
import { clearAuth } from '../api';
import {
  HomeIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">🛡️</span>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Malware Detection
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-colors"
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
              <Link
                to="/predict"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-colors"
              >
                <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-1" />
                Predict
              </Link>
              <Link
                to="/analysis"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary-600 border-b-2 border-transparent hover:border-primary-600 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5 mr-1" />
                Analysis
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <UserIcon className="h-5 w-5" />
                <span className="font-medium">{user.email || user.username || 'User'}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className="block pl-3 pr-4 py-2 border-l-4 border-primary-500 text-base font-medium text-primary-700 bg-primary-50"
          >
            Dashboard
          </Link>
          <Link
            to="/predict"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            Predict
          </Link>
          <Link
            to="/analysis"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

