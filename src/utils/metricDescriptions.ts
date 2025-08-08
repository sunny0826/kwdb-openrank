// 指标说明配置
export interface MetricDescription {
  title: string;
  description: string;
  calculation: string;
  dataSource: string;
  updateFrequency: string;
}

export const metricDescriptions: Record<string, MetricDescription> = {
  openrank: {
    title: 'OpenRank',
    description: 'OpenRank 是一个基于网络分析的开源项目影响力评估指标，通过分析开发者与项目之间的协作关系网络，计算项目在开源生态系统中的影响力和重要性。数值越高表示项目影响力越大。',
    calculation: '基于 PageRank 算法的改进版本，综合考虑项目的贡献者数量、贡献质量、项目间的引用关系等多个维度，通过图算法计算得出。具体包括代码贡献、Issue 参与、Pull Request 活动等行为的加权计算。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的公开数据',
    updateFrequency: '每月更新一次，数据延迟约 1-2 天'
  },
  
  activity: {
    title: '活跃度',
    description: '项目活跃度反映了项目在特定时间段内的开发活动强度，包括代码提交、Issue 处理、Pull Request 合并等各类开发活动的综合评估。高活跃度表示项目正在积极维护和发展。',
    calculation: '综合统计项目的 commits、issues、pull requests、releases 等活动数量，并根据活动类型和重要性进行加权计算。计算公式考虑了活动的频率、参与人数和活动质量。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的活动数据',
    updateFrequency: '每月更新一次，反映上个月的活动情况'
  },
  
  participants: {
    title: '参与者数量',
    description: '参与者数量统计了在特定时间段内对项目有实质性贡献的开发者总数，包括代码贡献者、Issue 提交者、代码审查者等。这个指标反映了项目的社区规模和协作广度。',
    calculation: '统计在指定时间段内有以下行为的唯一用户数：提交代码(commit)、创建或评论 Issue、提交或审查 Pull Request、发布 Release 等。去重计算，一个用户在同一时期只计算一次。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的用户活动数据',
    updateFrequency: '每月更新一次，统计上个月的参与者情况'
  },
  
  issues: {
    title: 'Issue 数量',
    description: 'Issue 数量反映了项目在特定时间段内的问题报告和需求讨论活跃程度，包括新建 Issue、关闭 Issue 等活动。适量的 Issue 活动表明项目有良好的用户反馈和问题处理机制。',
    calculation: '统计指定时间段内新建的 Issue 数量，包括 bug 报告、功能请求、文档改进等各类 Issue。不包括 Pull Request，因为在某些平台上 PR 也被归类为 Issue。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Issue 数据',
    updateFrequency: '每月更新一次，统计上个月的 Issue 活动'
  },
  
  issuesNew: {
    title: '新建 Issue',
    description: '新建 Issue 数量统计在特定时间段内创建的问题报告和功能请求总数。反映了用户对项目的关注度和反馈活跃程度。',
    calculation: '统计指定时间段内新创建的 Issue 数量，包括 bug 报告、功能请求、文档改进等各类问题。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Issue 数据',
    updateFrequency: '每月更新一次，统计上个月的新建 Issue 情况'
  },
  
  pullRequests: {
    title: 'Pull Request 数量',
    description: 'Pull Request 数量反映了项目的代码贡献活跃程度，表示开发者向项目提交代码更改的频率。高 PR 数量通常表明项目有活跃的开发社区和良好的协作流程。',
    calculation: '统计指定时间段内新建的 Pull Request 数量，包括来自项目维护者和外部贡献者的所有代码提交请求。计算时不区分 PR 的最终状态（合并、关闭或待处理）。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Pull Request 数据',
    updateFrequency: '每月更新一次，统计上个月的 PR 活动'
  },
  
  commits: {
    title: '提交数量',
    description: '提交数量统计了项目在特定时间段内的代码提交次数，直接反映了项目的开发活动强度。频繁的提交通常表明项目正在积极开发和维护。',
    calculation: '统计指定时间段内所有分支的 commit 数量，包括主分支和功能分支的提交。每个 commit 按其提交时间计入相应的时间段。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Git 提交数据',
    updateFrequency: '每月更新一次，统计上个月的提交活动'
  },
  
  stars: {
    title: 'Star 数量',
    description: 'Star 数量反映了项目受到的关注程度和用户认可度。用户给项目加 Star 通常表示对项目的认可、收藏或关注，是衡量项目受欢迎程度的重要指标。',
    calculation: '统计截至指定时间点项目累计获得的 Star 数量。这是一个累积指标，反映项目的历史受欢迎程度。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Star 数据',
    updateFrequency: '每月更新一次，反映月末的累计 Star 数量'
  },
  
  forks: {
    title: 'Fork 数量',
    description: 'Fork 数量表示其他用户复制项目代码库的次数，通常反映了项目的影响力和被二次开发的程度。高 Fork 数量表明项目具有较高的参考价值或被广泛用作基础项目。',
    calculation: '统计截至指定时间点项目累计被 Fork 的次数。这是一个累积指标，包括所有公开的 Fork 操作。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Fork 数据',
    updateFrequency: '每月更新一次，反映月末的累计 Fork 数量'
  },

  // 开发者指标
  newContributors: {
    title: '新贡献者数量',
    description: '新贡献者数量统计在特定时间段内首次对项目做出贡献的开发者人数。这个指标反映了项目吸引新开发者参与的能力和社区的增长活力。',
    calculation: '统计在指定时间段内首次提交代码、创建Issue或Pull Request的唯一用户数。通过对比历史贡献记录，识别新加入的贡献者。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的贡献者活动数据',
    updateFrequency: '每月更新一次，统计上个月的新贡献者情况'
  },

  contributors: {
    title: '贡献者数量',
    description: '贡献者数量统计在特定时间段内对项目有代码贡献的开发者总数。与参与者数量不同，贡献者专指有实际代码提交的开发者。',
    calculation: '统计在指定时间段内有代码提交(commit)的唯一用户数。只计算实际的代码贡献，不包括仅参与Issue讨论或代码审查的用户。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的提交数据',
    updateFrequency: '每月更新一次，统计上个月的贡献者情况'
  },

  inactiveContributors: {
    title: '不活跃贡献者',
    description: '不活跃贡献者数量统计在特定时间段内没有贡献活动的历史贡献者人数。这个指标帮助了解项目贡献者的流失情况。',
    calculation: '统计历史上曾经贡献过代码，但在指定时间段内没有任何贡献活动的开发者数量。通过对比历史贡献者列表和当前活跃贡献者来计算。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的历史贡献数据',
    updateFrequency: '每月更新一次，分析上个月的贡献者活跃状态'
  },

  busFactor: {
    title: '贡献者缺席因素',
    description: '贡献者缺席因素(Bus Factor)评估项目对核心贡献者的依赖程度。数值越低表示项目越依赖少数核心开发者，风险越高。',
    calculation: '基于贡献者的代码贡献量分布，计算如果失去多少核心贡献者会严重影响项目发展。通过分析代码贡献的集中度和关键模块的维护者分布来评估。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的贡献分布数据',
    updateFrequency: '每月更新一次，基于最近的贡献活动分析'
  },

  // Issue指标

  issuesClosed: {
    title: '关闭 Issue 数量',
    description: '关闭 Issue 数量统计在特定时间段内被解决或关闭的问题总数。反映了项目维护者处理问题的效率和项目的维护活跃度。',
    calculation: '统计指定时间段内状态变更为已关闭的 Issue 数量，包括已解决、重复、无效等各种关闭原因。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Issue 状态数据',
    updateFrequency: '每月更新一次，统计上个月的 Issue 关闭情况'
  },

  issueComments: {
    title: 'Issue 评论数量',
    description: 'Issue 评论数量统计在特定时间段内所有 Issue 收到的评论总数。反映了社区讨论的活跃程度和问题处理的互动水平。',
    calculation: '统计指定时间段内所有 Issue 下的评论数量，包括维护者回复、用户讨论、问题澄清等各类评论。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Issue 评论数据',
    updateFrequency: '每月更新一次，统计上个月的 Issue 评论活动'
  },

  issueResponseTime: {
    title: 'Issue 响应时间',
    description: 'Issue 响应时间统计从 Issue 创建到收到第一个回复的平均时间。反映了项目维护者对用户反馈的响应速度。',
    calculation: '计算每个 Issue 从创建时间到收到第一个评论的时间间隔，然后计算指定时间段内的平均值。以小时为单位。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Issue 时间戳数据',
    updateFrequency: '每月更新一次，分析上个月创建的 Issue 响应情况'
  },

  issueResolutionDuration: {
    title: 'Issue 解决时长',
    description: 'Issue 解决时长统计从 Issue 创建到关闭的平均时间。反映了项目处理问题的效率和问题解决的速度。',
    calculation: '计算每个已关闭 Issue 从创建到关闭的时间间隔，然后计算指定时间段内的平均值。以天为单位。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Issue 生命周期数据',
    updateFrequency: '每月更新一次，分析上个月关闭的 Issue 处理时长'
  },

  issueAge: {
    title: 'Issue 年龄',
    description: 'Issue 年龄统计当前未关闭 Issue 的平均存在时间。反映了项目中积压问题的情况和维护压力。',
    calculation: '计算所有未关闭 Issue 从创建到当前时间的时间间隔，然后计算平均值。以天为单位。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Issue 状态数据',
    updateFrequency: '每月更新一次，分析当前未关闭 Issue 的年龄分布'
  },

  // 变更请求指标
  changeRequests: {
    title: '变更请求',
    description: '变更请求数量统计在特定时间段内创建的 Pull Request 总数。反映了项目的代码贡献活跃程度和开发协作水平。',
    calculation: '统计指定时间段内新创建的 Pull Request 数量，包括来自项目维护者和外部贡献者的所有代码变更请求。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Pull Request 数据',
    updateFrequency: '每月更新一次，统计上个月的变更请求情况'
  },

  changeRequestsAccepted: {
    title: '接受的变更请求',
    description: '接受的变更请求数量统计在特定时间段内被合并的 Pull Request 总数。反映了项目对外部贡献的接受程度和代码质量控制。',
    calculation: '统计指定时间段内状态变更为已合并的 Pull Request 数量。只计算成功合并到主分支的变更请求。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Pull Request 合并数据',
    updateFrequency: '每月更新一次，统计上个月的 PR 合并情况'
  },

  changeRequestsReviews: {
    title: '变更请求评审数量',
    description: '变更请求评审数量统计在特定时间段内所有 Pull Request 收到的代码审查总数。反映了项目的代码质量控制和协作审查文化。',
    calculation: '统计指定时间段内所有 Pull Request 收到的评审(Review)数量，包括批准、请求修改、评论等各类审查活动。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Pull Request 审查数据',
    updateFrequency: '每月更新一次，统计上个月的代码审查活动'
  },

  changeRequestResponseTime: {
    title: '变更请求响应时间',
    description: '变更请求响应时间统计从 Pull Request 创建到收到第一个审查或评论的平均时间。反映了项目对代码贡献的响应速度。',
    calculation: '计算每个 Pull Request 从创建时间到收到第一个审查或评论的时间间隔，然后计算指定时间段内的平均值。以小时为单位。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Pull Request 时间戳数据',
    updateFrequency: '每月更新一次，分析上个月创建的 PR 响应情况'
  },

  changeRequestResolutionDuration: {
    title: '变更请求解决时长',
    description: '变更请求解决时长统计从 Pull Request 创建到关闭(合并或拒绝)的平均时间。反映了项目处理代码贡献的效率。',
    calculation: '计算每个已关闭 Pull Request 从创建到关闭的时间间隔，然后计算指定时间段内的平均值。以天为单位。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Pull Request 生命周期数据',
    updateFrequency: '每月更新一次，分析上个月关闭的 PR 处理时长'
  },

  changeRequestAge: {
    title: '变更请求年龄',
    description: '变更请求年龄统计当前未关闭 Pull Request 的平均存在时间。反映了项目中待处理代码贡献的积压情况。',
    calculation: '计算所有未关闭 Pull Request 从创建到当前时间的时间间隔，然后计算平均值。以天为单位。',
    dataSource: 'OpenDigger 平台，基于 GitHub、Gitee 等代码托管平台的 Pull Request 状态数据',
    updateFrequency: '每月更新一次，分析当前未关闭 PR 的年龄分布'
  }
};

