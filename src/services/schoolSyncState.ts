/**
 * Local-only state of the school calendar sync.
 * Nothing here leaves the computer: it is just a timestamp used to tell the
 * student how fresh the data is.
 */

const LAST_SUCCESS_KEY = 'tournesol_pronote_last_success';
const CONFIGURED_KEY = 'tournesol_pronote_configured';

export interface SchoolSyncState {
  /** Timestamp (ms) of the last successful download from the school. */
  lastSuccess: number | null;
  /** True when a school link is stored on this PC (~/.tournesol/pronote.json). */
  configured: boolean;
}

const readNumber = (key: string): number | null => {
  const value = Number(localStorage.getItem(key) || 0);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const schoolSyncState = {
  get(): SchoolSyncState {
    return {
      lastSuccess: readNumber(LAST_SUCCESS_KEY),
      configured: localStorage.getItem(CONFIGURED_KEY) === 'true'
    };
  },

  markSuccess(timestamp: number = Date.now()): void {
    localStorage.setItem(LAST_SUCCESS_KEY, String(timestamp));
  },

  setConfigured(configured: boolean): void {
    localStorage.setItem(CONFIGURED_KEY, configured ? 'true' : 'false');
  },

  /** Human readable age, e.g. "adesso", "3 h fa", "ieri", "5 giorni fa". */
  formatLast(timestamp: number | null, isIt: boolean): string {
    if (!timestamp) return isIt ? 'mai' : 'jamais';
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 2) return isIt ? 'adesso' : "à l'instant";
    if (minutes < 60) return isIt ? `${minutes} min fa` : `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return isIt ? `${hours} h fa` : `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return isIt ? 'ieri' : 'hier';
    return isIt ? `${days} giorni fa` : `il y a ${days} jours`;
  },

  /** True when the school data has not been refreshed for more than `days`. */
  isStale(timestamp: number | null, days = 3): boolean {
    if (!timestamp) return true;
    return Date.now() - timestamp > days * 24 * 60 * 60 * 1000;
  }
};
