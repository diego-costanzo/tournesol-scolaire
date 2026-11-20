import { QuizMistakeRecord, SrsCard } from '../types';

/**
 * Spaced repetition scheduler (SM-2, SuperMemo 2).
 *
 * The algorithm is public and deterministic; no AI service is involved and
 * everything stays in localStorage on the student's own device.
 * Reference: P. A. Woźniak, "Optimization of learning" (1990).
 */

const STORAGE_KEY = 'tournesol_srs_cards';
const MAX_CARDS = 500;
const MAX_NOTE_CARDS = 40;
const MASTERED_INTERVAL = 21;

/** Grade quality used by SM-2: 0 = forgotten, 3 = hard, 4 = good, 5 = easy. */
export type SrsGrade = 0 | 3 | 4 | 5;

export interface SrsStats {
  total: number;
  due: number;
  mastered: number;
  newToday: number;
}

const todayISO = (): string => new Date().toISOString().slice(0, 10);

const addDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(0, Math.round(days)));
  return date.toISOString().slice(0, 10);
};

const text = (value: unknown, max = 400): string =>
  typeof value === 'string' ? value.slice(0, max).trim() : '';

const clampNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, num));
};

const isoOr = (value: unknown, fallback: string): string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;

/** A card coming from disk is untrusted JSON: rebuild it field by field. */
const sanitizeCard = (raw: unknown): SrsCard | null => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  const frontIt = text(data.front_it);
  const frontFr = text(data.front_fr);
  const backIt = text(data.back_it);
  const backFr = text(data.back_fr);
  if (!(frontIt || frontFr) || !(backIt || backFr)) return null;

  const choices = Array.isArray(data.choices)
    ? data.choices.map((c) => text(c, 200)).filter((c) => c.length > 0).slice(0, 6)
    : null;
  const correctIndex =
    typeof data.correctIndex === 'number' && choices && data.correctIndex >= 0 && data.correctIndex < choices.length
      ? Math.floor(data.correctIndex)
      : null;

  return {
    id: text(data.id, 80) || `card-${Math.random().toString(36).slice(2, 10)}`,
    source: data.source === 'quiz' || data.source === 'manual' ? data.source : 'notes',
    subject: text(data.subject, 80) || 'Général',
    front_it: frontIt || frontFr,
    front_fr: frontFr || frontIt,
    back_it: backIt || backFr,
    back_fr: backFr || backIt,
    choices: choices && choices.length >= 2 ? choices : null,
    correctIndex,
    ease: clampNumber(data.ease, 2.5, 1.3, 3.2),
    intervalDays: clampNumber(data.intervalDays, 0, 0, 365),
    repetitions: clampNumber(data.repetitions, 0, 0, 100),
    lapses: clampNumber(data.lapses, 0, 0, 100),
    due: isoOr(data.due, todayISO()),
    createdAt: typeof data.createdAt === 'string' ? data.createdAt.slice(0, 40) : new Date().toISOString(),
    lastReviewed: typeof data.lastReviewed === 'string' ? data.lastReviewed.slice(0, 40) : null
  };
};

/** Normalized key used to avoid importing the same card twice. */
const cardKey = (front: string): string =>
  front
    .toLowerCase()
    .replace(/[^a-z0-9à-ÿ]+/gi, ' ')
    .trim();

