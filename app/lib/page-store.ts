// Define interfaces for the data structures
// These should match or be compatible with what app/page.tsx uses

export interface GraphNodeData {
  id: string;
  imageUrl: string;
  title: string;
  altText?: string;
}

export interface TextNodeStateProps {
  inputText: string;
  responseText: string;
  confidenceScore?: number | null;
  isLoadingResponse?: boolean;
  isCalculatingConfidence?: boolean;
}

export interface ImageTextNodeStateProps {
  promptText: string;
  imageUrl: string;
  imageAlt: string;
  responseText: string;
  isLoadingResponse?: boolean;
}

export interface BaseCarouselItem {
  id: string;
  type: 'textNode' | 'imageTextNode';
}

export interface TextCarouselItem extends BaseCarouselItem {
  type: 'textNode';
  props: TextNodeStateProps;
}

export interface ImageTextCarouselItem extends BaseCarouselItem {
  type: 'imageTextNode';
  props: ImageTextNodeStateProps;
}

export type CarouselItem = TextCarouselItem | ImageTextCarouselItem;

// Define the structure of our server-side store
export interface PageDataStore {
  radarLabels: string[];
  radarData: number[];
  topGraphNodeData: GraphNodeData;
  bottomGraphNodeData: GraphNodeData;
  carouselItems: CarouselItem[];
  // dynamicConfidence is client-side, but we might store an initial for one node
}

// Initialize the store with some default data
// (Ideally, this initial data matches what app/page.tsx currently uses)
let globalPageData: PageDataStore = {
  radarLabels: [
    "Health", "Intelligence", "Extroversion",
    "Personalized attractiveness", "Interest compatibility", "Personality compatibility"
  ],
  radarData: [5, 6, 7, 8, 9, 4],
  topGraphNodeData: {
    id: "static-top-node",
    imageUrl: "https://placehold.co/96x96/png?text=GN_Top_Srv",
    altText: "Main Topic Node - Top",
    title: "Top Topic (Server)",
  },
  bottomGraphNodeData: {
    id: "static-bottom-node",
    imageUrl: "https://placehold.co/96x96/png?text=GN_Bot_Srv",
    altText: "Bottom Anchor Node",
    title: "Bottom Anchor (Server)",
  },
  carouselItems: [
    {
      id: 'initial-text-node-1', // Use fixed IDs for initial server data if helpful
      type: 'textNode',
      props: {
        inputText: "Capital of France (Server)?", 
        responseText: "Paris. Landmarks: Eiffel Tower, Louvre, Notre-Dame.",
        confidenceScore: 0.99, // Static initial confidence from server
        isLoadingResponse: false, 
        isCalculatingConfidence: false,
      }
    },
    // Add more initial carousel items if needed, similar to app/page.tsx initial state
  ],
};

// Functions to interact with the store
export const getPageData = (): PageDataStore => {
  // In a real app, you might fetch from a DB here
  return JSON.parse(JSON.stringify(globalPageData)); // Return a deep copy
};

export const updateRadarDataInStore = (newData: number[]): PageDataStore => {
  globalPageData.radarData = newData;
  return getPageData();
};

export const updateRadarLabelsInStore = (newLabels: string[]): PageDataStore => {
  globalPageData.radarLabels = newLabels;
  return getPageData();
};

export const updateTopGraphNodeInStore = (data: GraphNodeData): PageDataStore => {
  globalPageData.topGraphNodeData = data;
  return getPageData();
};

export const updateBottomGraphNodeInStore = (data: GraphNodeData): PageDataStore => {
  globalPageData.bottomGraphNodeData = data;
  return getPageData();
};

export const addCarouselItemInStore = (item: CarouselItem): PageDataStore => {
  // Ensure item has a unique ID, though API route should handle ID generation based on input
  globalPageData.carouselItems.push(item);
  return getPageData();
};

export const deleteCarouselItemInStore = (itemId: string): PageDataStore => {
  globalPageData.carouselItems = globalPageData.carouselItems.filter(item => item.id !== itemId);
  return getPageData();
};

export const updateCarouselItemInStore = (itemId: string, newProps: Partial<TextNodeStateProps> | Partial<ImageTextNodeStateProps>): PageDataStore => {
  globalPageData.carouselItems = globalPageData.carouselItems.map(item => {
    if (item.id === itemId) {
      if (item.type === 'textNode' && !('promptText' in newProps)) { // Basic check for TextNode props
        return { ...item, props: { ...item.props, ...(newProps as Partial<TextNodeStateProps>) } };
      }
      if (item.type === 'imageTextNode' && !('inputText' in newProps)) { // Basic check for ImageTextNode props
        return { ...item, props: { ...item.props, ...(newProps as Partial<ImageTextNodeStateProps>) } };
      }
      // If type/prop mismatch, return original item to avoid corruption (or handle error)
      console.warn('Mismatched item type and newProps in updateCarouselItemInStore for id:', itemId, 'Item:', item, 'NewProps:', newProps);
      return item; 
    }
    return item;
  });
  return getPageData();
}; 