/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Header } from './components/Header';
import { AutoBackupReminder } from './components/common/AutoBackupReminder';
import { SunflowerGraphic } from './components/common/SunflowerGraphic';

/**
 * Code-splitting: tabs and modals are loaded on demand so the first paint only
 * ships the application shell. All chunks are same-origin and are precached by
 * the service worker, so navigating offline keeps working.
 */
const HomeworkTab = lazy(() =>
  import('./components/tabs/HomeworkTab').then((m) => ({ default: m.HomeworkTab }))
);
const SchoolTimetableTab = lazy(() =>
  import('./components/tabs/SchoolTimetableTab').then((m) => ({ default: m.SchoolTimetableTab }))
);
const StudyToolsTab = lazy(() =>
  import('./components/tabs/StudyToolsTab').then((m) => ({ default: m.StudyToolsTab }))
);
const MoyenneTab = lazy(() =>
  import('./components/tabs/MoyenneTab').then((m) => ({ default: m.MoyenneTab }))
);
const UpdatesTab = lazy(() =>
  import('./components/tabs/UpdatesTab').then((m) => ({ default: m.UpdatesTab }))
);
const AppStoreTab = lazy(() =>
  import('./components/tabs/AppStoreTab').then((m) => ({ default: m.AppStoreTab }))
);
const MobileTransferTab = lazy(() =>
  import('./components/tabs/MobileTransferTab').then((m) => ({ default: m.MobileTransferTab }))
);
const SettingsTab = lazy(() =>
  import('./components/tabs/SettingsTab').then((m) => ({ default: m.SettingsTab }))
);
const ProfileModal = lazy(() =>
  import('./components/ProfileModal').then((m) => ({ default: m.ProfileModal }))
);
const BridgeStatusModal = lazy(() =>
  import('./components/BridgeStatusModal').then((m) => ({ default: m.BridgeStatusModal }))
);
const DesktopWindowGuideModal = lazy(() =>
  import('./components/modals/DesktopWindowGuideModal').then((m) => ({
    default: m.DesktopWindowGuideModal
  }))
);

