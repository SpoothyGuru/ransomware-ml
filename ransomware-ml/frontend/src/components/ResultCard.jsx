import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/solid';

const ResultCard = ({ result }) => {
  if (!result) {
    return null;
  }

  // Handle both 'status' and 'prediction' fields for compatibility
  const status = result.status || result.prediction || 'Unknown';
  const isMalicious = status.toLowerCase().includes('malicious');
  const confidence = parseFloat(result.confidence?.replace('%', '') || 0);

  const getThreatColorClasses = (threatLevel) => {
    if (!threatLevel) return 'bg-gray-100 text-gray-800';
    const level = threatLevel.toLowerCase();
    if (level.includes('critical') || level.includes('high')) return 'bg-red-100 text-red-800';
    if (level.includes('medium')) return 'bg-yellow-100 text-yellow-800';
    if (level.includes('low')) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const threatColorClasses = getThreatColorClasses(result.threat_level);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-primary-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isMalicious ? (
            <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
          ) : (
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {status === 'Malicious' ? '🦠 MALICIOUS' : status === 'Benign' ? '✅ BENIGN' : status}
            </h3>
            <p className="text-sm text-gray-500">File Analysis Complete</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${threatColorClasses}`}
        >
          {result.threat_level || 'Unknown'}
        </span>
      </div>

      <div className="mb-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">Overall Confidence</p>
          <p className="text-3xl font-bold text-gray-900">
            {result.confidence || 'N/A'}
          </p>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">Individual Model Confidences:</p>
          
          {result.rf_confidence && result.rf_confidence !== 'N/A' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Random Forest</span>
                <span className="text-sm font-semibold text-gray-900">{result.rf_confidence}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${parseFloat(result.rf_confidence.replace('%', '')) || 0}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {result.xgb_confidence && result.xgb_confidence !== 'N/A' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">XGBoost</span>
                <span className="text-sm font-semibold text-gray-900">{result.xgb_confidence}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${parseFloat(result.xgb_confidence.replace('%', '')) || 0}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {result.nn_confidence && result.nn_confidence !== 'N/A' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Neural Network</span>
                <span className="text-sm font-semibold text-gray-900">{result.nn_confidence}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${parseFloat(result.nn_confidence.replace('%', '')) || 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {result.details && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: result.details }}
          />
        </div>
      )}

      {isMalicious && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Security Warning
              </p>
              <p className="text-sm text-red-700 mt-1">
                This file has been flagged as potentially malicious. Exercise caution.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;

