import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Calendar, BarChart3, ArrowLeftRight } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MonthSelector from '../components/MonthSelector';
import { OpenDiggerAPI } from '../services/api';
import { 
  OpenRankData,
  StatisticsData, 
  StatCard as StatCardType,
  ChartDataPoint,
  LoadingState,
  TimeSelector
} from '../types';
import { 
  calculateStatistics,
  convertDataForChart,
  generateChartDataByTimeSelector,
  generateStatCardsByTimeSelector,
  getAvailableMonths
} from '../utils/dataProcessor';

type ComparisonPeriod = {
  label: string;
  startDate: string;
  endDate: string;
};

const Trends: React.FC = () => {
  const [openRankData, setOpenRankData] = useState<OpenRankData>({});
  const [activityData, setActivityData] = useState<StatisticsData>({});
  const [participantsData, setParticipantsData] = useState<StatisticsData>({});
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true });
  const [timeSelector, setTimeSelector] = useState<TimeSelector>({
    mode: 'range',
    range: 'monthly'
  });
  const [comparisonMode, setComparisonMode] = useState<'single' | 'comparison'>('single');
  const [selectedPeriods, setSelectedPeriods] = useState<ComparisonPeriod[]>([]);

  // 分析数据中的时间范围
  const analyzeDataTimeRange = (data: OpenRankData): { minYear: number; maxYear: number; availableYears: number[] } => {
    const years = new Set<number>();
    
    Object.keys(data).forEach(key => {
      let year: number;
      if (key.includes('Q')) {
        // 季度数据 (e.g., "2023Q1")
        year = parseInt(key.split('Q')[0]);
      } else if (key.includes('-')) {
        // 月度数据 (e.g., "2023-01")
        year = parseInt(key.split('-')[0]);
      } else {
        // 年度数据 (e.g., "2023")
        year = parseInt(key);
      }
      
      if (!isNaN(year) && year > 1900 && year < 3000) {
        years.add(year);
      }
    });
    
    const availableYears = Array.from(years).sort((a, b) => a - b);
    return {
      minYear: availableYears.length > 0 ? availableYears[0] : new Date().getFullYear(),
      maxYear: availableYears.length > 0 ? availableYears[availableYears.length - 1] : new Date().getFullYear(),
      availableYears
    };
  };

  // 动态生成对比时间段
  const generateDynamicPeriods = (): ComparisonPeriod[] => {
    // 合并所有数据源来分析时间范围
    const allData = { ...openRankData, ...activityData, ...participantsData };
    const { availableYears } = analyzeDataTimeRange(allData);
    
    if (availableYears.length === 0) {
      // 如果没有数据，返回默认时间段
      const currentYear = new Date().getFullYear();
      return [
        { label: `${currentYear}年`, startDate: `${currentYear}-01-01`, endDate: `${currentYear}-12-31` },
        { label: `${currentYear - 1}年`, startDate: `${currentYear - 1}-01-01`, endDate: `${currentYear - 1}-12-31` },
      ];
    }
    
    const periods: ComparisonPeriod[] = [];
    
    // 为每个可用年份生成时间段
    availableYears.forEach(year => {
      // 年度时间段
      periods.push({
        label: `${year}年`,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`
      });
      
      // 上半年时间段
      periods.push({
        label: `${year}年上半年`,
        startDate: `${year}-01-01`,
        endDate: `${year}-06-30`
      });
      
      // 下半年时间段
      periods.push({
        label: `${year}年下半年`,
        startDate: `${year}-07-01`,
        endDate: `${year}-12-31`
      });
    });
    
    return periods;
  };

  // 获取动态生成的时间段
  const predefinedPeriods = generateDynamicPeriods();

  // 加载数据
  const loadData = async () => {
    setLoadingState({ isLoading: true });
    
    try {
      const results = await OpenDiggerAPI.getAllMetrics();
      
      if (results.openrank.status === 'success') {
        setOpenRankData(results.openrank.data);
      }
      
      if (results.activity.status === 'success') {
        setActivityData(results.activity.data);
      }
      
      if (results.participants.status === 'success') {
        setParticipantsData(results.participants.data);
      }
      
      setLoadingState({ isLoading: false });
    } catch (error: unknown) {
      setLoadingState({ 
        isLoading: false, 
        error: { 
          code: 'FETCH_ERROR', 
          message: error instanceof Error ? error.message : '趋势数据加载失败' 
        } 
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 获取可用月份
  const availableMonths = getAvailableMonths(openRankData);

  // 状态管理：趋势统计卡片数据
  const [trendStatCards, setTrendStatCards] = useState<StatCardType[]>([]);

  // 生成趋势统计卡片
  const generateTrendStatCards = useCallback((): StatCardType[] => {
    const dataConfigs = [
      { title: 'OpenRank 趋势', data: openRankData, color: '#3b82f6', key: 'openrank', description: 'OpenRank 指标趋势分析' },
      { title: '活跃度趋势', data: activityData, color: '#10b981', key: 'activity', description: '项目活跃度趋势分析' },
      { title: '参与者趋势', data: participantsData, color: '#8b5cf6', key: 'participants', description: '参与者数量趋势分析' }
    ];

    return dataConfigs.map(config => {
      const cardConfigs = [{
        title: config.title,
        key: config.key,
        description: config.description,
        icon: 'TrendingUp',
        color: config.color
      }];
      
      const cards = generateStatCardsByTimeSelector(config.data, timeSelector, cardConfigs);
      
      return cards[0] || {
         title: config.title,
         value: '0',
         change: 0,
         trend: 'stable' as const,
         description: config.description
       };
    });
  }, [timeSelector, openRankData, activityData, participantsData]);

  // 监听时间选择器变化，重新生成统计数据
  useEffect(() => {
    if (Object.keys(openRankData).length > 0 || Object.keys(activityData).length > 0 || Object.keys(participantsData).length > 0) {
      const newTrendStatCards = generateTrendStatCards();
      setTrendStatCards(newTrendStatCards);
    }
  }, [timeSelector, openRankData, activityData, participantsData, generateTrendStatCards]);

  // 生成综合趋势图表数据
  const generateComprehensiveTrendData = (): ChartDataPoint[] => {
    const openRankChartData = generateChartDataByTimeSelector(openRankData, timeSelector);
    const activityChartData = generateChartDataByTimeSelector(activityData, timeSelector);
    const participantsChartData = generateChartDataByTimeSelector(participantsData, timeSelector);
    
    // 合并所有数据集
    const combinedData: ChartDataPoint[] = [];
    const maxLength = Math.max(
      openRankChartData.length,
      activityChartData.length,
      participantsChartData.length
    );
    
    for (let i = 0; i < maxLength; i++) {
      const openRankPoint = openRankChartData[i];
      const activityPoint = activityChartData[i];
      const participantsPoint = participantsChartData[i];
      
      if (openRankPoint || activityPoint || participantsPoint) {
        const date = openRankPoint?.date || activityPoint?.date || participantsPoint?.date || '';
        
        combinedData.push({
          date,
          value: openRankPoint?.value || 0,
          activityValue: activityPoint?.value || 0,
          participantsValue: participantsPoint?.value || 0,
        });
      }
    }
    
    return combinedData;
  };

  // 生成对比分析数据
  const generateComparisonData = () => {
    if (selectedPeriods.length < 2) return null;
    
    const period1 = selectedPeriods[0];
    const period2 = selectedPeriods[1];
    
    // 计算每个时间段的统计数据
    const period1Stats = {
      openRank: calculateStatistics(convertDataForChart(openRankData), period1.startDate, period1.endDate),
      activity: calculateStatistics(convertDataForChart(activityData), period1.startDate, period1.endDate),
      participants: calculateStatistics(convertDataForChart(participantsData), period1.startDate, period1.endDate),
    };
    
    const period2Stats = {
      openRank: calculateStatistics(convertDataForChart(openRankData), period2.startDate, period2.endDate),
      activity: calculateStatistics(convertDataForChart(activityData), period2.startDate, period2.endDate),
      participants: calculateStatistics(convertDataForChart(participantsData), period2.startDate, period2.endDate),
    };
    
    return {
      period1: { label: period1.label, stats: period1Stats },
      period2: { label: period2.label, stats: period2Stats },
    };
  };

  // 添加对比时间段
  const addComparisonPeriod = (period: ComparisonPeriod) => {
    if (selectedPeriods.length < 2 && !selectedPeriods.find(p => p.label === period.label)) {
      setSelectedPeriods([...selectedPeriods, period]);
    }
  };

  // 移除对比时间段
  const removeComparisonPeriod = (period: ComparisonPeriod) => {
    setSelectedPeriods(selectedPeriods.filter(p => p.label !== period.label));
  };

  if (loadingState.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="正在加载趋势数据..." />
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

  const comprehensiveTrendData = generateComprehensiveTrendData();
  const comparisonData = generateComparisonData();

  // 生成图表标题
  const getChartTitle = (baseTitle: string) => {
    if (timeSelector.mode === 'specific' && timeSelector.specific) {
      const { year, month } = timeSelector.specific;
      return `${baseTitle} (${year}年${month}月)`;
    }
    
    const rangeLabels = {
      'monthly': '月度',
      'quarterly': '季度', 
      'yearly': '年度'
    };
    
    return `${baseTitle} (${rangeLabels[timeSelector.range || 'monthly']})`;
  };

  return (
    <Layout>
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              趋势分析
            </h1>
            <p className="text-lg text-gray-600">
              KWDB 项目的历史数据趋势分析和时间段对比
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

      {/* 趋势统计卡片 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">趋势统计概览</h2>
          <MonthSelector
            value={timeSelector}
            onChange={setTimeSelector}
            availableMonths={availableMonths}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendStatCards.map((card, index) => (
            <StatCard 
              key={index} 
              data={card} 
              timeSelector={timeSelector}
            />
          ))}
        </div>
      </div>

      {/* 分析模式选择器 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">趋势分析</h2>
          <div className="flex items-center space-x-4">
            {/* 分析模式切换 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">分析模式:</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setComparisonMode('single')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    comparisonMode === 'single'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  趋势分析
                </button>
                <button
                  onClick={() => setComparisonMode('comparison')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    comparisonMode === 'comparison'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4 inline mr-1" />
                  对比分析
                </button>
              </div>
            </div>
            

          </div>
        </div>
      </div>

      {/* 趋势分析模式 */}
      {comparisonMode === 'single' && (
        <>
          {/* 综合趋势图表 */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">综合趋势分析</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">OpenRank</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">活跃度</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">参与者</span>
                  </div>
                </div>
              </div>
              <ChartContainer
                data={comprehensiveTrendData}
                config={{
                  title: getChartTitle('综合趋势分析'),
                  type: 'line',
                  dataKey: 'value',
                  secondaryDataKey: 'activityValue',
                  tertiaryDataKey: 'participantsValue',
                  color: '#3b82f6',
                  secondaryColor: '#ca8a04',
                  tertiaryColor: '#9333ea',
                  showLegend: true,
                }}
                height={400}
                loading={loadingState.isLoading}
                error={loadingState.error?.message}
              />
            </div>
          </div>

          {/* 分指标趋势图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* OpenRank 趋势 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">OpenRank 趋势</h3>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <ChartContainer
                data={generateChartDataByTimeSelector(openRankData, timeSelector)}
                config={{
                  title: getChartTitle('OpenRank 历史趋势'),
                  type: 'area',
                  dataKey: 'value',
                  color: '#3b82f6',
                }}
                height={300}
                loading={loadingState.isLoading}
                error={loadingState.error?.message}
              />
            </div>

            {/* 活跃度趋势 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">活跃度趋势</h3>
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <ChartContainer
                data={generateChartDataByTimeSelector(activityData, timeSelector)}
                config={{
                  title: getChartTitle('活跃度历史趋势'),
                  type: 'area',
                  dataKey: 'value',
                  color: '#10b981',
                }}
                height={300}
                loading={loadingState.isLoading}
                error={loadingState.error?.message}
              />
            </div>
          </div>
        </>
      )}

      {/* 对比分析模式 */}
      {comparisonMode === 'comparison' && (
        <>
          {/* 时间段选择器 */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">选择对比时间段</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {predefinedPeriods.map((period) => {
                  const isSelected = selectedPeriods.find(p => p.label === period.label);
                  const canAdd = selectedPeriods.length < 2;
                  
                  return (
                    <button
                      key={period.label}
                      onClick={() => isSelected ? removeComparisonPeriod(period) : addComparisonPeriod(period)}
                      disabled={!isSelected && !canAdd}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : canAdd
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {period.label}
                    </button>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500">
                已选择: {selectedPeriods.map(p => p.label).join(' vs ')}
                {selectedPeriods.length < 2 && ` (请选择${2 - selectedPeriods.length}个时间段)`}
              </div>
            </div>
          </div>

          {/* 对比结果 */}
          {comparisonData && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  对比分析结果: {comparisonData.period1.label} vs {comparisonData.period2.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* OpenRank 对比 */}
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">OpenRank</h4>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-blue-600">
                        {typeof comparisonData.period1.stats.openRank.average === 'number' 
                          ? comparisonData.period1.stats.openRank.average.toFixed(2) 
                          : '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">{comparisonData.period1.label}</div>
                      <div className="text-lg font-semibold text-green-600">
                        {typeof comparisonData.period2.stats.openRank.average === 'number' 
                          ? comparisonData.period2.stats.openRank.average.toFixed(2) 
                          : '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">{comparisonData.period2.label}</div>
                    </div>
                  </div>

                  {/* 活跃度对比 */}
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">活跃度</h4>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-blue-600">
                        {typeof comparisonData.period1.stats.activity.average === 'number' 
                          ? comparisonData.period1.stats.activity.average.toFixed(2) 
                          : '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">{comparisonData.period1.label}</div>
                      <div className="text-lg font-semibold text-green-600">
                        {typeof comparisonData.period2.stats.activity.average === 'number' 
                          ? comparisonData.period2.stats.activity.average.toFixed(2) 
                          : '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">{comparisonData.period2.label}</div>
                    </div>
                  </div>

                  {/* 参与者对比 */}
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">参与者</h4>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-blue-600">
                        {typeof comparisonData.period1.stats.participants.average === 'number' 
                          ? comparisonData.period1.stats.participants.average.toFixed(2) 
                          : '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">{comparisonData.period1.label}</div>
                      <div className="text-lg font-semibold text-green-600">
                        {typeof comparisonData.period2.stats.participants.average === 'number' 
                          ? comparisonData.period2.stats.participants.average.toFixed(2) 
                          : '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">{comparisonData.period2.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 趋势分析说明 */}
      <div className="mt-8">
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">趋势分析说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-purple-800">
            <div>
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>趋势分析模式</span>
              </h4>
              <p>
                展示各项指标的历史趋势变化，帮助识别项目发展的规律和周期性特征。
                支持不同时间粒度的数据查看。
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <ArrowLeftRight className="w-4 h-4" />
                <span>对比分析模式</span>
              </h4>
              <p>
                通过选择不同时间段进行对比分析，量化项目在不同时期的表现差异，
                为项目发展策略提供数据支持。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Trends;