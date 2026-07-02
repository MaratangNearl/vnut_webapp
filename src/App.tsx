import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TierBoard from './components/TierBoard';
import { useProjectStore } from './store/projectStore';
import { useSettingsStore, translations } from './store/settingsStore';
import { Loader2 } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import DonateModal from './components/DonateModal';


const App: React.FC = () => {
  const { fetchProjects, isLoading, activeProjectId } = useProjectStore();
  const { language, theme } = useSettingsStore();
  const t = translations[language as keyof typeof translations] || translations.ko;

  const [showSettings, setShowSettings] = React.useState(false);
  const [showDonate, setShowDonate] = React.useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-[#121212] transition-colors">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300 font-sans relative">
      {/* Sidebar */}
      <Sidebar onOpenSettings={() => setShowSettings(true)} onOpenDonate={() => setShowDonate(true)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
          {activeProjectId ? (
            <TierBoard />
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-gray-400 font-black px-8 text-center gap-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center">
                <Loader2 size={32} className="opacity-20" />
              </div>
              <p className="max-w-[200px] leading-relaxed uppercase tracking-tighter text-sm">
                {t.selectOrCreate}
              </p>
            </div>
          )}
        </div>
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </div>
  );
};

export default App;
