import React, { useState } from 'react';
import { MessageCircle, Star, Github, Plus, X } from 'lucide-react';

interface ButtonConfig {
  icon: React.ReactNode;
  href: string;
  title: string;
  ariaLabel: string;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
  ringColor: string;
  bgColor: string;
}

const FloatingButtonGroup: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttons: ButtonConfig[] = [
    {
      icon: <MessageCircle className="w-4 h-4 relative z-10" />,
      href: "https://github.com/sunny0826/kwdb-openrank/issues/new",
      title: "反馈",
      ariaLabel: "提交反馈或问题报告",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
      shadowColor: "shadow-blue-500/20 hover:shadow-blue-500/30",
      ringColor: "focus:ring-blue-500/50",
      bgColor: "bg-blue-500"
    },
    {
      icon: <Star className="w-4 h-4 relative z-10" />,
      href: "https://gitee.com/kwdb/kwdb",
      title: "Gitee Star",
      ariaLabel: "给 Gitee 项目点 Star",
      gradient: "from-red-500 to-red-600",
      hoverGradient: "hover:from-red-600 hover:to-red-700",
      shadowColor: "shadow-red-500/20 hover:shadow-red-500/30",
      ringColor: "focus:ring-red-500/50",
      bgColor: "bg-red-500"
    },
    {
      icon: <Github className="w-4 h-4 relative z-10" />,
      href: "https://github.com/kwdb/kwdb",
      title: "GitHub Star",
      ariaLabel: "给 GitHub 项目点 Star",
      gradient: "from-gray-600 to-gray-700",
      hoverGradient: "hover:from-gray-700 hover:to-gray-800",
      shadowColor: "shadow-gray-500/20 hover:shadow-gray-500/30",
      ringColor: "focus:ring-gray-500/50",
      bgColor: "bg-gray-600"
    }
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50">
      {/* 展开的按钮列表 */}
      <div className={`flex flex-col-reverse gap-2 mb-3 transition-all duration-200 ease-out ${
        isExpanded 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-98 pointer-events-none'
      }`}>
        {buttons.map((button, index) => (
          <div key={index} className="relative group/item">
            {/* 文字标签 */}
            <div className={`absolute right-12 top-1/2 transform -translate-y-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap backdrop-blur-sm border border-white/10 transition-all duration-200 ${
              isExpanded ? 'opacity-0 group-hover/item:opacity-100 translate-x-1 group-hover/item:translate-x-0' : 'opacity-0 pointer-events-none'
            }`}>
              {button.title}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900/90 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
            </div>
            
            <a
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${button.gradient} ${button.hoverGradient} text-white rounded-full shadow-lg ${button.shadowColor} transform hover:scale-105 active:scale-98 transition-all duration-200 ease-out border border-white/20 backdrop-blur-sm overflow-hidden focus:outline-none focus:ring-2 ${button.ringColor}`}
              title={button.title}
              aria-label={button.ariaLabel}
              role="button"
            >
              {/* 悬停光效 */}
              <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></div>
              
              {/* 图标 */}
              {button.icon}
            </a>
          </div>
        ))}
      </div>

      {/* 主按钮（展开/收起按钮） */}
      <div className="relative group">
        <button
          onClick={toggleExpanded}
          className="group relative inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/30 transform hover:scale-105 active:scale-98 transition-all duration-200 ease-out border border-white/20 backdrop-blur-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          title={isExpanded ? "收起" : "展开更多"}
          aria-label={isExpanded ? "收起按钮组" : "展开按钮组"}
          aria-expanded={isExpanded}
        >
          {/* 悬停光效 */}
          <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"></div>
          
          {/* 图标 - 根据展开状态切换 */}
          <div className={`transform transition-all duration-200 ease-out ${
            isExpanded ? 'rotate-45 scale-105' : 'rotate-0 scale-100'
          }`}>
            {isExpanded ? (
              <X className="w-5 h-5 relative z-10" />
            ) : (
              <Plus className="w-5 h-5 relative z-10" />
            )}
          </div>
        </button>
        
        {/* 主按钮文字标签 */}
        <div className={`absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap backdrop-blur-sm border border-white/10 transition-all duration-200 ${
          !isExpanded ? 'opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0' : 'opacity-0 pointer-events-none'
        }`}>
          {isExpanded ? '收起' : '更多功能'}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900/90 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingButtonGroup;