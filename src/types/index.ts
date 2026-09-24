export type Language = 'fr' | 'it';

export type ThemeVariant = 
  | 'amber'   // 🌻 Ambra & Girasole (Tournesol Originale)
  | 'blue'    // 🌊 Blu Oceano & Notte Spaziale (Cobalto / Navy)
  | 'purple'  // 🔮 Viola Ametista & Galassia (Lilla / Prugna)
  | 'orange'  // 🍊 Arancio Mandarino & Energia (Pesca / Terracotta)
  | 'green'   // 🍃 Verde Menta & Foresta (Salvia / Smeraldo)
  // Legacy aliases
  | 'sunflower'
  | 'honey'
  | 'lemon'
  | 'night';

export type OperatingSystem = 'debian' | 'fedora' | 'arch' | 'macos';

export type UpdateSeverity = 'up-to-date' | 'standard' | 'critical-security';

export interface SystemUpdate {
  id: string;
  packageName: string;
  currentVersion: string;
  newVersion: string;
  category: 'system' | 'kde' | 'app' | 'security';
  severity: UpdateSeverity;
  size: string;
  cveId?: string;
  cveDescription?: string;
  cveDescription_fr?: string;
  cveDescription_it?: string;
  description: string;
  description_fr?: string;
  description_it?: string;
  source: 'debian-security' | 'debian-stable' | 'github-verified';
  selected?: boolean;
}

export interface VerifiedApp {
  id: string;
  name: string;
  category: 'math' | 'science' | 'languages' | 'writing' | 'creativity' | 'utility';
  summary: string;
  summary_fr?: string;
  summary_it?: string;
  description: string;
  description_fr?: string;
  description_it?: string;
  iconName: string;
  version: string;
  debSize: string;
  ramUsageEstimate: string; // e.g. "45 Mo" (ideal for 4GB MacBook Air)
  githubRepo?: string;
  gpgKeyId: string;
  gpgFingerprint: string;
  sha256: string;
  isInstalled: boolean;
  officialSite?: string;
  pedagogicalUse: string;
  pedagogicalUse_fr?: string;
  pedagogicalUse_it?: string;
  packageCommands?: {
    debian: string;
    fedora: string;
    arch: string;
    macos: string;
    flatpak?: string;
  };
}

export interface TimetableSlot {
  id: string;
  day: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi';
  startTime: string; // "08:30"
  endTime: string;   // "09:25"
  subject: string;
  subject_fr?: string;
  subject_it?: string;
  room: string;
  room_fr?: string;
  room_it?: string;
  teacher: string;
  color: string;
  weekType: 'both' | 'A' | 'B';
}

