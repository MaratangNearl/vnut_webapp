export interface Game {
  id?: number;
  vndbId: string;
  title: string;
  score: number;
  comment: string;
  coverImage?: Blob; // Stored as Blob in IndexedDB
  coverUrl?: string; // Local Object URL for display
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string; // UUID
  name: string;
  config: ProjectConfig;
  createdAt: string;
}

export interface ProjectConfig {
  colors: Record<string, string>;
  language: string;
  theme: 'dark' | 'light';
  bg_color?: string;
}

export type TierData = Record<string, {
  color: string;
  games: Game[];
}>;
