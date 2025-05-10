'use client';

import React, { forwardRef } from 'react';

interface TextNodeProps {
  inputText: string;
  responseText: string;
  confidenceScore?: number | null;
  isLoadingResponse?: boolean;
  isCalculatingConfidence?: boolean;
  className?: string;
}

const TextNode = forwardRef<HTMLDivElement, TextNodeProps>((
  {
    inputText,
    responseText,
    confidenceScore,
    isLoadingResponse = false,
    isCalculatingConfidence = false,
    className = '',
  }, 
  ref
) => {
  return (
    <div ref={ref} className={`flex flex-col items-center justify-center animate-float flex-shrink-0 ${className}`}>
      <div className="max-w-[180px] w-full rounded-lg p-1 bg-transparent">
        <div
          className={`chat-bubble-input relative mb-2 rounded-md p-2 shadow ${
            isLoadingResponse
              ? 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <p className="text-sm">
            {inputText}
          </p>
        </div>

        <div
          className={`chat-bubble-response relative rounded-md p-2 shadow ${
            (isLoadingResponse || isCalculatingConfidence)
              ? 'bg-gray-200 dark:bg-slate-700'
              : 'bg-blue-100 dark:bg-sky-800'
          }`}
        >
          {/* Response Text Area - Conditional Rendering */}
          <div className="flex justify-start mb-1">
            <div 
              className={`relative p-1 rounded-lg text-xs whitespace-pre-wrap min-h-[20px] max-w-[100%] ${
                isLoadingResponse
                  ? 'text-slate-600 dark:text-slate-300'
                  : isCalculatingConfidence
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-blue-700 dark:text-blue-200'
              }`}
            >
              {isLoadingResponse ? (
                <span className="italic loading-dots">Loading</span>
              ) : (
                responseText
              )}
            </div>
          </div>

          {/* Confidence Score - Conditional Rendering */}
          {!isLoadingResponse && (
            <div className="flex justify-end mt-1">
              {isCalculatingConfidence ? (
                <p className="text-[10px] italic loading-dots text-slate-500 dark:text-slate-400 font-medium">Calculating confidence</p>
              ) : (
                typeof confidenceScore === 'number' && (
                  <p className={`text-[10px] font-medium ${isCalculatingConfidence ? 'text-slate-500 dark:text-slate-400' : 'text-blue-500 dark:text-sky-300'}`}>
                    Confidence: <span className={`font-semibold ${isCalculatingConfidence ? 'text-slate-600 dark:text-slate-300' : 'text-blue-700 dark:text-sky-100'}`}>{confidenceScore.toFixed(2)}</span>
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TextNode; 