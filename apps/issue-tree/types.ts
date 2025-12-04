export type NodeType = "root" | "hypothesis" | "question" | "action" | "data";

export type IssueTreeAiGenerateMode = "child" | "sibling" | "complete";

export type NodeTag = {
  id: string;
  label: string;
  color?: string;
  kind?: string;
};

export interface IssueNode {
  id: string;
  content: string;
  type: NodeType;
  children: IssueNode[];
  parentId: string | null;
  isExpanded: boolean;
  tags?: NodeTag[];
}

export interface TreeState {
  root: IssueNode;
}

export interface Point {
  x: number;
  y: number;
}
