import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AppError } from '../types';

interface ErrorMessageProps {
  error: AppError | string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = typeof error === 'object' ? error.code : undefined;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            数据加载失败
          </h3>
          <p className="text-sm text-red-700 mb-2">
            {errorMessage}
          </p>
          {errorCode && (
            <p className="text-xs text-red-600 mb-3">
              错误代码: {errorCode}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-md transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重试</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;