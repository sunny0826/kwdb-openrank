import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface MetricTooltipProps {
  title: string;
  description: string;
  className?: string;
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({
  title,
  description,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 计算最佳显示位置
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 280;
      const tooltipHeight = 120;
      
      let top = buttonRect.bottom + 8;
      let left = buttonRect.left;
      
      // 检查右侧空间是否足够
      if (left + tooltipWidth > viewportWidth - 20) {
        left = viewportWidth - tooltipWidth - 20;
      }
      
      // 检查左侧边界
      if (left < 20) {
        left = 20;
      }
      
      // 检查下方空间是否足够
      if (top + tooltipHeight > viewportHeight - 20) {
        top = buttonRect.top - tooltipHeight - 8;
      }
      
      // 检查上方边界
      if (top < 20) {
        top = 20;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen]);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* 信息图标 */}
      <div
        ref={buttonRef}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-full hover:bg-blue-50 cursor-help"
        aria-label={`查看${title}指标说明`}
      >
        <Info className="w-4 h-4" />
      </div>

      {/* 使用 Portal 渲染悬停提示框 */}
      {isOpen && createPortal(
        <div 
          ref={tooltipRef}
          className="fixed z-[9999] w-70 max-w-xs bg-gray-900 text-white rounded-lg shadow-lg p-3"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
        >
          {/* 指标含义内容 */}
          <div className="text-sm">
            <h5 className="font-medium mb-2">{title}</h5>
            <p className="text-gray-200 leading-relaxed">{description}</p>
          </div>
          
          {/* 小箭头 */}
          <div 
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{
              top: '-4px',
              left: '16px'
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default MetricTooltip;