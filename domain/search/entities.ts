export type SearchResultType = "lesson" | "material" | "laboratory" | "case";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
}
