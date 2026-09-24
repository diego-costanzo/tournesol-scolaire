import { StudySessionLog, SubjectPacingStats, GradeCycle } from '../types';

const STORAGE_KEY = 'tournesol_study_history';

/**
 * Adaptive Time & Self-Pacing Engine
 * Analyzes cognitive load from assignment descriptions and adapts estimates
 * based on the student's personal historical completion speed per subject
 * and French curriculum grade cycle (Primaire, Collège, Brevet 3ème, Lycée).
 */
class AdaptiveTimeEngine {
  private history: StudySessionLog[] = [];

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch {
      this.history = [];
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch {
      // Storage error fallback
    }
  }

  /**
   * Cold-Start Heuristic Analyzer: scans task wording and scales according to school cycle
   */
  public analyzeTaskComplexity(
    title: string, 
    description: string = '', 
    subject: string = '',
    gradeCycle: GradeCycle = 'college'
  ): {
    baseMinutes: number;
    detectedType: 'exercises' | 'exam_prep' | 'reading' | 'quick' | 'standard';
    itemsCount: number;
    reason_it: string;
    reason_fr: string;
  } {
    const text = `${title} ${description}`.toLowerCase();

    // Scale factors by cycle
    // Primaire: max 15-20 min total
    // College: ~20-30 min
    // Brevet 3ème: ~30-45 min
    // Lycée: ~45-60 min
    const isPrimaire = gradeCycle === 'primaire';
    const isBrevet = gradeCycle === 'brevet';
    const isLycee = gradeCycle === 'lycee';

    // 1. Exam preparation / DM / Devoir Surveillé (Heavy load)
    if (text.match(/contr[ôo]le|devoir maison|\bdm\b|interro|r[ée]daction|dissertation|expos[ée]|brevet blanc|bac blanc/)) {
      const examMins = isPrimaire ? 20 : isLycee ? 60 : isBrevet ? 50 : 40;
      return {
        baseMinutes: examMins,
        detectedType: 'exam_prep',
        itemsCount: 1,
        reason_it: `Preparazione a verifica o compito lungo per ${gradeCycle} (${examMins} min con pause)`,
        reason_fr: `Préparation à un contrôle / DM pour niveau ${gradeCycle} (${examMins} min)`
      };
    }

    // 2. Exercise lists: e.g. "ex 34, 35, 36" or "n° 12 à 15" or "exercices 1, 2, 3"
    const exMatch = text.match(/(?:ex|n[°o]|exercices?)\s*([0-9\s,àeet\-]+)/i);
    if (exMatch && exMatch[1]) {
      const numbers = exMatch[1].match(/\d+/g);
      if (numbers && numbers.length > 0) {
        let count = numbers.length;
        if (text.includes('à') || text.includes('-')) {
          const first = parseInt(numbers[0], 10);
          const last = parseInt(numbers[numbers.length - 1], 10);
          if (last > first && last - first <= 10) {
            count = last - first + 1;
          }
        }
        
        const minsPerEx = isPrimaire ? 4 : isLycee ? 12 : isBrevet ? 10 : 8;
        const maxCap = isPrimaire ? 20 : isLycee ? 75 : 60;
        const minCap = isPrimaire ? 10 : 15;
        const total = Math.min(maxCap, Math.max(minCap, count * minsPerEx));

        return {
          baseMinutes: total,
          detectedType: 'exercises',
          itemsCount: count,
          reason_it: `Rilevati ${count} esercizi (~${minsPerEx} min ciascuno, livello ${gradeCycle})`,
          reason_fr: `${count} exercices détectés (~${minsPerEx} min par exercice, niveau ${gradeCycle})`
        };
      }
    }

    // 3. Reading / chapter
    if (text.match(/lire|lecture|chapitre|texte|livre/)) {
      const readMins = isPrimaire ? 12 : isLycee ? 30 : 20;
      return {
        baseMinutes: readMins,
        detectedType: 'reading',
        itemsCount: 1,
        reason_it: `Lettura o comprensione del testo (~${readMins} min)`,
        reason_fr: `Lecture de texte ou chapitre (~${readMins} min)`
      };
    }

    // 4. Quick administrative or memorization task
    if (text.match(/signer|recopier|vocabulaire|mat[ée]riel|m[ée]moriser/)) {
      const quickMins = isPrimaire ? 8 : 10;
      return {
        baseMinutes: quickMins,
        detectedType: 'quick',
        itemsCount: 1,
        reason_it: `Attività rapida o memorizzazione vocaboli (~${quickMins} min)`,
        reason_fr: `Tâche rapide ou mémorisation (~${quickMins} min)`
      };
    }

    // 5. Default subject standard scaled to grade cycle
    const s = subject.toLowerCase();
    const subStandard = s.includes('math') ? 25 : s.includes('fran') ? 20 : 20;
    const scaledStandard = isPrimaire 
      ? Math.min(15, Math.round(subStandard * 0.6))
      : isLycee
      ? Math.round(subStandard * 1.5)
      : isBrevet
      ? Math.round(subStandard * 1.25)
      : subStandard;

    return {
      baseMinutes: scaledStandard,
      detectedType: 'standard',
      itemsCount: 1,
      reason_it: `Stima calibrata per il livello ${gradeCycle} (~${scaledStandard} min)`,
      reason_fr: `Estimation calibrée pour le niveau ${gradeCycle} (~${scaledStandard} min)`
    };
  }

