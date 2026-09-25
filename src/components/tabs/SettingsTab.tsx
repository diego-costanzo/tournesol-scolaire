import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  User, 
  Download, 
  Upload,
  RotateCcw, 
  Check, 
  Sparkles, 
  Monitor,
  School,
  Sliders,
  Radio,
  ShieldCheck,
  AppWindow,
  Maximize2,
  HardDrive,
  FileCheck,
  AlertCircle,
  Calendar,
  History,
  Clock,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, ThemeVariant, OperatingSystem, BridgeConnectionStatus, HomeworkItem, TimetableSlot, BackupSnapshot } from '../../types';
import { translations } from '../../i18n/translations';
import { soundFx } from '../../utils/audio';
import { themes } from '../../utils/themeStyles';
import { systemBridge } from '../../services/systemBridge';
import { backupService } from '../../services/backupService';

interface SettingsTabProps {
  profile: StudentProfile;
  homework?: HomeworkItem[];
  timetable?: TimetableSlot[];
  onUpdateProfile: (newProfile: Partial<StudentProfile>) => void;
  onResetAllData: () => void;
  onRestoreBackup?: (backupData: any) => void;
  onOpenProfileModal?: () => void;
  onOpenBridgeModal?: () => void;
  onOpenDesktopWindowModal?: () => void;
  onSetMode: (mode: 'demo' | 'clean') => void;
  profileMode: 'demo' | 'clean';
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  profile,
  homework = [],
  timetable = [],
  onUpdateProfile,
  onResetAllData,
  onRestoreBackup,
  onOpenProfileModal,
  onOpenBridgeModal,
  onOpenDesktopWindowModal,
  onSetMode,
  profileMode
}) => {
  const t = translations[profile.language];
  const isIt = profile.language === 'it';
  const [name, setName] = useState(profile.name);
  const [school, setSchool] = useState(profile.schoolName);
  const [grade, setGrade] = useState(profile.gradeLevel);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeConnectionStatus>(systemBridge.getStatus());
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => backupService.getLocalSnapshots());
  const [diskSavedSuccess, setDiskSavedSuccess] = useState(false);
  const [diskBackupData, setDiskBackupData] = useState<any | null>(null);
  const [isLoadingDiskBackup, setIsLoadingDiskBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if browser storage is persisted
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(status => setIsPersisted(status)).catch(() => {});
    }

    // Check if disk backup exists on server
    backupService.loadFromDiskServer().then(data => {
      if (data && (data.profile || data.homework)) {
        setDiskBackupData(data);
      }
    }).catch(() => {});

    return systemBridge.subscribe((status) => {
      setBridgeStatus(status);
    });
  }, []);

  const handleRestoreSnapshot = (snap: BackupSnapshot) => {
    if (window.confirm(isIt ? `Ripristinare i dati dal punto automatico del ${snap.dateLabel}?` : `Restaurer les données du ${snap.dateLabel} ?`)) {
      if (onRestoreBackup) {
        onRestoreBackup(snap.data);
      }
      if (snap.data?.profile?.name) setName(snap.data.profile.name);
      if (snap.data?.profile?.schoolName) setSchool(snap.data.profile.schoolName);
      if (snap.data?.profile?.gradeLevel) setGrade(snap.data.profile.gradeLevel);
      setRestoreSuccess(true);
      soundFx.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setRestoreSuccess(false), 3500);
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = backupService.deleteSnapshot(id);
    setSnapshots(updated);
    soundFx.playClick();
  };

  const handleRequestPersistence = async () => {
    if (navigator.storage && navigator.storage.persist) {
      try {
        const persisted = await navigator.storage.persist();
        setIsPersisted(persisted);
        soundFx.playSuccess();
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      } catch {
        // Ignore
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    onUpdateProfile({
      name: name.trim() || 'Studente',
      schoolName: school.trim() || 'Collège Victor Hugo',
      gradeLevel: grade
    });
    setSavedSuccess(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    soundFx.playClick();
    const dataToExport = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      profile,
      homework,
      timetable,
      studyNotes: localStorage.getItem('tournesol_study_notes') || '',
      installedPacks: localStorage.getItem('tournesol_installed_packs') || '[]',
      studyHistory: localStorage.getItem('tournesol_study_history') || '[]',
      quizMistakes: localStorage.getItem('tournesol_quiz_mistakes') || '[]'
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (profile.name || 'studente').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `tournesol-backup-${safeName}-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundFx.playSuccess();
    onUpdateProfile({ lastBackupDate: new Date().toISOString() });
  };

  const handleSaveToLocalDisk = async () => {
    soundFx.playClick();
    const payload = backupService.createFullBackupPayload(profile, homework, timetable);
    const res = await backupService.saveToDiskServer(payload);
    if (res.success) {
      setDiskSavedSuccess(true);
      soundFx.playSuccess();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      setTimeout(() => setDiskSavedSuccess(false), 3000);
      setDiskBackupData(payload);
    }
  };

  const handleRestoreFromLocalDisk = async (customData?: any) => {
    soundFx.playClick();
    setIsLoadingDiskBackup(true);
    try {
      const dataToRestore = customData || await backupService.loadFromDiskServer();
      if (dataToRestore && (dataToRestore.profile || dataToRestore.homework || dataToRestore.timetable)) {
        if (onRestoreBackup) {
          onRestoreBackup(dataToRestore);
        }
        if (dataToRestore.profile?.name) setName(dataToRestore.profile.name);
        if (dataToRestore.profile?.schoolName) setSchool(dataToRestore.profile.schoolName);
        if (dataToRestore.profile?.gradeLevel) setGrade(dataToRestore.profile.gradeLevel);
        setRestoreSuccess(true);
        setRestoreError(null);
        soundFx.playSuccess();
        confetti({ particleCount: 65, spread: 70, origin: { y: 0.5 } });
        setTimeout(() => setRestoreSuccess(false), 4500);
      } else {
        setRestoreError(isIt ? 'Nessun file di backup trovato sul disco.' : 'Aucune sauvegarde sur disque.');
        setTimeout(() => setRestoreError(null), 4000);
      }
    } catch {
      setRestoreError(isIt ? 'Errore durante la lettura del backup da disco.' : 'Erreur de lecture du disque.');
      setTimeout(() => setRestoreError(null), 4000);
    } finally {
      setIsLoadingDiskBackup(false);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('File non valido');
        }

        if (onRestoreBackup) {
          onRestoreBackup(parsed);
        }

        if (parsed.profile?.name) setName(parsed.profile.name);
        if (parsed.profile?.schoolName) setSchool(parsed.profile.schoolName);
        if (parsed.profile?.gradeLevel) setGrade(parsed.profile.gradeLevel);

        setRestoreSuccess(true);
        setRestoreError(null);
        soundFx.playSuccess();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
        setTimeout(() => setRestoreSuccess(false), 4000);
      } catch (err) {
        setRestoreError(isIt ? 'File di backup non valido o corrotto' : 'Fichier de sauvegarde invalide ou corrompu');
        setTimeout(() => setRestoreError(null), 4000);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.settings.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.settings.subtitle}
          </p>
        </div>

        {onOpenProfileModal && (
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isIt ? 'Configurazione Guidata & Anno' : 'Assistant Profil & Classe'}</span>
          </button>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isIt ? 'Modalità Dati' : 'Mode des Données'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isIt ? 'Scegli se usare i tuoi dati personali o testare l\'app con dati finti' : 'Choisissez d\'utiliser vos propres données ou des données de test'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => onSetMode('clean')}
            className={`flex-1 flex flex-col items-start p-4 rounded-2xl border text-left transition cursor-pointer ${
              profileMode === 'clean'
                ? 'border-indigo-600 ring-2 ring-indigo-600/10 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-slate-900">🧹 {isIt ? 'Inizia da zero (Dati Personali)' : 'Commencer de zéro (Données Personnelles)'}</span>
              {profileMode === 'clean' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isIt ? 'Pulisce l\'app, disabilita i dati demo e salva solo le tue modifiche.' : 'Nettoie l\'app et la prépare pour votre usage quotidien.'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(isIt ? 'Sei sicuro? I tuoi dati attuali non salvati andranno persi.' : 'Êtes-vous sûr ? Vos données actuelles seront remplacées.')) {
                onSetMode('demo');
              }
            }}
            className={`flex-1 flex flex-col items-start p-4 rounded-2xl border text-left transition cursor-pointer ${
              profileMode === 'demo'
                ? 'border-indigo-600 ring-2 ring-indigo-600/10 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-slate-900">🔄 {isIt ? 'Ricarica dati di esempio (Demo)' : 'Recharger données de test (Démo)'}</span>
              {profileMode === 'demo' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isIt ? 'Popola l\'app con compiti e orari finti per vedere come funziona (nessun auto-salvataggio su disco).' : 'Remplit l\'app avec des données fictives pour tester (pas de sauvegarde auto).'}
            </p>
          </button>
        </div>
      </div>

      {/* Tone on Tone Themes (Amber, Blue, Purple, Orange, Green) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isIt ? 'Palette Colore Tono su Tono (Chiari e Scuri)' : 'Thèmes Ton sur Ton'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isIt ? 'Personalizzazione per ragazzi e ragazze con colori armonici coordinati' : 'Palette unisexe avec contrastes de travail'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {Object.values(themes).map((th) => {
            const isSelected = profile.theme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => {
                  soundFx.playClick();
                  onUpdateProfile({ theme: th.id });
                }}
                className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">{th.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {isIt ? th.name_it : th.name_fr}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                    {th.toneDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operating System Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Monitor className="w-5 h-5 text-slate-700" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isIt ? 'Sistema Operativo del Computer' : 'Système d\'Exploitation de l\'Ordinateur'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isIt ? 'Adatta i comandi del terminale e la memoria RAM al tuo sistema' : 'Adapte les commandes de paquets et l\'optimisation mémoire'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'debian', label: 'Debian / Ubuntu', icon: '🌀' },
            { id: 'fedora', label: 'Fedora / RHEL', icon: '🎩' },
            { id: 'arch', label: 'Arch / Manjaro', icon: '🏹' },
            { id: 'macos', label: 'macOS (MacBook)', icon: '🍎' }
          ].map((os) => {
            const isSelected = profile.operatingSystem === os.id;
            return (
              <button
                key={os.id}
                onClick={() => {
                  soundFx.playClick();
                  onUpdateProfile({ operatingSystem: os.id as OperatingSystem });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>{os.icon}</span>
                <span className="truncate">{os.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Local System Bridge Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl ${
              bridgeStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isIt ? 'Connettore di Sistema Locale (System Bridge)' : 'Connecteur Système Local (System Bridge)'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  bridgeStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : bridgeStatus === 'simulated'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  {bridgeStatus === 'connected' ? (isIt ? 'Attivo' : 'Actif') : bridgeStatus === 'simulated' ? (isIt ? 'Simulato' : 'Simulé') : (isIt ? 'Disconnesso' : 'Déconnecté')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isIt 
                  ? 'Permette il controllo automatico di memoria RAM, software installati e aggiornamenti senza terminale'
                  : 'Permet la détection automatique de RAM, paquets et mises à jour sans terminal'}
              </p>
            </div>
          </div>

          {onOpenBridgeModal && (
            <button
              type="button"
              onClick={onOpenBridgeModal}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isIt ? 'Configura / Diagnostica Bridge' : 'Gérer le Bridge'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Standalone Window & App Experience */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <AppWindow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isIt ? 'Modalità Finestra Applicativa (Senza Browser)' : 'Mode Application Dédiée (Sans Navigateur)'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isIt 
                  ? 'Apri Tournesol in una finestra autonoma senza barra degli indirizzi, senza frecce e senza schede'
                  : 'Ouvrez Tournesol dans une fenêtre isolée sans barre d\'adresse ni onglets parasites'}
              </p>
            </div>
          </div>

          {onOpenDesktopWindowModal && (
            <button
              type="button"
              onClick={onOpenDesktopWindowModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <AppWindow className="w-3.5 h-3.5" />
              <span>{isIt ? 'Configura Finestra App' : 'Configurer Fenêtre Dédiée'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Fast Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <User className="w-5 h-5 text-slate-700" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isIt ? 'Dati Studente & Scuola' : 'Informations de l\'Élève'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isIt ? 'Personalizza il nome visualizzato nei saluti e nei compiti' : 'Personnalisez le prénom affiché sur le cahier'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isIt ? 'Nome Studente' : 'Prénom & Nom'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isIt ? 'Nome della Scuola' : 'Établissement'}
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isIt ? 'Classe / Grado' : 'Classe'}
            </label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4" />
              {isIt ? 'Profilo salvato con successo!' : 'Modifications enregistrées !'}
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {isIt ? 'Salva Modifiche' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>

      {/* Backup & Persistence Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-700" />
              <h4 className="font-bold text-slate-900 text-sm">
                {isIt ? 'Salvataggio su Disco & Backup Completo' : 'Stockage sur Disque & Sauvegarde'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {isIt 
                ? 'I tuoi compiti e orari risiedono esclusivamente nella memoria privata di questo dispositivo (PC, Tablet o Telefono). Per sicurezza contro la pulizia accidentale della cronologia del browser, puoi scaricare una copia di backup (.json) con 1 clic.'
                : 'Vos données sont stockées localement sur votre appareil. Téléchargez une copie (.json) pour vous prémunir de tout nettoyage d\'historique.'}
            </p>
          </div>

          {/* Persistent Storage Status Badge */}
          {typeof navigator !== 'undefined' && 'storage' in navigator && (
            <div className="shrink-0">
              {isPersisted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isIt ? 'Memoria Permanente Attiva' : 'Stockage Persistant Actif'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPersistence}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  {isIt ? 'Attiva Protezione Permanente' : 'Activer Persistance'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feedback Banners */}
        {restoreSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isIt ? '🎉 Backup ripristinato con successo! Tutti i compiti e l\'orario sono stati ricaricati.' : '🎉 Sauvegarde restaurée avec succès !'}</span>
          </div>
        )}

        {restoreError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-900 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{restoreError}</span>
          </div>
        )}

        {diskSavedSuccess && (
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-2.5 text-sky-900 text-xs font-semibold">
            <Check className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{isIt ? '💾 File salvato con successo sul disco fisso in dati_salvati_pc/tournesol_dati_disco.json!' : '💾 Fichier sauvegardé sur le disque dur !'}</span>
          </div>
        )}

        {/* Disk Backup Detected Card */}
        {diskBackupData && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-400 text-amber-950 rounded-xl shrink-0 mt-0.5">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5 flex-wrap">
                  <span>{isIt ? 'Backup Completo Trovato su Disco PC' : 'Sauvegarde Détectée sur Disque PC'}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    tournesol_dati_disco.json
                  </span>
                </h4>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  {isIt
                    ? `Scuola: ${diskBackupData.profile?.schoolName || 'Collège Victor Hugo'} • ${diskBackupData.profile?.gradeLevel || '4ème'} • ${diskBackupData.homework?.length || 0} compiti • ${diskBackupData.timetable?.length || 0} materie orario.`
                    : `Établissement : ${diskBackupData.profile?.schoolName || 'Collège'} • ${diskBackupData.homework?.length || 0} devoirs • ${diskBackupData.timetable?.length || 0} cours.`}
                </p>
                {diskBackupData.exportDate && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isIt ? 'Data del file: ' : 'Date : '}
                    {new Date(diskBackupData.exportDate).toLocaleString(isIt ? 'it-IT' : 'fr-FR')}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRestoreFromLocalDisk(diskBackupData)}
              disabled={isLoadingDiskBackup}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isLoadingDiskBackup ? (isIt ? 'Caricamento...' : 'Chargement...') : (isIt ? 'Ripristina Ora Questo Backup' : 'Restaurer Maintenant')}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFileChange} 
            accept=".json,application/json" 
            className="hidden" 
          />

          <button
            type="button"
            onClick={() => handleRestoreFromLocalDisk()}
            disabled={isLoadingDiskBackup}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            title={isIt ? 'Carica direttamente dal file dati_salvati_pc/tournesol_dati_disco.json' : 'Charger depuis le disque'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isIt ? 'Ripristina da Disco PC' : 'Restaurer depuis Disque'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToLocalDisk}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            title={isIt ? 'Salva direttamente nella cartella del progetto su PC' : 'Sauvegarder directement sur le disque PC'}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{isIt ? 'Sincronizza Disco PC Ora' : 'Synchroniser Disque PC'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIt ? 'Esporta Backup (.json)' : 'Exporter Sauvegarde (.json)'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isIt ? 'Ripristina da File (.json)' : 'Restaurer depuis un fichier'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(isIt ? 'Ripristinare tutti i dati ai valori iniziali di fabbrica?' : 'Réinitialiser toutes les données ?')) {
                onResetAllData();
                soundFx.playClick();
              }
            }}
            className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isIt ? 'Ripristina Valori Iniziali' : 'Réinitialiser'}</span>
          </button>
        </div>

        {/* Automatic Backup Frequency Setting */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>{isIt ? 'Frequenza Promemoria Backup Automatico' : 'Fréquence Rappel Sauvegarde'}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isIt 
                  ? 'L\'app ti avviserà automaticamente con 1 clic per salvare la copia su disco' 
                  : 'L\'application vous rappellera de télécharger une copie locale'}
              </p>
            </div>

            {profile.lastBackupDate && (
              <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                {isIt ? 'Ultimo salvataggio: ' : 'Dernière sauvegarde : '}
                {new Date(profile.lastBackupDate).toLocaleDateString(isIt ? 'it-IT' : 'fr-FR')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'weekly', label_it: 'Ogni Settimana', label_fr: 'Chaque Semaine', desc_it: 'Raccomandato', desc_fr: 'Recommandé' },
              { id: 'biweekly', label_it: 'Ogni 2 Settimane', label_fr: 'Toutes les 2 sem.', desc_it: 'Moderato', desc_fr: 'Modéré' },
              { id: 'monthly', label_it: 'Ogni Mese', label_fr: 'Chaque Mois', desc_it: 'Minimo', desc_fr: 'Minimum' },
              { id: 'disabled', label_it: 'Disattivato', label_fr: 'Désactivé', desc_it: 'Solo Manuale', desc_fr: 'Manuel' }
            ].map(opt => {
              const active = (profile.autoBackupFrequency || 'weekly') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onUpdateProfile({ autoBackupFrequency: opt.id as any });
                  }}
                  className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                    active 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">
                    {isIt ? opt.label_it : opt.label_fr}
                  </span>
                  <span className={`text-[10px] mt-1 ${active ? 'text-slate-300 font-semibold' : 'text-slate-500'}`}>
                    {isIt ? opt.desc_it : opt.desc_fr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Local Automatic Rolling Snapshots */}
        {snapshots.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>{isIt ? 'Punti di Ripristino Automatici (Snapshot Locali)' : 'Points de Restauration Automatiques'}</span>
              <span className="text-[10px] font-normal text-slate-500 ml-1">
                ({isIt ? 'Salvati in background dall\'app' : 'Sauvegardés en arrière-plan'})
              </span>
            </div>

            <div className="space-y-1.5">
              {snapshots.map(snap => (
                <div 
                  key={snap.id} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-slate-800">{snap.dateLabel}</span>
                    <span className="text-slate-500 font-medium">
                      ({snap.homeworkCount} {isIt ? 'compiti' : 'devoirs'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-[11px] shadow-2xs transition cursor-pointer"
                    >
                      {isIt ? 'Ripristina' : 'Restaurer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title={isIt ? 'Rimuovi snapshot' : 'Supprimer'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clarification Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
          <p>
            <strong className="text-slate-800">{isIt ? '💡 Come funziona la memoria dei dati:' : '💡 Comment fonctionne la mémoire :'}</strong>{' '}
            {isIt 
              ? 'La normale pulizia della cronologia o della cache del browser non cancella i compiti. Tuttavia, se esegui una cancellazione manuale spuntando "Cookie e dati dei siti", scaricare periodicamente il file di backup (.json) nella cartella Documenti del tuo PC ti garantisce di non perdere mai nulla.' 
              : 'Le nettoyage ordinaire du cache ne supprime pas vos données. Sauvegarder périodiquement le fichier .json vous garantit une sécurité totale.'}
          </p>
        </div>
      </div>
    </div>
  );
};
