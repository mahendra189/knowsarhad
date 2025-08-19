export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
  author?: string;
  createdAt: string;
}
