import { systemBridge } from './systemBridge';

/**
 * School sync via the local Tournesol Bridge.
 *
 * Why a local bridge: Pronote/ENT calendars require authentication and are
 * protected by CORS, so a static browser app cannot download them directly.
 * The bridge runs on the student's own computer (127.0.0.1 only), downloads
 * the private iCal link, stores it in ~/.tournesol (0600) and hands it to the
 * app. No school data is ever sent to a third-party server.
 */

const BRIDGE_URL = 'http://127.0.0.1:38124';

export type SchoolSyncError = 'invalid-url' | 'bridge-offline' | 'fetch-failed';

export interface SchoolSyncResult {
  ok: boolean;
  ics?: string;
  cachedAt?: string;
  error?: SchoolSyncError;
  message?: string;
}

const isPublicHttpsUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 3;
  } catch {
    return false;
  }
};

export const schoolSyncService = {
  /** True when the bridge is actually running (simulation mode is not enough). */
  async isBridgeReady(): Promise<boolean> {
    if (systemBridge.getStatus() === 'simulated') return false;
    const connected = await systemBridge.probeBridge();
    return connected && systemBridge.getStatus() === 'connected';
  },

  /**
   * Download the student's private Pronote iCal URL through the local bridge.
   * With no argument the bridge reuses the link already stored on this PC
   * (~/.tournesol/pronote.json, 0600), so the token never enters the browser.
   */
  async syncFromPronote(url?: string): Promise<SchoolSyncResult> {
    const trimmed = (url || '').trim();
    if (trimmed && !isPublicHttpsUrl(trimmed)) {
      return { ok: false, error: 'invalid-url' };
    }

    if (!(await this.isBridgeReady())) {
      return { ok: false, error: 'bridge-offline' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(`${BRIDGE_URL}/api/pronote/ical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmed ? { url: trimmed } : {}),
        signal: controller.signal
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data || data.ok !== true || typeof data.ics !== 'string') {
        return { ok: false, error: 'fetch-failed', message: data?.error };
      }

      return { ok: true, ics: data.ics, cachedAt: data.cachedAt };
    } catch {
      return { ok: false, error: 'fetch-failed' };
    } finally {
      clearTimeout(timer);
    }
  },

  /** Retrieve the last calendar cached on this PC, without contacting the school. */
  async loadCached(): Promise<string | null> {
    if (!(await this.isBridgeReady())) return null;
    try {
      const response = await fetch(`${BRIDGE_URL}/api/pronote/cache`);
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  },

  /**
   * Tells whether a school link is already stored on this PC.
   * Only the host is returned: the private token never reaches the browser.
   */
  async getSavedSource(): Promise<{ configured: boolean; host: string } | null> {
    if (!(await this.isBridgeReady())) return null;
    try {
      const response = await fetch(`${BRIDGE_URL}/api/pronote/config`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        configured: data?.configured === true,
        host: typeof data?.host === 'string' ? data.host : ''
      };
    } catch {
      return null;
    }
  }
};
