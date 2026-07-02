import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore, translations } from '../store/settingsStore';
import { db } from '../lib/db';
import type { Game, TierData } from '../types';
import TierRow from './TierRow';
import { Plus, Download, Loader2, Palette, X, SortAsc, SortDesc } from 'lucide-react';
import AddGameModal from './AddGameModal';
import EditGameModal from './EditGameModal';
import BackupRestoreModal from './BackupRestoreModal';
import { DEFAULT_TIER_COLORS } from '../lib/utils';
import { toJpeg } from 'html-to-image';

type TierSortOrder = 'desc' | 'asc';

const TierBoard: React.FC = () => {
  const { activeProjectId, projects, updateConfig } = useProjectStore();
  const { language } = useSettingsStore();
  const t = translations[language as keyof typeof translations] || translations.ko;
  
  const [games, setGames] = useState<Game[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  
  // tierOrder: Score row order (Default 'desc': 91~100 first)
  const [tierOrder, setTierOrder] = useState<TierSortOrder>('desc');
  // isZtoA: Title sort toggle (ㄱㄴㄷ vs ㄷㄴㄱ)
  const [isZtoA, setIsZtoA] = useState(false);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const fetchGames = useCallback(async () => {
    if (!activeProjectId) return;
    const projectGames = await db.games.where('projectId').equals(activeProjectId).toArray();
    
    const sorted = projectGames.sort((a, b) => {
      // Primary grouping is always by score (Tier boundary)
      if (a.score !== b.score) {
        return b.score - a.score; 
      }
      
      // Secondary sort within same score
      const compare = a.title.localeCompare(b.title, language === 'ko' ? 'ko' : 'en');
      return isZtoA ? -compare : compare;
    });
    
    setGames(sorted);
  }, [activeProjectId, isZtoA, language]);

  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([]);

  const handleEditSelected = () => {
    if (selectedGameIds.length !== 1) return;
    const targetGame = games.find(g => g.id === selectedGameIds[0]);
    if (targetGame) {
      setEditingGame(targetGame);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchGames();
      setSelectedGameIds([]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchGames, tierOrder]);

  const handleExport = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    const originalWidth = boardRef.current.style.width;
    const originalMinWidth = boardRef.current.style.minWidth;
    try {
      boardRef.current.classList.add('exporting');
      boardRef.current.style.width = '1200px';
      boardRef.current.style.minWidth = '1200px';
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await toJpeg(boardRef.current, {
        quality: 0.95,
        backgroundColor: activeProject?.config.bg_color || '#121212',
        filter: (node: HTMLElement) => !node.classList?.contains('no-export')
      });
      const link = document.createElement('a');
      link.download = `${activeProject?.name || 'tier-list'}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert(t.errorOccurred);
    } finally {
      boardRef.current.classList.remove('exporting');
      boardRef.current.style.width = originalWidth;
      boardRef.current.style.minWidth = originalMinWidth;
      setIsExporting(false);
    }
  };

  const updateTierColor = (label: string, color: string) => {
    if (!activeProjectId || !activeProject) return;
    const newColors = { ...activeProject.config.colors, [label]: color };
    updateConfig(activeProjectId, { colors: newColors });
  };

  const groupGames = (): TierData => {
    const data: TierData = {};
    const config = activeProject?.config;
    
    const labels = Object.keys(DEFAULT_TIER_COLORS).sort((a, b) => {
      const valA = parseInt(a);
      const valB = parseInt(b);
      return tierOrder === 'asc' ? valA - valB : valB - valA;
    });

    labels.forEach(label => {
      data[label] = {
        color: config?.colors[label] || DEFAULT_TIER_COLORS[label],
        games: []
      };
    });

    games.forEach(game => {
      const score = game.score;
      let label = "0~10";
      if (score >= 91) label = "91~100";
      else if (score >= 81) label = "81~90";
      else if (score >= 71) label = "71~80";
      else if (score >= 61) label = "61~70";
      else if (score >= 51) label = "51~60";
      else if (score >= 41) label = "41~50";
      else if (score >= 31) label = "31~40";
      else if (score >= 21) label = "21~30";
      else if (score >= 11) label = "11~20";
      if (data[label]) data[label].games.push(game);
    });
    return data;
  };

  const tiers = groupGames();
  const tierLabels = Object.keys(tiers);
  const visibleTiers = tierLabels.filter(label => tiers[label].games.length > 0);

  return (
    <div className="p-2 sm:p-3 lg:p-6 xl:p-8 pb-48">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 no-export gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 transition-colors tracking-tighter break-all">
            {activeProject?.name}
          </h2>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => { setTierOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setIsZtoA(false); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${tierOrder === 'asc' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
             >
               Sort Tiers {tierOrder === 'desc' ? <SortDesc size={12}/> : <SortAsc size={12}/>}
             </button>
             <button 
              onClick={() => setIsZtoA(!isZtoA)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${isZtoA ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}
             >
               Sort by Title {isZtoA ? <SortAsc size={12}/> : <SortDesc size={12}/>}
             </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button onClick={() => setShowPalette(!showPalette)} className={`p-3 rounded-2xl transition-all shadow-xl ${showPalette ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'}`}>
            <Palette size={20} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-blue-600/30">
            <Plus size={20} /> {t.addGame}
          </button>
          <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-900 dark:text-white px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 border border-gray-200 dark:border-white/5 shadow-xl">
            {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {t.exportImage}
          </button>
        </div>
      </header>

      {showPalette && (
        <div className="mb-8 p-4 sm:p-8 bg-white dark:bg-[#1e1e1e] rounded-[2rem] sm:rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl no-export relative animate-in fade-in zoom-in duration-300">
          <button onClick={() => setShowPalette(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex flex-col gap-6 sm:gap-10">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-6">
              {Object.keys(DEFAULT_TIER_COLORS).sort((a,b) => parseInt(b)-parseInt(a)).map(label => (
                <div key={label} className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</span>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 dark:bg-black/20 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-white/5 focus-within:border-blue-500 transition-colors">
                    <input type="text" value={(activeProject?.config.colors[label] || DEFAULT_TIER_COLORS[label]).toUpperCase()} onChange={e => updateTierColor(label, e.target.value)} className="flex-1 bg-transparent text-[11px] font-mono font-bold dark:text-white outline-none uppercase w-full min-w-0" />
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 relative shadow-sm">
                      <input type="color" value={activeProject?.config.colors[label] || DEFAULT_TIER_COLORS[label]} onChange={e => updateTierColor(label, e.target.value)} className="absolute inset-0 w-[150%] h-[150%] translate-x-[-25%] translate-y-[-25%] bg-transparent cursor-pointer border-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="h-px bg-gray-100 dark:bg-white/5" />
            
            <div className="space-y-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">{t.bgColor}</span>
               <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-[1.5rem] border border-gray-200 dark:border-white/10 w-full sm:w-64 focus-within:border-blue-500 transition-colors">
                  <input type="text" value={(activeProject?.config.bg_color || '#121212').toUpperCase()} onChange={e => updateConfig(activeProjectId!, { bg_color: e.target.value })} className="flex-1 bg-transparent text-sm font-mono font-bold dark:text-white outline-none uppercase w-full min-w-0" />
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 relative shadow-sm">
                    <input type="color" value={activeProject?.config.bg_color || '#121212'} onChange={e => updateConfig(activeProjectId!, { bg_color: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] translate-x-[-25%] translate-y-[-25%] bg-transparent cursor-pointer border-none" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <div ref={boardRef} className="space-y-2 lg:space-y-4 p-2 sm:p-4 lg:p-6 xl:p-8 rounded-2xl lg:rounded-[3rem] transition-colors shadow-2xl tier-board-container" style={{ backgroundColor: activeProject?.config.bg_color || 'transparent' }}>
        {visibleTiers.map(label => (
          <TierRow key={label} label={label} color={tiers[label].color} games={tiers[label].games} onUpdated={fetchGames} />
        ))}
        {visibleTiers.length === 0 && (
          <div className="h-80 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-6 border-4 border-dashed border-gray-100 dark:border-white/5 rounded-[3.5rem]">
            <Plus size={64} className="opacity-10" />
            <p className="font-bold text-center px-12 text-sm md:text-lg leading-relaxed max-w-md">{t.emptyBoardHint}</p>
          </div>
        )}
      </div>

      {/* Game List Management Section */}
      {games.length > 0 && (
        <div className="mt-12 p-6 md:p-8 bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl no-export">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                {language === 'ko' ? '등록된 게임 관리' : language === 'ja' ? '登録ゲーム管理' : 'Manage Games'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'ko' ? `총 ${games.length}개의 게임이 등록되어 있습니다. 항목을 선택하여 일괄 삭제할 수 있습니다.` 
                 : language === 'ja' ? `全 ${games.length} 個のゲームが登録されています。項目を選択して一括削除できます。`
                 : `Total ${games.length} games. Select items to bulk delete.`}
              </p>
            </div>
            
            {/* Select Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto scrollbar-hide max-w-full py-1">
              <button 
                onClick={() => {
                  if (selectedGameIds.length === games.length) {
                    setSelectedGameIds([]);
                  } else {
                    setSelectedGameIds(games.map(g => g.id!).filter(id => id !== undefined));
                  }
                }}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-[10px] sm:text-xs font-bold transition-all active:scale-95 border border-gray-200 dark:border-white/5 whitespace-nowrap shrink-0 flex items-center justify-center"
              >
                <span className="whitespace-nowrap shrink-0">
                  {selectedGameIds.length === games.length 
                    ? (language === 'ko' ? '선택 해제' : language === 'ja' ? '選択解除' : 'Deselect All')
                    : (language === 'ko' ? '전체 선택' : language === 'ja' ? 'すべて選択' : 'Select All')
                  }
                </span>
              </button>
              <button 
                onClick={handleEditSelected}
                disabled={selectedGameIds.length !== 1}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg whitespace-nowrap shrink-0 ${
                  selectedGameIds.length === 1 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-white/5 shadow-none'
                }`}
              >
                <span className="whitespace-nowrap shrink-0">
                  {language === 'ko' ? '편집' : language === 'ja' ? '編集' : 'Edit'}
                </span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] sm:text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 border border-blue-600 whitespace-nowrap shrink-0"
              >
                <Plus size={14} className="shrink-0" />
                <span className="whitespace-nowrap shrink-0">
                  {language === 'ko' ? '추가' : language === 'ja' ? '追加' : 'Add'}
                </span>
              </button>
              <button 
                onClick={async () => {
                  if (selectedGameIds.length === 0) return;
                  const confirmMessage = language === 'ko' 
                    ? `선택한 ${selectedGameIds.length}개의 게임을 삭제하시겠습니까?`
                    : language === 'ja'
                    ? `選択した ${selectedGameIds.length} 個のゲームを削除しますか？`
                    : `Are you sure you want to delete ${selectedGameIds.length} selected games?`;
                    
                  if (confirm(confirmMessage)) {
                    try {
                      await db.games.bulkDelete(selectedGameIds);
                      setSelectedGameIds([]);
                      fetchGames();
                    } catch {
                      alert(t.errorOccurred);
                    }
                  }
                }}
                disabled={selectedGameIds.length === 0}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg whitespace-nowrap shrink-0 ${
                  selectedGameIds.length > 0 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-white/5 shadow-none'
                }`}
              >
                <span className="whitespace-nowrap shrink-0">
                  {language === 'ko' ? '선택 삭제' : language === 'ja' ? '選択削除' : 'Delete Selected'}
                </span>
                {selectedGameIds.length > 0 && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] ml-0.5 font-bold shrink-0">
                    {selectedGameIds.length}
                  </span>
                )}
              </button>
            </div></div>

          {/* Interactive Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {games.map(game => {
              const isSelected = selectedGameIds.includes(game.id!);
              const coverUrl = game.coverImage ? URL.createObjectURL(game.coverImage) : null;
              
              return (
                <div 
                  key={game.id} 
                  onClick={() => {
                    const id = game.id!;
                    setSelectedGameIds(prev => 
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    );
                  }}
                  className={`flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-2xl cursor-pointer transition-all border select-none ${
                    isSelected 
                      ? 'bg-blue-500/10 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-50 dark:bg-black/10 border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-white/10'
                  }`}
                >
                  {/* Custom Checkbox/Circle */}
                  <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 dark:border-white/20'
                  }`}>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Cover Mini Thumbnail */}
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    {coverUrl ? (
                      <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>
                    )}
                  </div>

                  {/* Title & Score */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {game.title}
                    </p>
                    <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium mt-1 inline-block">
                      Score: <strong className="text-blue-600 dark:text-blue-400 font-black">{game.score}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile-only Privacy Policy Link */}
      <div className="md:hidden mt-8 flex justify-center pb-4 no-export">
         <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold tracking-tight text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors underline decoration-dotted">
           {t.privacyPolicy}
         </a>
      </div>

      {showAddModal && <AddGameModal onClose={() => setShowAddModal(false)} onAdded={fetchGames} />}
      {showBackupModal && <BackupRestoreModal onClose={() => setShowBackupModal(false)} />}
      {editingGame && (
        <EditGameModal 
          game={editingGame} 
          onClose={() => setEditingGame(null)} 
          onUpdated={() => {
            setEditingGame(null);
            fetchGames();
          }} 
        />
      )}
    </div>
  );
};

export default TierBoard;
