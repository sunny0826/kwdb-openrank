import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Users, Activity, TrendingUp, ExternalLink, Calendar, Github } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MonthSelector from '../components/MonthSelector';
import { OpenDiggerAPI } from '../services/api';
import { 
  ProjectMeta, 
  OpenRankData, 
  StatisticsData, 
  StatCard as StatCardType,
  ChartDataPoint,
  LoadingState,
  TimeRange,
  TimeSelector
} from '../types';
import { 
  calculateMetricsSummary,
  getLatestValue, 
  processTimeSeriesData, 
  convertToChartData,
  getAvailableMonths,
  filterDataByTimeSelector,
  calculateSpecificMonthSummary,
  generateChartDataByTimeSelector,
  calculateStatistics
} from '../utils/dataProcessor';

const Home: React.FC = () => {
  const [projectMeta, setProjectMeta] = useState<ProjectMeta | null>(null);
  const [openRankData, setOpenRankData] = useState<OpenRankData>({});

  const [activityData, setActivityData] = useState<StatisticsData>({});
  const [participantsData, setParticipantsData] = useState<StatisticsData>({});
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true });
  const [timeSelector, setTimeSelector] = useState<TimeSelector>({
    mode: 'range',
    range: 'monthly'
  });

  // 加载数据
  const loadData = async () => {
    setLoadingState({ isLoading: true });
    
    try {
      const results = await OpenDiggerAPI.getAllMetrics();
      
      if (results.meta.status === 'success') {
        setProjectMeta(results.meta.data);
      }
      
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
    } catch (error: any) {
      setLoadingState({ 
        isLoading: false, 
        error: { 
          code: 'FETCH_ERROR', 
          message: error.message || '数据加载失败' 
        } 
      });
    }
  };

  // 状态变量用于存储计算后的数据
  const [statCards, setStatCards] = useState<StatCardType[]>([]);
  const [trendChartData, setTrendChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // 生成统计卡片数据
  const generateStatCards = (selector: TimeSelector = timeSelector): StatCardType[] => {
    let openRankSummary;
    let activitySummary;
    let participantsSummary;
    
    if (selector.mode === 'specific' && selector.specific) {
       openRankSummary = calculateSpecificMonthSummary(
         openRankData,
         selector.specific
       );
       activitySummary = calculateSpecificMonthSummary(
         activityData,
         selector.specific
       );
       participantsSummary = calculateSpecificMonthSummary(
         participantsData,
         selector.specific
       );
    } else {
      const timeRange = selector.range || 'monthly';
      openRankSummary = calculateStatistics(
         convertToChartData(processTimeSeriesData(openRankData, timeRange))
       );
      activitySummary = calculateStatistics(
         convertToChartData(processTimeSeriesData(activityData, timeRange))
       );
      participantsSummary = calculateStatistics(
         convertToChartData(processTimeSeriesData(participantsData, timeRange))
       );
    }

    return [
      {
        title: '全域 OpenRank',
        value: openRankSummary.currentValue,
        change: openRankSummary.changePercentage,
        trend: openRankSummary.trend,
        description: '项目在全域范围内的影响力指标',
      },
      {
        title: '活跃度',
        value: activitySummary.currentValue,
        change: activitySummary.changePercentage,
        trend: activitySummary.trend,
        description: '项目当前的活跃度水平',
      },
      {
        title: '参与者数量',
        value: participantsSummary.currentValue,
        change: participantsSummary.changePercentage,
        trend: participantsSummary.trend,
        description: '项目的参与者总数',
      },
    ];
  };

  // 生成趋势图表数据
  const generateTrendChartData = (selector: TimeSelector = timeSelector): ChartDataPoint[] => {
    return generateChartDataByTimeSelector(openRankData, selector);
  };

  // 监听timeSelector变化，重新生成统计数据
  useEffect(() => {
    if (Object.keys(openRankData).length > 0 && Object.keys(activityData).length > 0 && Object.keys(participantsData).length > 0) {
      const newStatCards = generateStatCards(timeSelector);
      const newTrendChartData = generateTrendChartData(timeSelector);
      setStatCards(newStatCards);
      setTrendChartData(newTrendChartData);
    }
  }, [timeSelector, openRankData, activityData, participantsData]);

  if (loadingState.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="正在加载项目数据..." />
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

  return (
    <Layout>
      {/* 项目概览 */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl">
                <GitBranch className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  KWDB 项目 OpenRank 指标
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  基于 OpenDigger 数据的 KWDB 项目影响力和活跃度分析平台
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {projectMeta && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>更新时间: {new Date(projectMeta.updatedAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4" />
                        <span>项目 ID: {projectMeta.id}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <a
                href="https://gitee.com/kwdb/kwdb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
                </svg>
                <span>Gitee</span>
              </a>
              <a
                href="https://github.com/kwdb/kwdb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a
                href="https://atomgit.com/kwdb/kwdb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium rounded-lg border border-gray-300 transition-colors duration-200"
              >
                <img src="https://res.oafimg.cn/openatom-www/home/assets/logo-300x300-DC-YZyCt.png" alt="OpenAtom" className="w-4 h-4" />
                <span>AtomGit</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 核心指标摘要 */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">核心指标概览</h2>
          <MonthSelector
            value={timeSelector}
            onChange={setTimeSelector}
            availableMonths={getAvailableMonths(openRankData)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr">
          {statCards.map((card, index) => (
            <StatCard 
              key={index} 
              data={card} 
              className="transform hover:scale-105 transition-transform duration-200"
              timeSelector={timeSelector}
            />
          ))}
        </div>
      </div>

      {/* OpenRank 趋势图表 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            OpenRank 趋势 ({timeSelector.mode === 'specific' && timeSelector.specific 
               ? `${timeSelector.specific.year}年${timeSelector.specific.month}月` 
               : timeSelector.range === 'monthly' ? '月度' : timeSelector.range === 'quarterly' ? '季度' : '年度'})
          </h2>
          <Link
            to="/openrank"
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <span>查看详细</span>
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
        <ChartContainer
          data={trendChartData}
          config={{
            title: `OpenRank ${timeSelector.mode === 'specific' && timeSelector.specific 
               ? `${timeSelector.specific.year}年${timeSelector.specific.month}月趋势` 
               : timeSelector.range === 'monthly' ? '月度' : timeSelector.range === 'quarterly' ? '季度' : '年度'}趋势`,
            type: 'area',
            dataKey: 'value',
            color: '#3b82f6',
          }}
          height={300}
          loading={loadingState.isLoading}
          error={loadingState.error?.message}
        />
      </div>

      {/* 快速导航 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/openrank"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">OpenRank 指标</h3>
          </div>
          <p className="text-gray-600 text-sm">
            查看 OpenRank 的详细数据和历史趋势
          </p>
        </Link>

        <Link
          to="/statistics"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">统计指标</h3>
          </div>
          <p className="text-gray-600 text-sm">
            浏览项目活跃度、贡献者统计和问题处理情况
          </p>
        </Link>

        <Link
          to="/trends"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">趋势分析</h3>
          </div>
          <p className="text-gray-600 text-sm">
            深入分析历史数据趋势和进行时间段对比
          </p>
        </Link>
      </div>
    </Layout>
  );
};

export default Home;