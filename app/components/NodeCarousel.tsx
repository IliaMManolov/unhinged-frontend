'use client';

import React from 'react';

interface NodeCarouselProps {
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}

const NodeCarousel: React.FC<NodeCarouselProps> = ({ children, className = '', innerRef }) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}> {/* Prevents content from visually overflowing its rounded corners if any */}
      <div 
        ref={innerRef}
        className="flex flex-nowrap overflow-x-auto space-x-4 py-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
      >
        {children}
      </div>
    </div>
  );
};

export default NodeCarousel; 