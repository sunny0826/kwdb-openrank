import React from 'react';
import Navbar from './Navbar';
import { Github, ExternalLink, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {children}
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 项目信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">KWDB OpenRank</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                基于 OpenDigger 数据的 KWDB 项目指标展示平台，提供全面的项目数据分析和可视化。
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>by KWDB Team</span>
              </div>
            </div>
            
            {/* 快速链接 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">快速链接</h4>
              <div className="space-y-2">
                <a
                  href="https://github.com/X-lab2017/open-digger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Github className="w-4 h-4" />
                  <span>OpenDigger</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://gitee.com/kwdb/kwdb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
                  </svg>
                  <span>KWDB 项目</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://github.com/kwdb/kwdb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://atomgit.com/kwdb/kwdb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <img src="https://res.oafimg.cn/openatom-www/home/assets/logo-300x300-DC-YZyCt.png" alt="OpenAtom" className="w-4 h-4" />
                  <span>AtomGit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            
            {/* 技术栈 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">技术栈</h4>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Vite'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* 版权信息 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-500">© {new Date().getFullYear()} KWDB OpenRank 指标展示平台. All rights reserved.</div>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>数据来源: OpenDigger</span>
                <span>•</span>
                <span>更新时间: {new Date().toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;