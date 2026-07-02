import React, { useState, useRef } from 'react';
import { Trash2, Upload, Edit3 } from 'lucide-react';
import { db } from '../lib/db';
import type { Game } from '../types';
import { useSettingsStore, translations } from '../store/settingsStore';
import Modal from './Modal';

interface EditGameModalProps {
  game: Game;
  onClose: () => void;
  onUpdated: () => void;
}

const EditGameModal: React.FC<EditGameModalProps> = ({ game, onClose, onUpdated }) => {
  const { language } = useSettingsStore();
  const t = translations[language as keyof typeof translations] || translations.ko;
  
  const [formData, setFormData] = useState({
    title: game.title,
    score: game.score,
    comment: game.comment || '',
    imageBlob: game.coverImage || null
  });
  const [scoreInput, setScoreInput] = useState(String(game.score));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeScore = (value: string | number) => {
    const nextScore = Number(value);
    if (!Number.isFinite(nextScore)) return formData.score;
    return Math.min(100, Math.max(0, Math.round(nextScore)));
  };

  const updateScore = (value: string | number) => {
    const score = normalizeScore(value);
    setFormData({ ...formData, score });
    setScoreInput(String(score));
  };

  const handleScoreInputChange = (value: string) => {
    setScoreInput(value);
    if (value === '') return;
    setFormData({ ...formData, score: normalizeScore(value) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageBlob: file });
    }
  };

  const handleSave = async () => {
    if (!formData.title || game.id === undefined) return;
    
    await db.games.update(game.id, {
      title: formData.title,
      score: formData.score,
      comment: formData.comment,
      coverImage: formData.imageBlob || undefined,
      updatedAt: new Date().toISOString()
    });
    
    onUpdated();
    onClose();
  };

  const handleDelete = async () => {
    if (game.id === undefined) return;
    if (confirm(t.deleteGameConfirm)) {
      await db.games.delete(game.id);
      onUpdated();
      onClose();
    }
  };

  const footer = (
    <div className="flex justify-between items-center w-full gap-2">
      <button onClick={handleDelete} className="flex items-center gap-1.5 text-red-500 hover:text-red-400 font-black text-xs uppercase tracking-widest transition-colors px-1 sm:px-2 shrink-0">
        <Trash2 size={16} />
        <span className="hidden sm:inline">{t.deleteGameConfirm.split('?')[0]}</span>
        <span className="sm:hidden">{language === 'ko' ? '삭제' : language === 'ja' ? '削除' : 'Delete'}</span>
      </button>
      <div className="flex gap-1.5 sm:gap-3 shrink-0">
        <button onClick={onClose} className="px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0">{t.cancel}</button>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-white transition-all transform active:scale-95 shadow-xl shadow-blue-600/20 shrink-0">
          {t.update}
        </button>
      </div>
    </div>
  );

  return (
    <Modal title={t.editGame} onClose={onClose} icon={<Edit3 size={20} />} footer={footer}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-1 flex justify-center sm:block">
            <div className="w-[120px] sm:w-full aspect-[13/20] bg-gray-50 dark:bg-white/5 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 relative group shadow-inner">
              {formData.imageBlob ? (
                <img src={URL.createObjectURL(formData.imageBlob)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center p-6 font-bold">
                  {t.unranked}
                </div>
              )}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
              >
                <Upload size={24} className="text-white" />
                <span className="text-[10px] text-white font-black uppercase tracking-widest">{t.uploadCover.split(' ')[0]}</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
          
          <div className="col-span-1 sm:col-span-2 space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1.5 px-1">{t.gameName}</label>
              <input 
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-colors"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">{t.score}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  inputMode="numeric"
                  className="w-16 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-0.5 text-right text-xs font-black text-blue-500 outline-none focus:border-blue-500 dark:bg-blue-500/15"
                  value={scoreInput}
                  onChange={e => handleScoreInputChange(e.target.value)}
                  onBlur={() => setScoreInput(String(formData.score))}
                  aria-label={t.score}
                />
              </div>
              <input type="range" min="0" max="100" className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={formData.score} onChange={e => updateScore(e.target.value)} />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1.5 px-1">{t.comment}</label>
              <textarea className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 h-32 resize-none transition-colors"
                value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditGameModal;
