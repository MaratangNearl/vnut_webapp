import { create } from 'zustand';
import type { Project, ProjectConfig } from '../types';
import { db } from '../lib/db';
import { DEFAULT_TIER_COLORS } from '../lib/utils';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  
  fetchProjects: () => Promise<void>;
  addProject: (name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  setActiveProject: (id: string) => void;
  updateConfig: (id: string, config: Partial<ProjectConfig>) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    const projects = await db.projects.toArray();
    set({ 
      projects, 
      isLoading: false, 
      activeProjectId: projects.length > 0 ? (get().activeProjectId || projects[0].id) : null 
    });
  },

  addProject: async (name: string) => {
    const existing = await db.projects.where('name').equals(name).first();
    if (existing) {
      throw new Error('DUPLICATE_PROJECT');
    }
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      config: {
        colors: { ...DEFAULT_TIER_COLORS },
        language: 'ko', // Default, will be ignored by global setting
        theme: 'dark',
        bg_color: '#121212'
      }
    };
    await db.projects.add(newProject);
    await get().fetchProjects();
    set({ activeProjectId: newProject.id });
  },

  deleteProject: async (id: string) => {
    await db.projects.delete(id);
    await db.games.where('projectId').equals(id).delete();
    await get().fetchProjects();
  },

  renameProject: async (id: string, name: string) => {
    const existing = await db.projects.where('name').equals(name).first();
    if (existing && existing.id !== id) {
      throw new Error('DUPLICATE_PROJECT');
    }
    await db.projects.update(id, { name });
    await get().fetchProjects();
  },

  setActiveProject: (id: string) => set({ activeProjectId: id }),

  updateConfig: async (id: string, config: Partial<ProjectConfig>) => {
    const project = await db.projects.get(id);
    if (project) {
      const newConfig = { ...project.config, ...config };
      await db.projects.update(id, { config: newConfig });
      
      // Update local state immediately
      set(state => ({
        projects: state.projects.map(p => p.id === id ? { ...p, config: newConfig } : p)
      }));
    }
  }
}));
