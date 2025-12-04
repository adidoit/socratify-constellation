import React from 'react';

export const INITIAL_TREE_DATA = {
  id: 'root-1',
  content: 'Profitability is declining',
  type: 'root' as const,
  parentId: null,
  isExpanded: true,
  children: [
    {
      id: 'child-1',
      content: 'Revenue is decreasing',
      type: 'hypothesis' as const,
      parentId: 'root-1',
      isExpanded: true,
      children: []
    },
    {
      id: 'child-2',
      content: 'Costs are increasing',
      type: 'hypothesis' as const,
      parentId: 'root-1',
      isExpanded: true,
      children: []
    }
  ]
};

// Function to get styles based on Depth (Level) and Type
export const getNodeStyle = (type: string, depth: number): string => {
    // Root is always dark
    if (type === 'root') {
        return 'bg-neutral-900 text-white border-neutral-900 shadow-md';
    }

    // Base style for all other nodes
    const baseStyle = 'shadow-sm hover:shadow-md transition-all duration-200';
    
    // Unified style for all levels (L1+) - Clean White
    const bgClass = 'bg-white'; 
    const borderClass = 'border-neutral-200 hover:border-primary-400';
    const textClass = 'text-neutral-900';

    return `${bgClass} ${borderClass} ${textClass} ${baseStyle}`;
};

// Deprecated map, keeping for reference
export const NODE_COLORS = {
  root: 'bg-neutral-900 text-white border-neutral-900',
  hypothesis: 'bg-white text-neutral-900 border-neutral-200 shadow-sm hover:border-primary-400',
  question: 'bg-blue-50 text-blue-900 border-blue-100 hover:border-blue-300',
  action: 'bg-green-50 text-green-900 border-green-100 hover:border-green-300',
  data: 'bg-amber-50 text-amber-900 border-amber-100 hover:border-amber-300',
};

export const getDepthLabel = (depth: number): string => {
    switch (depth) {
        case 0: return 'Problem Statement';
        case 1: return 'Key Driver';   // L1: The main pillars breaking down the problem
        case 2: return 'Sub-Issue';    // L2: Specific components of the driver
        case 3: return 'Analysis';     // L3: Specific areas to investigate
        default: return 'Evidence';    // L4+: Data and facts
    }
};