import React, { useState, useMemo } from 'react';
import { ActiveDatesAndTimesData } from '../types';

interface ActivityHeatmapProps {
  data: ActiveDatesAndTimesData;
  loading?: boolean;
  error?: string;
  className?: string;
}

type ViewType = 'yearly' | 'quarterly' | 'monthly';

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  loading = false,
  error,
  className = ''
}) => {
  const [viewType, setViewType] = useState<ViewType>('yearly');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // 获取所有可用的年份
  const availableYears = useMemo(() => {
    const years = Object.keys(data)
      .filter(key => /^\d{4}(Q[1-4]|-\d{2})?$/.test(key) && Array.isArray(data[key]))
      .map(key => {
        if (/^\d{4}$/.test(key)) return key; // 年度数据：2024
        if (/^\d{4}Q[1-4]$/.test(key)) return key.substring(0, 4); // 季度数据：2024Q3 -> 2024
        if (/^\d{4}-\d{2}$/.test(key)) return key.split('-')[0]; // 月度数据：2024-08 -> 2024
        return key;
      })
      .filter((year, index, arr) => arr.indexOf(year) === index)
      .sort()
      .reverse(); // 最新年份在前
    return years;
  }, [data]);

  // 获取可用的季度
  const availableQuarters = useMemo(() => {
    if (!selectedYear) return [];
    return Object.keys(data)
      .filter(key => key.startsWith(selectedYear + 'Q') && Array.isArray(data[key]))
      .sort();
  }, [data, selectedYear]);

  // 获取可用的月份
  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    return Object.keys(data)
      .filter(key => /^\d{4}-\d{2}$/.test(key) && key.startsWith(selectedYear + '-') && Array.isArray(data[key]))
      .sort();
  }, [data, selectedYear]);

  // 当前选中的年份，默认为最新年份
  React.useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // 根据视图类型设置默认选中周期
  React.useEffect(() => {
    if (viewType === 'quarterly' && availableQuarters.length > 0 && !selectedPeriod) {
      setSelectedPeriod(availableQuarters[availableQuarters.length - 1]); // 选择最新的季度
    } else if (viewType === 'monthly' && availableMonths.length > 0 && !selectedPeriod) {
      setSelectedPeriod(availableMonths[availableMonths.length - 1]); // 选择最新的月份
    } else if (viewType === 'yearly') {
      setSelectedPeriod('');
    }
  }, [viewType, availableQuarters, availableMonths, selectedPeriod]);

  // 当视图类型改变时重置选中周期，然后设置默认值
  React.useEffect(() => {
    if (viewType === 'quarterly' && availableQuarters.length > 0) {
      setSelectedPeriod(availableQuarters[availableQuarters.length - 1]);
    } else if (viewType === 'monthly' && availableMonths.length > 0) {
      setSelectedPeriod(availableMonths[availableMonths.length - 1]);
    } else if (viewType === 'yearly') {
      setSelectedPeriod('');
    }
  }, [viewType]);

  // 根据 ECharts 代码逻辑处理数据
  const processHeatmapData = () => {
    let dataKey: string = '';
    
    if (viewType === 'yearly' && selectedYear) {
      // 年度数据直接使用年份key
      dataKey = selectedYear;
    } else if (viewType === 'quarterly') {
      // 季度数据使用选中的季度key，如果没有选中则使用第一个可用的季度
      dataKey = selectedPeriod || (availableQuarters.length > 0 ? availableQuarters[0] : '');
    } else if (viewType === 'monthly') {
      // 月度数据使用选中的月份key，如果没有选中则使用第一个可用的月份
      dataKey = selectedPeriod || (availableMonths.length > 0 ? availableMonths[0] : '');
    }
    
    // 如果没有有效的dataKey，返回空数据
    if (!dataKey) {
      return { normalizedValues: [], inputData: [], maxValue: 0 };
    }
    
    // 获取对应的数据
    const periodData = data[dataKey];
    if (!Array.isArray(periodData) || periodData.length !== 168) {
      return { normalizedValues: [], inputData: [], maxValue: 0 };
    }
    
    // 归一化到 0-10，按照 ECharts 代码逻辑
    const maxValue = Math.max(...periodData);
    if (maxValue === 0) {
      return { normalizedValues: [], inputData: [], maxValue: 0 };
    }
    
    const normalizedValues = periodData.map(v => Math.ceil(v * 10 / maxValue));
    
    // 生成输入数据，按照 ECharts 代码的格式，并转换为UTC+8时间
    const inputData: Array<[number, number, number | string]> = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        // 将UTC+8时间转换回UTC时间来获取对应的数据
        const utcHour = (h - 8 + 24) % 24;
        const value = normalizedValues[d * 24 + utcHour] || 0;
        inputData.push([h, 6 - d, value === 0 ? '-' : value]);
      }
    }
    
    return { normalizedValues, inputData, maxValue };
  };

  // 获取颜色强度，基于归一化后的值 (0-10)
  const getColorIntensity = (value: number | string) => {
    if (value === '-' || value === 0) return 0;
    return Math.min(Number(value), 10);
  };
  
  // 获取 GitHub 风格的颜色
  const getGitHubColor = (intensity: number) => {
    if (intensity === 0) return '#ebedf0';
    if (intensity <= 2) return '#9be9a8';
    if (intensity <= 5) return '#40c463';
    if (intensity <= 8) return '#30a14e';
    return '#216e39';
  };

  // 获取选中周期的数据
  const getSelectedPeriodData = () => {
    if (viewType === 'yearly' && selectedYear) {
      return { [selectedYear]: data[selectedYear] };
    } else if (viewType === 'quarterly') {
      const quarterKey = selectedPeriod || (availableQuarters.length > 0 ? availableQuarters[0] : '');
      return quarterKey ? { [quarterKey]: data[quarterKey] } : {};
    } else if (viewType === 'monthly') {
      const monthKey = selectedPeriod || (availableMonths.length > 0 ? availableMonths[0] : '');
      return monthKey ? { [monthKey]: data[monthKey] } : {};
    }
    return {};
  };

  // 获取当前显示的标题
  const getDisplayTitle = () => {
    if (viewType === 'yearly') {
      return `${selectedYear} 年度活跃时间热力图`;
    } else if (viewType === 'quarterly') {
      return selectedPeriod ? `${selectedPeriod} 季度活跃时间热力图` : '季度活跃时间热力图';
    } else if (viewType === 'monthly') {
      if (selectedPeriod && selectedPeriod.includes('-')) {
        const [year, month] = selectedPeriod.split('-');
        return `${year} 年 ${month} 月活跃时间热力图`;
      }
      return '月度活跃时间热力图';
    }
    return '活跃时间热力图';
  };
  
  // 获取当前显示的描述
  const getDisplayDescription = () => {
    if (viewType === 'yearly') {
      return `展示项目在 ${selectedYear} 年各月份的活跃度分布`;
    } else if (viewType === 'quarterly') {
      return selectedPeriod ? `展示项目在 ${selectedPeriod} 的活跃度分布` : '展示项目季度活跃度分布';
    } else if (viewType === 'monthly') {
      if (selectedPeriod && selectedPeriod.includes('-')) {
        const [year, month] = selectedPeriod.split('-');
        return `展示项目在 ${year} 年 ${month} 月的活跃度分布`;
      }
      return '展示项目月度活跃度分布';
    }
    return '展示项目的活跃度分布';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 relative overflow-hidden ${className}`}>
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
          </div>
          
          <div className="bg-white rounded-2xl border border-white/30 shadow-lg shadow-blue-100/50 p-8 overflow-hidden relative">
            {/* 内部装饰光效 */}
            <div className="absolute inset-0 bg-blue-50/20 rounded-2xl"></div>
          <div className="absolute top-2 left-2 w-16 h-16 bg-blue-200/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 bg-purple-200/20 rounded-full blur-lg"></div>
            <div className="space-y-3 relative z-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 24 }).map((_, j) => (
                      <div key={j} className="w-5 h-5 bg-gray-200 rounded-md"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm p-8 relative overflow-hidden ${className}`}>
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-400/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">无法加载活跃时间数据</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { inputData, maxValue } = processHeatmapData();
  const selectedPeriodData = getSelectedPeriodData();
  const hours = [...Array(24).keys()];
  const days = ['周日', '周六', '周五', '周四', '周三', '周二', '周一'];

  if (inputData.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm p-8 relative overflow-hidden ${className}`}>
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-400/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{getDisplayTitle()}</h3>
          <p className="text-gray-600 mb-4">展示项目在不同时间段的活跃度分布（GitHub风格）</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-500">📊 暂无活跃时间数据</p>
            <p className="text-sm text-gray-400 mt-2">数据将在项目有活动时显示</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm p-8 relative overflow-hidden ${className}`}>
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">{getDisplayTitle()}</h3>
            <p className="text-xs text-gray-600">{getDisplayDescription()}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* 视图类型选择器 */}
            <div className="relative flex items-center space-x-2 bg-white rounded-xl px-3 py-2 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 group">
              <span className="text-xs font-medium text-gray-700 tracking-wide">🔍 视图</span>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value as ViewType)}
                className="text-xs font-semibold text-gray-800 bg-transparent border-none outline-none cursor-pointer appearance-none absolute inset-0 w-full h-full opacity-0"
              >
                <option value="yearly">年度</option>
                <option value="quarterly">季度</option>
                <option value="monthly">月度</option>
              </select>
              <div className="flex items-center space-x-1.5 pointer-events-none">
                <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {viewType === 'yearly' ? '年度' : viewType === 'quarterly' ? '季度' : '月度'}
                </span>
                <svg className="w-2.5 h-2.5 text-gray-500 group-hover:text-blue-500 transition-all duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* 年份选择器 */}
            <div className="relative flex items-center space-x-2 bg-white/90 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <span className="text-xs font-medium text-gray-700 tracking-wide">📅 年份</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs font-semibold text-gray-800 bg-transparent border-none outline-none cursor-pointer appearance-none absolute inset-0 w-full h-full opacity-0"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year} 年
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-1.5 pointer-events-none">
                <span className="text-xs font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">{selectedYear} 年</span>
                <svg className="w-2.5 h-2.5 text-gray-500 group-hover:text-purple-500 transition-all duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* 季度/月份选择器 */}
            {viewType === 'quarterly' && availableQuarters.length > 0 && (
              <div className="relative flex items-center space-x-2 bg-white/90 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <span className="text-xs font-medium text-gray-700 tracking-wide">📊 季度</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-xs font-semibold text-gray-800 bg-transparent border-none outline-none cursor-pointer appearance-none absolute inset-0 w-full h-full opacity-0"
                >
                  {availableQuarters.map((quarter) => (
                    <option key={quarter} value={quarter}>
                      {quarter}
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-1.5 pointer-events-none">
                  <span className="text-xs font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">{selectedPeriod}</span>
                  <svg className="w-2.5 h-2.5 text-gray-500 group-hover:text-green-500 transition-all duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            {viewType === 'monthly' && availableMonths.length > 0 && (
              <div className="relative flex items-center space-x-2 bg-white/90 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <span className="text-xs font-medium text-gray-700 tracking-wide">🗓️ 月份</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-xs font-semibold text-gray-800 bg-transparent border-none outline-none cursor-pointer appearance-none absolute inset-0 w-full h-full opacity-0"
                >
                  {availableMonths.map((month) => {
                    const [year, monthNum] = month.split('-');
                    return (
                      <option key={month} value={month}>
                        {year} 年 {monthNum} 月
                      </option>
                    );
                  })}
                </select>
                <div className="flex items-center space-x-1.5 pointer-events-none">
                  <span className="text-xs font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                    {selectedPeriod && (() => {
                      const [year, monthNum] = selectedPeriod.split('-');
                      return `${year} 年 ${monthNum} 月`;
                    })()}
                  </span>
                  <svg className="w-2.5 h-2.5 text-gray-500 group-hover:text-orange-500 transition-all duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* GitHub风格活跃度图例 */}
            <div className="flex items-center space-x-2 bg-white rounded-xl px-3 py-1.5 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-200 group">
              <span className="text-xs font-medium text-gray-700 tracking-wide">🎨 活跃度</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-500 font-medium">少</span>
                <div className="flex space-x-1">
                  <div className="w-2.5 h-2.5 rounded-md bg-gray-100 border border-white shadow-sm hover:scale-110 transition-transform duration-200"></div>
                  {['#9be9a8', '#40c463', '#30a14e', '#216e39'].map((color) => (
                    <div
                      key={color}
                      className="w-2.5 h-2.5 rounded-md shadow-md hover:scale-110 hover:rotate-12 transition-all duration-200 border border-white"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: `0 2px 8px ${color}40, inset 0 1px 0 rgba(255,255,255,0.3)`
                      }}
                    ></div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">多</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative bg-white rounded-3xl border-2 border-white/60 p-10 overflow-hidden shadow-2xl shadow-blue-200/50 transform transition-all duration-200 hover:shadow-3xl hover:shadow-purple-300/60">
          {/* 装饰性背景元素 */}
          <div className="absolute inset-0 bg-blue-100/20 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-300/25 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl opacity-60"></div>
          {/* 边框光效 */}
          <div className="absolute inset-0 rounded-3xl bg-white animate-pulse"></div>
          
          <div className="relative w-full">
            {/* ECharts 风格热力图 */}
            <div className="space-y-4">
              {/* 小时标签 */}
              <div className="flex items-center mb-6">
                <div className="w-14 flex-shrink-0"></div>
                <div className="flex-1 flex">
                  {hours.map((hour) => {
                    return (
                      <div key={hour} className="flex-1 text-xs text-gray-600 text-center font-semibold min-w-0 tracking-wide">
                        {hour % 4 === 0 ? (
                          <span className="inline-block px-1 py-0.5 bg-white/60 rounded-md shadow-sm">
                            {hour}
                          </span>
                        ) : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* 周几标签和热力图网格 */}
              <div className="space-y-3">
                {days.map((dayName, dayIndex) => (
                  <div key={dayIndex} className="flex items-center group">
                    <div className="w-12 flex-shrink-0 text-xs font-bold text-gray-700 text-right pr-2">
                      <span className="inline-block px-1.5 py-0.5 bg-white/70 rounded-md shadow-sm group-hover:bg-white/90 transition-all duration-300">
                        {dayName}
                      </span>
                    </div>
                    <div className="flex-1 flex gap-1.5">
                      {hours.map((hour) => {
                        // 根据 ECharts 数据格式查找对应的值
                        const dataPoint = inputData.find(([h, d]) => h === hour && d === dayIndex);
                        const value = dataPoint ? dataPoint[2] : '-';
                        const intensity = getColorIntensity(value);
                        const color = getGitHubColor(intensity);
                        
                        return (
                          <div
                            key={hour}
                            className="flex-1 aspect-square rounded-lg border-2 border-white/50 hover:border-white/80 hover:scale-150 hover:rotate-3 hover:shadow-2xl hover:shadow-blue-400/50 transition-all duration-200 cursor-pointer min-w-0 relative overflow-hidden group/cell hover:z-20 hover:ring-2 hover:ring-blue-300/50 hover:ring-offset-1"
                            style={{ 
                              backgroundColor: color, 
                              minHeight: '18px', 
                              maxHeight: '28px',
                              boxShadow: value !== '-' ? `0 3px 12px ${color}50, inset 0 1px 0 rgba(255,255,255,0.3), 0 0 15px ${color}25` : '0 1px 4px rgba(0,0,0,0.12)'
                            }}
                            title={`${dayName} ${hour}:00 (UTC+8)\n活跃度: ${value === '-' ? '无数据' : value}/10`}
                          >
                            {/* 内部光效 */}
                            <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover/cell:opacity-100 transition-opacity duration-300"></div>
                            {/* 脉冲动画 */}
                            {value !== '-' && typeof value === 'number' && value > 5 && (
                              <div className="absolute inset-0 rounded-lg animate-pulse bg-white/10"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-xs text-gray-600">
                📊 显示 <span className="font-bold text-blue-600">
                  {viewType === 'yearly' ? `${selectedYear} 年` : 
                   viewType === 'quarterly' ? (selectedPeriod || '季度') : 
                   (selectedPeriod && selectedPeriod.includes('-')) ? (() => {
                     const [year, month] = selectedPeriod.split('-');
                     return `${year} 年 ${month} 月`;
                   })() : '月度'
                  }
                </span> 数据
              </span>
              
              <span className="text-xs text-gray-600">
                🎯 最高值 <span className="font-bold text-purple-600">{maxValue}</span>
              </span>
              
              <span className="text-xs text-gray-600">
                📅 周期数 <span className="font-bold text-purple-600">{Object.keys(selectedPeriodData).length}</span>
              </span>
              
              <span className="text-xs text-gray-600">
                📈 范围 <span className="font-bold text-indigo-600">0-10</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>💡 鼠标悬停查看详情</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;