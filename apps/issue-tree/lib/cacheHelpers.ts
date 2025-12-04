import type { IssueTreeJson } from "@/schema/issueTree";

export function hashIssueTree(tree: IssueTreeJson): string {
  const str = JSON.stringify(tree);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export const CACHE_KEYS = {
  issueTree: (id: string) => `issueTree:${id}`,
  recentTrees: (userId: string | null, anonClientId: string | null, limit: number) => {
    if (userId) return `issueTrees:recent:user:${userId}:${limit}`;
    if (anonClientId) return `issueTrees:recent:anon:${anonClientId}:${limit}`;
    return null;
  },
  assessment: (treeHash: string) => `issueTreeAssessment:v1:${treeHash}`,
} as const;

export const CACHE_TTL = {
  issueTree: 60,
  recentTrees: 60,
  assessment: 86400,
} as const;
