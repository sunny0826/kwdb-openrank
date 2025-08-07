import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Github, Plus, X, BarChart3 } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MonthSelector from '../components/MonthSelector';
import KWDBLogo from '../assets/kwdb.svg';
import { 
  ProjectMeta, 
  OpenRankData, 
  StatisticsData, 
  StatCard as StatCardType,
  ChartDataPoint,
  TimeSelector
} from '../types';
import { 
  getAvailableMonths,
  generateChartDataByTimeSelector,
  calculateSpecificMonthSummary,
  calculateStatistics,
  processTimeSeriesData,
  convertToChartData
} from '../utils/dataProcessor';
import { OpenDiggerAPI } from '../services/api';

// 项目配置接口
interface ProjectConfig {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  org: string;
  repo: string;
  displayName?: string;
}

// 项目数据接口
interface ProjectData {
  config: ProjectConfig;
  meta?: ProjectMeta;
  openRankData: OpenRankData;
  activityData: StatisticsData;
  participantsData: StatisticsData;
  loading: boolean;
  error?: string;
}



const Compare: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([
    {
      config: {
        id: 'kwdb',
        name: 'KWDB',
        platform: 'gitee',
        org: 'kwdb',
        repo: 'kwdb',
        displayName: 'KWDB (基准项目)'
      },
      openRankData: {},
      activityData: {},
      participantsData: {},
      loading: true // 初始状态设置为加载中
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState<{
    platform: string;
    repoFullName: string;
    displayName: string;
  }>({ platform: 'github', repoFullName: '', displayName: '' });
  const [repoSuggestions, setRepoSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allRepos, setAllRepos] = useState<string[]>([]);
  const [timeSelector, setTimeSelector] = useState<TimeSelector>({
    mode: 'range',
    range: 'monthly'
  });

  // 状态变量用于存储计算后的数据
  const [projectStatCards, setProjectStatCards] = useState<StatCardType[][]>([]);
  const [comparisonChartData, setComparisonChartData] = useState<ChartDataPoint[]>([]);

  // 请求缓存，避免重复请求
  const requestCache = useRef<Map<string, Promise<Partial<ProjectData>>>>(new Map());

  // 使用真实API获取项目数据
  const fetchProjectData = useCallback(async (config: ProjectConfig): Promise<Partial<ProjectData>> => {
    const cacheKey = `${config.platform}-${config.org}-${config.repo}`;
    
    // 检查是否有正在进行的请求
    if (requestCache.current.has(cacheKey)) {
      return requestCache.current.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        // 调用通用的项目数据获取API
        const result = await OpenDiggerAPI.getProjectData(config.platform, config.org, config.repo);
        
        if (result.status === 'error') {
          throw new Error('message' in result ? result.message : '获取项目数据失败');
        }
 
        return {
          openRankData: result.openRankData || {},
          activityData: result.activityData || {},
          participantsData: result.participantsData || {}
        };
      } catch (error) {
        console.error(`获取项目数据失败 (${cacheKey}):`, error);
        throw new Error(error instanceof Error ? error.message : '无法获取项目数据，请检查项目名称是否正确');
      } finally {
        // 请求完成后清除缓存
        requestCache.current.delete(cacheKey);
      }
    })();

    // 缓存请求
    requestCache.current.set(cacheKey, requestPromise);
    return requestPromise;
  }, []);

  // 加载项目数据
  const loadProjectData = useCallback(async (projectIndex: number) => {
    // 使用函数式更新来避免依赖projects状态
    setProjects(prev => {
      const currentProject = prev[projectIndex];
      if (!currentProject) {
        console.error(`项目索引 ${projectIndex} 不存在`);
        return prev;
      }

      // 设置加载状态
      const updatedProjects = prev.map((p, i) => 
        i === projectIndex ? { ...p, loading: true, error: undefined } : p
      );
      
      // 异步加载数据
      (async () => {
        try {
          const data = await fetchProjectData(currentProject.config);
          
          setProjects(current => current.map((p, i) => 
            i === projectIndex ? { 
              ...p, 
              ...data,
              loading: false 
            } : p
          ));
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '加载失败';
          console.error(`项目数据加载失败: ${currentProject.config.name}`, error);
          
          setProjects(current => current.map((p, i) => 
            i === projectIndex ? { 
              ...p, 
              loading: false, 
              error: errorMessage 
            } : p
          ));
        }
      })();
      
      return updatedProjects;
    });
  }, [fetchProjectData]);

  // 仓库列表缓存
  const repoListCache = useRef<string[] | null>(null);
  const repoListFetching = useRef<boolean>(false);

  // 获取仓库列表
  const fetchRepoList = useCallback(async () => {
    // 如果已经有缓存或正在获取，直接返回
    if (repoListCache.current || repoListFetching.current) {
      if (repoListCache.current) {
        setAllRepos(repoListCache.current);
      }
      return;
    }

    repoListFetching.current = true;

    try {
      // 由于CORS限制，这里提供一些常用的仓库作为示例
      const popularRepos = [
        'microsoft/vscode',
        'facebook/react',
        'vuejs/vue',
        'angular/angular',
        'nodejs/node',
        'kubernetes/kubernetes',
        'tensorflow/tensorflow',
        'pytorch/pytorch',
        'apache/spark',
        'elastic/elasticsearch',
        'redis/redis',
        'mongodb/mongo',
        'docker/docker-ce',
        'golang/go',
        'rust-lang/rust',
        'python/cpython',
        'openjdk/jdk',
        'spring-projects/spring-boot',
        'django/django',
        'rails/rails',
        'laravel/laravel',
        'symfony/symfony',
        'expressjs/express',
        'nestjs/nest',
        'jquery/jquery',
        'lodash/lodash',
        'webpack/webpack',
        'babel/babel',
        'prettier/prettier',
        'eslint/eslint',
        'apache/kafka',
        'prometheus/prometheus',
        'grafana/grafana',
        'jenkins-x/jx',
        'helm/helm',
        'istio/istio',
        'etcd-io/etcd',
        'containerd/containerd',
        'moby/moby',
        'kubernetes/minikube'
      ];
      
      // 缓存并设置默认列表
      repoListCache.current = popularRepos;
      setAllRepos(popularRepos);
      
      // 尝试从API获取更多仓库（如果可用）
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
        
        const response = await fetch('https://oss.open-digger.cn/repo_list.csv', {
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const csvText = await response.text();
          const lines = csvText.split('\n');
          const repos = lines.slice(1)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => {
              const parts = line.split(',');
              return parts[0]?.replace(/"/g, '').trim();
            })
            .filter(repo => repo && repo.includes('/'));
          
          // 合并API数据和默认数据
          const combinedRepos = [...new Set([...popularRepos, ...repos])];
          repoListCache.current = combinedRepos;
          setAllRepos(combinedRepos);
        }
      } catch (apiError) {
        // API调用失败时使用默认列表
        console.log('使用默认仓库列表，API调用失败:', apiError);
      }
    } catch (error) {
      console.error('初始化仓库列表失败:', error);
      // 设置最基本的仓库列表
      const basicRepos = [
        'microsoft/vscode',
        'facebook/react',
        'vuejs/vue',
        'nodejs/node',
        'kubernetes/kubernetes'
      ];
      repoListCache.current = basicRepos;
      setAllRepos(basicRepos);
    } finally {
      repoListFetching.current = false;
    }
  }, []);

  // 搜索仓库建议
  const searchRepoSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setRepoSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allRepos
      .filter(repo => repo.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10); // 限制显示10个建议
    
    setRepoSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // 处理仓库输入变化
  const handleRepoInputChange = (value: string) => {
    setNewProject(prev => ({ ...prev, repoFullName: value }));
    searchRepoSuggestions(value);
  };

  // 选择仓库建议
  const selectRepoSuggestion = (repo: string) => {
    setNewProject(prev => ({ ...prev, repoFullName: repo }));
    setShowSuggestions(false);
  };

  // 添加新项目
  const addProject = async () => {
    if (!newProject.repoFullName || !newProject.repoFullName.includes('/')) {
      alert('请输入完整的仓库名称，格式为：组织名/项目名');
      return;
    }

    const [org, repo] = newProject.repoFullName.split('/');
    if (!org || !repo) {
      alert('请输入正确的仓库名称格式：组织名/项目名');
      return;
    }

    const projectConfig: ProjectConfig = {
      id: `${newProject.platform}-${org}-${repo}`,
      name: `${org}/${repo}`,
      platform: newProject.platform as 'github' | 'gitee',
      org: org,
      repo: repo,
      displayName: newProject.displayName || `${org}/${repo}`
    };

    const newProjectData: ProjectData = {
      config: projectConfig,
      openRankData: {},
      activityData: {},
      participantsData: {},
      loading: true
    };

    // 添加项目并立即开始加载数据
    const newProjectIndex = projects.length;
    setProjects(prev => [...prev, newProjectData]);
    setNewProject({ platform: 'github', repoFullName: '', displayName: '' });
    setShowAddForm(false);

    // 立即加载新添加项目的数据
    try {
      const data = await fetchProjectData(projectConfig);
      setProjects(prev => prev.map((p, i) => 
        i === newProjectIndex ? { 
          ...p, 
          ...data,
          loading: false 
        } : p
      ));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '加载失败';
      setProjects(prev => prev.map((p, i) => 
        i === newProjectIndex ? { 
          ...p, 
          loading: false, 
          error: errorMessage 
        } : p
      ));
    }
  };

  // 删除项目
  const removeProject = (index: number) => {
    if (index === 0) {
      alert('不能删除基准项目 KWDB');
      return;
    }
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  // 生成项目统计卡片
  const generateProjectStatCards = useCallback((project: ProjectData, selector: TimeSelector): StatCardType[] => {
    let openRankSummary;
    let activitySummary;
    let participantsSummary;

    if (selector.mode === 'specific' && selector.specific) {
      openRankSummary = calculateSpecificMonthSummary(
        project.openRankData,
        selector.specific
      );
      activitySummary = calculateSpecificMonthSummary(
        project.activityData,
        selector.specific
      );
      participantsSummary = calculateSpecificMonthSummary(
        project.participantsData,
        selector.specific
      );
    } else {
      const timeRange = selector.range || 'monthly';
      openRankSummary = calculateStatistics(
        convertToChartData(processTimeSeriesData(project.openRankData, timeRange))
      );
      activitySummary = calculateStatistics(
        convertToChartData(processTimeSeriesData(project.activityData, timeRange))
      );
      participantsSummary = calculateStatistics(
        convertToChartData(processTimeSeriesData(project.participantsData, timeRange))
      );
    }

    return [
      {
        title: 'OpenRank',
        value: openRankSummary.currentValue,
        change: openRankSummary.changePercentage,
        trend: openRankSummary.trend,
        description: '项目影响力指标'
      },
      {
        title: '活跃度',
        value: activitySummary.currentValue,
        change: activitySummary.changePercentage,
        trend: activitySummary.trend,
        description: '项目活跃度水平'
      },
      {
        title: '参与者',
        value: participantsSummary.currentValue,
        change: participantsSummary.changePercentage,
        trend: participantsSummary.trend,
        description: '项目参与者数量'
      }
    ];
  }, []);

  // 获取所有项目的可用月份
  const getAllAvailableMonths = useCallback((): string[] => {
    const allMonths = new Set<string>();
    
    projects.forEach(project => {
      // 使用统一的getAvailableMonths函数处理每个项目的数据
      const projectMonths = getAvailableMonths(project.openRankData);
      projectMonths.forEach(month => allMonths.add(month));
      
      const activityMonths = getAvailableMonths(project.activityData);
      activityMonths.forEach(month => allMonths.add(month));
      
      const participantsMonths = getAvailableMonths(project.participantsData);
      participantsMonths.forEach(month => allMonths.add(month));
    });
    
    return Array.from(allMonths).sort().reverse();
  }, [projects]);



  // 生成对比图表数据
  const generateComparisonChartData = useCallback((projectsData: ProjectData[], selector: TimeSelector): ChartDataPoint[] => {
    const allDates = new Set<string>();
    
    // 收集所有项目的日期
    projectsData.forEach(project => {
      const openRankChartData = generateChartDataByTimeSelector(project.openRankData, selector);
      openRankChartData.forEach(point => allDates.add(point.date));
    });

    return Array.from(allDates).sort().map(date => {
      const dataPoint: ChartDataPoint = { date, value: 0 };
      
      projectsData.forEach((project, index) => {
        const key = index === 0 ? 'kwdb' : `project${index}`;
        const openRankChartData = generateChartDataByTimeSelector(project.openRankData, selector);
        const activityChartData = generateChartDataByTimeSelector(project.activityData, selector);
        const participantsChartData = generateChartDataByTimeSelector(project.participantsData, selector);
        
        const openRankPoint = openRankChartData.find(p => p.date === date);
        const activityPoint = activityChartData.find(p => p.date === date);
        const participantsPoint = participantsChartData.find(p => p.date === date);
        
        dataPoint[`${key}_openrank`] = openRankPoint?.value || 0;
        dataPoint[`${key}_activity`] = activityPoint?.value || 0;
        dataPoint[`${key}_participants`] = participantsPoint?.value || 0;
      });
      
      return dataPoint;
    });
  }, []);

  // 初始加载KWDB数据
  useEffect(() => {
    loadProjectData(0);
    fetchRepoList();
  }, [fetchRepoList, loadProjectData]); // loadProjectData现在不依赖projects状态

  // 监听timeSelector和项目数据变化，重新生成统计数据
  useEffect(() => {
    const hasValidData = projects.some(project => 
      Object.keys(project.openRankData).length > 0 || 
      Object.keys(project.activityData).length > 0 || 
      Object.keys(project.participantsData).length > 0
    );
    
    if (hasValidData) {
      const newProjectStatCards = projects.map(project => 
        generateProjectStatCards(project, timeSelector)
      );
      const newComparisonChartData = generateComparisonChartData(projects, timeSelector);
      setProjectStatCards(newProjectStatCards);
      setComparisonChartData(newComparisonChartData);
    }
  }, [timeSelector, projects, generateProjectStatCards, generateComparisonChartData]);

  return (
    <Layout>
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">项目对比分析</h1>
                <p className="text-gray-600 mt-1">对比 KWDB 与其他开源项目的关键指标</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>添加项目</span>
            </button>
          </div>
          
          {/* 时间选择器 */}
          <div className="border-t border-gray-200 pt-6">
            <MonthSelector
              value={timeSelector}
              onChange={setTimeSelector}
              availableMonths={getAllAvailableMonths()}
            />
          </div>
        </div>
      </div>

      {/* 添加项目表单 */}
      {showAddForm && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加对比项目</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">数据源</label>
                <select
                  value={newProject.platform}
                  onChange={(e) => setNewProject(prev => ({ ...prev, platform: e.target.value as 'github' | 'gitee' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="github">GitHub</option>
                  <option value="gitee">Gitee</option>
                </select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">仓库名称</label>
                <input
                  type="text"
                  value={newProject.repoFullName}
                  onChange={(e) => handleRepoInputChange(e.target.value)}
                  onFocus={() => {
                    if (newProject.repoFullName) {
                      searchRepoSuggestions(newProject.repoFullName);
                    } else {
                      // 显示前10个热门仓库作为建议
                      setRepoSuggestions(allRepos.slice(0, 10));
                      setShowSuggestions(allRepos.length > 0);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="例如: microsoft/vscode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {showSuggestions && repoSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {repoSuggestions.map((repo, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectRepoSuggestion(repo)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="text-sm font-medium text-gray-900">{repo}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">显示名称（可选）</label>
                <input
                  type="text"
                  value={newProject.displayName}
                  onChange={(e) => setNewProject(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="自定义显示名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={addProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                添加项目
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 项目列表 */}
      <div className="space-y-8">
        {projects.map((project, index) => (
          <div key={project.config.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {index === 0 ? (
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border-2 border-blue-600">
                    <img src={KWDBLogo} alt="KWDB Logo" className="w-6 h-6" />
                  </div>
                ) : (
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                    project.config.platform === 'github' ? 'bg-gray-900' : 'bg-red-600'
                  }`}>
                    {project.config.platform === 'github' ? (
                      <Github className="w-5 h-5 text-white" />
                    ) : (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
                      </svg>
                    )}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.config.displayName || project.config.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {project.config.platform} • {project.config.org}/{project.config.repo}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => loadProjectData(index)}
                  disabled={project.loading}
                  className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {project.loading ? '加载中...' : '刷新数据'}
                </button>
                {index > 0 && (
                  <button
                    onClick={() => removeProject(index)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {project.loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="md" text="正在加载项目数据..." />
              </div>
            ) : project.error ? (
              <div className="py-8">
                <ErrorMessage 
                  error={{ code: 'FETCH_ERROR', message: project.error }}
                  onRetry={() => loadProjectData(index)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(projectStatCards[index] || []).map((card, cardIndex) => (
                  <StatCard 
                    key={cardIndex} 
                    data={card} 
                    timeSelector={timeSelector}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 对比图表 */}
      {projects.length > 1 && comparisonChartData.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">项目指标对比</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* OpenRank 对比 */}
              <ChartContainer
                data={comparisonChartData}
                config={{
                  title: 'OpenRank 对比',
                  type: 'line',
                  dataKey: 'kwdb_openrank',
                  color: '#3B82F6',
                  showGrid: true,
                  showTooltip: true,
                  showLegend: true,
                  dataSeries: projects.map((project, index) => ({
                    dataKey: index === 0 ? 'kwdb_openrank' : `project${index}_openrank`,
                    color: [
                      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
                      '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
                    ][index % 10],
                    name: project.config.displayName || project.config.name || (index === 0 ? 'KWDB' : `项目${index + 1}`)
                  }))
                }}
              />
              
              {/* 活跃度对比 */}
              <ChartContainer
                data={comparisonChartData}
                config={{
                  title: '活跃度对比',
                  type: 'line',
                  dataKey: 'kwdb_activity',
                  color: '#8B5CF6',
                  showGrid: true,
                  showTooltip: true,
                  showLegend: true,
                  dataSeries: projects.map((project, index) => ({
                    dataKey: index === 0 ? 'kwdb_activity' : `project${index}_activity`,
                    color: [
                      '#8B5CF6', '#EF4444', '#06B6D4', '#F59E0B', '#10B981',
                      '#3B82F6', '#F97316', '#84CC16', '#EC4899', '#6366F1'
                    ][index % 10],
                    name: project.config.displayName || project.config.name || (index === 0 ? 'KWDB' : `项目${index + 1}`)
                  }))
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Compare;