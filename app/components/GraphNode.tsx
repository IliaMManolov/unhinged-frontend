'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';

interface GraphNodeProps {
  imageUrl: string;
  altText?: string;
  title: string;
  // description: string; // Description removed
  className?: string;
}

const IMAGE_CONTAINER_SIZE_REM = 6; // Corresponds to w-24, h-24 (96px at 16px/rem)
const IMAGE_RENDER_SIZE_PX = Math.floor(IMAGE_CONTAINER_SIZE_REM * 16 * 1.2); // Approx 20% larger

const GraphNode = forwardRef<HTMLDivElement, GraphNodeProps>((
  {
    imageUrl,
    altText = 'Graph Node Image',
    title,
    // description, // Description removed
    className = '',
  },
  ref
) => {
  return (
    <div 
      ref={ref} 
      className={`flex flex-col items-center text-center transition-transform duration-300 ease-in-out hover:scale-105 animate-float flex-shrink-0 ${className}`}
    >
      <div 
        className="w-24 h-24 mb-2 rounded-full overflow-hidden border-2 border-gray-300 shadow-md flex items-center justify-center"
        // Removed inline style for width/height, relying on Tailwind classes for the container size.
        // Added flex items-center justify-center to help center the slightly larger image if needed.
      >
        <Image 
          src={imageUrl} 
          alt={altText} 
          width={IMAGE_RENDER_SIZE_PX}
          height={IMAGE_RENDER_SIZE_PX}
          className="object-cover" // object-cover is still useful to maintain aspect ratio
          // No fill, no sizes needed when width/height are explicit like this for a fixed size.
          // Removed: fill, sizes, block, w-full, h-full, scale-110
        />
      </div>
      <h3 className="text-md font-medium text-gray-700">
        {title}
      </h3>
    </div>
  );
});

export default GraphNode; 