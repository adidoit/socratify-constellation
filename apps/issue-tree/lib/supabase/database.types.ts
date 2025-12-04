// Shared Database type comes from the monorepo package @constellation/db.
// We add convenience helpers to map to app-level camelCase types.

import type { Database as SharedDatabase } from "@constellation/db";
import type { IssueTreeJson } from "@/schema/issueTree";
import type { IssueTreeAssessment as IssueTreeAssessmentResult } from "@/schema/issueTreeAssessment";

export type Database = SharedDatabase;

// Helper type for issue tree row (camelCase for app usage)
export type IssueTree = {
  id: string;
  userId: string | null;
  title: string;
  description: string | null;
  treeJson: IssueTreeJson;
  isExample: boolean;
  source: string | null;
  forkedFromId: string | null;
  challengeId: string | null;
  createdAt: string;
  updatedAt: string;
};

// Helper type for tree revision row (camelCase for app usage)
export type TreeRevision = {
  id: string;
  issueTreeId: string;
  treeJson: IssueTreeJson;
  label: string | null;
  createdAt: string;
};

// Helper type for assessment row (camelCase for app usage)
export type IssueTreeAssessment = {
  id: string;
  issueTreeId: string;
  assessmentJson: IssueTreeAssessmentResult;
  overallScore: number | null;
  createdAt: string;
};

// Convert snake_case DB row to camelCase
export function toIssueTree(
  row: Database["public"]["Tables"]["issue_trees"]["Row"]
): IssueTree {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    treeJson: row.tree_json as IssueTreeJson,
    isExample: row.is_example,
    source: row.source,
    forkedFromId: row.forked_from_id,
    challengeId: row.challenge_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTreeRevision(
  row: Database["public"]["Tables"]["tree_revisions"]["Row"]
): TreeRevision {
  return {
    id: row.id,
    issueTreeId: row.issue_tree_id,
    treeJson: row.tree_json as IssueTreeJson,
    label: row.label,
    createdAt: row.created_at,
  };
}
