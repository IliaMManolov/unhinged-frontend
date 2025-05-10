'use client'; // Required for useState and useEffect

import React, { useState, useEffect, useRef, useCallback } from 'react';
import RadarChart from "./components/RadarChart";
import TextNode from "./components/TextNode";
import ImageTextNode from "./components/ImageTextNode";
import NodeCarousel from "./components/NodeCarousel";
import GraphNode from "./components/GraphNode";
import NodeConnections from "./components/NodeConnections";
// import { v4 as uuidv4 } from 'uuid'; // No longer needed here for ID generation

const DEFAULT_CHART_SIZE = 300;

// Define interfaces for GraphNode data (matching page-store)
interface GraphNodeData {
  id: string; // Added id to match store and API response
  imageUrl: string;
  title: string;
  altText?: string;
}

// Props types for carousel items (matching page-store TextNodeProps and ImageTextNodeProps)
interface TextNodeStateProps {
  inputText: string;
  responseText: string;
  confidenceScore?: number | null;
  isLoadingResponse?: boolean;
  isCalculatingConfidence?: boolean;
}

interface ImageTextNodeStateProps {
  promptText: string;
  imageUrl: string;
  imageAlt: string;
  responseText: string;
  isLoadingResponse?: boolean;
}

// Discriminated union for Carousel Items (matching page-store CarouselItem)
interface BaseCarouselItem {
  id: string;
  type: 'textNode' | 'imageTextNode';
}

interface TextCarouselItem extends BaseCarouselItem {
  type: 'textNode';
  props: TextNodeStateProps;
}

interface ImageTextCarouselItem extends BaseCarouselItem {
  type: 'imageTextNode';
  props: ImageTextNodeStateProps;
}

type CarouselItem = TextCarouselItem | ImageTextCarouselItem;

// Interface for the entire page data structure from the API
interface PageData {
  radarLabels: string[];
  radarData: number[];
  topGraphNodeData: GraphNodeData;
  bottomGraphNodeData: GraphNodeData;
  carouselItems: CarouselItem[];
}

const POLLING_INTERVAL = 5000; // Poll every 5 seconds

