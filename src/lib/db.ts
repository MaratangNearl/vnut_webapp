import Dexie, { type Table } from 'dexie';
import type { Game, Project } from '../types';

export class VNUTDatabase extends Dexie {
  projects!: Table<Project>;
  games!: Table<Game & { projectId: string }>;

  constructor() {
    super('VNUTDatabase');
    this.version(1).stores({
      projects: 'id, name, createdAt',
      games: '++id, vndbId, title, score, projectId'
    });
  }
}

export const db = new VNUTDatabase();
