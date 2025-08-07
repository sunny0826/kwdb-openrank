import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, TrendingUp, Activity, GitBranch, Menu, X } from 'lucide-react';
import { NavItem } from '../types';

// Logo组件，使用favicon的SVG内容
const Logo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#3b82f6",stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#1e40af",stopOpacity:1}} />
      </linearGradient>
    </defs>
    
    {/* 背景圆形 */}
    <circle cx="16" cy="16" r="15" fill="url(#gradient)" stroke="#1e40af" strokeWidth="2"/>
    
    {/* K 字母 */}
    <g fill="white">
      {/* K 的左侧竖线 */}
      <rect x="8" y="8" width="3" height="16" rx="1"/>
      
      {/* K 的右上斜线 */}
      <rect x="12" y="8" width="10" height="3" rx="1" transform="rotate(35 17 9.5)"/>
      
      {/* K 的右下斜线 */}
      <rect x="12" y="21" width="10" height="3" rx="1" transform="rotate(-35 17 22.5)"/>
    </g>
    
    {/* 科技感装饰点 */}
    <circle cx="24" cy="10" r="1.5" fill="#60a5fa" opacity="0.8"/>
    <circle cx="26" cy="14" r="1" fill="#93c5fd" opacity="0.6"/>
    <circle cx="25" cy="18" r="0.8" fill="#dbeafe" opacity="0.4"/>
  </svg>
);

const navItems: NavItem[] = [
  { label: '首页', path: '/', icon: 'Home' },
  { label: 'OpenRank', path: '/openrank', icon: 'BarChart3' },
  { label: '统计指标', path: '/statistics', icon: 'Activity' },
  { label: '趋势分析', path: '/trends', icon: 'TrendingUp' },
  { label: '项目对比', path: '/compare', icon: 'GitBranch' },
];

const iconMap = {
  Home,
  BarChart3,
  Activity,
  TrendingUp,
  GitBranch,
  Menu,
  X,
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo 和项目名称 */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg">
              <Logo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">KWDB OpenRank</h1>
              <p className="text-xs text-gray-500 hidden sm:block">数据洞察平台</p>
            </div>
          </div>

          {/* 导航菜单和反馈按钮 */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className={`transition-transform duration-200 ${
                    isActive ? 'text-blue-600' : 'group-hover:scale-110'
                  }`}>
                    {item.icon && getIcon(item.icon)}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
            

          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              aria-label="打开菜单"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                  }
                `}
              >
                <span className={isActive ? 'text-blue-600' : ''}>
                  {item.icon && getIcon(item.icon)}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
          

        </div>
      </div>
    </nav>
  );
};

export default Navbar;