import React, { useState, useEffect } from 'react';
import { Download, Clock, X, ShieldCheck, Sparkles } from 'lucide-react';
import { StudentProfile, HomeworkItem, TimetableSlot } from '../../types';
import { backupService } from '../../services/backupService';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface AutoBackupReminderProps {
  profile: StudentProfile;
  homework: HomeworkItem[];
  timetable: TimetableSlot[];
  onUpdateProfile: (newProfile: Partial<StudentProfile>) => void;
}

export const AutoBackupReminder: React.FC<AutoBackupReminderProps> = ({
  profile,
  homework,
  timetable,
  onUpdateProfile
}) => {
  const [showReminder, setShowReminder] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const isIt = profile.language === 'it';

  // Check if backup is due
  useEffect(() => {
    const { isDue } = backupService.checkIfBackupDue(profile);
    if (isDue && !snoozed) {
      setShowReminder(true);
    } else {
      setShowReminder(false);
    }
  }, [profile, snoozed]);

  // Request persistent storage automatically in browser
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }, []);

  // Also automatically save rolling snapshot on load/update
  useEffect(() => {
    backupService.saveLocalRollingSnapshot(profile, homework, timetable);
  }, [profile, homework.length, timetable.length]);

  if (!showReminder) return null;

  const handleDownloadNow = () => {
    soundFx.playClick();
    const payload = backupService.createFullBackupPayload(profile, homework, timetable);
    backupService.downloadBackupFile(payload, profile.name);
    
    // Update last backup date
    onUpdateProfile({ lastBackupDate: new Date().toISOString() });
    setShowReminder(false);
    soundFx.playSuccess();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.2 } });
  };

  const handleSnooze = () => {
    setSnoozed(true);
    // Postpone for 2 days
    const postponedDate = new Date();
    postponedDate.setDate(postponedDate.getDate() - 5); // next check in 2 days (7-5=2)
    onUpdateProfile({ lastBackupDate: postponedDate.toISOString() });
  };

  return (
    <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md animate-in fade-in slide-in-from-top-2 duration-300 w-full max-w-full overflow-hidden">
      {/* Top Header Row: Title on Left, Buttons on Right (Tablet/Desktop) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-white/20 backdrop-blur-xs text-white shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm tracking-tight text-white truncate sm:whitespace-normal">
                {isIt ? 'Promemoria Backup Automatico' : 'Rappel Sauvegarde Automatique'}
              </h4>
            </div>
          </div>

          {/* Close button visible on small mobile top row */}
          <button
            type="button"
            onClick={() => setShowReminder(false)}
            className="sm:hidden p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer shrink-0 ml-2"
            title={isIt ? 'Chiudi avviso' : 'Fermer'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons for Tablet / Desktop (Header aligned) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadNow}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs shadow-xs transition cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{isIt ? 'Salva Copia Adesso' : 'Sauvegarder Maintenant'}</span>
          </button>

          <button
            type="button"
            onClick={handleSnooze}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition cursor-pointer shrink-0 whitespace-nowrap"
            title={isIt ? 'Ricordamelo tra 2 giorni' : 'Rappeler dans 2 jours'}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{isIt ? 'Più tardi' : 'Plus tard'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReminder(false)}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer shrink-0"
            title={isIt ? 'Chiudi avviso' : 'Fermer'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description: spreads naturally across full width without awkward squishing */}
      <p className="text-[11px] sm:text-xs text-amber-100 font-medium leading-relaxed mt-2 sm:mt-1.5 sm:pl-9 max-w-4xl">
        {isIt 
          ? 'I tuoi compiti e l\'orario risiedono solo su questo dispositivo (privacy 100% protetta). Salva una copia su file per metterti al sicuro anche se pulisci la cronologia del browser!'
          : 'Vos données restent uniquement sur cet appareil. Téléchargez une copie pour sécuriser vos devoirs même en cas de nettoyage du navigateur !'}
      </p>

      {/* Action Buttons for Mobile (< sm) */}
      <div className="flex sm:hidden items-center gap-2 mt-2.5 pt-1">
        <button
          type="button"
          onClick={handleDownloadNow}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs shadow-xs transition cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{isIt ? 'Salva Copia Adesso' : 'Sauvegarder Maintenant'}</span>
        </button>

        <button
          type="button"
          onClick={handleSnooze}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition cursor-pointer shrink-0 whitespace-nowrap"
          title={isIt ? 'Ricordamelo tra 2 giorni' : 'Rappeler dans 2 jours'}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{isIt ? 'Più tardi' : 'Plus tard'}</span>
        </button>
      </div>
    </div>
  );
};
