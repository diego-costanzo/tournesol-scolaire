/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProfileModal } from './components/ProfileModal';
import { BridgeStatusModal } from './components/BridgeStatusModal';
import { DesktopWindowGuideModal } from './components/modals/DesktopWindowGuideModal';
import { HomeworkTab } from './components/tabs/HomeworkTab';
import { SchoolTimetableTab } from './components/tabs/SchoolTimetableTab';
import { StudyToolsTab } from './components/tabs/StudyToolsTab';
import { MoyenneTab } from './components/tabs/MoyenneTab';
import { UpdatesTab } from './components/tabs/UpdatesTab';
import { AppStoreTab } from './components/tabs/AppStoreTab';
import { MobileTransferTab } from './components/tabs/MobileTransferTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { AutoBackupReminder } from './components/common/AutoBackupReminder';
import { 
  initialProfile, 
  initialUpdates, 
  verifiedAppsList, 
  initialTimetable, 
  initialHomework 
} from './data/mockData';
import { 
  StudentProfile, 
  SystemUpdate, 
  VerifiedApp, 
  TimetableSlot, 
  HomeworkItem, 
  GradeItem,
  Language, 
  ThemeVariant,
  OperatingSystem
} from './types';
import { soundFx } from './utils/audio';
import { getThemeConfig } from './utils/themeStyles';
import { systemBridge } from './services/systemBridge';
import { backupService } from './services/backupService';

