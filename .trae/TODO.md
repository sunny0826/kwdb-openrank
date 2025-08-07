# TODO:

- [x] 1: 分析Home.tsx的时间选择器逻辑：TimeSelector状态管理、MonthSelector使用方式、数据处理函数 (priority: High)
- [x] 2: 重构OpenRank.tsx状态管理：将timeRange和selectedMonth统一为TimeSelector类型 (priority: High)
- [x] 3: 统一MonthSelector组件使用：简化value和onChange逻辑，添加availableMonths支持 (priority: High)
- [x] 4: 统一数据处理逻辑：使用generateChartDataByTimeSelector等Home.tsx的数据处理函数 (priority: High)
- [x] 5: 统一useEffect监听逻辑：确保时间选择器变化时数据正确更新 (priority: High)
- [x] 6: 保持OpenRank特有功能：图表类型选择器、特有统计卡片内容等 (priority: Medium)
- [x] 7: 测试重构后的OpenRank.tsx页面功能，确保时间选择器逻辑与Home.tsx一致 (priority: Medium)