class SpacedRepetitionService {
  private cards: SrsCard[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('shape');
      this.cards = parsed
        .slice(0, MAX_CARDS)
        .map(sanitizeCard)
        .filter((card): card is SrsCard => card !== null);
    } catch {
      // Corrupted storage: drop it rather than blocking the study tools.
      localStorage.removeItem(STORAGE_KEY);
      this.cards = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cards.slice(0, MAX_CARDS)));
    } catch {
      // Quota exceeded: keep working in memory for this session.
    }
  }

  public getCards(): SrsCard[] {
    return [...this.cards];
  }

  public stats(): SrsStats {
    const today = todayISO();
    return {
      total: this.cards.length,
      due: this.cards.filter((c) => c.due <= today).length,
      mastered: this.cards.filter((c) => c.intervalDays >= MASTERED_INTERVAL && c.repetitions >= 3).length,
      newToday: this.cards.filter((c) => c.repetitions === 0).length
    };
  }

  /** Cards to review now, hardest first (lowest ease, then oldest due date). */
  public dueCards(includeFuture = false): SrsCard[] {
    const today = todayISO();
    return this.cards
      .filter((c) => includeFuture || c.due <= today)
      .sort((a, b) => (a.ease - b.ease) || a.due.localeCompare(b.due));
  }

  public cardsBySubject(): Array<{ subject: string; total: number; due: number }> {
    const today = todayISO();
    const map = new Map<string, { subject: string; total: number; due: number }>();
    for (const card of this.cards) {
      const entry = map.get(card.subject) || { subject: card.subject, total: 0, due: 0 };
      entry.total += 1;
      if (card.due <= today) entry.due += 1;
      map.set(card.subject, entry);
    }
    return [...map.values()].sort((a, b) => b.due - a.due || b.total - a.total);
  }

  /**
   * Import the mistakes recorded by the quiz laboratory as review cards.
   * Returns how many new cards were created.
   */
  public importQuizMistakes(mistakes: QuizMistakeRecord[]): number {
    const known = new Set(this.cards.map((c) => c.id));
    const seenFronts = new Set(this.cards.map((c) => cardKey(c.front_fr || c.front_it)));
    let created = 0;

    for (const mistake of mistakes) {
      if (!mistake?.question) continue;
      const question = mistake.question;
      const id = `quiz-${question.id}`;
      if (known.has(id)) continue;

      const frontFr = text(question.question_fr) || text(question.question_it);
      const frontIt = text(question.question_it) || frontFr;
      if (!frontFr) continue;
      const key = cardKey(frontFr);
      if (seenFronts.has(key)) continue;

      const answerFr =
        text(question.options[question.correctIndex] || '') ||
        text(question.explanation_fr);
      const answerIt =
        text(question.options[question.correctIndex] || '') ||
        text(question.explanation_it);

      this.cards.push({
        id,
        source: 'quiz',
        subject: text(question.subject_fr, 80) || text(question.subject_it, 80) || text(question.subject, 80),
        front_it: frontIt,
        front_fr: frontFr,
        back_it: answerIt,
        back_fr: answerFr,
        choices: question.options.slice(0, 6),
        correctIndex: question.correctIndex,
        ease: 2.5,
        intervalDays: 0,
        repetitions: 0,
        lapses: 0,
        due: todayISO(),
        createdAt: new Date().toISOString(),
        lastReviewed: null
      });
      known.add(id);
      seenFronts.add(key);
      created += 1;
    }

    if (created > 0) this.save();
    return created;
  }

  /**
   * Turn study notes into flashcards with deterministic rules (no AI, no cloud):
   * - "termine : définition" or "termine = définition"
   * - a line ending with "?" followed by its answer on the next line
   */
  public createFromNotes(notes: string): number {
    if (!notes || notes.length < 10) return 0;

    const seen = new Set(this.cards.map((c) => cardKey(c.front_fr || c.front_it)));
    const lines = notes.split(/\r?\n/).map((l) => l.trim());
    let created = 0;

    const push = (front: string, back: string) => {
      if (created >= MAX_NOTE_CARDS) return;
      const cleanFront = front.replace(/^[-*•\d.)\s]+/, '').trim();
      const cleanBack = back.replace(/^[-*•\s]+/, '').trim();
      if (cleanFront.length < 4 || cleanBack.length < 2) return;
      if (/^https?:\/\//i.test(cleanFront) || cleanFront.length > 200) return;

      const key = cardKey(cleanFront);
      if (!key || seen.has(key)) return;
      seen.add(key);

      this.cards.push({
        id: `note-${Date.now()}-${created}`,
        source: 'notes',
        subject: 'Notes',
        front_it: cleanFront,
        front_fr: cleanFront,
        back_it: cleanBack,
        back_fr: cleanBack,
        choices: null,
        correctIndex: null,
        ease: 2.5,
        intervalDays: 0,
        repetitions: 0,
        lapses: 0,
        due: todayISO(),
        createdAt: new Date().toISOString(),
        lastReviewed: null
      });
      created += 1;
    };

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line || line.length < 6) continue;

      if (line.endsWith('?')) {
        const next = (lines[i + 1] || '').trim();
        if (next && !next.endsWith('?')) {
          push(line, next);
          i += 1;
          continue;
        }
      }

      const separator = line.match(/^(.{3,150}?)\s*[:=]\s*(.{2,300})$/);
      if (separator) push(separator[1], separator[2]);
    }

    if (created > 0) this.save();
    return created;
  }

  public addCard(input: {
    front: string;
    back: string;
    subject?: string;
  }): SrsCard | null {
    const front = text(input.front, 200);
    const back = text(input.back, 400);
    if (front.length < 3 || back.length < 2) return null;
    if (this.cards.some((c) => cardKey(c.front_fr || c.front_it) === cardKey(front))) return null;

    const card: SrsCard = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: 'manual',
      subject: text(input.subject, 80) || 'Notes',
      front_it: front,
      front_fr: front,
      back_it: back,
      back_fr: back,
      choices: null,
      correctIndex: null,
      ease: 2.5,
      intervalDays: 0,
      repetitions: 0,
      lapses: 0,
      due: todayISO(),
      createdAt: new Date().toISOString(),
      lastReviewed: null
    };
    this.cards.push(card);
    this.save();
    return card;
  }

  /** Apply the SM-2 formula and persist the new schedule. */
  public review(cardId: string, grade: SrsGrade): SrsCard | null {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return null;

    if (grade < 3) {
      card.repetitions = 0;
      card.lapses += 1;
      card.intervalDays = 1;
    } else {
      if (card.repetitions === 0) card.intervalDays = 1;
      else if (card.repetitions === 1) card.intervalDays = 6;
      else card.intervalDays = Math.min(180, Math.round(card.intervalDays * card.ease));
      card.repetitions += 1;
    }

    const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
    card.ease = Math.min(3.2, Math.max(1.3, Number((card.ease + delta).toFixed(2))));
    card.due = addDays(card.intervalDays);
    card.lastReviewed = new Date().toISOString();

    this.save();
    return card;
  }

  public deleteCard(cardId: string): void {
    this.cards = this.cards.filter((c) => c.id !== cardId);
    this.save();
  }

  public clearAll(): void {
    this.cards = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const spacedRepetition = new SpacedRepetitionService();
