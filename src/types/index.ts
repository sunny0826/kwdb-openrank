// 项目元数据类型
export interface ProjectMeta {
  updatedAt: number;
  type: 'repo';
  id: number;
  labels: {
    id: string;
    name: string;
    type: string;
  }[];
}

// OpenRank 数据类型
export interface OpenRankData {
  [timeKey: string]: number;
}

// 统计数据类型
export interface StatisticsData {
  [timeKey: string]: number;
}

// 图表数据类型
export interface ChartDataPoint {
  date: string;
  value: number;
  activityValue?: number;
  participantsValue?: number;
  label?: string;
  [key: string]: string | number | undefined;
}

// API 响应类型
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// 时间范围类型
export type TimeRange = 'monthly' | 'quarterly' | 'yearly' | 'all';

// 具体月份类型 (YYYY-MM 格式)
export type SpecificMonth = string;

// 月份选择类型
export interface MonthSelection {
  year: number;
  month: number;
}

// 时间选择模式
export type TimeSelectionMode = 'range' | 'specific';

// 时间选择器配置
export interface TimeSelector {
  mode: TimeSelectionMode;
  range?: TimeRange;
  specific?: MonthSelection;
}

// 指标类型
export type MetricType = 'openrank' | 'activity' | 'participants' | 'new_contributors' | 'contributors' | 'inactive_contributors' | 'bus_factor' | 'issues_new' | 'issues_closed' | 'issue_comments' | 'issue_response_time' | 'issue_resolution_duration' | 'issue_age' | 'change_requests' | 'change_requests_accepted' | 'change_requests_reviews' | 'change_request_response_time' | 'change_request_resolution_duration' | 'change_request_age';

// 开发者相关指标类型
export type DeveloperMetricType = 'new_contributors' | 'new_contributors_detail' | 'contributors' | 'contributors_detail' | 'inactive_contributors' | 'participants' | 'bus_factor' | 'bus_factor_detail';

// Issue相关指标类型
export type IssueMetricType = 'issues_new' | 'issues_closed' | 'issue_comments' | 'issue_response_time' | 'issue_resolution_duration' | 'issue_age';

// 变更请求相关指标类型
export type ChangeRequestMetricType = 'change_requests' | 'change_requests_accepted' | 'change_requests_reviews' | 'change_request_response_time' | 'change_request_resolution_duration' | 'change_request_age';

// 指标分类类型
export type MetricCategory = 'developer' | 'issue' | 'change_request' | 'general';

// 指标配置接口
export interface MetricConfig {
  key: string;
  name: string;
  category: MetricCategory;
  unit?: string;
  description?: string;
  color?: string;
  icon?: string;
}

// 扩展的统计数据类型（支持详情数据）
export interface DetailedStatisticsData {
  [timeKey: string]: number | string[] | object;
}

// 指标摘要类型
export interface MetricsSummary {
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  total: number;
  average: number;
  max: number;
  min: number;
  latest: number;
  totalPeriods: number;
}

// 时间序列数据类型
export interface TimeSeriesData {
  date: string;
  value: number;
  type: 'monthly' | 'quarterly' | 'yearly';
}

// 项目信息类型
export interface ProjectInfo {
  name: string;
  platform: string;
  description: string;
  url: string;
}

// 导航菜单项类型
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

// 统计卡片数据类型
export interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

// 数据系列配置
export interface DataSeries {
  dataKey: string;
  color: string;
  name: string;
}

// 图表配置类型
export interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'area';
  dataKey: string;
  secondaryDataKey?: string;
  tertiaryDataKey?: string;
  color: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendNames?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
  };
  // 新增：支持动态数量的数据系列
  dataSeries?: DataSeries[];
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 加载状态类型
export interface LoadingState {
  isLoading: boolean;
  error?: AppError;
}

// 数据过滤器类型
export interface DataFilter {
  timeRange: TimeRange;
  metricType: MetricType;
  startDate?: string;
  endDate?: string;
}