/** Lightweight placeholder shown while a tab chunk is being fetched. */
const SectionFallback: React.FC = () => (
  <div className="animate-pulse space-y-4 py-2" aria-busy="true" aria-live="polite">
    <div className="h-24 rounded-3xl bg-white border border-slate-200" />
    <div className="h-40 rounded-3xl bg-white border border-slate-200" />
  </div>
);

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
import { schoolAutoSync } from './services/schoolAutoSync';
import { schoolSyncState } from './services/schoolSyncState';

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
    const userHasExplicitlyChosenLang = localStorage.getItem('tournesol_lang_chosen') === 'true';
    const saved = backupService.readProfileFromLocal();
    if (saved) {
      const merged = { ...initialProfile, ...saved };
      // Legacy placeholder names from older versions.
      if (merged.name === 'Marieme Dieye' || merged.name === 'Marieme' || merged.name === 'Studente') {
        merged.name = 'Élève';
      }
      if (!userHasExplicitlyChosenLang) merged.language = 'fr';
      return merged;
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
    // Validated read: a corrupted value is dropped, then the last snapshot is restored.
    const local = backupService.readTimetableFromLocal();
    if (local) return local;
    if (backupService.getRecoveryNotice() === 'timetable') {
      const snapshot = backupService.latestSnapshotData();
      if (snapshot?.timetable) return snapshot.timetable;
      return [];
    }
    const mode = localStorage.getItem('tournesol_profile_mode');
    return mode === 'clean' ? [] : initialTimetable;
  });

  useEffect(() => {
    localStorage.setItem('tournesol_timetable', JSON.stringify(timetable));
  }, [timetable]);

  // 6. Homework State
  const [homework, setHomework] = useState<HomeworkItem[]>(() => {
    const local = backupService.readHomeworkFromLocal();
    if (local) {
      // Guarantee unique ids even inside an otherwise valid array.
      const seen = new Set<string>();
      return local.map((item, idx) => {
        let uniqueId = item.id;
        if (!uniqueId || seen.has(uniqueId)) {
          uniqueId = `hw-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`;
        }
        seen.add(uniqueId);
        return { ...item, id: uniqueId };
      });
    }
    if (backupService.getRecoveryNotice() === 'homework') {
      const snapshot = backupService.latestSnapshotData();
      if (snapshot?.homework) return snapshot.homework;
      return [];
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
      isIt ? "Simulazione locale: nessun comando viene eseguito." : "Simulation locale : aucune commande n'est exécutée.",
      isIt ? "Usa « Copia comando » per aggiornare davvero il sistema." : "Utilisez « Copier la commande » pour mettre à jour le système."
    ]);

    await new Promise(r => setTimeout(r, 1000));
    setIsCheckingUpdates(false);
  };

  const handleApplyUpdates = async (mode: 'security' | 'all') => {
    setIsUpdatingSystem(true);
    setUpdateProgress(15);
    const cmd = profile.operatingSystem === 'fedora' ? 'dnf upgrade -y' : profile.operatingSystem === 'arch' ? 'pacman -Syu --noconfirm' : profile.operatingSystem === 'macos' ? 'brew upgrade' : 'apt-get upgrade -y';
    const scope = mode === 'security' ? (isIt ? 'sicurezza' : 'sécurité') : (isIt ? 'completo' : 'complet');

    setTerminalLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] $ ${cmd}`,
      isIt
        ? `Simulazione aggiornamento ${scope}: nessun comando viene eseguito.`
        : `Simulation de mise à jour ${scope} : aucune commande n'est exécutée.`
    ]);

    await new Promise(r => setTimeout(r, 600));
    setUpdateProgress(55);

    await new Promise(r => setTimeout(r, 600));
    setUpdateProgress(85);

    await new Promise(r => setTimeout(r, 400));
    setUpdateProgress(100);

    setTerminalLogs(prev => [
      ...prev,
      isIt
        ? "⚠️ Anteprima completata. Copia il comando e avvialo nel terminale per applicare davvero gli aggiornamenti."
        : "⚠️ Aperçu terminé. Copiez la commande et exécutez-la dans le terminal pour appliquer les mises à jour."
    ]);

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
    // Never trust imported JSON: validate types and sizes before touching the state.
    const clean = backupService.sanitizeBackup(backupData);
    if (!clean) return;
    if (clean.profile) setProfile(prev => ({ ...prev, ...clean.profile }));
    if (clean.homework) setHomework(clean.homework);
    if (clean.timetable) setTimetable(clean.timetable);
    if (clean.studyNotes !== null) localStorage.setItem('tournesol_study_notes', clean.studyNotes);
    if (clean.installedPacks !== null) localStorage.setItem('tournesol_installed_packs', clean.installedPacks);
    if (clean.studyHistory !== null) localStorage.setItem('tournesol_study_history', clean.studyHistory);
    if (clean.quizMistakes !== null) localStorage.setItem('tournesol_quiz_mistakes', clean.quizMistakes);
    if (clean.srsCards !== null) localStorage.setItem('tournesol_srs_cards', clean.srsCards);
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
        // If the browser wiped its storage, restore the PC copy silently instead
        // of letting the auto-save overwrite it with empty data.
        const localWasEmpty =
          localStorage.getItem('tournesol_homework') === null &&
          localStorage.getItem('tournesol_timetable') === null;
        const clean = localWasEmpty ? backupService.sanitizeBackup(diskData) : null;

        if (clean && ((clean.homework?.length ?? 0) > 0 || (clean.timetable?.length ?? 0) > 0)) {
          if (clean.homework) setHomework(clean.homework);
          if (clean.timetable) setTimetable(clean.timetable);
          if (clean.profile) setProfile(prev => ({ ...prev, ...clean.profile }));
          setRecoveryNotice('disk');
        } else {
          setDiskBackupFound(diskData);
        }
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

  // Silent school-calendar refresh: local copy first, at most one download per day.
  const latestDataRef = useRef({ homework, timetable, isIt });
  const autoSyncStarted = useRef(false);
  const [autoSyncNotice, setAutoSyncNotice] = useState<string | null>(null);
  const [syncState, setSyncState] = useState(() => schoolSyncState.get());
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(() =>
    backupService.getRecoveryNotice()
  );

  useEffect(() => {
    latestDataRef.current = { homework, timetable, isIt };
  }, [homework, timetable, isIt]);

  useEffect(() => {
    if (bootState !== 'ready' || profileMode === 'demo') return;
    const timer = setTimeout(async () => {
      if (autoSyncStarted.current) return;
      autoSyncStarted.current = true;

      const snapshot = latestDataRef.current;
      const result = await schoolAutoSync.run();
      // Refresh the "last update" indicator even when nothing new arrived.
      setSyncState(schoolSyncState.get());
      if (!result) return;

      const hwKey = (h: { subject: string; title: string; dueDate: string }) =>
        `${h.subject}|${h.title}|${h.dueDate}`;
      const slotKey = (s: { day: string; startTime: string; subject: string }) =>
        `${s.day}|${s.startTime}|${s.subject}`;

      const knownHomework = new Set(snapshot.homework.map(hwKey));
      const knownSlots = new Set(snapshot.timetable.map(slotKey));
      const newHomework = result.homework.filter(h => !knownHomework.has(hwKey(h)));
      const newSlots = result.slots.filter(s => !knownSlots.has(slotKey(s)));

      if (newHomework.length > 0) handleAddBatchHomework(newHomework);
      if (newSlots.length > 0) handleBatchAddSlots(newSlots);

      if (newHomework.length > 0 || newSlots.length > 0) {
        setAutoSyncNotice(
          snapshot.isIt
            ? `Calendario scolastico aggiornato dal PC: ${newSlots.length} lezioni e ${newHomework.length} compiti.`
            : `Emploi du temps mis à jour depuis le PC : ${newSlots.length} cours et ${newHomework.length} devoirs.`
        );
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [bootState, profileMode]);

  const hasCriticalUpdates = updates.some(u => u.severity === 'critical-security');
  const pendingHomeworkCount = homework.filter(h => !h.completed).length;

  if (bootState === 'booting') {
    return (
      <div className="min-h-screen bg-[#FFFDF0] flex flex-col items-center justify-center font-sans p-4">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 text-center">
          <div className="w-24 h-24 mb-4 rounded-full bg-white/95 shadow-md border-2 border-amber-200/90 flex items-center justify-center p-2.5 animate-bounce">
            <SunflowerGraphic className="w-full h-full drop-shadow-xs" />
          </div>
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
              <span className="w-4 h-4 inline-flex items-center justify-center">
                <SunflowerGraphic className="w-full h-full" />
              </span>
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

          {/* Banner Hero with High-Contrast Sunflower Medallion */}
          <div className="bg-amber-400 px-8 pb-8 pt-3 sm:px-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
            
            {/* Sunflower Medallion: crisp, delicate petal contours and perfect contrast */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 rounded-full bg-white/95 shadow-lg border-2 border-amber-300/80 flex items-center justify-center p-2.5 relative z-10 hover:scale-105 transition-transform duration-300">
              <SunflowerGraphic className="w-full h-full drop-shadow-xs" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-amber-950 mt-1 relative z-10 tracking-tight">
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

            {/* Two Central Action Cards: Clear, Intuitive, Reassuring */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: Démo / Esempi */}
              <button
                type="button"
                onClick={() => {
                  handleSetMode('demo');
                  setBootState('ready');
                }}
                className="group relative p-5 rounded-2xl border-2 border-indigo-200/90 hover:border-indigo-400 bg-gradient-to-b from-indigo-50/70 to-indigo-50/20 hover:from-indigo-50 hover:to-indigo-100/50 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      👀
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {isIt ? 'Solo per curiosare' : 'Idéal pour tester'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-indigo-950 text-base mb-1.5">
                    {isIt ? 'Guarda gli esempi' : 'Voir des exemples'}
                  </h4>

                  <p className="text-xs text-indigo-900/80 font-medium leading-relaxed">
                    {isIt 
                      ? 'Trovi compiti finti, materie e orari già compilati. Ti serve per capire come funziona l\'app in piena tranquillità.' 
                      : 'Des cours, des devoirs types et un emploi du temps sont déjà remplis. Parfait pour découvrir l\'outil sans hésiter.'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-indigo-100/80 flex items-center justify-between text-xs font-bold text-indigo-700 group-hover:text-indigo-900">
                  <span>{isIt ? 'Esplora la demo' : 'Explorer la démo'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>

              {/* Option 2: Personnel / Quaderno Nuovo */}
              <button
                type="button"
                onClick={() => {
                  handleSetMode('clean');
                  setBootState('ready');
                  setTimeout(() => setIsProfileModalOpen(true), 600);
                }}
                className="group relative p-5 rounded-2xl border-2 border-amber-300 hover:border-amber-500 bg-gradient-to-b from-amber-50/80 to-amber-50/20 hover:from-amber-100/60 hover:to-amber-50 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ring-2 ring-amber-400/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-amber-200/90 text-amber-900 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-2xs">
                      🚀
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {isIt ? 'Consigliato' : 'Recommandé'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-amber-950 text-base mb-1.5">
                    {isIt ? 'Inizia per davvero' : 'Commencer pour de vrai'}
                  </h4>

                  <p className="text-xs text-amber-900/85 font-medium leading-relaxed">
                    {isIt 
                      ? 'Un quaderno tutto nuovo e pulito: inserisci i tuoi veri orari di scuola, le tue materie e i tuoi compiti di ogni giorno.' 
                      : 'Un carnet tout neuf et vierge pour votre rentrée : saisissez votre emploi du temps et notez vos vrais cours dès aujourd\'hui.'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-amber-200/80 flex items-center justify-between text-xs font-black text-amber-900">
                  <span>{isIt ? 'Crea il tuo quaderno' : 'Créer mon carnet personnel'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
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

        {/* Data recovered from a corrupted local storage */}
        {recoveryNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-start justify-between gap-3 print:hidden">
            <p className="text-xs font-bold text-sky-900 flex items-start gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" />
              <span className="break-words">
                {isIt
                  ? 'Dati locali danneggiati o mancanti: ho ripristinato l\'ultima copia valida salvata su questo PC.'
                  : 'Données locales corrompues ou manquantes : la dernière copie valide enregistrée sur ce PC a été restaurée.'}
              </span>
            </p>
            <button
              type="button"
              onClick={() => {
                backupService.clearRecoveryNotice();
                setRecoveryNotice(null);
              }}
              className="p-1.5 rounded-lg text-sky-800 hover:bg-sky-100 transition cursor-pointer shrink-0"
              aria-label={isIt ? 'Chiudi avviso' : 'Fermer la notification'}
            >
              ✕
            </button>
          </div>
        )}

        {/* School data getting old: the student should know it explicitly */}
        {syncState.configured && schoolSyncState.isStale(syncState.lastSuccess) && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 print:hidden">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p className="text-xs font-bold text-amber-900 min-w-0 break-words">
              {isIt
                ? `Calendario della scuola non aggiornato (ultimo: ${schoolSyncState.formatLast(syncState.lastSuccess, true)}). Controlla che il Connettore sia attivo, poi sincronizza da Impostazioni.`
                : `Emploi du temps non actualisé (dernier : ${schoolSyncState.formatLast(syncState.lastSuccess, false)}). Vérifiez que le Connecteur est actif, puis synchronisez depuis les Réglages.`}
            </p>
          </div>
        )}

        {/* School calendar refreshed automatically from the local copy on this PC */}
        {autoSyncNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 print:hidden">
            <p className="text-xs font-bold text-emerald-900 flex items-start gap-2 min-w-0">
              <RefreshCw className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="break-words">{autoSyncNotice}</span>
            </p>
            <button
              type="button"
              onClick={() => setAutoSyncNotice(null)}
              className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-100 transition cursor-pointer shrink-0"
              aria-label={isIt ? 'Chiudi avviso' : 'Fermer la notification'}
            >
              ✕
            </button>
          </div>
        )}

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

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
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
        <Suspense fallback={<SectionFallback />}>
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
        </Suspense>
      </main>

      {/* Profile & Onboarding Modal */}
      {isProfileModalOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {/* Local System Bridge Modal */}
      {isBridgeModalOpen && (
        <Suspense fallback={null}>
          <BridgeStatusModal
            isOpen={isBridgeModalOpen}
            onClose={() => setIsBridgeModalOpen(false)}
            os={profile.operatingSystem}
            language={profile.language}
          />
        </Suspense>
      )}

      {/* Standalone Window & Desktop Launcher Modal */}
      {isDesktopWindowModalOpen && (
        <Suspense fallback={null}>
          <DesktopWindowGuideModal
            isOpen={isDesktopWindowModalOpen}
            onClose={() => setIsDesktopWindowModalOpen(false)}
            language={profile.language}
          />
        </Suspense>
      )}

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
