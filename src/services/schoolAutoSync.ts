import { calendarSyncService } from './calendarSyncService';
import { schoolSyncService } from './schoolSyncService';
import { schoolSyncState } from './schoolSyncState';
import { HomeworkItem, TimetableSlot } from '../types';

/**
 * Silent, background refresh of the school calendar.
 *
 * Order of operations (nothing ever leaves the computer):
 * 1. If the bridge is running, the cached copy `~/.tournesol/pronote.ics` is
 *    always available and is used immediately;
 * 2. at most once per day, the bridge re-downloads the calendar from the link
 *    stored on the PC (`~/.tournesol/pronote.json`, 0600). The browser never
 *    sees that link, and a failure is ignored silently.
 */

const LAST_REFRESH_KEY = 'tournesol_pronote_last_refresh';
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface AutoSyncOutcome {
  slots: Array<Omit<TimetableSlot, 'id'>>;
  homework: Array<Omit<HomeworkItem, 'id' | 'completed'>>;
  source: 'live' | 'cache';
}

const readLastRefresh = (): number => {
  const value = Number(localStorage.getItem(LAST_REFRESH_KEY) || 0);
  return Number.isFinite(value) ? value : 0;
};

export const schoolAutoSync = {
  /** Returns parsed calendar data, or null when nothing can be synced. */
  async run(): Promise<AutoSyncOutcome | null> {
    if (!(await schoolSyncService.isBridgeReady())) return null;

    let ics: string | null = null;
    let source: 'live' | 'cache' = 'cache';

    if (Date.now() - readLastRefresh() > REFRESH_INTERVAL_MS) {
      const saved = await schoolSyncService.getSavedSource();
      if (saved) schoolSyncState.setConfigured(saved.configured);
      if (saved?.configured) {
        const live = await schoolSyncService.syncFromPronote();
        if (live.ok && live.ics) {
          ics = live.ics;
          source = 'live';
          localStorage.setItem(LAST_REFRESH_KEY, String(Date.now()));
          schoolSyncState.markSuccess();
        } else {
          // Remember the failure so the UI can warn when data gets old.
          schoolSyncState.setConfigured(true);
        }
      }
    }

    if (!ics) ics = await schoolSyncService.loadCached();
    if (!ics) return null;

    const parsed = calendarSyncService.parseICalString(ics);
    if (parsed.totalEventsFound === 0) return null;

    return { slots: parsed.timetableSlots, homework: parsed.homeworkItems, source };
  }
};