export interface HomeworkItem {
  id: string;
  subject: string;
  subject_fr?: string;
  subject_it?: string;
  title: string;
  title_fr?: string;
  title_it?: string;
  description: string;
  description_fr?: string;
  description_it?: string;
  dueDate: string; // "YYYY-MM-DD"
  estimatedMinutes: number;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// School Stages & Grade Equivalencies (Scuola Italiana vs Scuola Francese)
export type SchoolStage = 'elementary' | 'middle' | 'high';
export type GradeCycle = 'primaire' | 'college' | 'brevet' | 'lycee';

export type FrenchGradeLevel = 
  | 'cm1' 
  | 'cm2'
  | '6eme' 
  | '5eme' 
  | '4eme' 
  | '3eme'
  | 'seconde' 
  | 'premiere' 
  | 'terminale';

export type QuizDifficultyLevel = 'easy' | 'medium' | 'hard';

export interface SchoolGradeOption {
  id: string;
  stage: SchoolStage;
  frenchName: string;   // e.g. "4ème (Collège)"
  italianName: string;  // e.g. "3ª Media (Secondaria I grado)"
  recommendedAge: number; // e.g. 13
  cycleDescription_fr: string; // "Cycle 4 - Approfondissements"
  cycleDescription_it: string; // "Ciclo 4 - Approfondimenti"
  nationalExam?: string; // e.g. "Diplôme National du Brevet (DNB)"
  defaultPackId: string;
}

export interface StudentProfile {
  name: string;
  age: number;
  schoolName: string;
  schoolStage: SchoolStage; // 'elementary' | 'middle' | 'high'
  gradeLevel: string;       // "4ème" / "Classe di 4ª"
  avatar: string;           // emoji or icon key
  language: Language;
  theme: ThemeVariant;
  operatingSystem: OperatingSystem;
  dyslexicFont: boolean;
  soundEffects: boolean;
  currentWeek: 'A' | 'B';
  firstTimeSetupDone: boolean;
  activePackId: string;
  autoBackupFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'disabled';
  lastBackupDate?: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string; // ISO date
  dateLabel: string;
  homeworkCount: number;
  data: any;
}

export interface CurriculumPack {
  id: string;
  name: string;
  stage: SchoolStage;
  gradeLevel: string;
  version: string;
  description_it: string;
  description_fr: string;
  author: string;
  isInstalled: boolean;
  lastUpdated: string;
  topicsCount: number;
  downloadUrl?: string;
}

// System Bridge Types
export type BridgeConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'simulated';

export interface BridgeSystemInfo {
  status: 'ok';
  os: OperatingSystem;
  distroName: string;
  desktopEnvironment: string;
  kernelVersion: string;
  ram: {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    zramActive: boolean;
    zramSizeMb?: number;
  };
  storage: {
    totalGb: number;
    freeGb: number;
  };
  installedPackages: string[];
  pendingSecurityUpdates: number;
  bridgeVersion: string;
}

// ==========================================
// SMART CONTEXT & PEDAGOGICAL DOMAINS
// ==========================================
export type PedagogicalDomain = 
  // 1. Primaire (CM1 / CM2 - Cycle 3)
  | 'primaire_math_ops'
  | 'primaire_fractions'
  | 'primaire_homophones'
  | 'primaire_verbes'
  | 'primaire_sciences'
  // 2. Collège Intermédiaire (5e / 4e - Cycle 4)
  | 'pythagoras'
  | 'powers_roots'
  | 'fractions'
  | 'equations'
  | 'proportions'
  | 'french_conjugation'
  | 'french_accord'
  | 'french_connectors'
  | 'ohms_law'
  | 'atoms_ions'
  | 'speed_motion'
  | 'french_revolution'
  | 'industrial_revolution'
  | 'scratch_algorithms'
  // 3. 3ème (Diplôme National du Brevet - DNB)
  | 'thales'
  | 'trigonometry'
  | 'affine_functions'
  | 'identites_remarquables'
  | 'kinetic_energy'
  | 'ph_scale'
  | 'brevet_history'
  // 4. Lycée (Seconde / Bac)
  | 'quadratic_equations'
  | 'vectors_plane'
  | 'mole_chemistry'
  // General fallback
  | 'general_study';

export interface SmartStudyAid {
  domain: PedagogicalDomain;
  gradeCycle?: GradeCycle;
  subjectKey: string;
  badgeLabel_it: string;
  badgeLabel_fr: string;
  title_it: string;
  title_fr: string;
  summary_it: string;
  summary_fr: string;
  formula?: string;
  memoryTrick_it: string;
  memoryTrick_fr: string;
  stepByStepGuide_it: string[];
  stepByStepGuide_fr: string[];
  commonTrap_it?: string;
  commonTrap_fr?: string;
}

// ==========================================
// ADAPTIVE TIME & STUDY SESSION HISTORY
// ==========================================
export interface StudySessionLog {
  id: string;
  homeworkId?: string;
  subject: string;
  taskTitle: string;
  estimatedMinutes: number;
  actualMinutes: number;
  completedAt: string; // ISO date
  efficiencyRatio: number; // actual / estimated
}

export interface SubjectPacingStats {
  subject: string;
  averageMinutes: number;
  speedFactor: number; // e.g. 0.85 = faster than estimated, 1.2 = needs more time
  totalSessions: number;
}

// ==========================================
// PARAMETRIC QUIZ & SPACED REPETITION
// ==========================================
export interface ParametricQuizQuestion {
  id: string;
  domain: PedagogicalDomain;
  gradeCycle?: GradeCycle;
  gradeLevel?: FrenchGradeLevel;
  subject: string;
  subject_it: string;
  subject_fr: string;
  difficulty: QuizDifficultyLevel;
  question_it: string;
  question_fr: string;
  options: string[];
  correctIndex: number;
  explanation_it: string;
  explanation_fr: string;
  trapWarning_it?: string;
  trapWarning_fr?: string;
  formula?: string;
}

export interface QuizMistakeRecord {
  id: string;
  question: ParametricQuizQuestion;
  selectedOptionIndex: number;
  timestamp: string;
  timesWrong: number;
  consecutiveCorrect: number;
  mastered: boolean;
}
