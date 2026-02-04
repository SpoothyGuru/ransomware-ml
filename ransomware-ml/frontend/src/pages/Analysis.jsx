import { useState, useEffect } from 'react';
import ModelChart from '../components/ModelChart';
import ConfusionMatrix from '../components/ConfusionMatrix';
import MetricCard from '../components/MetricCard';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import api from '../api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const Analysis = () => {
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState({
    confusion_matrix: [[0, 0], [0, 0]],
    model_accuracies: {},
    top_features: [],
    roc: { fpr: [], tpr: [], auc: 0 },
    evaluation_image_url: null,
  });

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analysis');
      setAnalysisData(response.data);
    } catch (err) {
      console.error('Error fetching analysis data:', err);
      
      // Fallback to actual model evaluation data if backend not available
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setAnalysisData({
          confusion_matrix: [[883, 11], [5, 1106]], // From model_evaluation.png: TN=883, FP=11, FN=5, TP=1106
          model_accuracies: {
            RandomForest: 0.9930,  // From model_evaluation.png
            XGBoost: 0.9915,        // From model_evaluation.png
            NeuralNetwork: 0.9850,  // From model_evaluation.png
            Ensemble: 0.9920,       // From model_evaluation.png
          },
          top_features: [
            { name: 'StartXref', importance: 0.138 },      // From model_evaluation.png
            { name: 'MetadataSize', importance: 0.120 },    // From model_evaluation.png
            { name: 'Javascript', importance: 0.110 },      // From model_evaluation.png
            { name: 'PdfSize', importance: 0.088 },        // From model_evaluation.png
            { name: 'JS', importance: 0.075 },              // From model_evaluation.png
            { name: 'Stream', importance: 0.065 },           // From model_evaluation.png
            { name: 'XrefLength', importance: 0.063 },      // From model_evaluation.png
            { name: 'Xref', importance: 0.038 },            // From model_evaluation.png
            { name: 'Images', importance: 0.032 },            // From model_evaluation.png
            { name: 'Trailer', importance: 0.028 },          // From model_evaluation.png
          ],
          roc: {
            fpr: [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0],
            tpr: [0, 0.95, 0.97, 0.98, 0.99, 0.995, 0.998, 1.0],
            auc: 0.9995,  // From model_evaluation.png
          },
          evaluation_image_url: null,
        });
        showToast('Using demo data - backend not available', 'warning');
      } else {
        showToast('Failed to load analysis data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!analysisData.evaluation_image_url) {
      showToast('No evaluation image available', 'warning');
      return;
    }

    try {
      const imageUrl = `${api.defaults.baseURL}${analysisData.evaluation_image_url}`;
      const response = await fetch(imageUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ransom_token')}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'model_evaluation.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Image downloaded successfully', 'success');
    } catch (err) {
      showToast('Failed to download image', 'error');
    }
  };

  // Prepare chart data from API response
  const modelAccuraciesData = {
    labels: Object.keys(analysisData.model_accuracies || {}),
    datasets: [
      {
        label: 'Accuracy',
        data: Object.values(analysisData.model_accuracies || {}).map(v => v * 100),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
        ],
      },
    ],
  };

  const featureImportanceData = {
    labels: analysisData.top_features.slice(0, 10).map(f => f.name),
    datasets: [
      {
        label: 'Importance',
        data: analysisData.top_features.slice(0, 10).map(f => f.importance * 100),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  // Prepare ROC curve data - Chart.js needs arrays of x and y values
  const rocData = {
    datasets: [
      {
        label: 'ROC Curve',
        data: analysisData.roc.fpr.map((fpr, i) => ({
          x: fpr,
          y: analysisData.roc.tpr[i],
        })),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Random Classifier',
        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        borderColor: '#9ca3af',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const rocChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'False Positive Rate',
        },
        min: 0,
        max: 1,
      },
      y: {
        title: {
          display: true,
          text: 'True Positive Rate',
        },
        min: 0,
        max: 1,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: `ROC Curve (AUC = ${analysisData.roc.auc.toFixed(4)})`,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analysis...</div>
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
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Model Analysis</h1>
          <p className="mt-2 text-sm text-gray-600">
            Detailed performance metrics and model comparisons
          </p>
        </div>
        {analysisData.evaluation_image_url && (
          <button
            onClick={handleDownloadImage}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Evaluation Image
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Confusion Matrix
          </h2>
          <ConfusionMatrix matrix={analysisData.confusion_matrix} />
        </div>

        <ModelChart
          type="bar"
          data={modelAccuraciesData}
          title="Model Accuracies"
          options={{
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  },
                },
              },
            },
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top 10 Feature Importance
          </h2>
          <ModelChart
            type="bar"
            data={featureImportanceData}
            options={{
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                  max: 20,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <ModelChart
            type="scatter"
            data={rocData}
            options={rocChartOptions}
          />
        </div>
      </div>

      {analysisData.evaluation_image_url && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Model Evaluation Visualization
            </h2>
            <button
              onClick={handleDownloadImage}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Download
            </button>
          </div>
          <img
            src={`${api.defaults.baseURL}${analysisData.evaluation_image_url}`}
            alt="Model Evaluation"
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              showToast('Failed to load evaluation image', 'error');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Analysis;