  /**
   * Computes student's personal pacing speed multiplier for a subject
   */
  public getSubjectPacing(subject: string): SubjectPacingStats {
    const normalizedSub = subject.toLowerCase().trim();
    const relevantSessions = this.history.filter(h => 
      h.subject.toLowerCase().includes(normalizedSub) || normalizedSub.includes(h.subject.toLowerCase())
    );

    if (relevantSessions.length < 2) {
      return {
        subject,
        averageMinutes: 20,
        speedFactor: 1.0,
        totalSessions: relevantSessions.length
      };
    }

    let weightedRatioSum = 0;
    let weightSum = 0;
    let totalMinutes = 0;

    relevantSessions.slice(-6).forEach((session, idx) => {
      const weight = idx + 1;
      const ratio = Math.max(0.5, Math.min(2.0, session.actualMinutes / Math.max(10, session.estimatedMinutes)));
      weightedRatioSum += ratio * weight;
      weightSum += weight;
      totalMinutes += session.actualMinutes;
    });

    const speedFactor = Number((weightedRatioSum / weightSum).toFixed(2));
    const averageMinutes = Math.round(totalMinutes / Math.min(6, relevantSessions.length));

    return {
      subject,
      averageMinutes,
      speedFactor,
      totalSessions: relevantSessions.length
    };
  }

  /**
   * Final Adaptive Estimate combining cold-start heuristics + personal learning speed + school level
   */
  public getAdaptiveEstimate(
    title: string, 
    description: string = '', 
    subject: string = '',
    gradeCycle: GradeCycle = 'college'
  ): {
    estimatedMinutes: number;
    baseMinutes: number;
    speedFactor: number;
    isPersonalized: boolean;
    reason_it: string;
    reason_fr: string;
  } {
    const analysis = this.analyzeTaskComplexity(title, description, subject, gradeCycle);
    const pacing = this.getSubjectPacing(subject);

    let finalMinutes = analysis.baseMinutes;
    let isPersonalized = false;

    if (pacing.totalSessions >= 2 && Math.abs(pacing.speedFactor - 1.0) >= 0.1) {
      finalMinutes = Math.round(analysis.baseMinutes * pacing.speedFactor);
      finalMinutes = Math.max(5, Math.round(finalMinutes / 5) * 5);
      isPersonalized = true;
    }

    const paceComment_it = pacing.speedFactor < 0.9 
      ? `adattata al tuo ritmo rapido (${Math.round((1 - pacing.speedFactor) * 100)}% più veloce della media)`
      : pacing.speedFactor > 1.15
      ? `ti prendi più tempo per approfondire (${Math.round((pacing.speedFactor - 1) * 100)}% tempo extra)`
      : 'in linea con la tua media';

    const paceComment_fr = pacing.speedFactor < 0.9
      ? `adaptée à ton rythme rapide (${Math.round((1 - pacing.speedFactor) * 100)}% plus rapide)`
      : pacing.speedFactor > 1.15
      ? `temps adapté pour approfondir (+${Math.round((pacing.speedFactor - 1) * 100)}% de temps)`
      : 'en accord avec ta moyenne';

    return {
      estimatedMinutes: finalMinutes,
      baseMinutes: analysis.baseMinutes,
      speedFactor: pacing.speedFactor,
      isPersonalized,
      reason_it: isPersonalized 
        ? `${analysis.reason_it} — ${paceComment_it}`
        : analysis.reason_it,
      reason_fr: isPersonalized
        ? `${analysis.reason_fr} — ${paceComment_fr}`
        : analysis.reason_fr
    };
  }


  /**
   * Record a completed study session to feed the learning algorithm
   */
  public recordSession(data: {
    homeworkId?: string;
    subject: string;
    taskTitle: string;
    estimatedMinutes: number;
    actualMinutes: number;
  }): StudySessionLog {
    const efficiencyRatio = Number((data.actualMinutes / Math.max(1, data.estimatedMinutes)).toFixed(2));
    const log: StudySessionLog = {
      id: `session-${Date.now()}`,
      homeworkId: data.homeworkId,
      subject: data.subject,
      taskTitle: data.taskTitle,
      estimatedMinutes: data.estimatedMinutes,
      actualMinutes: data.actualMinutes,
      completedAt: new Date().toISOString(),
      efficiencyRatio
    };

    this.history.push(log);
    // Keep last 50 sessions
    if (this.history.length > 50) {
      this.history.shift();
    }
    this.saveHistory();
    return log;
  }

  /**
   * Returns overview statistics of the student's study habits
   */
  public getStudyOverview() {
    const totalMinutes = this.history.reduce((sum, h) => sum + h.actualMinutes, 0);
    const totalSessions = this.history.length;

    return {
      totalMinutes,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      totalSessions,
      recentSessions: [...this.history].reverse().slice(0, 5)
    };
  }
}

export const adaptiveTimeEngine = new AdaptiveTimeEngine();
