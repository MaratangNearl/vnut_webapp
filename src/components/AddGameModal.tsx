import React, { useState, useRef } from 'react';
import { Search, Loader2, Upload, Plus } from 'lucide-react';
import { fetchVnInfo } from '../lib/vndb';
import { db } from '../lib/db';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore, translations } from '../store/settingsStore';
import Modal from './Modal';

interface AddGameModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddGameModal: React.FC<AddGameModalProps> = ({ onClose, onAdded }) => {
  const { activeProjectId } = useProjectStore();
  const { language, useOriginalTitle } = useSettingsStore();
  const t = translations[language as keyof typeof translations] || translations.ko;
  const isPassed = true;
  
  const [vnInput, setVnInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useOriginal, setUseOriginal] = useState(useOriginalTitle);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    originalTitle: '',
    score: 80,
    comment: '',
    imageBlob: null as Blob | null,
    vndbId: ''
  });
  const [scoreInput, setScoreInput] = useState('80');

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

  const handleSearch = async () => {
    if (!vnInput.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const idMatch = vnInput.match(/v(\d+)/);
      const targetId = idMatch ? idMatch[0] : vnInput.trim();
      const info = await fetchVnInfo(targetId);
      setFormData({
        ...formData,
        title: info.title,
        originalTitle: info.alttitle || info.title,
        vndbId: targetId,
        imageBlob: info.imageBlob || null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "VNDB Error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageBlob: file });
    }
  };

  const handleSave = async () => {
    if (!activeProjectId || !formData.title) return;
    const finalTitle = useOriginal && formData.originalTitle ? formData.originalTitle : formData.title;

    const existing = await db.games
      .where('projectId').equals(activeProjectId)
      .filter(g => (g.vndbId === formData.vndbId && formData.vndbId !== '') || g.title === finalTitle)
      .first();
    
    if (existing) {
      setError(t.duplicateGame);
      return;
    }

    await db.games.add({
      projectId: activeProjectId,
      title: finalTitle,
      vndbId: formData.vndbId,
      score: formData.score,
      comment: formData.comment,
      coverImage: formData.imageBlob || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    onAdded();
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-1.5 sm:gap-3 shrink-0">
      <button onClick={onClose} className="px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0">{t.cancel}</button>
      <button onClick={handleSave} disabled={!formData.title} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-white transition-all active:scale-95 shadow-xl shadow-blue-600/20 shrink-0">
        {t.save}
      </button>
    </div>
  );

  return (
    <Modal title={t.addGame} onClose={onClose} icon={<Plus size={20} />} footer={footer}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white font-bold disabled:opacity-50 transition-all"
              placeholder={t.searchVndb}
              value={vnInput}
              onChange={e => setVnInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          </div>
          <button 
            onClick={handleSearch} 
            disabled={isSearching || !isPassed} 
            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 px-6 py-3 rounded-2xl text-sm font-black transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : t.fetch}
          </button>
        </div>



        {error && <p className="text-red-500 text-[10px] font-black uppercase px-2 tracking-widest">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-1 flex justify-center sm:block">
             <div className="w-[120px] sm:w-full aspect-[13/20] bg-gray-50 dark:bg-white/5 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 relative group shadow-inner">
              {formData.imageBlob ? (
                <img src={URL.createObjectURL(formData.imageBlob)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 text-center p-6 font-black uppercase tracking-widest">
                  {t.uploadCover}
                </div>
              )}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
              >
                <Upload size={24} className="text-white" />
                <span className="text-[10px] text-white font-black uppercase tracking-widest">Upload</span>
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

            {formData.originalTitle && (
              <label className="flex items-center gap-3 cursor-pointer group bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                <input type="checkbox" checked={useOriginal} onChange={e => setUseOriginal(e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 bg-white/5 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold group-hover:text-blue-500 transition-colors">{t.originalTitle}: <span className="text-gray-900 dark:text-white">{formData.originalTitle}</span></span>
              </label>
            )}
            
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
              <textarea className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 h-24 resize-none transition-colors"
                value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddGameModal;