// 获取指标说明的辅助函数
export const getMetricDescription = (metricKey: string): MetricDescription | null => {
  return metricDescriptions[metricKey] || null;
};

// 根据指标标题获取说明
export const getMetricDescriptionByTitle = (title: string): MetricDescription | null => {
  const titleMap: Record<string, string> = {
    // OpenRank 相关
    'OpenRank': 'openrank',
    '全域 OpenRank': 'openrank',
    '项目 OpenRank': 'openrank',
    'OpenRank 趋势': 'openrank',
    
    // 活跃度相关
    '活跃度': 'activity',
    '项目活跃度': 'activity',
    '活跃度趋势': 'activity',
    
    // 参与者相关
    '参与者数量': 'participants',
    '参与者': 'participants',
    '项目参与者数量': 'participants',
    '参与者趋势': 'participants',
    
    // 基础指标
    'Issue 数量': 'issues',
    'Issues': 'issues',
    'Pull Request 数量': 'pullRequests',
    'Pull Requests': 'pullRequests',
    '提交数量': 'commits',
    'Commits': 'commits',
    'Star 数量': 'stars',
    'Stars': 'stars',
    'Fork 数量': 'forks',
    'Forks': 'forks',
    
    // 开发者指标
    '新贡献者数量': 'newContributors',
    '贡献者数量': 'contributors',
    '不活跃贡献者': 'inactiveContributors',
    '贡献者缺席因素': 'busFactor',
    
    // Issue 指标
    '新建 Issue': 'issuesNew',
    '关闭 Issue 数量': 'issuesClosed',
    'Issue 评论数量': 'issueComments',
    'Issue 响应时间': 'issueResponseTime',
    'Issue 解决时长': 'issueResolutionDuration',
    'Issue 年龄': 'issueAge',
    
    // 变更请求指标
    '变更请求': 'changeRequests',
    '接受的变更请求': 'changeRequestsAccepted',
    '变更请求评审数量': 'changeRequestsReviews',
    '变更请求响应时间': 'changeRequestResponseTime',
    '变更请求解决时长': 'changeRequestResolutionDuration',
    '变更请求年龄': 'changeRequestAge',
    
  };
  
  const metricKey = titleMap[title];
  return metricKey ? getMetricDescription(metricKey) : null;
};