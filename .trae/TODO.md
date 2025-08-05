# TODO:

- [x] analyze_data_processing: 分析当前数据处理逻辑中的问题，特别是processTimeSeriesData函数如何处理不同时间粒度的数据 (priority: High)
- [x] fix_process_time_series: 修复processTimeSeriesData函数，确保能正确处理月度到年度的数据聚合 (priority: High)
- [x] fix_calculate_statistics: 修复calculateStatistics函数，确保能正确计算不同时间粒度的统计数据 (priority: High)
- [x] update_home_logic: 更新Home.tsx中的数据生成逻辑，确保时间选择器变化时能正确更新统计数据 (priority: Medium)
- [x] test_time_selector: 测试时间选择器切换功能，确保月度视图和年度视图之间的切换正常工作 (priority: Medium)
