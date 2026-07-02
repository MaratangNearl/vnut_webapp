import React from 'react';
import { Moon, Sun, Globe, Palette, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useSettingsStore, translations, type Language } from '../store/settingsStore';
import { db } from '../lib/db';
import Modal from './Modal';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { language, setLanguage, theme, setTheme, useOriginalTitle, setUseOriginalTitle } = useSettingsStore();
  const t = translations[language as keyof typeof translations] || translations.ko;
  
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as Language);
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleFullReset = async () => {
    if (confirm(t.resetWarning)) {
      try {
        // 1. Delete Dexie DB
        await db.delete();
        // 2. Clear Local Storage
        localStorage.clear();
        // 3. Inform user
        alert(t.resetSuccess);
        // 4. Force reload to clean state
        window.location.reload();
      } catch {
        alert(t.errorOccurred);
      }
    }
  };

  return (
    <Modal title={t.settings} onClose={onClose} icon={<Palette size={20} />}>
      <div className="space-y-8">
        {/* Language Selection */}
        <section>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            <Globe size={14} />
            <span>{t.language}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['ko', 'en', 'ja'] as Language[]).map(lang => (
              <button 
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition-all ${
                  language === lang 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-blue-500'
                }`}
              >
                {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : '日本語'}
              </button>
            ))}
          </div>
        </section>

        {/* Theme & Appearance */}
        <section>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            <Sun size={14} />
            <span>{t.appearance}</span>
          </div>
          <button 
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-[1.5rem] border border-gray-100 dark:border-white/5 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {theme === 'dark' ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-yellow-500" />}
              </div>
              <span className="text-sm font-black tracking-tight">{t.themeMode}</span>
            </div>
            <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">{theme}</span>
          </button>
        </section>

        {/* Original Title Setting */}
        <section>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            <Globe size={14} />
            <span>{t.originalTitle}</span>
          </div>
          <button 
            onClick={() => setUseOriginalTitle(!useOriginalTitle)}
            className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-[1.5rem] border border-gray-100 dark:border-white/5 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Globe size={20} className={useOriginalTitle ? "text-blue-500" : "text-gray-400"} />
              </div>
              <span className="text-sm font-black tracking-tight">{t.originalTitle}</span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-colors ${
              useOriginalTitle 
                ? 'text-blue-500 bg-blue-500/10' 
                : 'text-gray-400 bg-gray-100 dark:bg-white/5'
            }`}>
              {useOriginalTitle ? 'ON' : 'OFF'}
            </span>
          </button>
        </section>

        {/* Danger Zone */}
        <section className="pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">
            <AlertTriangle size={14} />
            <span>Danger Zone</span>
          </div>
          <button 
            onClick={handleFullReset}
            className="w-full flex items-center justify-between px-5 py-4 bg-red-500/5 hover:bg-red-500/10 rounded-[1.5rem] border border-red-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                <RefreshCcw size={20} />
              </div>
              <span className="text-sm font-black tracking-tight text-red-500">{t.resetData}</span>
            </div>
          </button>
        </section>
      </div>
    </Modal>
  );
};

export default SettingsModal;
