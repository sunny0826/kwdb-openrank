import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertCircle, BarChart3, Table, TrendingUp } from 'lucide-react';
import { ChartDataPoint, ChartConfig } from '../types';
import { formatNumber } from '../utils/dataProcessor';

interface ChartContainerProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  height?: number;
  className?: string;
  loading?: boolean;
  error?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  config,
  height = 300,
  className = '',
  loading = false,
  error,
}) => {
  const { title, type, dataKey, secondaryDataKey, tertiaryDataKey, color, secondaryColor, tertiaryColor, showGrid = true, showTooltip = true, showLegend = false, legendNames, dataSeries } = config;
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // 自定义 Tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      color: string;
      name: string;
      value: number;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name}: {formatNumber(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 加载状态
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div 
          className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 animate-pulse"
          style={{ height }}
        >
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-500 text-sm">正在加载图表数据...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div 
          className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
          style={{ height }}
        >
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm font-medium mb-1">图表加载失败</p>
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 渲染不同类型的图表
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    try {
      switch (type) {
        case 'area':
          return (
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              <Area
                 type="monotone"
                 dataKey={dataKey}
                 stroke={color}
                 fill={color}
                 fillOpacity={0.1}
                 strokeWidth={2}
               />
               {secondaryDataKey && (
                 <Area
                   type="monotone"
                   dataKey={secondaryDataKey}
                   stroke={secondaryColor}
                   fill={secondaryColor}
                   fillOpacity={0.1}
                   strokeWidth={2}
                 />
               )}
            </AreaChart>
          );

        case 'bar':
          return (
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {/* 动态渲染数据系列 */}
              {dataSeries ? (
                dataSeries.map((series, index) => (
                  <Bar
                    key={index}
                    dataKey={series.dataKey}
                    fill={series.color}
                    radius={[2, 2, 0, 0]}
                    name={series.name}
                  />
                ))
              ) : (
                // 兼容旧的固定系列配置
                <>
                  <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} name={legendNames?.primary || "OpenRank"} />
                   {secondaryDataKey && (
                     <Bar dataKey={secondaryDataKey} fill={secondaryColor} radius={[2, 2, 0, 0]} name={legendNames?.secondary || "活跃度"} />
                   )}
                   {tertiaryDataKey && (
                     <Bar dataKey={tertiaryDataKey} fill={tertiaryColor} radius={[2, 2, 0, 0]} name={legendNames?.tertiary || "参与者"} />
                   )}
                </>
              )}
            </BarChart>
          );

        default: // line
          return (
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {/* 动态渲染数据系列 */}
              {dataSeries ? (
                dataSeries.map((series, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={series.dataKey}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={{ fill: series.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: series.color, strokeWidth: 2 }}
                    name={series.name}
                  />
                ))
              ) : (
                // 兼容旧的固定系列配置
                <>
                  <Line
                     type="monotone"
                     dataKey={dataKey}
                     stroke={color}
                     strokeWidth={2}
                     dot={{ fill: color, strokeWidth: 2, r: 4 }}
                     activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                     name={legendNames?.primary || "OpenRank"}
                   />
                   {secondaryDataKey && (
                     <Line
                       type="monotone"
                       dataKey={secondaryDataKey}
                       stroke={secondaryColor}
                       strokeWidth={2}
                       dot={{ fill: secondaryColor, strokeWidth: 2, r: 4 }}
                       activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2 }}
                       name={legendNames?.secondary || "活跃度"}
                     />
                   )}
                   {tertiaryDataKey && (
                     <Line
                       type="monotone"
                       dataKey={tertiaryDataKey}
                       stroke={tertiaryColor}
                       strokeWidth={2}
                       dot={{ fill: tertiaryColor, strokeWidth: 2, r: 4 }}
                       activeDot={{ r: 6, stroke: tertiaryColor, strokeWidth: 2 }}
                       name={legendNames?.tertiary || "参与者"}
                     />
                   )}
                </>
              )}
            </LineChart>
          );
      }
    } catch (chartError) {
      console.error('Chart rendering error:', chartError);
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">图表渲染失败</p>
          </div>
        </div>
      );
    }
  };

  // 渲染表格视图
  const renderTable = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <Table className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">暂无数据</p>
            <p className="text-gray-400 text-xs mt-1">请稍后再试或检查数据源</p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-auto" style={{ maxHeight: height }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-900 border-b border-gray-200">
                时间
              </th>
              {/* 动态渲染表头 */}
              {dataSeries ? (
                dataSeries.map((series, index) => (
                  <th key={index} className="px-4 py-3 text-right font-medium text-gray-900 border-b border-gray-200">
                    {series.name}
                  </th>
                ))
              ) : (
                // 兼容旧的固定列配置
                <>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 border-b border-gray-200">
                    OpenRank
                  </th>
                  {secondaryDataKey && (
                    <th className="px-4 py-3 text-right font-medium text-gray-900 border-b border-gray-200">
                      活跃度
                    </th>
                  )}
                  {tertiaryDataKey && (
                    <th className="px-4 py-3 text-right font-medium text-gray-900 border-b border-gray-200">
                      参与者
                    </th>
                  )}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 border-b border-gray-100">
                  {item.date}
                </td>
                {/* 动态渲染数据列 */}
                {dataSeries ? (
                  dataSeries.map((series, seriesIndex) => (
                    <td key={seriesIndex} className="px-4 py-3 text-right text-gray-900 border-b border-gray-100 font-medium">
                      {typeof item[series.dataKey] === 'number' ? formatNumber(item[series.dataKey] as number) : item[series.dataKey]}
                    </td>
                  ))
                ) : (
                  // 兼容旧的固定列配置
                  <>
                    <td className="px-4 py-3 text-right text-gray-900 border-b border-gray-100 font-medium">
                       {typeof item[dataKey] === 'number' ? formatNumber(item[dataKey]) : item[dataKey]}
                     </td>
                     {secondaryDataKey && (
                       <td className="px-4 py-3 text-right text-gray-900 border-b border-gray-100 font-medium">
                         {typeof item[secondaryDataKey] === 'number' ? formatNumber(item[secondaryDataKey]) : item[secondaryDataKey]}
                       </td>
                     )}
                     {tertiaryDataKey && (
                       <td className="px-4 py-3 text-right text-gray-900 border-b border-gray-100 font-medium">
                         {typeof item[tertiaryDataKey] === 'number' ? formatNumber(item[tertiaryDataKey]) : item[tertiaryDataKey]}
                       </td>
                     )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* 标题和视图切换按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>图表</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>表格</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {viewMode === 'chart' ? (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      ) : (
        renderTable()
      )}

      {/* 数据为空时的提示（仅在图表模式下显示） */}
      {viewMode === 'chart' && data.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">暂无数据</p>
            <p className="text-gray-400 text-xs mt-1">请稍后再试或检查数据源</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartContainer;