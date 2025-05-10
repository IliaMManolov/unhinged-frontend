'use client';

import React, { useState, useEffect, RefObject } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Line {
  id: string;
  p1: Point;
  p2: Point;
}

interface NodeConnectionsProps {
  topNodeRef: RefObject<HTMLDivElement | null>;
  bottomNodeRef: RefObject<HTMLDivElement | null>;
  carouselNodeRefs: RefObject<(HTMLDivElement | null)[]>;
  containerRef: RefObject<HTMLDivElement | null>;
  carouselScrollContainerRef?: RefObject<HTMLDivElement | null>;
  svgClassName?: string;
}

const NodeConnections: React.FC<NodeConnectionsProps> = ({
  topNodeRef,
  bottomNodeRef,
  carouselNodeRefs,
  containerRef,
  carouselScrollContainerRef,
  svgClassName,
}) => {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const calculateLines = () => {
      if (!topNodeRef.current || !bottomNodeRef.current || !carouselNodeRefs.current || !containerRef.current) {
        return;
      }

      const newLines: Line[] = [];
      const containerRect = containerRef.current.getBoundingClientRect();

      const getCenter = (node: HTMLDivElement): Point => {
        const rect = node.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      };

      const topCenter = getCenter(topNodeRef.current);
      const bottomCenter = getCenter(bottomNodeRef.current);

      carouselNodeRefs.current.forEach((nodeRef, index) => {
        if (nodeRef) {
          const carouselNodeCenter = getCenter(nodeRef);
          // Line from top node to carousel node
          newLines.push({
            id: `line-top-${index}`,
            p1: topCenter,
            p2: carouselNodeCenter,
          });
          // Line from bottom node to carousel node
          newLines.push({
            id: `line-bottom-${index}`,
            p1: bottomCenter,
            p2: carouselNodeCenter,
          });
        }
      });
      setLines(newLines);
    };

    calculateLines(); // Initial calculation

    // Basic recalculation on resize for now. More robust handling (e.g., scroll) would be needed.
    window.addEventListener('resize', calculateLines);
    
    // Add scroll listener to the carousel's scroll container
    const scrollContainer = carouselScrollContainerRef?.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', calculateLines, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', calculateLines);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', calculateLines);
      }
    };
  // Dependencies: include all refs and the containerRef to re-calculate when they might change or become available.
  // carouselNodeRefs.current itself might change if nodes are added/removed dynamically, 
  // so watching its .current might not be enough if the array instance changes.
  // For simplicity now, we list them. A more complex setup might be needed for dynamic children.
  }, [
    topNodeRef, 
    bottomNodeRef, 
    carouselNodeRefs, 
    containerRef, 
    carouselScrollContainerRef,
    carouselNodeRefs.current
  ]);

  if (!lines.length) {
    return null; // Don't render SVG if no lines are calculated yet
  }

  return (
    <svg 
      className={svgClassName || "absolute top-0 left-0 w-full h-full pointer-events-none"} 
      style={{ zIndex: 0 }} // Place SVG at a base z-index within its stacking context
    >
      {lines.map(line => (
        <line
          key={line.id}
          x1={line.p1.x}
          y1={line.p1.y}
          x2={line.p2.x}
          y2={line.p2.y}
          stroke="rgba(156, 163, 175, 0.5)" // Restore original stroke color
          strokeWidth="2"
        />
      ))}
    </svg>
  );
};

export default NodeConnections; 