export default function App() {
  const [bootState, setBootState] = useState<'booting' | 'welcome' | 'ready'>('booting');

  useEffect(() => {
    // Fake loading per rassicurare l'utente sulla verifica dei dati
    const checkData = async () => {
      await new Promise(r => setTimeout(r, 1200));
      const hasChosenMode = localStorage.getItem('tournesol_mode_selected');
      if (hasChosenMode === 'true') {
        setBootState('ready');
      } else {
        setBootState('welcome');
      }
    };
    checkData();
  }, []);

  // 0. Profile Mode (demo vs clean)
  const [profileMode, setProfileMode] = useState<'demo' | 'clean'>(() => {
    return (localStorage.getItem('tournesol_profile_mode') as 'demo' | 'clean') || 'demo';
  });

  useEffect(() => {
    localStorage.setItem('tournesol_profile_mode', profileMode);
  }, [profileMode]);

  // 1. Profile State (Default is French for French audience, switchable to Italian for tests)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('tournesol_profile');
    const userHasExplicitlyChosenLang = localStorage.getItem('tournesol_lang_chosen') === 'true';
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Marieme Dieye' || parsed.name === 'Marieme' || parsed.name === 'Studente') {
          parsed.name = 'Élève';
        }
        if (!userHasExplicitlyChosenLang) {
          parsed.language = 'fr';
        }
        return { ...initialProfile, ...parsed };
      } catch {}
    }
    return initialProfile;
  });

  const handleSetLanguage = (lang: Language) => {
    localStorage.setItem('tournesol_lang_chosen', 'true');
    setProfile(p => ({ ...p, language: lang }));
    soundFx.playClick();
  };

  useEffect(() => {
    localStorage.setItem('tournesol_profile', JSON.stringify(profile));
  }, [profile]);

  // Synchronize active theme with document element for CSS variables & portals
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [isDesktopWindowModalOpen, setIsDesktopWindowModalOpen] = useState(false);
  const isIt = profile.language === 'it';
  const theme = getThemeConfig(profile.theme);

  // Probe system bridge on app load
  useEffect(() => {
    systemBridge.probeBridge();
  }, []);

  // 2. Active Tab - Default to 'homework' as requested (In evidenza i compiti)
  const [activeTab, setActiveTab] = useState<string>('homework');

  // 3. System Updates State
  const [updates, setUpdates] = useState<SystemUpdate[]>(() => {
    const saved = localStorage.getItem('tournesol_updates');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const mode = localStorage.getItem('tournesol_profile_mode');
    return mode === 'clean' ? [] : initialUpdates;
  });

  useEffect(() => {
    localStorage.setItem('tournesol_updates', JSON.stringify(updates));
  }, [updates]);

  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  const getSystemLogs = (os: OperatingSystem, lang: Language) => {
    if (os === 'fedora') {
      return [
        lang === 'it' ? "Repository Fedora configurati: fedora, updates, updates-testing" : "Dépôts Fedora configurés : fedora, updates",
        lang === 'it' ? "Controllo advisory di sicurezza DNF..." : "Vérification des avis de sécurité DNF..."
      ];
    }
    if (os === 'arch') {
      return [
        lang === 'it' ? "Server specchio Pacman: core, extra, multilib" : "Miroirs Pacman : core, extra, multilib",
        lang === 'it' ? "Controllo archlinux-keyring e firme PGP..." : "Vérification du trousseau archlinux-keyring..."
      ];
    }
    if (os === 'macos') {
      return [
        lang === 'it' ? "Homebrew su macOS: homebrew/core, homebrew/cask" : "Homebrew sur macOS : homebrew/core, homebrew/cask",
        lang === 'it' ? "Controllo formule e dipendenze..." : "Vérification des formules et dépendances..."
      ];
    }
    return [
      lang === 'it' ? "Repository configurati: deb.debian.org/debian bookworm main contrib" : "Dépôts configurés : deb.debian.org/debian bookworm main",
      lang === 'it' ? "Repository sicurezza: security.debian.org/debian-security bookworm-security" : "Dépôt sécurité : security.debian.org/debian-security"
    ];
  };

  const [terminalLogs, setTerminalLogs] = useState<string[]>(() => 
    getSystemLogs(profile.operatingSystem || 'debian', profile.language)
  );

  useEffect(() => {
    if (!isUpdatingSystem && !isCheckingUpdates) {
      setTerminalLogs(getSystemLogs(profile.operatingSystem || 'debian', profile.language));
    }
  }, [profile.operatingSystem, profile.language]);

  // 4. Verified Apps State
  const [apps, setApps] = useState<VerifiedApp[]>(() => {
    const saved = localStorage.getItem('tournesol_apps');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return verifiedAppsList;
  });

  useEffect(() => {
    localStorage.setItem('tournesol_apps', JSON.stringify(apps));
  }, [apps]);

  const [installingAppId, setInstallingAppId] = useState<string | null>(null);

  // 5. Timetable State
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('tournesol_timetable');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const mode = localStorage.getItem('tournesol_profile_mode');
    return mode === 'clean' ? [] : initialTimetable;
  });

  useEffect(() => {
    localStorage.setItem('tournesol_timetable', JSON.stringify(timetable));
  }, [timetable]);

  // 6. Homework State
  const [homework, setHomework] = useState<HomeworkItem[]>(() => {
    const saved = localStorage.getItem('tournesol_homework');
    if (saved) {
      try {
        const parsed: HomeworkItem[] = JSON.parse(saved);
        const seen = new Set<string>();
        return parsed.map((item, idx) => {
          let uniqueId = item.id;
          if (!uniqueId || seen.has(uniqueId)) {
            uniqueId = `hw-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`;
          }
          seen.add(uniqueId);
          return { ...item, id: uniqueId };
        });
      } catch {}
    }
    const mode = localStorage.getItem('tournesol_profile_mode');
    return mode === 'clean' ? [] : initialHomework;
  });

  useEffect(() => {
    localStorage.setItem('tournesol_homework', JSON.stringify(homework));
  }, [homework]);

  // 7. Grades State
  const [grades, setGrades] = useState<GradeItem[]>(() => {
    const saved = localStorage.getItem('tournesol_grades');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tournesol_grades', JSON.stringify(grades));
  }, [grades]);

  // Sync sound setting
  useEffect(() => {
    soundFx.enabled = profile.soundEffects;
  }, [profile.soundEffects]);

  // Handlers for Updates
  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    const cmd = profile.operatingSystem === 'fedora' ? 'dnf check-update' : profile.operatingSystem === 'arch' ? 'pacman -Sy' : profile.operatingSystem === 'macos' ? 'brew update' : 'apt-get update';
    setTerminalLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] $ ${cmd}`,
      isIt ? "Verifica firme crittografiche e integrità..." : "Vérification des signatures et de l'intégrité...",
      isIt ? "Tutti i cataloghi sono aggiornati e sicuri." : "Tous les paquets sont à jour et vérifiés."
    ]);

    await new Promise(r => setTimeout(r, 1000));
    setIsCheckingUpdates(false);
  };

  const handleApplyUpdates = async (mode: 'security' | 'all') => {
    setIsUpdatingSystem(true);
    setUpdateProgress(15);
    const cmd = profile.operatingSystem === 'fedora' ? 'dnf upgrade -y' : profile.operatingSystem === 'arch' ? 'pacman -Syu --noconfirm' : profile.operatingSystem === 'macos' ? 'brew upgrade' : 'apt-get upgrade -y';

    setTerminalLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] $ ${cmd}`,
      isIt ? "Scaricamento pacchetti verificati..." : "Téléchargement des paquets vérifiés..."
    ]);

    await new Promise(r => setTimeout(r, 600));
    setUpdateProgress(55);

    setTerminalLogs(prev => [
      ...prev,
      isIt ? "Verifica hash SHA256 e applicazione patch..." : "Vérification SHA256 et installation..."
    ]);

    await new Promise(r => setTimeout(r, 600));
    setUpdateProgress(85);

    await new Promise(r => setTimeout(r, 400));
    setUpdateProgress(100);

    setTerminalLogs(prev => [
      ...prev,
      isIt ? "✅ Operazione completata. Il computer è protetto e stabile." : "✅ Opération terminée. Le système est protégé et stable.",
      isIt ? "Pulizia cache e pacchetti orfani completata." : "Nettoyage du cache terminé."
    ]);

    if (mode === 'security') {
      setUpdates(prev => prev.filter(u => u.severity !== 'critical-security'));
    } else {
      setUpdates([]);
    }

    setIsUpdatingSystem(false);
  };

  // Handlers for Apps
  const handleInstallApp = async (appId: string) => {
    setInstallingAppId(appId);
    await new Promise(r => setTimeout(r, 1000));
    setApps(prev => prev.map(a => a.id === appId ? { ...a, isInstalled: true } : a));
    setInstallingAppId(null);
  };

  // Handlers for Timetable
  const handleToggleWeek = () => {
    setProfile(prev => ({
      ...prev,
      currentWeek: prev.currentWeek === 'A' ? 'B' : 'A'
    }));
  };

  const handleAddSlot = (newSlot: Omit<TimetableSlot, 'id'>) => {
    const id = `slot-${Date.now()}`;
    setTimetable(prev => [...prev, { ...newSlot, id }]);
  };

  const handleBatchAddSlots = (newSlots: Array<Omit<TimetableSlot, 'id'>>) => {
    const formatted: TimetableSlot[] = newSlots.map((slot, i) => ({
      ...slot,
      id: `slot-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`
    }));
    setTimetable(prev => [...prev, ...formatted]);
  };

  const handleDeleteSlot = (id: string) => {
    setTimetable(prev => prev.filter(s => s.id !== id));
  };

  // Handlers for Homework
  const handleToggleHomework = (id: string) => {
    setHomework(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const handleAddHomework = (item: Omit<HomeworkItem, 'id' | 'completed'>) => {
    const id = `hw-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setHomework(prev => [{ ...item, id, completed: false }, ...prev]);
  };

  const handleAddBatchHomework = (items: Array<Omit<HomeworkItem, 'id' | 'completed'>>) => {
    const newItems: HomeworkItem[] = items.map((item, idx) => ({
      ...item,
      id: `hw-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 9)}`,
      completed: false
    }));
    setHomework(prev => [...newItems, ...prev]);
  };

  const handleDeleteHomework = (id: string) => {
    setHomework(prev => prev.filter(h => h.id !== id));
  };

  // Handlers for Grades
  const handleAddGrade = (grade: Omit<GradeItem, 'id'>) => {
    const id = `grade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setGrades(prev => [{ ...grade, id }, ...prev]);
  };

  const handleDeleteGrade = (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  // Active Study Session
  const [activeStudyHomeworkId, setActiveStudyHomeworkId] = useState<string | null>(null);
  const activeStudyHomework = homework.find(h => h.id === activeStudyHomeworkId) || null;

  const handleStartStudy = (item: HomeworkItem) => {
    setActiveStudyHomeworkId(item.id);
    setActiveTab('study');
    soundFx.playClick();
  };

  const handleCompleteActiveStudy = (homeworkId: string) => {
    setHomework(prev => prev.map(h => h.id === homeworkId ? { ...h, completed: true } : h));
    setActiveStudyHomeworkId(null);
    soundFx.playSuccess();
  };

  const handleSelectStudyHomework = (homeworkId: string | null) => {
    setActiveStudyHomeworkId(homeworkId);
  };

  // Profile Updates & Curriculum Pack Switcher
  const handleUpdateProfile = (newProfile: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  const handleSelectCurriculumPack = (packId: string) => {
    setProfile(prev => {
      let grade = prev.gradeLevel;
      if (packId.includes('3eme')) grade = '3ème';
      else if (packId.includes('4eme')) grade = '4ème';
      else if (packId.includes('5eme')) grade = '5ème';
      else if (packId.includes('lycee')) grade = 'Lycée (2nde)';
      return { ...prev, activePackId: packId, gradeLevel: grade };
    });
  };

  const handleSetMode = (mode: 'demo' | 'clean') => {
    localStorage.setItem('tournesol_mode_selected', 'true');
    setProfileMode(mode);
    if (mode === 'clean') {
      setHomework([]);
      setTimetable([]);
      setGrades([]);
      setUpdates([]);
      setProfile(initialProfile);
      localStorage.removeItem('tournesol_homework');
      localStorage.removeItem('tournesol_timetable');
      localStorage.removeItem('tournesol_grades');
      localStorage.removeItem('tournesol_updates');
    } else {
      setHomework(initialHomework);
      setTimetable(initialTimetable);
      setGrades([]);
      setUpdates(initialUpdates);
      setProfile(initialProfile);
    }
    soundFx.playSuccess();
  };

  const handleResetAllData = () => {
    setProfile(initialProfile);
    setUpdates(initialUpdates);
    setApps(verifiedAppsList);
    setTimetable(initialTimetable);
    setHomework(initialHomework);
    localStorage.removeItem('tournesol_study_notes');
    localStorage.removeItem('tournesol_installed_packs');
    localStorage.removeItem('tournesol_study_history');
    localStorage.removeItem('tournesol_quiz_mistakes');
  };

  const handleRestoreBackup = (backupData: any) => {
    if (!backupData || typeof backupData !== 'object') return;
    if (backupData.profile) setProfile(backupData.profile);
    if (Array.isArray(backupData.homework)) setHomework(backupData.homework);
    if (Array.isArray(backupData.timetable)) setTimetable(backupData.timetable);
    if (backupData.studyNotes) localStorage.setItem('tournesol_study_notes', backupData.studyNotes);
    if (backupData.installedPacks) localStorage.setItem('tournesol_installed_packs', typeof backupData.installedPacks === 'string' ? backupData.installedPacks : JSON.stringify(backupData.installedPacks));
    if (backupData.studyHistory) localStorage.setItem('tournesol_study_history', typeof backupData.studyHistory === 'string' ? backupData.studyHistory : JSON.stringify(backupData.studyHistory));
    if (backupData.quizMistakes) localStorage.setItem('tournesol_quiz_mistakes', typeof backupData.quizMistakes === 'string' ? backupData.quizMistakes : JSON.stringify(backupData.quizMistakes));
  };

  const [diskBackupFound, setDiskBackupFound] = useState<any | null>(null);
  const [isDiskInitialized, setIsDiskInitialized] = useState(false);

  useEffect(() => {
    // Request persistent storage so browser never auto-evicts data on cache cleanup
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }

    // Auto-heal / detect saved state from local PC disk
    backupService.loadFromDiskServer().then(diskData => {
      if (diskData && (diskData.profile || diskData.homework)) {
        setDiskBackupFound(diskData);
      }
      setIsDiskInitialized(true);
    }).catch(() => {
      setIsDiskInitialized(true);
    });
  }, []);

  // Debounced auto-save directly to PC hard disk via local Node.js server (only after initialization)
  useEffect(() => {
    if (!isDiskInitialized) return;
    if (profileMode === 'demo') return; // Do not backup demo data to user's disk
    const timer = setTimeout(() => {
      const payload = backupService.createFullBackupPayload(profile, homework, timetable);
      backupService.saveToDiskServer(payload);
    }, 3500);
    return () => clearTimeout(timer);
  }, [profile, homework, timetable, isDiskInitialized]);

  const hasCriticalUpdates = updates.some(u => u.severity === 'critical-security');
  const pendingHomeworkCount = homework.filter(h => !h.completed).length;

  if (bootState === 'booting') {
    return (
      <div className="min-h-screen bg-[#FFFDF0] flex flex-col items-center justify-center font-sans p-4">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 text-center">
          <span className="text-6xl mb-4 animate-bounce">🌻</span>
          <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Tournesol</h1>
          <p className="text-sm font-bold text-amber-700 mb-2 bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-200">
            {isIt ? 'Verifica del quaderno in corso...' : 'Vérification du carnet de bord...'}
          </p>
          <p className="text-xs text-slate-500 font-medium mb-6">
            {isIt ? 'Caricamento dello spazio scolastico protetto' : 'Chargement de votre espace scolaire sécurisé'}
          </p>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (bootState === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 border border-slate-100">
          
          {/* Top Bar with Language Selector (French by default, switchable for testing) */}
          <div className="bg-amber-400/90 px-6 pt-5 pb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 text-amber-950 text-xs font-bold">
              <span>🌻</span>
              <span>Tournesol Scolaire</span>
            </span>

            <div className="flex items-center bg-amber-500/40 p-0.5 rounded-xl text-xs font-bold border border-amber-600/30">
              <button
                type="button"
                onClick={() => handleSetLanguage('fr')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  !isIt ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-amber-950/70 hover:text-amber-950'
                }`}
                title="Passer en Français"
              >
                🇫🇷 FR
              </button>
              <button
                type="button"
                onClick={() => handleSetLanguage('it')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  isIt ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-amber-950/70 hover:text-amber-950'
                }`}
                title="Passa in Italiano"
              >
                🇮🇹 IT
              </button>
            </div>
          </div>

          {/* Banner Hero */}
          <div className="bg-amber-400 px-8 pb-8 pt-3 sm:px-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
            <span className="text-7xl relative z-10 drop-shadow-md">🌻</span>
            <h1 className="text-3xl sm:text-4xl font-black text-amber-950 mt-3 relative z-10 tracking-tight">
              {isIt ? 'Benvenuto su Tournesol!' : 'Bienvenue sur Tournesol !'}
            </h1>
            <p className="text-amber-950/90 font-bold mt-2 text-sm sm:text-base relative z-10 max-w-lg mx-auto leading-relaxed">
              {isIt 
                ? 'Il tuo compagno scolastico libero, intelligente e 100% privato.' 
                : 'Votre carnet de bord scolaire libre, intelligent et 100% privé.'}
            </p>
          </div>
          
          <div className="p-6 sm:p-10 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <span className="text-xl">👋</span> 
                {isIt ? 'Come preferisci iniziare l\'anno?' : 'Comment souhaitez-vous démarrer ?'}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {isIt 
                  ? 'Tournesol funziona direttamente su questo dispositivo senza bisogno di account e senza pubblicità. Abbiamo preparato un ambiente con dati di prova (compiti e orari) per esplorare l\'app in libertà. Oppure puoi iniziare subito con il tuo quaderno personale pulito!'
                  : 'Tournesol fonctionne entièrement sur votre appareil : aucune création de compte n\'est requise et aucune donnée n\'est collectée. Vous pouvez explorer l\'application avec un exemple prêt à l\'emploi, ou démarrer directement avec votre carnet personnel vierge.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  handleSetMode('demo');
                  setBootState('ready');
                }}
                className="group p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 transition-all text-left flex flex-col gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl group-hover:scale-110 transition-transform origin-left">🧪</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                    {isIt ? 'Modalità Demo' : 'Mode Démo'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm">
                    {isIt ? 'Esplora con dati di esempio' : 'Découvrir avec des exemples'}
                  </h4>
                  <p className="text-xs text-indigo-700/80 font-medium mt-1 leading-relaxed">
                    {isIt 
                      ? 'Compiti, orario scolastico e schede di studio finti per provare ogni funzione senza paura.' 
                      : 'Cahier de textes, emploi du temps modèle et révisions pré-remplis pour tout essayer sans risque.'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  handleSetMode('clean');
                  setBootState('ready');
                  setTimeout(() => setIsProfileModalOpen(true), 600);
                }}
                className="group p-5 rounded-2xl border-2 border-amber-100 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 transition-all text-left flex flex-col gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl group-hover:scale-110 transition-transform origin-left">🚀</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    {isIt ? 'Personale' : 'Personnel'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">
                    {isIt ? 'Inizia il mio quaderno' : 'Créer mon carnet personnel'}
                  </h4>
                  <p className="text-xs text-amber-800/80 font-medium mt-1 leading-relaxed">
                    {isIt 
                      ? 'Crea un quaderno pulito: imposta la tua classe e inserisci i tuoi veri orari e compiti.' 
                      : 'Carnet vierge prêt à l\'emploi : configurez votre classe et notez vos vrais cours dès aujourd\'hui.'}
                  </p>
                </div>
              </button>
            </div>
            
            <p className="text-center text-xs text-slate-500 font-semibold">
              {isIt 
                ? '💡 Potrai sempre passare da una modalità all\'altra nella scheda Impostazioni' 
                : '💡 Vous pourrez toujours basculer entre la démonstration et votre carnet dans l\'onglet Paramètres'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-theme={profile.theme}
      className={`min-h-screen ${theme.pageBg} ${theme.bodyText} flex flex-col font-sans transition-colors duration-200 antialiased overflow-x-hidden w-full max-w-full`}
    >
      {/* Top Main Navigation Header */}
      <div className="print:hidden">
        <Header
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setLanguage={handleSetLanguage}
          setTheme={(themeVar: ThemeVariant) => setProfile(p => ({ ...p, theme: themeVar }))}
          toggleSound={() => setProfile(p => ({ ...p, soundEffects: !p.soundEffects }))}
          hasCriticalUpdates={hasCriticalUpdates}
          pendingHomeworkCount={pendingHomeworkCount}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
          onOpenDesktopWindowModal={() => setIsDesktopWindowModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-6 md:py-8 flex-1 overflow-x-hidden">
        {/* Automatic Backup Reminder Banner */}
        <div className="print:hidden mb-6">
          <AutoBackupReminder
            profile={profile}
            homework={homework}
            timetable={timetable}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>

        {/* Banner Modalità Demo */}
        {profileMode === 'demo' && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 print:hidden">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5 shrink-0">👀</span>
              <div>
                <h4 className="font-bold text-sm text-indigo-900">
                  {isIt ? "Sei in Modalità Demo (Dati di prova)" : "Vous êtes en mode Démo (Données de test)"}
                </h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  {isIt ? "L'app mostra compiti e orari di esempio per illustrarne il funzionamento." : "L'application affiche des devoirs et horaires d'exemple."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleSetMode('clean')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                🧹 {isIt ? "Inizia da zero con i tuoi dati" : "Commencer de zéro"}
              </button>
            </div>
          </div>
        )}

        {/* Disk Backup Quick-Recovery Banner (if a valid backup exists on PC disk) */}
        {diskBackupFound && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-600 animate-in fade-in slide-in-from-top-2 print:hidden">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5 shrink-0">💾</span>
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-1.5 flex-wrap">
                  <span>{isIt ? 'I tuoi dati sono al sicuro! Backup trovato su disco' : 'Vos données sont en sécurité !'}</span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
                    tournesol_dati_disco.json
                  </span>
                </h4>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  {isIt
                    ? `Scuola: ${diskBackupFound.profile?.schoolName || 'Collège Victor Hugo'} • ${diskBackupFound.profile?.gradeLevel || '4ème'} • ${diskBackupFound.homework?.length || 0} compiti • ${diskBackupFound.timetable?.length || 0} lezioni orario.`
                    : `Établissement : ${diskBackupFound.profile?.schoolName || 'Collège'} • ${diskBackupFound.homework?.length || 0} devoirs • ${diskBackupFound.timetable?.length || 0} cours.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  handleRestoreBackup(diskBackupFound);
                  setDiskBackupFound(null);
                  soundFx.playSuccess();
                }}
                className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs shadow-xs hover:bg-emerald-50 transition cursor-pointer"
              >
                {isIt ? 'Ripristina Subito i Tuoi Dati' : 'Restaurer Mes Données'}
              </button>
              <button
                type="button"
                onClick={() => setDiskBackupFound(null)}
                className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white text-xs transition cursor-pointer"
                title={isIt ? 'Nascondi avviso' : 'Masquer'}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 1. Compiti (In Evidenza) */}
        {activeTab === 'homework' && (
          <HomeworkTab
            profile={profile}
            homework={homework}
            onToggleHomework={handleToggleHomework}
            onAddHomework={handleAddHomework}
            onAddBatchHomework={handleAddBatchHomework}
            onDeleteHomework={handleDeleteHomework}
            activeStudyHomeworkId={activeStudyHomeworkId}
            onStartStudy={handleStartStudy}
          />
        )}

        {/* 2. Orario della Settimana */}
        {activeTab === 'timetable' && (
          <SchoolTimetableTab
            profile={profile}
            timetable={timetable}
            onToggleWeek={handleToggleWeek}
            onAddSlot={handleAddSlot}
            onDeleteSlot={handleDeleteSlot}
            onBatchAddSlots={handleBatchAddSlots}
            onAddBatchHomework={handleAddBatchHomework}
          />
        )}

        {/* Moyenne / Voti */}
        {activeTab === 'moyenne' && (
          <MoyenneTab
            profile={profile}
            grades={grades}
            onAddGrade={handleAddGrade}
            onDeleteGrade={handleDeleteGrade}
          />
        )}

        {/* 3. Scambio Cellulare & Pronote (LocalSend) */}
        {activeTab === 'transfer' && (
          <MobileTransferTab
            profile={profile}
            onAddHomework={handleAddHomework}
            onAddBatchHomework={handleAddBatchHomework}
            onAddTimetableSlot={handleAddSlot}
            onBatchAddSlots={handleBatchAddSlots}
            homework={homework}
            timetable={timetable}
          />
        )}

        {/* 4. Strumenti di Studio */}
        {activeTab === 'study' && (
          <StudyToolsTab
            profile={profile}
            activeStudyHomework={activeStudyHomework}
            homeworkList={homework}
            onCompleteHomework={handleCompleteActiveStudy}
            onSelectHomework={handleSelectStudyHomework}
            onClearActiveHomework={() => setActiveStudyHomeworkId(null)}
          />
        )}

        {/* 5. Aggiornamenti del Computer (OS-Agnostic) */}
        {activeTab === 'updates' && (
          <UpdatesTab
            profile={profile}
            updates={updates}
            onApplyUpdates={handleApplyUpdates}
            onCheckUpdates={handleCheckUpdates}
            isChecking={isCheckingUpdates}
            isUpdating={isUpdatingSystem}
            updateProgress={updateProgress}
            terminalLogs={terminalLogs}
            onChangeOS={(os) => setProfile(p => ({ ...p, operatingSystem: os }))}
            onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
          />
        )}

        {/* 6. Edu-Hub & Software per la Scuola (GitHub Discovery & Packs) */}
        {activeTab === 'apps' && (
          <AppStoreTab
            profile={profile}
            apps={apps}
            onInstallApp={handleInstallApp}
            installingAppId={installingAppId}
            onSelectCurriculumPack={handleSelectCurriculumPack}
            onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
          />
        )}

        {/* 7. Impostazioni */}
        {activeTab === 'settings' && (
          <SettingsTab
            profile={profile}
            homework={homework}
            timetable={timetable}
            onUpdateProfile={handleUpdateProfile}
            onResetAllData={handleResetAllData}
            onRestoreBackup={handleRestoreBackup}
            onSetMode={handleSetMode}
            profileMode={profileMode}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
            onOpenDesktopWindowModal={() => setIsDesktopWindowModalOpen(true)}
          />
        )}
      </main>

      {/* Profile & Onboarding Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
        onOpenBridgeModal={() => {
          setIsProfileModalOpen(false);
          setIsBridgeModalOpen(true);
        }}
      />

      {/* Local System Bridge Modal */}
      <BridgeStatusModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        os={profile.operatingSystem}
        language={profile.language}
      />

      {/* Standalone Window & Desktop Launcher Modal */}
      <DesktopWindowGuideModal
        isOpen={isDesktopWindowModalOpen}
        onClose={() => setIsDesktopWindowModalOpen(false)}
        language={profile.language}
      />

      {/* Footer */}
      <footer className={`border-t ${theme.headerBorder} ${theme.subHeaderBg} py-3 px-4 sm:px-6 text-xs ${theme.mutedText}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-center md:text-left">
          {/* Project Identity & Educational Purpose */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🌻</span>
              <span>Tournesol</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-600 font-medium">
              {isIt 
                ? 'Progetto sperimentale libero creato per aiutare gli studenti a organizzarsi e studiare con serenità.'
                : 'Projet éducatif ouvert conçu pour accompagner les élèves dans leur organisation et leurs révisions.'}
            </span>
          </div>

          {/* Privacy & Offline Guarantee */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 font-semibold shrink-0">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {isIt ? '100% Locale & Riservato' : '100% Hors-ligne & Privé'}
            </span>
            <span>•</span>
            <span>{isIt ? 'Nessun dato raccolto' : 'Zéro donnée collectée'}</span>
            <span>•</span>
            <span className="text-slate-400">{profile.gradeLevel}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
