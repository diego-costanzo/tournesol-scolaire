import { StudentProfile, HomeworkItem, TimetableSlot, BackupSnapshot } from '../types';

const SNAPSHOTS_KEY = 'tournesol_backup_snapshots';
const MAX_SNAPSHOTS = 5;

const HOMEWORK_KEY = 'tournesol_homework';
const TIMETABLE_KEY = 'tournesol_timetable';
const PROFILE_KEY = 'tournesol_profile';
const BRIDGE_STORE_URL = 'http://127.0.0.1:38124/api/store';

/** Set when a localStorage value was corrupted and had to be discarded. */
let lastRecoveryNotice: string | null = null;

const MAX_HOMEWORK = 500;
const MAX_SLOTS = 300;
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'] as const;
const THEMES = ['amber', 'blue', 'purple', 'orange', 'green', 'sunflower', 'honey', 'lemon', 'night'];
const SYSTEMS = ['debian', 'fedora', 'arch', 'macos'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown, fallback = '', max = 500): string =>
  typeof value === 'string' ? value.slice(0, max) : fallback;

const clock = (value: unknown, fallback: string): string =>
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback;

const isoDate = (value: unknown): string => {
  const candidate = typeof value === 'string' ? value.slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : new Date().toISOString().slice(0, 10);
};

const validJsonString = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') return null;
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    JSON.parse(raw);
    return raw.slice(0, 500_000);
  } catch {
    return null;
  }
};

const sanitizeProfile = (raw: unknown): Partial<StudentProfile> | null => {
  if (!isRecord(raw)) return null;
  const profile: Partial<StudentProfile> = {
    name: text(raw.name, 'Élève', 60),
    schoolName: text(raw.schoolName, '', 120),
    gradeLevel: text(raw.gradeLevel, '', 40),
    avatar: text(raw.avatar, '🌻', 8),
    language: raw.language === 'it' ? 'it' : 'fr',
    dyslexicFont: raw.dyslexicFont === true,
    soundEffects: raw.soundEffects !== false,
    currentWeek: raw.currentWeek === 'B' ? 'B' : 'A',
    firstTimeSetupDone: raw.firstTimeSetupDone === true,
    activePackId: text(raw.activePackId, '', 60)
  };
  if (typeof raw.age === 'number' && raw.age > 0 && raw.age < 120) profile.age = Math.round(raw.age);
  if (raw.schoolStage === 'elementary' || raw.schoolStage === 'middle' || raw.schoolStage === 'high') {
    profile.schoolStage = raw.schoolStage;
  }
  if (typeof raw.theme === 'string' && THEMES.includes(raw.theme)) {
    profile.theme = raw.theme as StudentProfile['theme'];
  }
  if (typeof raw.operatingSystem === 'string' && SYSTEMS.includes(raw.operatingSystem)) {
    profile.operatingSystem = raw.operatingSystem as StudentProfile['operatingSystem'];
  }
  if (
    raw.autoBackupFrequency === 'weekly' ||
    raw.autoBackupFrequency === 'biweekly' ||
    raw.autoBackupFrequency === 'monthly' ||
    raw.autoBackupFrequency === 'disabled'
  ) {
    profile.autoBackupFrequency = raw.autoBackupFrequency;
  }
  if (typeof raw.lastBackupDate === 'string') profile.lastBackupDate = raw.lastBackupDate.slice(0, 40);
  return profile;
};

const sanitizeHomework = (raw: unknown): HomeworkItem | null => {
  if (!isRecord(raw)) return null;
  const title = text(raw.title, '').trim();
  if (!title) return null;
  return {
    id: text(raw.id, `hw-${Math.random().toString(36).slice(2, 10)}`, 80),
    subject: text(raw.subject, 'Général', 80),
    subject_fr: text(raw.subject_fr, '', 80),
    subject_it: text(raw.subject_it, '', 80),
    title,
    title_fr: text(raw.title_fr, title, 200),
    title_it: text(raw.title_it, title, 200),
    description: text(raw.description, '', 800),
    description_fr: text(raw.description_fr, '', 800),
    description_it: text(raw.description_it, '', 800),
    dueDate: isoDate(raw.dueDate),
    estimatedMinutes:
      typeof raw.estimatedMinutes === 'number' && raw.estimatedMinutes > 0 && raw.estimatedMinutes <= 600
        ? Math.round(raw.estimatedMinutes)
        : 25,
    completed: raw.completed === true,
    priority: raw.priority === 'high' || raw.priority === 'low' ? raw.priority : 'medium'
  };
};

