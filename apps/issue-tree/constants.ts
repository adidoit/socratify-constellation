export const INITIAL_TREE_DATA = {
  id: "root-1",
  content: "Profitability is declining",
  type: "root" as const,
  parentId: null,
  isExpanded: true,
  children: [
    {
      id: "child-1",
      content: "Revenue is decreasing",
      type: "hypothesis" as const,
      parentId: "root-1",
      isExpanded: true,
      children: [],
    },
    {
      id: "child-2",
      content: "Costs are increasing",
      type: "hypothesis" as const,
      parentId: "root-1",
      isExpanded: true,
      children: [],
    },
  ],
};

export const getNodeStyle = (type: string, depth: number): string => {
  const baseStyle = "border shadow-md hover:shadow-lg transition-all duration-200";

  // In light mode, use the root styling for all nodes.
  // In dark mode, use the secondary styling for all nodes.
  return [
    baseStyle,
    "bg-card text-card-foreground border-border",
    "dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:border-muted-foreground/50",
  ].join(" ");
};

export const NODE_COLORS = {
  root: "bg-card text-card-foreground border-border",
  hypothesis: "bg-secondary text-secondary-foreground border-border",
  question: "bg-secondary text-secondary-foreground border-border",
  action: "bg-secondary text-secondary-foreground border-border",
  data: "bg-secondary text-secondary-foreground border-border",
};

export const getDepthLabel = (depth: number): string => {
  switch (depth) {
    case 0:
      return "Problem Statement";
    case 1:
      return "Level 1";
    case 2:
      return "Level 2";
    case 3:
      return "Level 3";
    default:
      return `Level ${depth}`;
  }
};
