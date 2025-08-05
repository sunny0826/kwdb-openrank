import React from 'react';
import { TimeRange } from '../types';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  value?: TimeRange;
  onChange?: (range: TimeRange) => void;
  className?: string;
}

const timeRangeOptions = [
  { value: 'monthly' as TimeRange, label: '月度' },
  { value: 'quarterly' as TimeRange, label: '季度' },
  { value: 'yearly' as TimeRange, label: '年度' },
];

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  value,
  onChange,
  className = '',
}) => {
  // 支持两种 props 模式
  const currentRange = value || selectedRange;
  const handleChange = onChange || onRangeChange;
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-sm font-medium text-gray-700 mr-2">时间范围:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${
                currentRange === option.value
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector;