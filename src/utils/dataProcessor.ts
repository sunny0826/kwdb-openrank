import { OpenRankData, TimeSeriesData, MetricsSummary, ChartDataPoint, TimeRange, MonthSelection, TimeSelector } from '../types';

/**
 * 处理时间序列数据，将 OpenDigger 的数据格式转换为图表可用的格式
 */
export function processTimeSeriesData(data: OpenRankData, type: TimeRange = 'all'): TimeSeriesData[] {
  const result: TimeSeriesData[] = [];
  
  Object.entries(data).forEach(([key, value]) => {
    let dataType: 'monthly' | 'quarterly' | 'yearly';
    let date: string;
    
    if (key.includes('Q')) {
      // 季度数据 (e.g., "2023Q1")
      dataType = 'quarterly';
      const [year, quarter] = key.split('Q');
      const monthMap = { '1': '03', '2': '06', '3': '09', '4': '12' };
      date = `${year}-${monthMap[quarter as keyof typeof monthMap]}`;
    } else if (key.includes('-')) {
      // 月度数据 (e.g., "2023-01")
      dataType = 'monthly';
      date = key;
    } else {
      // 年度数据 (e.g., "2023")
      dataType = 'yearly';
      date = `${key}-12`;
    }
    
    // 根据类型过滤数据
    if (type === 'all' || type === dataType) {
      // 确保 value 是有效的数字类型
      const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      result.push({
        date,
        value: Number(numericValue.toFixed(2)),
        type: dataType,
      });
    }
  });
  
  // 按日期排序
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * 转换为图表数据格式
 */
export function convertToChartData(timeSeriesData: TimeSeriesData[]): ChartDataPoint[] {
  return timeSeriesData.map(item => ({
    date: formatDateForChart(item.date, item.type),
    value: item.value,
    label: item.type,
  }));
}

/**
 * 格式化日期用于图表显示
 */
export function formatDateForChart(date: string, type: 'monthly' | 'quarterly' | 'yearly'): string {
  const dateObj = new Date(date);
  
  switch (type) {
    case 'yearly':
      return dateObj.getFullYear().toString();
    case 'quarterly': {
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const quarter = Math.ceil(month / 3);
      return `${year}Q${quarter}`;
    }
    case 'monthly':
      return dateObj.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
    default:
      return date;
  }
}

/**
 * 计算指标摘要信息
 */
export function calculateMetricsSummary(data: OpenRankData): MetricsSummary {
  const values = Object.values(data).filter(val => typeof val === 'number' && !isNaN(val));
  
  if (values.length === 0) {
    return {
      currentValue: 0,
      previousValue: 0,
      changePercentage: 0,
      trend: 'stable',
      total: 0,
      average: 0,
      max: 0,
      min: 0,
      latest: 0,
      totalPeriods: 0,
    };
  }
  
  const currentValue = values[values.length - 1];
  const previousValue = values.length > 1 ? values[values.length - 2] : 0;
  const total = values.reduce((sum, val) => sum + val, 0);
  const average = total / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  const changePercentage = previousValue !== 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercentage > 1) {
    trend = 'up';
  } else if (changePercentage < -1) {
    trend = 'down';
  }
  
  // 确保所有数值都是有效的数字类型
  const safeToFixed = (value: number) => {
    return typeof value === 'number' && !isNaN(value) ? Number(value.toFixed(2)) : 0;
  };
  
  return {
    currentValue: safeToFixed(currentValue),
    previousValue: safeToFixed(previousValue),
    changePercentage: safeToFixed(changePercentage),
    trend,
    total: safeToFixed(total),
    average: safeToFixed(average),
    max: safeToFixed(max),
    min: safeToFixed(min),
    latest: safeToFixed(currentValue),
    totalPeriods: values.length,
  };
}

/**
 * 获取最新的数据值
 */
export function getLatestValue(data: OpenRankData): number {
  const entries = Object.entries(data);
  if (entries.length === 0) return 0;
  
  // 按时间排序，获取最新值
  const sortedEntries = entries.sort(([a], [b]) => {
    const dateA = parseTimeKey(a);
    const dateB = parseTimeKey(b);
    return dateB.getTime() - dateA.getTime();
  });
  
  const value = sortedEntries[0][1];
  return typeof value === 'number' && !isNaN(value) ? Number(value.toFixed(2)) : 0;
}

/**
 * 解析时间键为 Date 对象
 */
function parseTimeKey(key: string): Date {
  if (key.includes('Q')) {
    // 季度数据
    const [year, quarter] = key.split('Q');
    const month = (parseInt(quarter) - 1) * 3 + 2; // 季度末月份
    return new Date(parseInt(year), month, 1);
  } else if (key.includes('-')) {
    // 月度数据
    return new Date(key + '-01');
  } else {
    // 年度数据
    return new Date(parseInt(key), 11, 31);
  }
}

/**
 * 过滤指定时间范围的数据
 */
export function filterDataByTimeRange(data: OpenRankData, range: TimeRange): OpenRankData {
  if (range === 'all') return data;
  
  const filtered: OpenRankData = {};
  
  Object.entries(data).forEach(([key, value]) => {
    let shouldInclude = false;
    
    switch (range) {
      case 'monthly':
        shouldInclude = key.includes('-') && !key.includes('Q');
        break;
      case 'quarterly':
        shouldInclude = key.includes('Q');
        break;
      case 'yearly':
        shouldInclude = !key.includes('-') && !key.includes('Q');
        break;
    }
    
    if (shouldInclude) {
      filtered[key] = value;
    }
  });
  
  return filtered;
}

/**
 * 将 OpenRankData 转换为 ChartDataPoint 数组
 */
export function convertDataForChart(data: OpenRankData): ChartDataPoint[] {
  const timeSeriesData = processTimeSeriesData(data);
  return convertToChartData(timeSeriesData);
}

/**
 * 计算数据的统计信息
 */
export function calculateStatistics(data: ChartDataPoint[], startDate?: string, endDate?: string): MetricsSummary {
  if (!data || data.length === 0) {
    return {
      total: 0,
      average: 0,
      max: 0,
      min: 0,
      latest: 0,
      totalPeriods: 0,
      currentValue: 0,
      previousValue: 0,
      changePercentage: 0,
      trend: 'stable',
    };
  }

  // 如果提供了时间范围，过滤数据
  let filteredData = data;
  if (startDate && endDate) {
    filteredData = data.filter(d => {
      // 处理不同的日期格式
      let dateStr = d.date;
      
      // 如果是格式化的显示日期（如'2023/01'），转换为标准格式
      if (dateStr.includes('/')) {
        dateStr = dateStr.replace('/', '-') + '-01';
      }
      // 如果是月度格式（如'2023-01'），添加日期部分
      else if (dateStr.match(/^\d{4}-\d{2}$/)) {
        dateStr = dateStr + '-01';
      }
      // 如果是年度格式（如'2023'），转换为年末日期
      else if (dateStr.match(/^\d{4}$/)) {
        dateStr = dateStr + '-12-31';
      }
      
      const date = new Date(dateStr);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return date >= start && date <= end;
    });
  }

  const values = filteredData.map(d => d.value).filter(v => typeof v === 'number');
  const total = values.reduce((sum, val) => sum + val, 0);
  const average = values.length > 0 ? total / values.length : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const latest = values[values.length - 1] || 0;
  const previous = values[values.length - 2] || 0;
  const changePercentage = previous !== 0 ? ((latest - previous) / previous) * 100 : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercentage > 1) {
    trend = 'up';
  } else if (changePercentage < -1) {
    trend = 'down';
  }
  
  return {
    total,
    average,
    max,
    min,
    latest,
    totalPeriods: values.length,
    currentValue: latest,
    previousValue: previous,
    changePercentage,
    trend,
  };
}

/**
 * 格式化数值显示
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.00';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(decimals) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(decimals) + 'K';
  }
  return value.toFixed(decimals);
}

/**
 * 格式化百分比显示
 */
