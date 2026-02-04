import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import ModelChart from '../components/ModelChart';
import {
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import AIConsole from '../components/AIConsole';

const Dashboard = () => {
  const { toast, showToast, hideToast } = useToast();
  const [stats, setStats] = useState({
    total_scans: 0,
    malicious_count: 0,
    benign_count: 0,
    todays_scans: 0,
    false_positives: 0,
    false_negatives: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard summary
      const summaryResponse = await api.get('/dashboard');
      setStats(summaryResponse.data);
      
      // Fetch recent activity
      const recentResponse = await api.get('/dashboard/recent');
      setRecentActivity(recentResponse.data || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Fallback to actual model evaluation data if backend not available
      // Values calculated from confusion matrix: TN=883, FP=11, FN=5, TP=1106
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setStats({
          total_scans: 2005,        // TN + FP + FN + TP = 883 + 11 + 5 + 1106
          malicious_count: 1111,    // FN + TP = 5 + 1106 (actual malicious)
          benign_count: 894,        // TN + FP = 883 + 11 (actual benign)
          todays_scans: 23,         // Estimated for demo
          false_positives: 11,      // From confusion matrix
          false_negatives: 5,       // From confusion matrix
        });
        setRecentActivity([
          { filename: 'sample.pdf', status: 'Benign', confidence: '94.5%', date: new Date().toISOString() },
          { filename: 'document.docx', status: 'Malicious', confidence: '87.2%', date: new Date(Date.now() - 15 * 60000).toISOString() },
        ]);
        showToast('Using demo data - backend not available', 'warning');
      } else {
        showToast('Failed to load dashboard data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Benign', 'Malicious'],
    datasets: [
      {
        label: 'Files Scanned',
        data: [stats.benign_count, stats.malicious_count],
        backgroundColor: ['#10b981', '#ef4444'],
      },
    ],
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your malware detection system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Scans"
          value={stats.total_scans.toLocaleString()}
          subtitle="All time"
          icon={DocumentMagnifyingGlassIcon}
          color="blue"
        />
        <MetricCard
          title="Malicious Detected"
          value={stats.malicious_count}
          subtitle="Threats found"
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <MetricCard
          title="Benign Files"
          value={stats.benign_count.toLocaleString()}
          subtitle="Safe files"
          icon={ShieldCheckIcon}
          color="green"
        />
        <MetricCard
          title="Today's Scans"
          value={stats.todays_scans}
          subtitle="Scans today"
          icon={ClockIcon}
          color="primary"
        />
        <MetricCard
          title="False Positives"
          value={stats.false_positives}
          subtitle="Incorrectly flagged"
          icon={XCircleIcon}
          color="yellow"
        />
        <MetricCard
          title="False Negatives"
          value={stats.false_negatives}
          subtitle="Missed threats"
          icon={XCircleIcon}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ModelChart
          type="doughnut"
          data={chartData}
          title="File Classification Distribution"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.filename || 'Unknown file'}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                    {activity.confidence && (
                      <p className="text-xs text-gray-500">Confidence: {activity.confidence}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    activity.status === 'Malicious'
                      ? 'text-red-800 bg-red-100'
                      : 'text-green-800 bg-green-100'
                  }`}
                >
                  {activity.status || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <AIConsole />
      </div>
    </div>
  );
};

export default Dashboard;

