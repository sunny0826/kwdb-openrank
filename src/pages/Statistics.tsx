import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  AlertCircle, 
  GitPullRequest, 
  Calendar, 
  Filter,
  TrendingUp
} from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MonthSelector from '../components/MonthSelector';
import { OpenDiggerAPI } from '../services/api';
import { 
  StatisticsData, 
  StatCard as StatCardType,
  ChartDataPoint,
  LoadingState,
  TimeSelector,
  MetricConfig,
  MetricCategory
} from '../types';
import { 
  generateChartDataByTimeSelector,
  generateStatCardsByTimeSelector,
  getAvailableMonths
} from '../utils/dataProcessor';
import { getMetricDescription } from '../utils/metricDescriptions';

const Statistics: React.FC = () => {
  // 基础指标数据状态
  const [openRankData, setOpenRankData] = useState<StatisticsData>({});
  const [activityData, setActivityData] = useState<StatisticsData>({});
  const [participantsData, setParticipantsData] = useState<StatisticsData>({});
  const [issuesData, setIssuesData] = useState<StatisticsData>({});
  const [changeRequestsData, setChangeRequestsData] = useState<StatisticsData>({});
  const [starsData, setStarsData] = useState<StatisticsData>({});
  const [forksData, setForksData] = useState<StatisticsData>({});
  const [attentionData, setAttentionData] = useState<StatisticsData>({});
  const [newContributorsData, setNewContributorsData] = useState<StatisticsData>({});

  // 开发者指标数据状态
  const [contributorsData, setContributorsData] = useState<StatisticsData>({});
  const [inactiveContributorsData, setInactiveContributorsData] = useState<StatisticsData>({});
  const [busFactorData, setBusFactorData] = useState<StatisticsData>({});

  // Issue指标数据状态
  const [issuesClosedData, setIssuesClosedData] = useState<StatisticsData>({});
  const [issueCommentsData, setIssueCommentsData] = useState<StatisticsData>({});
  const [issueResponseTimeData, setIssueResponseTimeData] = useState<StatisticsData>({});
  const [issueResolutionDurationData, setIssueResolutionDurationData] = useState<StatisticsData>({});
  const [issueAgeData, setIssueAgeData] = useState<StatisticsData>({});

  // 变更请求指标数据状态
  const [changeRequestsAcceptedData, setChangeRequestsAcceptedData] = useState<StatisticsData>({});
  const [changeRequestsReviewsData, setChangeRequestsReviewsData] = useState<StatisticsData>({});
  const [changeRequestResponseTimeData, setChangeRequestResponseTimeData] = useState<StatisticsData>({});
  const [changeRequestResolutionDurationData, setChangeRequestResolutionDurationData] = useState<StatisticsData>({});
  const [changeRequestAgeData, setChangeRequestAgeData] = useState<StatisticsData>({});
  
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: true });
  const [timeSelector, setTimeSelector] = useState<TimeSelector>({
    mode: 'range',
    range: 'monthly'
  });
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory>('general');
  const [selectedMetric, setSelectedMetric] = useState<string>('openrank');

  // 指标配置
  const metricConfigs: MetricConfig[] = useMemo(() => [
    // 基础指标
    { key: 'openrank', name: 'OpenRank 评分', category: 'general', color: '#dc2626', icon: 'Star' },
    { key: 'activity', name: '项目活跃度', category: 'general', color: '#3b82f6', icon: 'Activity' },
    { key: 'participants', name: '参与者数量', category: 'general', color: '#10b981', icon: 'Users' },
    { key: 'issues_new', name: '新建 Issue', category: 'general', color: '#f59e0b', icon: 'AlertCircle' },
    { key: 'change_requests', name: '变更请求', category: 'general', color: '#8b5cf6', icon: 'GitPullRequest' },
    { key: 'stars', name: 'Star 数量', category: 'general', color: '#fbbf24', icon: 'Star' },
    { key: 'forks', name: 'Fork 数量', category: 'general', color: '#6366f1', icon: 'GitFork' },
    { key: 'attention', name: '关注度', category: 'general', color: '#ec4899', icon: 'Eye' },
    
    // 开发者指标
    { key: 'new_contributors', name: '新贡献者数量', category: 'developer', color: '#06b6d4', icon: 'UserPlus' },
    { key: 'contributors', name: '贡献者数量', category: 'developer', color: '#10b981', icon: 'Users' },
    { key: 'inactive_contributors', name: '不活跃贡献者', category: 'developer', color: '#ef4444', icon: 'UserMinus' },
    { key: 'bus_factor', name: '贡献者缺席因素', category: 'developer', color: '#f97316', icon: 'BarChart3' },
    
    // Issue指标
    { key: 'issues_closed', name: '关闭 Issue 数量', category: 'issue', color: '#22c55e', icon: 'CheckCircle' },
    { key: 'issue_comments', name: 'Issue 评论数量', category: 'issue', color: '#3b82f6', icon: 'MessageSquare' },
    { key: 'issue_response_time', name: 'Issue 响应时间', category: 'issue', unit: '小时', color: '#f59e0b', icon: 'Clock' },
    { key: 'issue_resolution_duration', name: 'Issue 解决时长', category: 'issue', unit: '天', color: '#8b5cf6', icon: 'Timer' },
    { key: 'issue_age', name: 'Issue 年龄', category: 'issue', unit: '天', color: '#ef4444', icon: 'Calendar' },
    
    // 变更请求指标
    { key: 'change_requests_accepted', name: '接受的变更请求', category: 'change_request', color: '#22c55e', icon: 'CheckCircle' },
    { key: 'change_requests_reviews', name: '变更请求评审数量', category: 'change_request', color: '#3b82f6', icon: 'GitBranch' },
    { key: 'change_request_response_time', name: '变更请求响应时间', category: 'change_request', unit: '小时', color: '#f59e0b', icon: 'Clock' },
    { key: 'change_request_resolution_duration', name: '变更请求解决时长', category: 'change_request', unit: '天', color: '#8b5cf6', icon: 'Timer' },
    { key: 'change_request_age', name: '变更请求年龄', category: 'change_request', unit: '天', color: '#ef4444', icon: 'Calendar' },
  ], []);

  // 加载数据
  const loadData = async () => {
    setLoadingState({ isLoading: true });
    
    try {
      const [
        openRankResult,
        activityResult,
        participantsResult,
        issuesResult,
        changeRequestsResult,
        starsResult,
        forksResult,
        attentionResult,
        newContributorsResult,
        contributorsResult,
        inactiveContributorsResult,
        busFactorResult,
        issuesClosedResult,
        issueCommentsResult,
        issueResponseTimeResult,
        issueResolutionDurationResult,
        issueAgeResult,
        changeRequestsAcceptedResult,
        changeRequestsReviewsResult,
        changeRequestResponseTimeResult,
        changeRequestResolutionDurationResult,
        changeRequestAgeResult,
      ] = await Promise.all([
        OpenDiggerAPI.getOpenRankData(),
        OpenDiggerAPI.getActivityData(),
        OpenDiggerAPI.getParticipantsData(),
        OpenDiggerAPI.getIssuesData(),
        OpenDiggerAPI.getChangeRequestsData(),
        OpenDiggerAPI.getStarsData(),
        OpenDiggerAPI.getForksData(),
        OpenDiggerAPI.getAttentionData(),
        OpenDiggerAPI.getNewContributorsData(),
        OpenDiggerAPI.getContributorsData(),
        OpenDiggerAPI.getInactiveContributorsData(),
        OpenDiggerAPI.getBusFactorData(),
        OpenDiggerAPI.getIssuesClosedData(),
        OpenDiggerAPI.getIssueCommentsData(),
        OpenDiggerAPI.getIssueResponseTimeData(),
        OpenDiggerAPI.getIssueResolutionDurationData(),
        OpenDiggerAPI.getIssueAgeData(),
        OpenDiggerAPI.getChangeRequestsAcceptedData(),
        OpenDiggerAPI.getChangeRequestsReviewsData(),
        OpenDiggerAPI.getChangeRequestResponseTimeData(),
        OpenDiggerAPI.getChangeRequestResolutionDurationData(),
        OpenDiggerAPI.getChangeRequestAgeData(),
      ]);
      
      // 设置基础数据
      if (openRankResult.status === 'success') setOpenRankData(openRankResult.data);
      if (activityResult.status === 'success') setActivityData(activityResult.data);
      if (participantsResult.status === 'success') setParticipantsData(participantsResult.data);
      if (issuesResult.status === 'success') setIssuesData(issuesResult.data);
      if (changeRequestsResult.status === 'success') setChangeRequestsData(changeRequestsResult.data);
      if (starsResult.status === 'success') setStarsData(starsResult.data);
      if (forksResult.status === 'success') setForksData(forksResult.data);
      if (attentionResult.status === 'success') setAttentionData(attentionResult.data);
      
      // 设置开发者数据
      if (newContributorsResult.status === 'success') setNewContributorsData(newContributorsResult.data);
      if (contributorsResult.status === 'success') setContributorsData(contributorsResult.data);
      if (inactiveContributorsResult.status === 'success') setInactiveContributorsData(inactiveContributorsResult.data);
      if (busFactorResult.status === 'success') setBusFactorData(busFactorResult.data);
      
      // 设置Issue数据
      if (issuesClosedResult.status === 'success') setIssuesClosedData(issuesClosedResult.data);
      if (issueCommentsResult.status === 'success') setIssueCommentsData(issueCommentsResult.data);
      if (issueResponseTimeResult.status === 'success') setIssueResponseTimeData(issueResponseTimeResult.data);
      if (issueResolutionDurationResult.status === 'success') setIssueResolutionDurationData(issueResolutionDurationResult.data);
      if (issueAgeResult.status === 'success') setIssueAgeData(issueAgeResult.data);
      
      // 设置变更请求数据
      if (changeRequestsAcceptedResult.status === 'success') setChangeRequestsAcceptedData(changeRequestsAcceptedResult.data);
      if (changeRequestsReviewsResult.status === 'success') setChangeRequestsReviewsData(changeRequestsReviewsResult.data);
      if (changeRequestResponseTimeResult.status === 'success') setChangeRequestResponseTimeData(changeRequestResponseTimeResult.data);
      if (changeRequestResolutionDurationResult.status === 'success') setChangeRequestResolutionDurationData(changeRequestResolutionDurationResult.data);
      if (changeRequestAgeResult.status === 'success') setChangeRequestAgeData(changeRequestAgeResult.data);
      
      setLoadingState({ isLoading: false });
    } catch (error: unknown) {
      setLoadingState({ 
        isLoading: false, 
        error: { 
          code: 'FETCH_ERROR', 
          message: error instanceof Error ? error.message : '统计数据加载失败' 
        } 
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 获取数据映射
  const getDataByKey = useCallback((key: string): StatisticsData => {
    const dataMap: { [key: string]: StatisticsData } = {
      'openrank': openRankData,
      'activity': activityData,
      'participants': participantsData,
      'issues_new': issuesData,
      'change_requests': changeRequestsData,
      'stars': starsData,
      'forks': forksData,
      'attention': attentionData,
      'new_contributors': newContributorsData,
      'contributors': contributorsData,
      'inactive_contributors': inactiveContributorsData,
      'bus_factor': busFactorData,
      'issues_closed': issuesClosedData,
      'issue_comments': issueCommentsData,
      'issue_response_time': issueResponseTimeData,
      'issue_resolution_duration': issueResolutionDurationData,
      'issue_age': issueAgeData,
      'change_requests_accepted': changeRequestsAcceptedData,
      'change_requests_reviews': changeRequestsReviewsData,
      'change_request_response_time': changeRequestResponseTimeData,
      'change_request_resolution_duration': changeRequestResolutionDurationData,
      'change_request_age': changeRequestAgeData,
    };
    return dataMap[key] || {};
  }, [openRankData, activityData, participantsData, issuesData, changeRequestsData, starsData, forksData, attentionData, newContributorsData, contributorsData, inactiveContributorsData, busFactorData, issuesClosedData, issueCommentsData, issueResponseTimeData, issueResolutionDurationData, issueAgeData, changeRequestsAcceptedData, changeRequestsReviewsData, changeRequestResponseTimeData, changeRequestResolutionDurationData, changeRequestAgeData]);

  // 获取可用月份
  const availableMonths = getAvailableMonths(activityData);

  // 状态管理：分类统计卡片数据
  const [currentCategoryCards, setCurrentCategoryCards] = useState<StatCardType[]>([]);
  
  // 状态管理：选中的卡片索引
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);

  // 生成分类统计卡片
  const generateCategoryStatCards = useCallback((category: MetricCategory): StatCardType[] => {
    const categoryConfigs = metricConfigs.filter(config => config.category === category);
    
    return categoryConfigs.map(config => {
      const rawData = getDataByKey(config.key);
      const cardConfigs = [{
        title: config.name,
        key: config.key,
        description: config.description || `${config.name}统计`,
        icon: 'TrendingUp',
        color: config.color
      }];
      
      const cards = generateStatCardsByTimeSelector(rawData, timeSelector, cardConfigs);
      
      return cards[0] || {
        title: config.name,
        value: config.unit ? `0.0 ${config.unit}` : '0',
        change: 0,
        trend: 'stable' as const,
        description: config.description || `${config.name}统计`
      };
    });
  }, [timeSelector, metricConfigs, getDataByKey]);

  // 监听时间选择器和分类变化，重新生成统计数据
  useEffect(() => {
    // 检查是否有数据加载完成
    const hasData = Object.keys(activityData).length > 0 || 
                   Object.keys(participantsData).length > 0 || 
                   Object.keys(issuesData).length > 0;
    
    if (hasData) {
      const newCategoryCards = generateCategoryStatCards(selectedCategory);
      setCurrentCategoryCards(newCategoryCards);
      // 重置选中的卡片索引
      setSelectedCardIndex(-1);
    }
  }, [generateCategoryStatCards, selectedCategory, activityData, participantsData, issuesData]);

  // 获取分类名称
  const getCategoryName = (category: MetricCategory): string => {
    const names = {
      'general': '核心指标',
      'developer': '开发者指标',
      'issue': 'Issue 指标',
      'change_request': '变更请求指标'
    };
    return names[category];
  };

  // 获取分类图标
  const getCategoryIcon = (category: MetricCategory) => {
    const icons = {
      'general': <TrendingUp className="w-5 h-5" />,
      'developer': <Users className="w-5 h-5" />,
      'issue': <AlertCircle className="w-5 h-5" />,
      'change_request': <GitPullRequest className="w-5 h-5" />
    };
    return icons[category];
  };

  // 处理卡片点击事件
  const handleCardClick = (cardIndex: number) => {
    setSelectedCardIndex(cardIndex);
    // 获取对应的指标配置
    const categoryConfigs = metricConfigs.filter(config => config.category === selectedCategory);
    if (categoryConfigs[cardIndex]) {
      setSelectedMetric(categoryConfigs[cardIndex].key);
    }
  };

  // 获取当前选中指标的数据
  const getCurrentMetricData = (): ChartDataPoint[] => {
    const rawData = getDataByKey(selectedMetric);
    return generateChartDataByTimeSelector(rawData, timeSelector);
  };

  // 获取指标标题
  const getMetricTitle = (): string => {
    const config = metricConfigs.find(c => c.key === selectedMetric);
    return config?.name || '指标';
  };

  // 获取指标颜色
  const getMetricColor = (): string => {
    const config = metricConfigs.find(c => c.key === selectedMetric);
    return config?.color || '#3b82f6';
  };

  if (loadingState.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="正在加载统计数据..." />
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

  const currentMetricData = getCurrentMetricData();



  return (
    <Layout>
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              统计指标分析
            </h1>
            <p className="text-lg text-gray-600">
              KWDB 项目的全面统计分析，包括开发者、Issue 和变更请求等多维度指标
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

      {/* 时间选择器 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">指标概览</h2>
          <MonthSelector
            value={timeSelector}
            onChange={setTimeSelector}
            availableMonths={availableMonths}
          />
        </div>
      </div>

      {/* 分类选择器 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {(['general', 'developer', 'issue', 'change_request'] as MetricCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="font-medium">{getCategoryName(category)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 当前分类的指标卡片 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {getCategoryName(selectedCategory)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCategoryCards.map((card, index) => (
            <StatCard 
              key={index} 
              data={card} 
              timeSelector={timeSelector}
              onClick={() => handleCardClick(index)}
              isSelected={selectedCardIndex === index}
            />
          ))}
        </div>
      </div>

      {/* 详细指标分析 */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">详细指标分析</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">选择指标:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {metricConfigs.map(config => (
                  <option key={config.key} value={config.key}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ChartContainer
            data={currentMetricData}
            config={{
              title: `${getMetricTitle()} 趋势`,
              type: 'area',
              dataKey: 'value',
              color: getMetricColor(),
            }}
            height={350}
            loading={loadingState.isLoading}
            error={loadingState.error?.message}
          />
        </div>
      </div>


    </Layout>
  );
};

export default Statistics;