export function formatPercentage(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.0%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * 获取数据中可用的月份列表
 */
export function getAvailableMonths(data: OpenRankData): string[] {
  const months: string[] = [];
  
  Object.keys(data).forEach(key => {
    if (key.includes('-') && !key.includes('Q')) {
      // 月度数据格式: "2023-01"
      months.push(key);
    }
  });
  
  return months.sort();
}

/**
 * 根据时间选择器配置过滤数据
 */
export function filterDataByTimeSelector(data: OpenRankData, selector: TimeSelector): OpenRankData {
  if (selector.mode === 'range') {
    return filterDataByTimeRange(data, selector.range || 'all');
  } else if (selector.mode === 'specific' && selector.specific) {
    return filterDataBySpecificMonth(data, selector.specific);
  }
  
  return data;
}

/**
 * 根据具体月份过滤数据
 */
export function filterDataBySpecificMonth(data: OpenRankData, selection: MonthSelection): OpenRankData {
  const targetKey = `${selection.year}-${selection.month.toString().padStart(2, '0')}`;
  const filtered: OpenRankData = {};
  
  // 查找精确匹配的月份数据
  if (data[targetKey] !== undefined) {
    filtered[targetKey] = data[targetKey];
  }
  
  return filtered;
}

/**
 * 根据具体月份计算指标摘要（与前一个月对比）
 */
export function calculateSpecificMonthSummary(data: OpenRankData, selection: MonthSelection): MetricsSummary {
  const targetKey = `${selection.year}-${selection.month.toString().padStart(2, '0')}`;
  const currentValue = data[targetKey] || 0;
  
  // 计算前一个月的键
  let prevYear = selection.year;
  let prevMonth = selection.month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevKey = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
  const previousValue = data[prevKey] || 0;
  
  const changePercentage = previousValue !== 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercentage > 1) {
    trend = 'up';
  } else if (changePercentage < -1) {
    trend = 'down';
  }
  
  const safeToFixed = (value: number) => {
    return typeof value === 'number' && !isNaN(value) ? Number(value.toFixed(2)) : 0;
  };
  
  return {
    currentValue: safeToFixed(currentValue),
    previousValue: safeToFixed(previousValue),
    changePercentage: safeToFixed(changePercentage),
    trend,
    total: safeToFixed(currentValue),
    average: safeToFixed(currentValue),
    max: safeToFixed(currentValue),
    min: safeToFixed(currentValue),
    latest: safeToFixed(currentValue),
    totalPeriods: 1,
  };
}

/**
 * 根据时间选择器生成图表数据
 */
export function generateChartDataByTimeSelector(data: OpenRankData, selector: TimeSelector): ChartDataPoint[] {
  if (selector.mode === 'specific' && selector.specific) {
    // 具体月份模式：显示该月份及前几个月的趋势
    const { year, month } = selector.specific;
    const months: string[] = [];
    
    // 生成前6个月的数据用于趋势显示
    for (let i = 5; i >= 0; i--) {
      let targetYear = year;
      let targetMonth = month - i;
      
      while (targetMonth <= 0) {
        targetMonth += 12;
        targetYear -= 1;
      }
      
      const key = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
      if (data[key] !== undefined) {
        months.push(key);
      }
    }
    
    return months.map(key => {
      const value = data[key] || 0;
      return {
        date: formatDateForChart(key, 'monthly'),
        value: typeof value === 'number' && !isNaN(value) ? Number(value.toFixed(2)) : 0,
        label: 'monthly'
      };
    });
  } else {
    // 范围模式：使用原有逻辑
    const timeSeriesData = processTimeSeriesData(data, selector.range || 'monthly');
    return convertToChartData(timeSeriesData);
  }
}

/**
 * 根据时间选择器生成统计卡片数据
 */
export function generateStatCardsByTimeSelector(
  data: OpenRankData, 
  selector: TimeSelector,
  cardConfigs: Array<{
    title: string;
    key: string;
    description: string;
    icon: string;
    color: string;
  }>
): Array<{
  title: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}> {
  return cardConfigs.map(config => {
    const summary = selector.mode === 'specific' && selector.specific
      ? calculateSpecificMonthSummary(data, selector.specific)
      : calculateMetricsSummary(filterDataByTimeSelector(data, selector));
    
    return {
      title: config.title,
      value: formatNumber(summary.currentValue),
      change: summary.changePercentage,
      trend: summary.trend,
      description: config.description
    };
  });
}