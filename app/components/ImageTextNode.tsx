'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';

interface ImageTextNodeProps {
  promptText: string;
  imageUrl: string;
  imageAlt: string;
  responseText: string;
  isLoadingResponse?: boolean;
  className?: string;
}

const ImageTextNode = forwardRef<HTMLDivElement, ImageTextNodeProps>((
  {
    promptText,
    imageUrl,
    imageAlt,
    responseText,
    isLoadingResponse = false,
    className = '',
  }, 
  ref
) => {
  return (
    <div ref={ref} className={`flex flex-col items-center justify-center animate-float flex-shrink-0 ${className}`}>
      <div className="max-w-[180px] w-full rounded-lg bg-transparent overflow-hidden p-1">
        <div className="relative mb-2 rounded-md shadow bg-gray-100 dark:bg-slate-800 overflow-hidden">
          <div className="p-2">
            <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
              {promptText}
            </p>
          </div>

          <div className="relative w-full h-[120px]">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Basic sizes
            />
          </div>
        </div>

        <div className={`relative p-2 mt-2 rounded-md shadow ${ 
            isLoadingResponse 
              ? 'bg-gray-200 dark:bg-slate-700'
              : 'bg-blue-100 dark:bg-sky-800'
          }`}>
          {isLoadingResponse ? (
            <div className="flex items-center justify-center h-[40px]">
              <span className="italic text-xs text-slate-600 dark:text-slate-300 loading-dots">
                Loading response
              </span>
            </div>
          ) : (
            <p className="text-xs text-blue-700 dark:text-blue-200 whitespace-pre-wrap">
              {responseText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export default ImageTextNode; 