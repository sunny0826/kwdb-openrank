import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, LineChart, AreaChart } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MonthSelector from '../components/MonthSelector';
import { OpenDiggerAPI } from '../services/api';
import { 
  OpenRankData, 
  StatCard as StatCardType,
  ChartDataPoint,
  LoadingState,
  TimeRange,
  SpecificMonth 
} from '../types';
import { 
  calculateMetricsSummary, 
  processTimeSeriesData, 
  convertToChartData,
  filterDataByTimeRange,
  convertDataForChart,
  filterDataBySpecificMonth 
} from '../utils/dataProcessor';

const OpenRank: React.FC = () => {
  const [globalOpenRankData, setGlobalOpenRankData] = useState<OpenRankData>({});
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true });
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<SpecificMonth | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  
  // 状态变量用于存储计算后的数据
  const [statCards, setStatCards] = useState<StatCardType[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // 加载数据
  const loadData = async () => {
    setLoadingState({ isLoading: true });
    
    try {
      const globalResult = await OpenDiggerAPI.getOpenRankData();
      
      if (globalResult.status === 'success') {
        setGlobalOpenRankData(globalResult.data);
      }
      
      setLoadingState({ isLoading: false });
    } catch (error: any) {
      setLoadingState({ 
        isLoading: false, 
        error: { 
          code: 'FETCH_ERROR', 
          message: error.message || 'OpenRank 数据加载失败' 
        } 
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 监听selectedMonth和timeRange变化，重新生成统计数据
  useEffect(() => {
    if (Object.keys(globalOpenRankData).length > 0) {
      const newStatCards = generateStatCards();
      const newChartData = generateChartData();
      setStatCards(newStatCards);
      setChartData(newChartData);
    }
  }, [selectedMonth, timeRange, globalOpenRankData]);

  // 生成统计卡片数据
  const generateStatCards = (): StatCardType[] => {
    let filteredGlobalData;
    
    if (selectedMonth) {
      // 具体月份模式：根据选择的月份过滤数据
      filteredGlobalData = filterDataBySpecificMonth(globalOpenRankData, {
        year: parseInt(selectedMonth.split('-')[0]),
        month: parseInt(selectedMonth.split('-')[1])
      });
    } else {
      // 范围视图模式：根据timeRange处理数据，不进行月份过滤
      filteredGlobalData = filterDataByTimeRange(globalOpenRankData, timeRange);
    }

    const globalSummary = calculateMetricsSummary(filteredGlobalData);

    return [
      {
        title: 'OpenRank',
        value: `${globalSummary.currentValue.toFixed(2)} 分`,
        change: globalSummary.changePercentage,
        trend: globalSummary.trend,
        description: selectedMonth 
          ? `${selectedMonth} 数据` 
          : `${timeRange === 'monthly' ? '月度' : timeRange === 'quarterly' ? '季度' : '年度'}视图数据`,
      },
      {
        title: '最高值',
        value: `${globalSummary.max.toFixed(2)} 分`,
        description: '历史最高 OpenRank 值',
      },
      {
        title: '平均值',
        value: `${globalSummary.average.toFixed(2)} 分`,
        description: '历史平均 OpenRank 值',
      },
      {
        title: '数据覆盖期间',
        value: `${globalSummary.totalPeriods} 个月`,
        description: '可用数据的时间跨度',
      },
    ];
  };

  // 生成图表数据
  const generateChartData = () => {
    let filteredGlobalData;
    
    if (selectedMonth) {
      // 具体月份模式：根据选择的月份过滤数据
      filteredGlobalData = filterDataBySpecificMonth(globalOpenRankData, {
        year: parseInt(selectedMonth.split('-')[0]),
        month: parseInt(selectedMonth.split('-')[1])
      });
    } else {
      // 范围视图模式：使用原始数据，让processTimeSeriesData根据timeRange处理
      filteredGlobalData = globalOpenRankData;
    }

    const globalTimeSeriesData = processTimeSeriesData(filteredGlobalData, timeRange);
    
    // 转换为图表数据格式
    return convertToChartData(globalTimeSeriesData);
  };

  if (loadingState.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="正在加载 OpenRank 数据..." />
        </div>
      </Layout>
    );
  }

  if (loadingState.error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <ErrorMessage 
            error={loadingState.error} 
            onRetry={loadData}
            className="mt-8"
          />
        </div>
      </Layout>
    );
  }

  // 移除这两行，因为现在使用状态变量

  // 生成图表标题
  const getChartTitle = () => {
    if (selectedMonth) {
      return `OpenRank 趋势 (${selectedMonth})`;
    }
    return `OpenRank 趋势 (${timeRange})`;
  };

  return (
    <Layout>
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              OpenRank 指标分析
            </h1>
            <p className="text-lg text-gray-600">
              KWDB 项目的 OpenRank 影响力指标详细分析
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              数据来源: OpenDigger API
            </span>
          </div>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">核心指标概览</h2>
          <MonthSelector
            value={{
              mode: selectedMonth ? 'specific' : 'range',
              range: timeRange,
              specific: selectedMonth ? {
                year: parseInt(selectedMonth.split('-')[0]),
                month: parseInt(selectedMonth.split('-')[1])
              } : undefined
            }}
            onChange={(selector) => {
              if (selector.mode === 'specific' && selector.specific) {
                const monthStr = `${selector.specific.year}-${selector.specific.month.toString().padStart(2, '0')}`;
                setSelectedMonth(monthStr);
              } else {
                setSelectedMonth(null);
                if (selector.range) {
                  setTimeRange(selector.range);
                }
              }
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard key={index} data={card} />
          ))}
        </div>
      </div>

      {/* 图表控制器 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">OpenRank 趋势</h2>
          <div className="flex items-center space-x-4">
            {/* 图表类型选择器 */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">图表类型:</span>
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 shadow-sm">
                <button
                  onClick={() => setChartType('line')}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    chartType === 'line'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                  <span>线图</span>
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    chartType === 'area'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <AreaChart className="w-4 h-4" />
                  <span>面积图</span>
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    chartType === 'bar'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>柱状图</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主图表 */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ChartContainer
            data={chartData}
            config={{
              title: getChartTitle(),
              type: chartType,
              dataKey: 'value',
              color: '#3b82f6',
            }}
            height={400}
            loading={loadingState.isLoading}
            error={loadingState.error?.message}
          />
        </div>
      </div>



      {/* 数据说明 */}
      <div className="mt-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">关于 OpenRank 指标</h3>
          <div className="text-sm text-blue-800">
            <p>
              OpenRank 是衡量项目在开源生态系统中影响力和重要性的综合指标。
              该指标考虑了项目的网络效应、协作关系、贡献度和社区活跃度等多个维度，
              为评估开源项目的价值和影响力提供了量化的参考标准。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OpenRank;