import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ko' | 'en' | 'ja';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ko';
  const legacyNavigator = navigator as Navigator & { userLanguage?: string };
  const lang = navigator.language || legacyNavigator.userLanguage || 'ko';
  const shortLang = lang.split('-')[0].toLowerCase();
  if (shortLang === 'ja') return 'ja';
  if (shortLang === 'ko') return 'ko';
  return 'en';
};

interface SettingsState {
  language: Language;
  theme: 'dark' | 'light';
  useOriginalTitle: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setUseOriginalTitle: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: getInitialLanguage(),
      theme: 'dark',
      useOriginalTitle: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setUseOriginalTitle: (useOriginalTitle) => set({ useOriginalTitle }),
    }),
    {
      name: 'vnut-settings',
    }
  )
);

export interface Translation {
  title: string;
  projects: string;
  menu: string;
  tierList: string;
  dataBackup: string;
  settings: string;
  addProject: string;
  projectName: string;
  gameName: string;
  addGame: string;
  editGame: string;
  searchVndb: string;
  fetch: string;
  save: string;
  cancel: string;
  update: string;
  score: string;
  comment: string;
  originalTitle: string;
  duplicateGame: string;
  duplicateProject: string;
  exportImage: string;
  localBackup: string;
  cloudSync: string;
  appearance: string;
  language: string;
  themeMode: string;
  bgColor: string;
  tierPalette: string;
  uploadCover: string;
  unranked: string;

  autoSortDesc: string;
  selectOrCreate: string;
  backupSuccess: string;
  restoreSuccess: string;
  errorOccurred: string;
  deleteProjectConfirm: string;
  deleteGameConfirm: string;
  emptyBoardHint: string;
  donateMsg: string;
  donateSubMsg: string;
  resetData: string;
  resetWarning: string;
  resetSuccess: string;
  privacyPolicy: string;

}

