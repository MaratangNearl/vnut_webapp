import React, { useState } from 'react';
import { Download, Upload, Loader2, HardDrive, Database } from 'lucide-react';
import { db } from '../lib/db';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore, translations } from '../store/settingsStore';
import { CloudSync, MAX_BACKUP_ZIP_SIZE, MAX_COVER_SIZE, MAX_RESTORE_GAMES } from '../lib/cloud';
import type { ProjectConfig } from '../types';
import Modal from './Modal';

interface BackupRestoreModalProps {
  onClose: () => void;
}

const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ onClose }) => {
  const { projects, activeProjectId, fetchProjects } = useProjectStore();
  const { language } = useSettingsStore();
  const t = translations[language as keyof typeof translations] || translations.ko;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const toText = (value: unknown) => typeof value === 'string' ? value : '';
  const toScore = (value: unknown) => {
    const score = Number(value);
    return Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0;
  };

  const handleBackup = async () => {
    if (!activeProjectId || !activeProject) return;
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const blob = await CloudSync.exportToZip(activeProjectId, activeProject.config);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `vnut_backup_${activeProject.name}_${new Date().toISOString().slice(0,10)}.zip`;
      link.click();
    } catch (err) {
      console.error('Backup Error:', err);
      alert(`${t.errorOccurred}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BACKUP_ZIP_SIZE) {
      alert(`${t.errorOccurred}: Backup file is too large`);
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const { sqlDb, config, newProjectId, zip } = await CloudSync.importFromZip(file);
      
      await db.projects.add({
        id: newProjectId,
        name: `${file.name.replace('.zip', '')} (Restored)`,
        createdAt: new Date().toISOString(),
        config: config as ProjectConfig
      });

      const res = sqlDb.exec("SELECT * FROM games");
      if (res.length > 0) {
        const columns = res[0].columns;
        const values = res[0].values;
        if (values.length > MAX_RESTORE_GAMES) {
          throw new Error("INVALID_BACKUP: Too many games in backup");
        }

        for (const row of values) {
          const gameData: Record<string, unknown> = {};
          columns.forEach((col: string, i: number) => gameData[col] = row[i]);
          const vndbIdMatch = toText(gameData.vndb_url).match(/v(\d+)/);
          const vndbId = vndbIdMatch ? vndbIdMatch[0] : "";
          
          let coverBlob: Blob | undefined;
          if (gameData.cover_image_path) {
            // Robust path handling for covers
            const rawPath = toText(gameData.cover_image_path);
            const cleanPath = rawPath.replace(/^data[/\\]/, '').replace(/\\/g, '/');
            const possiblePaths = [
              rawPath,
              cleanPath,
              `data/covers/${cleanPath.split('/').pop()}`,
              `covers/${cleanPath.split('/').pop()}`,
              cleanPath.split('/').pop() || ""
            ];

            for (const path of possiblePaths) {
               const coverFile = zip.file(path);
               if (coverFile) {
                 const candidateBlob = await coverFile.async("blob");
                 if (candidateBlob.size <= MAX_COVER_SIZE) {
                   coverBlob = candidateBlob;
                 }
                 break;
               }
            }
          }

          await db.games.add({
            projectId: newProjectId,
            title: toText(gameData.title),
            score: toScore(gameData.score),
            comment: toText(gameData.comment),
            vndbId,
            coverImage: coverBlob,
            createdAt: toText(gameData.created_at) || new Date().toISOString(),
            updatedAt: toText(gameData.updated_at) || new Date().toISOString()
          });
        }
      }
      await fetchProjects();
      alert(t.restoreSuccess);
      onClose();
    } catch (err) {
      console.error('Restore Error:', err);
      alert(`${t.errorOccurred}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal title={`${t.dataBackup} (${activeProject?.name})`} onClose={onClose} icon={<Database size={20} />}>
      <div className="space-y-6 relative">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          <HardDrive size={14} />
          <span>{t.localBackup}</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <button onClick={handleBackup} disabled={isProcessing || !activeProjectId} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-3xl border border-gray-100 dark:border-white/5 transition-all group shadow-sm disabled:opacity-30 disabled:cursor-not-allowed">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download size={24} />
               </div>
               <div className="text-left">
                   <p className="text-sm font-black">{t.dataBackup.split(' & ')[0]} Export</p>
                   <p className="text-[10px] text-gray-400 font-bold">{t.save} {t.projects}</p>
                </div>
             </div>
          </button>

          <label className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-3xl border border-gray-100 dark:border-white/5 transition-all cursor-pointer group shadow-sm">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={24} />
               </div>
               <div className="text-left">
                  <p className="text-sm font-black">{t.dataBackup.split(' & ')[0]} Import</p>
                  <p className="text-[10px] text-gray-400 font-bold">{t.update} {t.projects}</p>
               </div>
            </div>
            <input type="file" accept=".zip" className="hidden" onChange={handleRestore} disabled={isProcessing} />
          </label>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex flex-col items-center justify-center backdrop-blur-[4px] rounded-3xl z-20 transition-all">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">Processing...</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BackupRestoreModal;
