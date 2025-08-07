import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { TimeSelector, TimeSelectionMode } from '../types';

interface MonthSelectorProps {
  value: TimeSelector;
  onChange: (selector: TimeSelector) => void;
  className?: string;
  availableMonths?: string[]; // 可用的月份数据，格式如 ['2023-01', '2023-02']
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  value,
  onChange,
  className = '',
  availableMonths = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // 从可用月份数据中提取年份范围
  const getAvailableYears = (): number[] => {
    if (availableMonths.length === 0) {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    }
    
    const years = availableMonths
      .map(month => parseInt(month.split('-')[0]))
      .filter((year, index, arr) => arr.indexOf(year) === index)
      .sort((a, b) => b - a);
    
    return years;
  };

  // 获取指定年份的可用月份
  const getAvailableMonthsForYear = (year: number): number[] => {
    if (availableMonths.length === 0) {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    
    const months = availableMonths
      .filter(month => month.startsWith(year.toString()))
      .map(month => parseInt(month.split('-')[1]))
      .sort((a, b) => a - b);
    
    return months;
  };

  const availableYears = getAvailableYears();
  const availableMonthsForYear = getAvailableMonthsForYear(selectedYear);

  // 月份名称
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // 初始化选择的年月
  useEffect(() => {
    if (value.mode === 'specific' && value.specific) {
      setSelectedYear(value.specific.year);
      setSelectedMonth(value.specific.month);
    }
  }, [value.mode, value.specific]);

  // 单独处理 availableMonths 的初始化，避免循环更新
  useEffect(() => {
    if (availableMonths.length > 0 && value.mode !== 'specific') {
      // 默认选择最新的可用月份
      const latestMonth = availableMonths[availableMonths.length - 1];
      const [year, month] = latestMonth.split('-').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month);
    }
  }, [availableMonths, value.mode]); // 添加缺失的依赖项

  // 处理模式切换
  const handleModeChange = (mode: TimeSelectionMode) => {
    if (mode === 'range') {
      onChange({
        mode: 'range',
        range: 'monthly'
      });
    } else {
      onChange({
        mode: 'specific',
        specific: {
          year: selectedYear,
          month: selectedMonth
        }
      });
    }
  };

  // 处理年份选择
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const availableMonths = getAvailableMonthsForYear(year);
    const newMonth = availableMonths.includes(selectedMonth) ? selectedMonth : availableMonths[0] || 1;
    setSelectedMonth(newMonth);
    
    if (value.mode === 'specific') {
      onChange({
        mode: 'specific',
        specific: {
          year,
          month: newMonth
        }
      });
    }
  };

  // 处理月份选择
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    
    if (value.mode === 'specific') {
      onChange({
        mode: 'specific',
        specific: {
          year: selectedYear,
          month
        }
      });
    }
  };

  // 格式化显示文本
  const getDisplayText = (): string => {
    if (value.mode === 'range') {
      switch (value.range) {
        case 'monthly': return '月度视图';
        case 'quarterly': return '季度视图';
        case 'yearly': return '年度视图';
        default: return '全部数据';
      }
    } else {
      return `${selectedYear}年${selectedMonth}月`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">时间选择:</span>
        
        {/* 模式切换按钮 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleModeChange('range')}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${
                value.mode === 'range'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            范围视图
          </button>
          <button
            onClick={() => handleModeChange('specific')}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${
                value.mode === 'specific'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >具体月份</button>
        </div>

        {/* 选择器下拉框 */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <Calendar className="w-4 h-4" />
            <span>{getDisplayText()}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* 下拉菜单 */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4">
                {value.mode === 'range' ? (
                  // 范围选择模式
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">选择时间范围</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { value: 'monthly', label: '月度视图' },
                        { value: 'quarterly', label: '季度视图' },
                        { value: 'yearly', label: '年度视图' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onChange({ mode: 'range', range: option.value as 'monthly' | 'quarterly' | 'yearly' });
                            setIsOpen(false);
                          }}
                          className={`
                            text-left px-3 py-2 rounded-md text-sm transition-colors duration-200
                            ${
                              value.range === option.value
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // 具体月份选择模式
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">选择具体月份</h4>
                    
                    {/* 年份选择 */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">年份</label>
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {availableYears.map((year) => (
                          <button
                            key={year}
                            onClick={() => handleYearChange(year)}
                            className={`
                              px-3 py-2 text-sm rounded-md transition-colors duration-200
                              ${
                                selectedYear === year
                                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                                  : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                              }
                            `}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 月份选择 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">月份</label>
                      <div className="grid grid-cols-4 gap-2">
                        {monthNames.map((monthName, index) => {
                          const monthNumber = index + 1;
                          const isAvailable = availableMonthsForYear.includes(monthNumber);
                          return (
                            <button
                              key={monthNumber}
                              onClick={() => {
                                if (isAvailable) {
                                  handleMonthChange(monthNumber);
                                  setIsOpen(false);
                                }
                              }}
                              disabled={!isAvailable}
                              className={`
                                px-2 py-2 text-sm rounded-md transition-colors duration-200
                                ${
                                  !isAvailable
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : selectedMonth === monthNumber
                                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                                    : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }
                              `}
                            >
                              {monthName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MonthSelector;