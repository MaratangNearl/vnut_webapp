import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore, translations } from '../store/settingsStore';
import { Plus, Settings, Trash2, Edit2, Check, Heart, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackupRestoreModal from './BackupRestoreModal';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenDonate: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings, onOpenDonate }) => {
  const { projects, activeProjectId, setActiveProject, addProject, deleteProject, renameProject } = useProjectStore();
  const { language } = useSettingsStore();
  const t = translations[language as keyof typeof translations] || translations.ko;
  
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showBackup, setShowBackup] = useState(false);

  const isDuplicateProjectError = (err: unknown) => err instanceof Error && err.message === 'DUPLICATE_PROJECT';

  const handleAdd = async () => {
    if (newProjectName.trim()) {
      try {
        await addProject(newProjectName.trim());
        setNewProjectName('');
        setIsAdding(false);
      } catch (err) {
        if (isDuplicateProjectError(err)) alert(t.duplicateProject);
      }
    }
  };

  const handleRename = async (id: string) => {
    if (editName.trim()) {
      try {
        await renameProject(id, editName.trim());
        setEditingId(null);
      } catch (err) {
        if (isDuplicateProjectError(err)) alert(t.duplicateProject);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(t.deleteProjectConfirm.replace('{name}', name))) {
      await deleteProject(id);
    }
  };

  return (
    <nav className="w-full md:w-72 bg-white dark:bg-[#1e1e1e] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col h-auto md:h-full z-20 transition-colors shadow-xl">
      <div className="p-4 md:p-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-blue-600/30 border border-blue-500/20 bg-blue-500/10">
            <img src="/logo.png" className="w-full h-full object-cover" alt="VNUT" />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
            {t.title}
          </h1>
        </div>
        <div className="flex md:hidden items-center gap-1.5">
          <button onClick={() => setShowBackup(true)} className="p-1.5 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl">
            <Database size={18} />
          </button>
          <button onClick={() => setIsAdding(true)} className="p-1.5 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl">
            <Plus size={18} />
          </button>
          <button onClick={onOpenDonate} className="p-1.5 bg-red-500/10 text-red-500 rounded-xl">
            <Heart size={18} className="animate-pulse" />
          </button>
          <button onClick={onOpenSettings} className="p-1.5 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto md:overflow-y-auto px-4 md:px-6 py-2 flex md:flex-col gap-2 scrollbar-hide">
        <div className="hidden md:flex items-center justify-between mb-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          <span>{t.projects}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBackup(true)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-purple-500 transition-all">
              <Database size={16} />
            </button>
            <button onClick={() => setIsAdding(true)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-blue-500 transition-all">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex md:flex-col gap-2">
          <AnimatePresence>
            {isAdding && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="min-w-[200px] md:w-full">
                <input autoFocus className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-gray-900 dark:text-white font-bold"
                  placeholder={t.projectName} value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} onBlur={() => !newProjectName && setIsAdding(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {projects.map(project => (
            <div key={project.id} onClick={() => setActiveProject(project.id)}
              className={`group flex items-center justify-between px-4 py-3 rounded-[1.25rem] cursor-pointer transition-all shrink-0 min-w-[160px] md:min-w-0 border ${
                activeProjectId === project.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30 scale-[1.02] md:scale-100' 
                : 'bg-white dark:bg-transparent border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {editingId === project.id ? (
                  <input autoFocus className="bg-white/20 border-none outline-none rounded-lg px-2 w-full text-white font-bold"
                    value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename(project.id)} onClick={e => e.stopPropagation()} />
                ) : (
                  <span className="truncate text-sm font-bold tracking-tight">{project.name}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === project.id ? (
                   <Check size={14} className="hover:text-green-300" onClick={(e) => { e.stopPropagation(); handleRename(project.id); }} />
                ) : (
                  <>
                    <Edit2 size={12} className="hover:text-white" onClick={(e) => { e.stopPropagation(); setEditingId(project.id); setEditName(project.name); }} />
                    <Trash2 size={12} className="hover:text-white" onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:flex flex-col gap-2 p-6 border-t border-gray-100 dark:border-white/5 mt-auto shrink-0">
        <button onClick={onOpenSettings} className="flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] cursor-pointer transition-all text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-blue-500 group">
          <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
            <Settings size={18} />
          </div>
          <span className="text-sm font-black tracking-tight">{t.settings}</span>
        </button>
        <button onClick={onOpenDonate} className="flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] cursor-pointer transition-all text-red-500 hover:bg-red-500/10 group">
          <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
            <Heart size={18} />
          </div>
          <span className="text-sm font-black tracking-tight uppercase">Donate</span>
        </button>
        <div className="mt-4 flex flex-col items-center gap-1.5 shrink-0">
           <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold tracking-tight text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors underline decoration-dotted">
             {t.privacyPolicy}
           </a>
           <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase italic opacity-40">v1.0</p>
        </div>
      </div>

      {showBackup && <BackupRestoreModal onClose={() => setShowBackup(false)} />}
    </nav>
  );
};

export default Sidebar;