const sanitizeSlot = (raw: unknown): TimetableSlot | null => {
  if (!isRecord(raw)) return null;
  if (typeof raw.day !== 'string' || !DAYS.includes(raw.day as (typeof DAYS)[number])) return null;
  return {
    id: text(raw.id, `slot-${Math.random().toString(36).slice(2, 10)}`, 80),
    day: raw.day as TimetableSlot['day'],
    startTime: clock(raw.startTime, '08:30'),
    endTime: clock(raw.endTime, '09:25'),
    subject: text(raw.subject, 'Cours', 80),
    subject_fr: text(raw.subject_fr, '', 80),
    subject_it: text(raw.subject_it, '', 80),
    room: text(raw.room, 'Salle de cours', 60),
    room_fr: text(raw.room_fr, '', 60),
    room_it: text(raw.room_it, '', 60),
    teacher: text(raw.teacher, 'Enseignant', 80),
    color: text(raw.color, 'bg-amber-100 text-amber-900 border-amber-300', 200),
    weekType: raw.weekType === 'A' || raw.weekType === 'B' ? raw.weekType : 'both'
  };
};

/**
 * Read a JSON array from localStorage entry by entry.
 * Corrupted values are dropped (and the key removed) instead of silently
 * being replaced, so the caller can fall back to the last valid snapshot.
 */
function safeReadArray<T>(
  key: string,
  sanitizer: (raw: unknown) => T | null,
  max: number,
  label: string
): T[] | null {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === '') return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('shape');
    const clean = parsed.slice(0, max).map(sanitizer).filter((item): item is T => item !== null);
    if (parsed.length > 0 && clean.length === 0) throw new Error('entries');
    return clean;
  } catch {
    localStorage.removeItem(key);
    lastRecoveryNotice = label;
    return null;
  }
}

export interface SanitizedBackup {
  profile: Partial<StudentProfile> | null;
  homework: HomeworkItem[] | null;
  timetable: TimetableSlot[] | null;
  studyNotes: string | null;
  installedPacks: string | null;
  studyHistory: string | null;
  quizMistakes: string | null;
  srsCards: string | null;
}

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
      quizMistakes: localStorage.getItem('tournesol_quiz_mistakes') || '[]',
      srsCards: localStorage.getItem('tournesol_srs_cards') || '[]'
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
    const list = this.getLocalSnapshots().filter((s: BackupSnapshot) => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list));
    return list;
  },

  /**
   * Save the full backup on the user's own disk.
   * 1. Local bridge (~/.tournesol/data.json, 0600) — works on the deployed site too;
   * 2. Vite dev/preview server — only when running the app locally.
   */
  async saveToDiskServer(payload: any): Promise<{ success: boolean; path?: string }> {
    try {
      const response = await fetch(BRIDGE_STORE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) return { success: true };
    } catch {
      /* bridge not running: fall back to the dev server */
    }

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
      const response = await fetch(BRIDGE_STORE_URL);
      if (response.ok) return await response.json();
    } catch {
      /* bridge not running */
    }

    try {
      const response = await fetch('/api/disk-backup');
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  },

  /** Last problem found while reading localStorage (shown once as a banner). */
  getRecoveryNotice(): string | null {
    return lastRecoveryNotice;
  },

  clearRecoveryNotice(): void {
    lastRecoveryNotice = null;
  },

  /**
   * Read an array from localStorage, validating every entry.
   * A corrupted value is removed instead of being silently restored as demo data.
   */
  readHomeworkFromLocal(): HomeworkItem[] | null {
    return safeReadArray(HOMEWORK_KEY, sanitizeHomework, MAX_HOMEWORK, 'homework');
  },

  readTimetableFromLocal(): TimetableSlot[] | null {
    return safeReadArray(TIMETABLE_KEY, sanitizeSlot, MAX_SLOTS, 'timetable');
  },

  readProfileFromLocal(): Partial<StudentProfile> | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    try {
      return sanitizeProfile(JSON.parse(raw));
    } catch {
      localStorage.removeItem(PROFILE_KEY);
      lastRecoveryNotice = 'profile';
      return null;
    }
  },

  /** First valid snapshot stored on this browser, already sanitized. */
  latestSnapshotData(): SanitizedBackup | null {
    const snapshot = this.getLocalSnapshots()[0];
    if (!snapshot?.data) return null;
    return this.sanitizeBackup(snapshot.data);
  },

  /**
   * Validate and sanitize an imported backup before it reaches the app state.
   * Protects against corrupted files, wrong types and oversized payloads.
   * Returns null when the payload is not a backup object at all.
   */
  sanitizeBackup(raw: unknown): SanitizedBackup | null {
    if (!isRecord(raw)) return null;

    const homework = Array.isArray(raw.homework)
      ? raw.homework
          .slice(0, MAX_HOMEWORK)
          .map(sanitizeHomework)
          .filter((item): item is HomeworkItem => item !== null)
      : null;

    const timetable = Array.isArray(raw.timetable)
      ? raw.timetable
          .slice(0, MAX_SLOTS)
          .map(sanitizeSlot)
          .filter((item): item is TimetableSlot => item !== null)
      : null;

    return {
      profile: sanitizeProfile(raw.profile),
      homework,
      timetable,
      studyNotes: typeof raw.studyNotes === 'string' ? raw.studyNotes.slice(0, 200_000) : null,
      installedPacks: validJsonString(raw.installedPacks),
      studyHistory: validJsonString(raw.studyHistory),
      quizMistakes: validJsonString(raw.quizMistakes),
      srsCards: validJsonString(raw.srsCards)
    };
  }
};
