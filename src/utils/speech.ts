/**
 * Read-aloud helper based on the Web Speech API.
 *
 * Uses the voices already installed on the device (no third-party service, no
 * audio upload). When the browser has no voice for the requested language the
 * feature simply reports itself as unavailable.
 */

type Lang = 'it' | 'fr';

const LANG_TAG: Record<Lang, string> = { it: 'it-IT', fr: 'fr-FR' };

let voices: SpeechSynthesisVoice[] = [];

const synth = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  return window.speechSynthesis;
};

const refreshVoices = (): SpeechSynthesisVoice[] => {
  const engine = synth();
  if (!engine) return [];
  const list = engine.getVoices();
  if (list.length > 0) voices = list;
  return voices;
};

if (typeof window !== 'undefined' && synth()) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    refreshVoices();
  });
}

export const speech = {
  isSupported(): boolean {
    return synth() !== null && typeof window.SpeechSynthesisUtterance !== 'undefined';
  },

  hasVoiceFor(lang: Lang): boolean {
    const prefix = lang === 'it' ? 'it' : 'fr';
    return refreshVoices().some((voice) => voice.lang.toLowerCase().startsWith(prefix));
  },

  speak(text: string, lang: Lang, rate = 0.95, onEnd?: () => void): boolean {
    const engine = synth();
    if (!engine || typeof window.SpeechSynthesisUtterance === 'undefined') return false;
    const clean = (text || '').replace(/\s+/g, ' ').trim().slice(0, 2000);
    if (!clean) return false;

    engine.cancel();

    const utterance = new window.SpeechSynthesisUtterance(clean);
    utterance.lang = LANG_TAG[lang];
    utterance.rate = Math.min(1.5, Math.max(0.5, rate));
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    const prefix = lang === 'it' ? 'it' : 'fr';
    const match = refreshVoices().find((voice) => voice.lang.toLowerCase().startsWith(prefix));
    if (match) utterance.voice = match;

    engine.speak(utterance);
    return true;
  },

  stop(): void {
    synth()?.cancel();
  },

  isSpeaking(): boolean {
    return synth()?.speaking === true;
  }
};
