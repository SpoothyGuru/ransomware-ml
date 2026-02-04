import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import api from '../api';
import {
  DocumentMagnifyingGlassIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  ChartBarIcon,
  EyeIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';

const Predict = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError('');
  };

  const handleScan = async (retryCount = 0) => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    // Validate file type
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc', 'json'].includes(fileExt)) {
      setError('Unsupported file type. Only PDF, DOCX, DOC, and JSON files are supported.');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Get auth token
      const token = localStorage.getItem('ransom_token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      console.log('Creating form data...');
      const formData = new FormData();
      formData.append('file', file);

      // Log detailed file and form data information
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log('- ', pair[0], ':', pair[1]);
      }

      console.log('Sending request to server...');
      const response = await api.post('/predict', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
        }
      });
      
      console.log('Server response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      // Transform API response
      const apiData = response.data;
      const transformedResult = {
        status: apiData.status || 'Unknown',
        confidence: apiData.confidence || '0%',
        threat_level: apiData.threat_level || 'UNKNOWN',
        rf_confidence: apiData.rf_confidence || 'N/A',
        xgb_confidence: apiData.xgb_confidence || 'N/A',
        nn_confidence: apiData.nn_confidence || 'N/A',
        details: apiData.details || '',
        filename: file.name,
        filesize: (file.size / 1024).toFixed(2),
        filetype: file.name.split('.').pop().toUpperCase(),
      };

      setResult(transformedResult);
    } catch (err) {
      console.error('Scan error:', {
        message: err.message,
        code: err.code,
        response: {
          status: err.response?.status,
          headers: err.response?.headers,
          data: err.response?.data
        },
        request: {
          method: err.config?.method,
          url: err.config?.url,
          headers: err.config?.headers
        }
      });
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Redirect to login page
        window.location.href = '/login';
      } else if (err.response?.status === 413) {
        setError('File is too large. Maximum size is 50MB.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data?.detail || 'Invalid file format or content';
        setError(`Validation Error: ${errorMessage}`);
      } else if (err.response?.status === 422) {
        const errorMessage = err.response.data?.detail?.map(e => e.msg).join(', ') || 'Invalid request format';
        setError(`Request Error: ${errorMessage}`);
      } else if (err.response?.status >= 500 && retryCount < 2) {
        // Retry up to 2 times for server errors
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setError(`Server error. Retrying in ${retryDelay/1000} seconds...`);
        setTimeout(() => handleScan(retryCount + 1), retryDelay);
        return;
      } else {
        const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           err.message ||
                           'Failed to scan file. Please try again.';
        setError(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getThreatIcon = (threatLevel) => {
    const level = threatLevel?.toLowerCase() || '';
    if (level.includes('critical') || level.includes('high')) {
      return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
    }
    if (level.includes('medium')) {
      return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
    }
    if (level.includes('low')) {
      return <div className="h-6 w-6 rounded-full bg-orange-500"></div>;
    }
    return <CheckCircleIconSolid className="h-6 w-6 text-green-600" />;
  };

  const getThreatColor = (threatLevel) => {
    const level = threatLevel?.toLowerCase() || '';
    if (level.includes('critical') || level.includes('high')) return 'text-red-600';
    if (level.includes('medium')) return 'text-yellow-600';
    if (level.includes('low')) return 'text-orange-600';
    return 'text-green-600';
  };

  const isMalicious = result?.status?.toLowerCase().includes('malicious');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🛡️ AI-Powered Malware Detection System</h1>
        <p className="text-primary-100 mb-4">
          Upload a file (PDF, DOCX, DOC, or JSON) to detect if it contains malicious content
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-primary-200">Powered by:</p>
            <p className="font-semibold">Ensemble Machine Learning</p>
            <p className="text-xs text-primary-300">(Random Forest + XGBoost + Neural Network)</p>
          </div>
          <div>
            <p className="text-sm text-primary-200">Dataset:</p>
            <p className="font-semibold">CIC-Evasive-PDFMal2022</p>
            <p className="text-xs text-primary-300">(10,025 samples)</p>
          </div>
          <div>
            <p className="text-sm text-primary-200">Performance:</p>
            <p className="font-semibold">Accuracy: 99.20%</p>
            <p className="text-xs text-primary-300">Precision: 99.02% | Recall: 99.55%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload File Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <CloudArrowUpIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Upload File</h2>
            </div>
            
            <FileUploader onFileSelect={handleFileSelect} />

            {file && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 flex-1">
                  <DocumentTextIcon className="h-8 w-8 text-primary-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const url = URL.createObjectURL(file);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Remove"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={!file || loading}
              className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Scan for Malware
                </>
              )}
            </button>
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <InformationCircleIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Upload a PDF, DOCX, DOC, or JSON file</li>
              <li>Click "Scan for Malware"</li>
              <li>Wait for analysis results</li>
              <li>Review the detailed report</li>
            </ol>
            <p className="mt-4 text-xs text-gray-500">
              <strong>Maximum file size:</strong> 50 MB
            </p>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Scan Results */}
          {result && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Scan Results</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prediction</p>
                  <div className="flex items-center space-x-2">
                    {isMalicious ? (
                      <ShieldExclamationIcon className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    )}
                    <p className="text-lg font-bold text-gray-900">
                      {result.status?.toUpperCase() || 'UNKNOWN'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
                    <p className="text-lg font-bold text-gray-900">{result.confidence || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Threat Level</p>
                  <div className="flex items-center space-x-2">
                    {getThreatIcon(result.threat_level)}
                    <p className={`text-lg font-bold ${getThreatColor(result.threat_level)}`}>
                      {result.threat_level || 'UNKNOWN'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Individual Model Results */}
          {result && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <EyeIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Individual Model Results</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded bg-green-600"></div>
                      <span className="text-sm font-medium text-gray-700">Random Forest</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{result.rf_confidence || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded bg-blue-600"></div>
                      <span className="text-sm font-medium text-gray-700">XGBoost</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{result.xgb_confidence || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded bg-purple-600"></div>
                      <span className="text-sm font-medium text-gray-700">Neural Network</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{result.nn_confidence || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Analysis Report - Full Width */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">File Analysis Report</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">File Name</p>
              <p className="font-medium text-gray-900">{result.filename || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">File Type</p>
              <p className="font-medium text-gray-900">.{result.filetype || 'UNKNOWN'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">File Size</p>
              <p className="font-medium text-gray-900">{result.filesize || '0'} KB</p>
            </div>
          </div>

          {/* Prediction Results */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-pink-500 flex items-center justify-center">
                <span className="text-white text-xs">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">PREDICTION RESULTS</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="font-bold text-lg text-gray-900">{result.status?.toUpperCase() || 'UNKNOWN'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <p className="font-bold text-lg text-gray-900">{result.confidence || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Threat Level</p>
                <p className={`font-bold text-lg ${getThreatColor(result.threat_level)}`}>
                  {result.threat_level || 'UNKNOWN'}
                </p>
              </div>
            </div>
          </div>

          {/* Model Predictions */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Model Predictions:</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                • <strong>Random Forest:</strong> {isMalicious ? 'Malicious' : 'Benign'} ({result.rf_confidence || 'N/A'})
              </p>
              <p className="text-sm text-gray-700">
                • <strong>XGBoost:</strong> {isMalicious ? 'Malicious' : 'Benign'} ({result.xgb_confidence || 'N/A'})
              </p>
              <p className="text-sm text-gray-700">
                • <strong>Neural Network:</strong> {isMalicious ? 'Malicious' : 'Benign'} ({result.nn_confidence || 'N/A'})
              </p>
            </div>
          </div>

          {/* Details */}
          {result.details && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: result.details }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Predict;