export const translations: Record<Language, Translation> = {
  ko: {
    title: "VNUT WEB",
    projects: "프로젝트",
    menu: "메뉴",
    tierList: "티어표",
    dataBackup: "데이터 & 백업",
    settings: "설정",
    addProject: "새 프로젝트 추가",
    projectName: "프로젝트 이름",
    gameName: "게임 제목",
    addGame: "게임 추가",
    editGame: "게임 편집",
    searchVndb: "VNDB ID(예: v17) 또는 URL 입력...",
    fetch: "가져오기",
    save: "저장",
    cancel: "취소",
    update: "수정",
    score: "점수",
    comment: "코멘트",
    originalTitle: "원문 제목 사용",
    duplicateGame: "이미 등록된 게임(ID 또는 이름)입니다.",
    duplicateProject: "이미 존재하는 프로젝트 이름입니다.",
    exportImage: "이미지 내보내기",
    localBackup: "로컬 백업 (데스크톱 호환)",
    cloudSync: "클라우드 동기화",
    appearance: "화면 설정",
    language: "언어",
    themeMode: "테마 모드",
    bgColor: "배경 색상",
    tierPalette: "티어 색상 팔레트",
    uploadCover: "커버 이미지 업로드",
    unranked: "미분류",

    autoSortDesc: "점수 기반 자동 정렬 시스템",
    selectOrCreate: "프로젝트를 선택하거나 새로 생성해주세요.",
    backupSuccess: "백업이 성공적으로 완료되었습니다.",
    restoreSuccess: "데이터 복원이 완료되었습니다.",
    errorOccurred: "오류가 발생했습니다.",
    deleteProjectConfirm: "이 프로젝트를 정말 삭제하시겠습니까?",
    deleteGameConfirm: "이 게임을 삭제하시겠습니까?",
    emptyBoardHint: "Add Game 버튼을 눌러 첫 번째 게임을 등록하세요.",
    donateMsg: "개발자를 응원해 주셔서 감사합니다!",
    donateSubMsg: "",
    resetData: "모든 데이터 초기화",
    resetWarning: "이 작업은 되돌릴 수 없습니다. 모든 프로젝트와 게임 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?",
    resetSuccess: "데이터가 완전히 초기화되었습니다.",
    privacyPolicy: "개인정보처리방침",

  },
  en: {
    title: "VNUT WEB",
    projects: "Projects",
    menu: "Menu",
    tierList: "Tier List",
    dataBackup: "Data & Backup",
    settings: "Settings",
    addProject: "Add Project",
    projectName: "Project Name",
    gameName: "Game Title",
    addGame: "Add Game",
    editGame: "Edit Game",
    searchVndb: "Enter VNDB ID (e.g. v17) or URL...",
    fetch: "Fetch",
    save: "Save",
    cancel: "Cancel",
    update: "Update",
    score: "Score",
    comment: "Comment",
    originalTitle: "Use Original Title",
    duplicateGame: "Game already exists (ID or Title).",
    duplicateProject: "Project name already exists.",
    exportImage: "Export Image",
    localBackup: "Local Backup (Desktop Compatible)",
    cloudSync: "Cloud Sync",
    appearance: "Appearance",
    language: "Language",
    themeMode: "Theme Mode",
    bgColor: "Background Color",
    tierPalette: "Tier Palette",
    uploadCover: "Upload Cover",
    unranked: "Unranked",

    autoSortDesc: "Auto-sort by score",
    selectOrCreate: "Please select or create a project.",
    backupSuccess: "Backup completed successfully.",
    restoreSuccess: "Data restoration complete.",
    errorOccurred: "An error occurred.",
    deleteProjectConfirm: "Are you sure you want to delete this project?",
    deleteGameConfirm: "Are you sure you want to delete this game?",
    emptyBoardHint: "Click the Add Game button to register your first game.",
    donateMsg: "Thank you for supporting the developer!",
    donateSubMsg: "",
    resetData: "Reset All Data",
    resetWarning: "This action cannot be undone. All projects and game data will be permanently deleted. Continue?",
    resetSuccess: "Data has been completely reset.",
    privacyPolicy: "Privacy Policy",

  },
  ja: {
    title: "VNUT WEB",
    projects: "プロジェクト",
    menu: "メニュー",
    tierList: "ティア表",
    dataBackup: "データ＆バックアップ",
    settings: "設定",
    addProject: "プロジェクト追加",
    projectName: "プロジェクト名",
    gameName: "ゲームタイトル",
    addGame: "ゲーム追加",
    editGame: "ゲーム編集",
    searchVndb: "VNDB ID (例: v17) または URLを入力...",
    fetch: "取得",
    save: "保存",
    cancel: "キャンセル",
    update: "更新",
    score: "スコア",
    comment: "コメント",
    originalTitle: "原題を使用",
    duplicateGame: "登録済み(IDまたは名前)です。",
    duplicateProject: "プロジェクト名が既に存在します。",
    exportImage: "画像書き出し",
    localBackup: "ローカルバックアップ",
    cloudSync: "クラウド同期",
    appearance: "外観",
    language: "言語",
    themeMode: "テーマモード",
    bgColor: "背景色",
    tierPalette: "ティアパレット",
    uploadCover: "カバー画像アップロード",
    unranked: "未分類",

    autoSortDesc: "スコア順自動ソート",
    selectOrCreate: "プロジェクトを選択するか、新しく作成してください。",
    backupSuccess: "バックアップが正常に完了しました。",
    restoreSuccess: "データ復元が完了しました。",
    errorOccurred: "エラーが発生しました。",
    deleteProjectConfirm: "このプロジェクトを本当に削除しますか？",
    deleteGameConfirm: "このゲームを削除しますか？",
    emptyBoardHint: "Add Gameボタンを押して、最初のゲームを登録してください。",
    donateMsg: "開発者を応援していただきありがとうございます！",
    donateSubMsg: "",
    resetData: "すべてのデータを初期化",
    resetWarning: "この操作は取り消せません。すべてのプロジェクトとゲームデータが永久に削除されます。続行しますか？",
    resetSuccess: "データが完全に初期化されました。",
    privacyPolicy: "個人情報処理方針",

  }
};
