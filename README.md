# OpenRank 洞察平台

一个基于 React + TypeScript 构建的开源项目数据分析平台，专注于 OpenRank 指标的可视化展示和深度分析。

## 🌟 功能特性

### 📊 多维度数据分析
- **OpenRank 指标**：展示项目的 OpenRank 评分趋势
- **活跃度分析**：统计项目的活跃度变化
- **参与者统计**：分析项目贡献者数量和参与情况
- **开发者指标**：新贡献者、活跃贡献者、非活跃贡献者等
- **Issue 分析**：新建、关闭 Issue 数量及响应时间
- **变更请求**：PR 数量、接受率、审查情况等

### 🎯 灵活的时间维度
- **范围视图**：月度、季度、年度数据聚合
- **特定时间**：精确到具体月份的数据查看
- **智能聚合**：根据选择的时间范围自动聚合数据

### 📈 丰富的可视化
- **多种图表类型**：折线图、柱状图、面积图
- **交互式图表**：支持缩放、悬停提示、图例切换
- **表格视图**：详细的数据表格展示
- **响应式设计**：适配不同屏幕尺寸

### 🔍 项目对比功能
- **多项目对比**：同时分析多个项目的指标
- **动态添加**：支持搜索和动态添加对比项目
- **实时刷新**：一键刷新所有项目数据

## 🛠️ 技术栈

### 前端框架
- **React 18** - 现代化的用户界面库
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的构建工具和开发服务器

### UI 组件
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Recharts** - 基于 React 的图表库
- **Lucide React** - 美观的图标库

### 状态管理
- **React Hooks** - 内置的状态管理
- **Custom Hooks** - 封装的业务逻辑钩子

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 后处理器
- **pnpm** - 高效的包管理器

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/sunny0826/kwdb-openrank
cd openrank-insight

# 安装依赖
pnpm install
```

### 开发环境
```bash
# 启动开发服务器
pnpm dev

# 访问应用
# 浏览器打开 http://localhost:5173/openrank/
```

### 生产构建
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ChartContainer.tsx   # 图表容器组件
│   ├── MonthSelector.tsx    # 月份选择器
│   ├── StatCard.tsx         # 统计卡片
│   └── ...
├── pages/              # 页面组件
│   ├── Home.tsx            # 首页
│   ├── OpenRank.tsx        # OpenRank 分析页
│   ├── Statistics.tsx      # 统计分析页
│   ├── Trends.tsx          # 趋势分析页
│   └── Compare.tsx         # 项目对比页
├── hooks/              # 自定义 Hooks
│   ├── useErrorHandler.ts  # 错误处理
│   ├── useLoadingState.ts  # 加载状态
│   └── useTheme.ts         # 主题管理
├── services/           # API 服务
│   └── api.ts              # API 接口封装
├── types/              # TypeScript 类型定义
│   └── index.ts            # 通用类型
├── utils/              # 工具函数
│   └── dataProcessor.ts    # 数据处理工具
└── ...
```

## 🎨 页面功能

### 首页 (Home)

- 项目概览和快速导航
- 关键指标摘要展示
- 最新数据趋势预览

### OpenRank 分析 (OpenRank)

- OpenRank 指标的详细分析
- 时间序列趋势图表
- 统计摘要和变化趋势

### 统计分析 (Statistics)

- 多维度指标统计
- 开发者、Issue、PR 等详细分析
- 可配置的时间范围选择

### 趋势分析 (Trends)

- 长期趋势分析
- 多指标对比展示
- 趋势预测和洞察

### 项目对比 (Compare)

- 多项目横向对比
- 实时数据同步
- 灵活的项目管理

## 🔧 配置说明

### API 配置

项目使用 OpenDigger API 获取开源项目数据，在 `src/services/api.ts` 中配置：

```typescript
// OpenDigger API 基础 URL
const BASE_URL = 'https://oss.open-digger.cn';

// KWDB 项目信息
const PROJECT_PATH = 'gitee/kwdb/kwdb';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

如需修改数据源项目，请在 `api.ts` 中更新 `PROJECT_PATH` 常量。

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 编写清晰的提交信息
- 添加必要的测试用例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [OpenDigger](https://github.com/X-lab2017/open-digger) - 提供开源项目数据支持
- [React](https://reactjs.org/) - 强大的前端框架
- [Recharts](https://recharts.org/) - 优秀的图表库
- [Tailwind CSS](https://tailwindcss.com/) - 现代化的 CSS 框架

## 📞 联系我们

如果您有任何问题或建议，请通过以下方式联系我们：

- 提交 [Issue](https://github.com/sunny0826/kwdb-openrank/issues)

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！
