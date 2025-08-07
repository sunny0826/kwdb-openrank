import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { StatCard as StatCardType, TimeSelector } from '../types';
import { formatNumber, formatPercentage } from '../utils/dataProcessor';

interface StatCardProps {
  data: StatCardType;
  className?: string;
  variant?: 'default' | 'gradient' | 'minimal';
  loading?: boolean;
  timeSelector?: TimeSelector; // 新增：时间选择器状态
}

const StatCard: React.FC<StatCardProps> = ({ data, className = '', variant = 'default', loading = false, timeSelector }) => {
  const { title, value, change, trend, description } = data;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <ArrowUp className="w-3 h-3" />;
    if (change < 0) return <ArrowDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return 'text-gray-600';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number' && !isNaN(val)) {
      return formatNumber(val);
    }
    // 如果是字符串，检查是否包含单位
    if (typeof val === 'string') {
      // 如果字符串包含空格，可能是带单位的值，需要根据时间选择器调整单位
      if (val.includes(' ')) {
        // 检查是否是时间相关的单位（月、季度、年）
        if (val.includes('个月') && timeSelector?.mode === 'range') {
          const numValue = parseFloat(val);
          if (!isNaN(numValue)) {
            if (timeSelector.range === 'quarterly') {
              const quarters = numValue;
              return `${quarters} 个季度`;
            } else if (timeSelector.range === 'yearly') {
              const years = numValue;
              return `${years} 年`;
            }
          }
        }
        return val;
      }
      // 如果是纯数字字符串，尝试转换
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        return formatNumber(numVal);
      }
    }
    return val;
  };

  const getCardStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-md hover:shadow-lg';
      case 'minimal':
        return 'bg-white border-l-4 border-blue-500 shadow-sm hover:shadow-md';
      default:
        return 'bg-white border border-gray-200 shadow-sm hover:shadow-md';
    }
  };

  if (loading) {
    return (
      <div className={`${getCardStyles()} rounded-lg p-4 sm:p-6 animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getCardStyles()} rounded-lg p-4 sm:p-6 transition-all duration-200 group relative overflow-hidden ${className}`}>
      {/* 标题和趋势图标 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
          {title}
        </h3>
        <div className={`p-2 rounded-full ${getTrendColor()} transition-all duration-200 group-hover:scale-110`}>
          {trend && getTrendIcon()}
        </div>
      </div>

      {/* 主要数值和变化 */}
      <div className="space-y-2">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div className="flex items-baseline space-x-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()} bg-opacity-10`}>
                {getChangeIcon()}
                <span>
                  {formatPercentage(change)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* 变化趋势说明 */}
        {change !== undefined && (
          <div className="text-xs text-gray-500">
            vs 上期
          </div>
        )}

        {/* 描述信息 */}
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed mt-2">
            {description}
          </p>
        )}
      </div>

      {/* 装饰性元素 */}
      {variant === 'gradient' && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
      )}
    </div>
  );
};

export default StatCard;