import { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  const Icon = type === 'success' ? CheckCircleIcon : ExclamationCircleIcon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${bgColor[type]} animate-slide-in`}
    >
      <Icon className={`h-5 w-5 ${iconColor[type]}`} />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className={`ml-2 ${iconColor[type]} hover:opacity-70 transition-opacity`}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;

