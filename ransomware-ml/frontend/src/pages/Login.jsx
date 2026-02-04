import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, login } from '../api';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try to login with backend
      const response = await login(formData.username, formData.password);
      
      // Store token and user info
      setAuthToken(response.access_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        // Create user object from username if not provided
        localStorage.setItem('user', JSON.stringify({ 
          email: formData.username, 
          username: formData.username.split('@')[0] 
        }));
      }
      
      // Redirect to /predict as specified
      navigate('/predict');
    } catch (err) {
      console.error('Login error:', err);
      
      // If backend is not available, use development mode
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.code === 'ECONNABORTED') {
        // Development mode: Allow login without backend
        console.warn('Backend not available, using development mode');
        
        // Validate credentials (for demo purposes)
        if (formData.username && formData.password) {
          // Create a mock token for development
          const mockToken = `dev-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setAuthToken(mockToken);
          localStorage.setItem('user', JSON.stringify({ 
            email: formData.username, 
            username: formData.username.split('@')[0] 
          }));
          
          // Show warning but allow login
          setError('⚠️ Development Mode: Backend not available. Using mock authentication.');
          setTimeout(() => {
            navigate('/predict');
          }, 1000);
          return;
        } else {
          setError('Cannot connect to server. Please ensure the backend is running on http://localhost:7860');
        }
      } else if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.detail || 
                            err.response.data?.message || 
                            `Server error: ${err.response.status} ${err.response.statusText}`;
        setError(errorMessage);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <ShieldCheckIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Malware Detection System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className={`px-4 py-3 rounded ${
              error.includes('Development Mode') || error.includes('⚠️')
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username / Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username or email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Sample Credentials:</p>
            <p className="text-xs text-blue-700">
              <strong>Username:</strong> admin@example.com<br />
              <strong>Password:</strong> StrongPass123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