export default function Home() {
  // Radar Chart State
  const [radarLabels, setRadarLabels] = useState<string[]>([]);
  const [radarData, setRadarData] = useState<number[]>([]);
  const [radarChartSize, setRadarChartSize] = useState(DEFAULT_CHART_SIZE);

  // Top and Bottom GraphNode State
  const [topGraphNodeData, setTopGraphNodeData] = useState<GraphNodeData | null>(null);
  const [bottomGraphNodeData, setBottomGraphNodeData] = useState<GraphNodeData | null>(null);
  
  // State for Carousel Nodes
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);

  // State for TextNode dynamic confidence score example (for the first node)
  // This will be applied locally if the first node is a text node after data is fetched.
  const [dynamicConfidence, setDynamicConfidence] = useState(0.88);


  // Refs for NodeConnections
  const topNodeRef = useRef<HTMLDivElement>(null);
  const bottomNodeRef = useRef<HTMLDivElement>(null);
  const carouselNodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const carouselScrollRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/page-data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PageData = await response.json();
      
      setRadarLabels(data.radarLabels);
      setRadarData(data.radarData);
      setTopGraphNodeData(data.topGraphNodeData);
      setBottomGraphNodeData(data.bottomGraphNodeData);
      
      // Preserve local dynamic confidence for the first text node if applicable
      setCarouselItems(prevItems => {
        const newItems = data.carouselItems;
        if (newItems.length > 0 && newItems[0].type === 'textNode' && prevItems.length > 0 && prevItems[0].id === newItems[0].id && prevItems[0].type === 'textNode') {
          // If the first node is the same and is a text node, apply local dynamic confidence
          const updatedFirstItemProps = { ...newItems[0].props, confidenceScore: dynamicConfidence };
          return [{ ...newItems[0], props: updatedFirstItemProps }, ...newItems.slice(1)];
        }
        return newItems;
      });

    } catch (error) {
      console.error("Failed to fetch page data:", error);
      // Optionally, set some error state here to display to the user
    }
  }, [dynamicConfidence]); // Add dynamicConfidence to ensure it's used when data is fetched

  // Fetch initial data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling for data updates
  useEffect(() => {
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchData]);
  
  // Effect to keep carouselNodeRefs array in sync with carouselItems length
  useEffect(() => {
    carouselNodeRefs.current = Array(carouselItems.length).fill(null).map(
      (_, i) => carouselNodeRefs.current[i] || null
    );
  }, [carouselItems.length]);

  // Update dynamicConfidence periodically (local effect)
  useEffect(() => {
    const confidenceInterval = setInterval(() => {
      setDynamicConfidence(prev => parseFloat((Math.random() * 0.15 + 0.85).toFixed(2)));
    }, 4000);
    return () => clearInterval(confidenceInterval);
  }, []);

  // When dynamicConfidence changes, update the first carousel item if it's a TextNode
  useEffect(() => {
    setCarouselItems(prevItems => {
      if (prevItems.length > 0 && prevItems[0].type === 'textNode') {
        const currentFirstItemProps = prevItems[0].props;
        // Only update if the confidence score is actually different
        if (currentFirstItemProps.confidenceScore !== dynamicConfidence) {
          const updatedProps = { ...currentFirstItemProps, confidenceScore: dynamicConfidence };
          return [{ ...prevItems[0], props: updatedProps }, ...prevItems.slice(1)];
        }
      }
      return prevItems;
    });
  }, [dynamicConfidence]);


  useEffect(() => {
    const handleResize = () => {
      const size = Math.min(window.innerWidth / 2.5, window.innerHeight / 2.5, 400);
      setRadarChartSize(size);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // The useEffect for calculating responsive chart size for radar can be simplified or merged.
  // The previous radar chart size calculation:
  // useEffect(() => {
  //   const calculateSize = () => {
  //     if (typeof window !== 'undefined') {
  //       const newSize = Math.min(350, window.innerWidth / 2 - 100, window.innerHeight / 2 - 100);
  //       setRadarChartSize(Math.max(150, newSize)); 
  //     }
  //   };
  //   calculateSize();
  //   window.addEventListener('resize', calculateSize);
  //   return () => {
  //     window.removeEventListener('resize', calculateSize);
  //   };
  // }, []);
  // Let's keep the simpler one from above.

  // Render null or a loading state if essential data hasn't loaded yet
  if (!topGraphNodeData || !bottomGraphNodeData) {
    return (
      <main className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading page data...</p>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Left Side Wrapper */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
        {/* Top-Left Pane (RadarChart) */}
        <div className="h-1/2 p-6 border-b md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center overflow-hidden">
          <RadarChart 
            data={radarData} 
            labels={radarLabels} 
            size={radarChartSize}
            maxValue={10} 
            color="rgba(75, 192, 192, 0.6)" 
          />
        </div>
        {/* Bottom-Left Pane (System Insights) */}
        <div className="h-1/2 p-6 md:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">System Insights</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          {/* ... other static text ... */}
        </div>
      </div>

      {/* Right Pane */}
      <div ref={rightPaneRef} className="relative z-0 w-full md:w-1/2 h-full bg-gray-100 dark:bg-gray-850 p-4 flex flex-col justify-between overflow-auto">
        <div className="pt-6 z-10 flex justify-center w-full">
          <GraphNode 
            ref={topNodeRef}
            // id={topGraphNodeData.id} // id is not a prop for GraphNode component
            imageUrl={topGraphNodeData.imageUrl}
            altText={topGraphNodeData.altText}
            title={topGraphNodeData.title}
          />
        </div>
        
        {/* Removed Test Buttons for Carousel API */}
        
        <NodeCarousel className="w-full z-10" innerRef={carouselScrollRef}> 
          {carouselItems.map((item, index) => {
            const commonProps = {
              key: item.id,
              ref: (el: HTMLDivElement | null) => { carouselNodeRefs.current[index] = el; },
            };
            if (item.type === 'textNode') {
              return <TextNode {...commonProps} {...item.props} />;
            }
            if (item.type === 'imageTextNode') {
              return <ImageTextNode {...commonProps} {...item.props} />;
            }
            return null;
          })}
        </NodeCarousel>

        <div className="pb-6 z-10 flex justify-center w-full">
          <GraphNode 
            ref={bottomNodeRef}
            // id={bottomGraphNodeData.id} // id is not a prop for GraphNode component
            imageUrl={bottomGraphNodeData.imageUrl}
            altText={bottomGraphNodeData.altText}
            title={bottomGraphNodeData.title}
          />
        </div>
        <NodeConnections 
          topNodeRef={topNodeRef} 
          bottomNodeRef={bottomNodeRef} 
          carouselNodeRefs={carouselNodeRefs}
          containerRef={rightPaneRef} 
          carouselScrollContainerRef={carouselScrollRef}
          svgClassName="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </main>
  );
}
