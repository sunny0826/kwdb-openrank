import React from 'react';
import { Loader2, BarChart3, TrendingUp } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'default' | 'chart' | 'data';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = '加载中...',
  className = '',
  variant = 'default',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getIcon = () => {
    switch (variant) {
      case 'chart':
        return <BarChart3 className={`${sizeClasses[size]} animate-pulse text-blue-600`} />;
      case 'data':
        return <TrendingUp className={`${sizeClasses[size]} animate-bounce text-green-600`} />;
      default:
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        {getIcon()}
        {variant === 'default' && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping" />
        )}
      </div>
      {text && (
        <div className="text-center">
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>{text}</p>
          {variant === 'chart' && (
            <p className="text-xs text-gray-400 mt-1">正在处理图表数据</p>
          )}
          {variant === 'data' && (
            <p className="text-xs text-gray-400 mt-1">正在获取最新数据</p>
          )}
        </div>
      )}
      {variant === 'default' && (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {content}
    </div>
  );
};

export default LoadingSpinner;