const ConfusionMatrix = ({ matrix }) => {
  if (!matrix || !Array.isArray(matrix) || matrix.length !== 2) {
    return <div className="text-gray-500">Invalid confusion matrix data</div>;
  }

  const [[tn, fp], [fn, tp]] = matrix;
  const total = tn + fp + fn + tp;

  const getColor = (value, max) => {
    const intensity = value / max;
    if (intensity > 0.7) return 'bg-green-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const maxValue = Math.max(tn, fp, fn, tp);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div></div>
        <div className="text-center font-semibold text-gray-700">Predicted Benign</div>
        <div className="text-center font-semibold text-gray-700">Predicted Malicious</div>
        
        <div className="text-center font-semibold text-gray-700 flex items-center">Actual Benign</div>
        <div className={`${getColor(tn, maxValue)} text-white p-4 rounded text-center font-bold`}>
          <div className="text-2xl">{tn}</div>
          <div className="text-xs mt-1">True Negative</div>
          <div className="text-xs opacity-75">{(tn / total * 100).toFixed(1)}%</div>
        </div>
        <div className={`${getColor(fp, maxValue)} text-white p-4 rounded text-center font-bold`}>
          <div className="text-2xl">{fp}</div>
          <div className="text-xs mt-1">False Positive</div>
          <div className="text-xs opacity-75">{(fp / total * 100).toFixed(1)}%</div>
        </div>
        
        <div className="text-center font-semibold text-gray-700 flex items-center">Actual Malicious</div>
        <div className={`${getColor(fn, maxValue)} text-white p-4 rounded text-center font-bold`}>
          <div className="text-2xl">{fn}</div>
          <div className="text-xs mt-1">False Negative</div>
          <div className="text-xs opacity-75">{(fn / total * 100).toFixed(1)}%</div>
        </div>
        <div className={`${getColor(tp, maxValue)} text-white p-4 rounded text-center font-bold`}>
          <div className="text-2xl">{tp}</div>
          <div className="text-xs mt-1">True Positive</div>
          <div className="text-xs opacity-75">{(tp / total * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;

