export type NodeType = 'root' | 'hypothesis' | 'question' | 'action' | 'data';

export interface IssueNode {
  id: string;
  content: string;
  type: NodeType;
  children: IssueNode[];
  parentId: string | null;
  isExpanded: boolean;
}

export interface TreeState {
  root: IssueNode;
}

export interface Point {
  x: number;
  y: number;
}