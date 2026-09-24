import { StudentProfile, HomeworkItem, TimetableSlot, BackupSnapshot } from '../types';

const SNAPSHOTS_KEY = 'tournesol_backup_snapshots';
const MAX_SNAPSHOTS = 5;

export const backupService = {
  createFullBackupPayload(
    profile: StudentProfile,
    homework: HomeworkItem[],
    timetable: TimetableSlot[]
  ) {
    return {
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
  },

  downloadBackupFile(payload: any, studentName: string = 'studente') {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (studentName || 'studente').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `tournesol-backup-${safeName}-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  checkIfBackupDue(profile: StudentProfile): { isDue: boolean; daysElapsed: number; intervalLabel: string } {
    const freq = profile.autoBackupFrequency || 'weekly';
    if (freq === 'disabled') {
      return { isDue: false, daysElapsed: 0, intervalLabel: '' };
    }

    const intervalDays = freq === 'monthly' ? 30 : freq === 'biweekly' ? 14 : 7;
    const lastBackup = profile.lastBackupDate ? new Date(profile.lastBackupDate).getTime() : 0;
    const now = Date.now();
    const daysElapsed = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

    return {
      isDue: daysElapsed >= intervalDays,
      daysElapsed,
      intervalLabel: freq === 'monthly' ? 'mensile' : freq === 'biweekly' ? 'ogni 2 settimane' : 'settimanale'
    };
  },

  saveLocalRollingSnapshot(
    profile: StudentProfile,
    homework: HomeworkItem[],
    timetable: TimetableSlot[]
  ): BackupSnapshot[] {
    try {
      const existing = this.getLocalSnapshots();
      const now = new Date();

      // Avoid duplicate snapshots within the same 6 hours
      if (existing.length > 0) {
        const latestTime = new Date(existing[0].timestamp).getTime();
        if (now.getTime() - latestTime < 6 * 60 * 60 * 1000) {
          return existing;
        }
      }

      const payload = this.createFullBackupPayload(profile, homework, timetable);
      const newSnapshot: BackupSnapshot = {
        id: 'snap_' + Date.now(),
        timestamp: now.toISOString(),
        dateLabel: now.toLocaleDateString(profile.language === 'it' ? 'it-IT' : 'fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        homeworkCount: homework.length,
        data: payload
      };

      const updated = [newSnapshot, ...existing].slice(0, MAX_SNAPSHOTS);
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  getLocalSnapshots(): BackupSnapshot[] {
    try {
      const raw = localStorage.getItem(SNAPSHOTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  deleteSnapshot(id: string): BackupSnapshot[] {
    const list = this.getLocalSnapshots().filter(s => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list));
    return list;
  },

  async saveToDiskServer(payload: any): Promise<{ success: boolean; path?: string }> {
    try {
      const response = await fetch('/api/disk-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        return await response.json();
      }
      return { success: false };
    } catch {
      // Backend not running (e.g. static hosting)
      return { success: false };
    }
  },

  async loadFromDiskServer(): Promise<any | null> {
    try {
      const response = await fetch('/api/disk-backup');
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  }
};
