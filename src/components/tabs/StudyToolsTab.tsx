import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calculator, 
  BookOpen, 
  Clock, 
  FileText, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  GraduationCap, 
  Atom, 
  School,
  Compass,
  History,
  Heart,
  Search,
  Globe2,
  Box,
  Layers,
  Flame,
  Dna,
  ShieldCheck,
  Award,
  Zap,
  HelpCircle,
  Cpu,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, HomeworkItem, GradeCycle, FrenchGradeLevel } from '../../types';
import { translations } from '../../i18n/translations';
import { soundFx } from '../../utils/audio';
import { 
  commonFrenchVerbs, 
  geometricSolids, 
  scienceTopics4eme, 
  historyGeography4eme, 
  studyMethods,
  frenchFiguresOfStyle
} from '../../data/schoolCurriculum';
import { ThalesAndIdentities } from '../study/ThalesAndIdentities';
import { PeriodicTableSection } from '../study/PeriodicTableSection';
import { HistoryTimelineSection } from '../study/HistoryTimelineSection';
import { TechAlgorithmSection } from '../study/TechAlgorithmSection';
import { QuizLaboratorySection } from '../study/QuizLaboratorySection';
import { getSmartStudyAid } from '../../services/smartContextEngine';
import { adaptiveTimeEngine } from '../../services/adaptiveTimeEngine';

interface StudyToolsTabProps {
  profile: StudentProfile;
  activeStudyHomework?: HomeworkItem | null;
  homeworkList?: HomeworkItem[];
  onCompleteHomework?: (homeworkId: string) => void;
  onSelectHomework?: (homeworkId: string | null) => void;
  onClearActiveHomework?: () => void;
}

type GradeLevel = 'Primaire (CM1/CM2)' | 'Collège (5e/4e)' | '3ème (Brevet)' | 'Lycée (Seconde/Bac)';

export const StudyToolsTab: React.FC<StudyToolsTabProps> = ({ 
  profile,
  activeStudyHomework,
  homeworkList = [],
  onCompleteHomework,
  onSelectHomework,
  onClearActiveHomework
}) => {
  const isIt = profile.language === 'it';

  // Dynamic Grade Level selector
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(() => {
    if (profile.gradeLevel.includes('elem') || profile.gradeLevel.includes('cm') || profile.gradeLevel.includes('Primaria')) return 'Primaire (CM1/CM2)';
    if (profile.gradeLevel.includes('3')) return '3ème (Brevet)';
    if (profile.gradeLevel.includes('Lyc') || profile.gradeLevel.includes('Sec')) return 'Lycée (Seconde/Bac)';
    return 'Collège (5e/4e)';
  });

  const [subTool, setSubTool] = useState<
    'math' | 'science' | 'french' | 'history' | 'tech' | 'languages' | 'quiz' | 'method' | 'serenity' | 'notes'
  >('math');

  // Automatic subject tab switching when an active homework is selected
  useEffect(() => {
    if (!activeStudyHomework) return;
    const s = activeStudyHomework.subject.toLowerCase();
    if (s.includes('math') || s.includes('matematica') || s.includes('géom')) {
      setSubTool('math');
    } else if (s.includes('phys') || s.includes('chim') || s.includes('svt') || s.includes('scien')) {
      setSubTool('science');
    } else if (s.includes('fran') || s.includes('litt')) {
      setSubTool('french');
    } else if (s.includes('hist') || s.includes('géo') || s.includes('stor') || s.includes('emc')) {
      setSubTool('history');
    } else if (s.includes('tech') || s.includes('info') || s.includes('scratch') || s.includes('python')) {
      setSubTool('tech');
    } else if (s.includes('angl') || s.includes('ingl') || s.includes('esp') || s.includes('ital')) {
      setSubTool('languages');
    }
  }, [activeStudyHomework]);

  // Pomodoro / Study Timer State
  const defaultMinutes = activeStudyHomework?.estimatedMinutes || 25;
  const [timerSeconds, setTimerSeconds] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [studyElapsedSeconds, setStudyElapsedSeconds] = useState(0);

  // French School Grade Cycle derivation
  const currentGradeCycle: GradeCycle = 
    gradeLevel === 'Primaire (CM1/CM2)' ? 'primaire' :
    gradeLevel === '3ème (Brevet)' ? 'brevet' :
    gradeLevel === 'Lycée (Seconde/Bac)' ? 'lycee' : 'college';

  const defaultGradeLevel: FrenchGradeLevel = (() => {
    const raw = (profile.gradeLevel || '').toLowerCase();
    if (raw.includes('cm1')) return 'cm1';
    if (raw.includes('cm2')) return 'cm2';
    if (raw.includes('6')) return '6eme';
    if (raw.includes('5')) return '5eme';
    if (raw.includes('4')) return '4eme';
    if (raw.includes('3')) return '3eme';
    if (raw.includes('sec') || raw.includes('2')) return 'seconde';
    if (raw.includes('prem') || raw.includes('1')) return 'premiere';
    if (raw.includes('term') || raw.includes('tle')) return 'terminale';

    if (gradeLevel === 'Primaire (CM1/CM2)') return 'cm2';
    if (gradeLevel === '3ème (Brevet)') return '3eme';
    if (gradeLevel === 'Lycée (Seconde/Bac)') return 'seconde';
    return '4eme';
  })();

  // Compute smart study aid based on active homework title, subject & grade cycle
  const smartAid = getSmartStudyAid(activeStudyHomework || null, currentGradeCycle);

  useEffect(() => {
    if (activeStudyHomework && activeStudyHomework.estimatedMinutes) {
      setTimerSeconds(activeStudyHomework.estimatedMinutes * 60);
      setStudyElapsedSeconds(0);
      setIsRunning(false);
    }
  }, [activeStudyHomework?.id]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
        if (timerMode === 'study') {
          setStudyElapsedSeconds((s) => s + 1);
        }
      }, 1000);
    } else if (timerSeconds === 0) {
      soundFx.playSuccess();
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#10B981']
      });
      if (timerMode === 'study') {
        setTimerMode('break');
        setTimerSeconds(5 * 60);
        setSessionsCompleted((c) => c + 1);
      } else {
        setTimerMode('study');
        setTimerSeconds(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds, timerMode]);

  const handleFinishHomework = () => {
    if (!activeStudyHomework || !onCompleteHomework) return;
    soundFx.playSuccess();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B', '#FBBF24', '#3B82F6']
    });

    // Record session into adaptive time engine to learn the student's personal pacing!
    const actualMinutes = Math.max(1, Math.round(studyElapsedSeconds / 60));
    adaptiveTimeEngine.recordSession({
      homeworkId: activeStudyHomework.id,
      subject: activeStudyHomework.subject,
      taskTitle: activeStudyHomework.title,
      estimatedMinutes: activeStudyHomework.estimatedMinutes,
      actualMinutes: actualMinutes > 0 ? actualMinutes : activeStudyHomework.estimatedMinutes
    });

    onCompleteHomework(activeStudyHomework.id);
  };

  // ==========================================
  // MATH HELPER STATES
  // ==========================================
  // Pythagoras
  const [pythMode, setPythMode] = useState<'hypotenuse' | 'side' | 'reciproque'>('hypotenuse');
  const [sideA, setSideA] = useState('3');
  const [sideB, setSideB] = useState('4');
  const [sideC, setSideC] = useState('5');
  const numA = parseFloat(sideA) || 0;
  const numB = parseFloat(sideB) || 0;
  const numC = parseFloat(sideC) || 0;

  let pythagoreResult: { resultVal: number; steps: string[] } | null = null;
  if (pythMode === 'hypotenuse' && numA > 0 && numB > 0) {
    const hypSquared = numA * numA + numB * numB;
    const hyp = Math.sqrt(hypSquared);
    pythagoreResult = {
      resultVal: Math.round(hyp * 100) / 100,
      steps: isIt ? [
        `Nel triangolo ABC rettangolo in A :`,
        `Per il Teorema di Pitagora : BC² = AB² + AC²`,
        `BC² = ${numA}² + ${numB}²`,
        `BC² = ${numA * numA} + ${numB * numB} = ${hypSquared}`,
        `BC = √(${hypSquared}) ≈ ${Math.round(hyp * 100) / 100} cm`
      ] : [
        `Dans le triangle ABC rectangle en A :`,
        `D'après le théorème de Pythagore : BC² = AB² + AC²`,
        `BC² = ${numA}² + ${numB}²`,
        `BC² = ${numA * numA} + ${numB * numB} = ${hypSquared}`,
        `BC = √(${hypSquared}) ≈ ${Math.round(hyp * 100) / 100} cm`
      ]
    };
  } else if (pythMode === 'side' && numC > numA && numA > 0) {
    const sideSquared = numC * numC - numA * numA;
    const side = Math.sqrt(sideSquared);
    pythagoreResult = {
      resultVal: Math.round(side * 100) / 100,
      steps: isIt ? [
        `Nel triangolo ABC rettangolo in A :`,
        `Per il Teorema di Pitagora : BC² = AB² + AC²`,
        `Quindi AC² = BC² - AB²`,
        `AC² = ${numC}² - ${numA}² = ${numC * numC} - ${numA * numA} = ${sideSquared}`,
        `AC = √(${sideSquared}) ≈ ${Math.round(side * 100) / 100} cm`
      ] : [
        `Dans le triangle ABC rectangle en A :`,
        `D'après le théorème de Pythagore : BC² = AB² + AC²`,
        `Donc AC² = BC² - AB²`,
        `AC² = ${numC}² - ${numA}² = ${numC * numC} - ${numA * numA} = ${sideSquared}`,
        `AC = √(${sideSquared}) ≈ ${Math.round(side * 100) / 100} cm`
      ]
    };
  } else if (pythMode === 'reciproque' && numA > 0 && numB > 0 && numC > 0) {
    const maxSide = Math.max(numA, numB, numC);
    let other1 = numA, other2 = numB;
    if (maxSide === numA) { other1 = numB; other2 = numC; }
    else if (maxSide === numB) { other1 = numA; other2 = numC; }
    const hypSq = maxSide * maxSide;
    const sumSq = other1 * other1 + other2 * other2;
    const isRect = Math.abs(hypSq - sumSq) < 0.0001;
    pythagoreResult = {
      resultVal: isRect ? 1 : 0,
      steps: isIt ? [
        `Il lato più lungo è di ${maxSide} cm : ${maxSide}² = ${hypSq}`,
        `Somma dei quadrati degli altri due lati : ${other1}² + ${other2}² = ${other1 * other1} + ${other2 * other2} = ${sumSq}`,
        isRect
          ? `Poiché ${hypSq} = ${sumSq}, per la reciproca del Teorema di Pitagora, il triangolo È RETTANGOLO ! ✅`
          : `Poiché ${hypSq} ≠ ${sumSq}, il triangolo NON È rettangolo. ❌`
      ] : [
        `Le plus grand côté mesure ${maxSide} cm : ${maxSide}² = ${hypSq}`,
        `Somme des carrés des deux autres côtés : ${other1}² + ${other2}² = ${other1 * other1} + ${other2 * other2} = ${sumSq}`,
        isRect
          ? `Comme ${hypSq} = ${sumSq}, d'après la réciproque du théorème de Pythagore, le triangle EST RECTANGLE ! ✅`
          : `Comme ${hypSq} ≠ ${sumSq}, le triangle N'EST PAS rectangle. ❌`
      ]
    };
  }

  // Tableau de Conversion (Conversion Table)
  const [convType, setConvType] = useState<'length' | 'mass' | 'volume'>('length');
  const [convInput, setConvInput] = useState('12.5');
  const [convFrom, setConvFrom] = useState('m');
  const [convTo, setConvTo] = useState('cm');

  const lengthUnits: { [key: string]: number } = { km: 1000, hm: 100, dam: 10, m: 1, dm: 0.1, cm: 0.01, mm: 0.001 };
  const massUnits: { [key: string]: number } = { kg: 1000, hg: 100, dag: 10, g: 1, dg: 0.1, cg: 0.01, mg: 0.001 };
  const volUnits: { [key: string]: number } = { L: 1, dL: 0.1, cL: 0.01, mL: 0.001 };

  const getConvResult = () => {
    const val = parseFloat(convInput) || 0;
    let units = lengthUnits;
    if (convType === 'mass') units = massUnits;
    if (convType === 'volume') units = volUnits;
    const inBase = val * (units[convFrom] || 1);
    const inTarget = inBase / (units[convTo] || 1);
    return Math.round(inTarget * 100000) / 100000;
  };

  // Fractions Helper
  const [fracOp, setFracOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [fracA, setFracA] = useState('1');
  const [fracB, setFracB] = useState('4');
  const [fracC, setFracC] = useState('2');
  const [fracD, setFracD] = useState('3');

  const numFracA = parseInt(fracA) || 0;
  const numFracB = parseInt(fracB) || 1;
  const numFracC = parseInt(fracC) || 0;
  const numFracD = parseInt(fracD) || 1;

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  let rawNum = 0;
  let rawDen = 1;
  if (fracOp === '+') {
    rawNum = numFracA * numFracD + numFracC * numFracB;
    rawDen = numFracB * numFracD;
  } else if (fracOp === '-') {
    rawNum = numFracA * numFracD - numFracC * numFracB;
    rawDen = numFracB * numFracD;
  } else if (fracOp === '*') {
    rawNum = numFracA * numFracC;
    rawDen = numFracB * numFracD;
  } else if (fracOp === '/') {
    rawNum = numFracA * numFracD;
    rawDen = numFracB * numFracC;
  }

  const commonDiv = rawDen !== 0 ? Math.abs(gcd(rawNum, rawDen)) : 1;
  const simpNum = rawNum / commonDiv;
  const simpDen = rawDen / commonDiv;

  // Scientific Notation & Powers of 10
  const [powerBase, setPowerBase] = useState('45000');
  const formatScientific = (strVal: string) => {
    const num = parseFloat(strVal);
    if (isNaN(num) || num === 0) return { a: '0', exp: 0 };
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const a = num / Math.pow(10, exp);
    return { a: (Math.round(a * 1000) / 1000).toString(), exp };
  };
  const sciResult = formatScientific(powerBase);

  // Linear Equation Solver (ax + b = c)
  const [eqA, setEqA] = useState('3');
  const [eqB, setEqB] = useState('5');
  const [eqC, setEqC] = useState('17');
  const solveEquation = () => {
    const a = parseFloat(eqA);
    const b = parseFloat(eqB);
    const c = parseFloat(eqC);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return null;
    if (a === 0) return { error: isIt ? 'Non è un\'equazione di 1° grado (a = 0)' : 'Pas du 1er degré (a = 0)' };
    const step1 = `${a}x = ${c} - (${b}) = ${c - b}`;
    const x = (c - b) / a;
    return {
      step1,
      step2: `x = (${c - b}) / ${a}`,
      x: Math.round(x * 100) / 100
    };
  };
  const eqResult = solveEquation();

  // Solid Geometry
  const [selectedSolid, setSelectedSolid] = useState<number>(0);

  // Relative Numbers state
  const [relNum1, setRelNum1] = useState('-4');
  const [relNum2, setRelNum2] = useState('7');
  const [relOp, setRelOp] = useState<'+' | '-' | '*' | '/'>('*');
  const n1 = parseFloat(relNum1) || 0;
  const n2 = parseFloat(relNum2) || 0;
  const calculateRel = () => {
    switch (relOp) {
      case '+': return n1 + n2;
      case '-': return n1 - n2;
      case '*': return n1 * n2;
      case '/': return n2 !== 0 ? Math.round((n1 / n2) * 100) / 100 : (isIt ? 'Impossibile (÷ 0)' : 'Impossible (÷ 0)');
    }
  };

  // ==========================================
  // FRENCH VERB CONJUGATOR & GRAMMAR
  // ==========================================
  const [verbSearch, setVerbSearch] = useState('');
  const [selectedVerbIdx, setSelectedVerbIdx] = useState<number>(0);
  const [selectedTense, setSelectedTense] = useState<'present' | 'imparfait' | 'passeSimple' | 'futur' | 'conditionnel'>('present');

  const filteredVerbs = commonFrenchVerbs.filter(v => 
    v.verb.toLowerCase().includes(verbSearch.toLowerCase()) ||
    v.meaning_it.toLowerCase().includes(verbSearch.toLowerCase())
  );
  const currentVerb = filteredVerbs[selectedVerbIdx] || commonFrenchVerbs[0];

  // Homophones
  const homophones = [
    { pair: 'a / à', rule: 'Si on peut remplacer par "avait", c\'est le verbe avoir ("a") sans accent. Sinon c\'est la préposition "à".' },
    { pair: 'et / est', rule: 'Si on peut remplacer par "était", c\'est le verbe être ("est"). Si on peut remplacer par "et puis", c\'est "et".' },
    { pair: 'son / sont', rule: 'Si on peut remplacer par "étaient", c\'est le verbe être ("sont"). Sinon c\'est le déterminant possessif ("son chien").' },
    { pair: 'on / ont', rule: 'Si on peut remplacer par "avaient", c\'est le verbe avoir ("ont"). Sinon c\'est le pronom sujet "on" (remplaçable par "il").' },
    { pair: 'ou / où', rule: 'Si on peut remplacer par "ou bien", c\'est "ou". S\'il s\'agit d\'un lieu ou d\'un moment, c\'est "où" avec accent.' },
    { pair: 'ce / se', rule: 'Devant un verbe ("il se lave"), c\'est toujours "se" (verbe pronominal). Devant un nom ("ce livre"), c\'est "ce".' },
    { pair: 'ces / ses', rule: '"Ses" = les siens (possession). "Ces" = ceux-là qu\'on montre du doigt (démonstratif).' }
  ];

  // French 4ème Curriculum Literary Themes
  const frenchLiteratureThemes4eme = [
    {
      theme: 'Thème 1 : Dire l\'amour',
      author: 'Ronsard, Louise Labé, Victor Hugo, Cyrano de Bergerac',
      keyPoint: 'Poésie lyrique et déclarations passionnées, amour tragique, métaphores du cœur.'
    },
    {
      theme: 'Thème 2 : Confrontations de valeurs ?',
      author: 'Molière (L\'Avare, Le Bourgeois Gentilhomme)',
      keyPoint: 'Le théâtre comique du XVIIe siècle : critique des vices humains (avarice, orgueil, hypocrisie).'
    },
    {
      theme: 'Thème 3 : La fiction pour interroger le réel',
      author: 'Guy de Maupassant (La Parure, Aux champs) & Émile Zola',
      keyPoint: 'La nouvelle réaliste du XIXe siècle : chute inattendue, critique de la société et des inégalités.'
    },
    {
      theme: 'Thème 4 : La ville, lieu de tous les possibles ?',
      author: 'Charles Baudelaire & Balzac',
      keyPoint: 'Paris au XIXe siècle : fascination et misère des grandes métropoles modernes en plein essor.'
    },
    {
      theme: 'Thème 5 : Informer, s\'informer, déformer ?',
      author: 'Presse, journalisme et réseaux sociaux',
      keyPoint: 'Médias d\'information, vérifier les sources, repérer les infox (fake news) et la liberté de la presse.'
    }
  ];

  // Synonyms
  const richSynonyms = [
    { word: 'Dire', itWord: 'Dire', synonyms: ['Déclarer', 'Murmurer', 'Chuchoter', 'S\'exclamer', 'Rétorquer', 'Affirmer', 'Prétendre'] },
    { word: 'Faire', itWord: 'Fare', synonyms: ['Réaliser', 'Accomplir', 'Élaborer', 'Confectionner', 'Pratiquer', 'Commettre'] },
    { word: 'Il y a', itWord: 'C\'è / Ci sono', synonyms: ['Il existe', 'On aperçoit', 'On observe', 'Se trouve', 'Prend place', 'Demeure'] },
    { word: 'Beau / Belle', itWord: 'Bello / Bella', synonyms: ['Splendide', 'Remarquable', 'Ravissant', 'Somptueux', 'Captivant', 'Majestueux'] }
  ];

  // ==========================================
  // SCIENCE HELPER STATES
  // ==========================================
  // Ohm's law interactive pyramid (U = R * I)
  const [ohmTarget, setOhmTarget] = useState<'U' | 'R' | 'I'>('U');
  const [valU, setValU] = useState('12');
  const [valR, setValR] = useState('240');
  const [valI, setValI] = useState('0.05');

  const calcOhm = () => {
    const u = parseFloat(valU) || 0;
    const r = parseFloat(valR) || 0;
    const i = parseFloat(valI) || 0;
    if (ohmTarget === 'U') {
      return { val: Math.round(r * i * 1000) / 1000, unit: 'Volts (V)', formula: 'U = R × I' };
    } else if (ohmTarget === 'R') {
      return { val: i > 0 ? Math.round((u / i) * 100) / 100 : 0, unit: 'Ohms (Ω)', formula: 'R = U / I' };
    } else {
      return { val: r > 0 ? Math.round((u / r) * 1000) / 1000 : 0, unit: 'Ampères (A)', formula: 'I = U / R' };
    }
  };
  const ohmResult = calcOhm();

  // Speed converter (v = d / t)
  const [speedKmH, setSpeedKmH] = useState('90');
  const numKmH = parseFloat(speedKmH) || 0;
  const speedMS = Math.round((numKmH / 3.6) * 100) / 100;

  // Density Calculator (Masse Volumique: rho = m / V)
  const [massG, setMassG] = useState('270');
  const [volCm3, setVolCm3] = useState('100');
  const density = (parseFloat(volCm3) > 0) ? Math.round((parseFloat(massG) / parseFloat(volCm3)) * 100) / 100 : 0;

  // ==========================================
  // LANGUAGES: ENGLISH IRREGULAR VERBS
  // ==========================================
  const [englishSearch, setEnglishSearch] = useState('');
  const englishIrregularVerbs = [
    { base: 'be', past: 'was / were', part: 'been', fr: 'être', it: 'essere' },
    { base: 'become', past: 'became', part: 'become', fr: 'devenir', it: 'diventare' },
    { base: 'begin', past: 'began', part: 'begun', fr: 'commencer', it: 'iniziare' },
    { base: 'break', past: 'broke', part: 'broken', fr: 'casser', it: 'rompere' },
    { base: 'bring', past: 'brought', part: 'brought', fr: 'apporter', it: 'portare' },
    { base: 'build', past: 'built', part: 'built', fr: 'construire', it: 'costruire' },
    { base: 'buy', past: 'bought', part: 'bought', fr: 'acheter', it: 'comprare' },
    { base: 'catch', past: 'caught', part: 'caught', fr: 'attraper', it: 'prendere/catturare' },
    { base: 'choose', past: 'chose', part: 'chosen', fr: 'choisir', it: 'scegliere' },
    { base: 'come', past: 'came', part: 'come', fr: 'venir', it: 'venire' },
    { base: 'do', past: 'did', part: 'done', fr: 'faire', it: 'fare' },
    { base: 'drink', past: 'drank', part: 'drunk', fr: 'boire', it: 'bere' },
    { base: 'drive', past: 'drove', part: 'driven', fr: 'conduire', it: 'guidare' },
    { base: 'eat', past: 'ate', part: 'eaten', fr: 'manger', it: 'mangiare' },
    { base: 'fall', past: 'fell', part: 'fallen', fr: 'tomber', it: 'cadere' },
    { base: 'feel', past: 'felt', part: 'felt', fr: 'ressentir', it: 'sentire/provare' },
    { base: 'find', past: 'found', part: 'found', fr: 'trouver', it: 'trovare' },
    { base: 'fly', past: 'flew', part: 'flown', fr: 'voler', it: 'volare' },
    { base: 'forget', past: 'forgot', part: 'forgotten', fr: 'oublier', it: 'dimenticare' },
    { base: 'get', past: 'got', part: 'got', fr: 'obtenir', it: 'ottenere/diventare' },
    { base: 'give', past: 'gave', part: 'given', fr: 'donner', it: 'dare' },
    { base: 'go', past: 'went', part: 'gone', fr: 'aller', it: 'andare' },
    { base: 'have', past: 'had', part: 'had', fr: 'avoir', it: 'avere' },
    { base: 'know', past: 'knew', part: 'known', fr: 'savoir', it: 'sapere/conoscere' },
    { base: 'make', past: 'made', part: 'made', fr: 'fabriquer', it: 'fare/creare' },
    { base: 'meet', past: 'met', part: 'met', fr: 'rencontrer', it: 'incontrare' },
    { base: 'see', past: 'saw', part: 'seen', fr: 'voir', it: 'vedere' },
    { base: 'speak', past: 'spoke', part: 'spoken', fr: 'parler', it: 'parlare' },
    { base: 'take', past: 'took', part: 'taken', fr: 'prendre', it: 'prendere' },
    { base: 'think', past: 'thought', part: 'thought', fr: 'penser', it: 'pensare' },
    { base: 'write', past: 'wrote', part: 'written', fr: 'écrire', it: 'scrivere' }
  ];

  const filteredEnglishVerbs = englishIrregularVerbs.filter(v => 
    v.base.toLowerCase().includes(englishSearch.toLowerCase()) ||
    v.fr.toLowerCase().includes(englishSearch.toLowerCase()) ||
    v.it.toLowerCase().includes(englishSearch.toLowerCase())
  );

  // False friends
  const falseFriends = [
    { it: 'Attualmente', fr: 'Actuellement', danger: 'In inglese "Actually" significa "In realtà" !', ex: 'Actuellement je suis en 4ème (Ora sono in 4ème).' },
    { it: 'Cantina', fr: 'Cave / Cantine', danger: 'In francese "La cantine" è la mensa scolastica ! La cantina dei vini si dice "La cave".', ex: 'Je mange à la cantine (Mangio a mensa).' },
    { it: 'Fermare', fr: 'Fermer / Arrêter', danger: '"Fermer" in francese significa "Chiudere" ! Fermare si dice "Arrêter".', ex: 'Ferme la porte (Chiudi la porta) !' },
    { it: 'Salire', fr: 'Salir / Monter', danger: '"Salir" in francese significa "Sporcare" ! Salire si dice "Monter".', ex: 'Ne salis pas ton cahier (Non sporcare il quaderno).' },
    { it: 'Camera', fr: 'Caméra / Chambre', danger: '"Caméra" è solo la telecamera. La stanza da letto si dice "La chambre".', ex: 'Je range ma chambre (Riordino la mia stanza).' }
  ];

  // ==========================================
  // SERENITY & MINDFULNESS (Calm Space)
  // ==========================================
  const [breathePhase, setBreathePhase] = useState<'inspire' | 'hold' | 'expire' | 'wait'>('inspire');
  const [breatheActive, setBreatheActive] = useState(false);

  useEffect(() => {
    if (!breatheActive) return;
    const interval = setInterval(() => {
      setBreathePhase((current) => {
        if (current === 'inspire') return 'hold';
        if (current === 'hold') return 'expire';
        if (current === 'expire') return 'wait';
        return 'inspire';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [breatheActive]);

  // Personal notes
  const [personalNote, setPersonalNote] = useState<string>(() => {
    return localStorage.getItem('tournesol_study_notes') || (
      isIt
        ? `I miei appunti di studio (${profile.name || 'Studente'}) :\n- Matematica : Memorizzare la formula di Pitagora (BC² = AB² + AC²).\n- Francese : Accordare il participio passato con avere solo se il COD è prima.\n- Scienze : Legge di Ohm U = R x I (Volt, Ohm, Ampere).`
        : `Mes notes de travail (${profile.name || 'Élève'}) :\n- Mathématiques : mémoriser la rédaction type de Pythagore (Dans le triangle ABC rectangle en A...).\n- Français : accord du participe passé avec Avoir (uniquement si COD avant).\n- Physique : Loi d'Ohm U = R x I.`
    );
  });
  const [noteSaved, setNoteSaved] = useState(false);
  const saveNotes = () => {
    localStorage.setItem('tournesol_study_notes', personalNote);
    soundFx.playSuccess();
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pendingHomework = homeworkList.filter(h => !h.completed);

  return (
    <div className="space-y-6">
      {/* 1. Clean Compact Header */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 w-full max-w-full overflow-hidden">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isIt ? `Centro Studio • ${profile.name || 'Studente'}` : `Espace d'Étude • ${profile.name || 'Élève'}`}
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {isIt 
              ? 'Formule, coniugatore di verbi, schede ed esercizi ufficiali del programma scolastico.' 
              : 'Formules, conjugueur, fiches et exercices du programme officiel.'}
          </p>
        </div>

        {/* Grade Level Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          {[
            { id: 'Primaire (CM1/CM2)', label: 'CM1/CM2' },
            { id: 'Collège (5e/4e)', label: '5e / 4e' },
            { id: '3ème (Brevet)', label: '3e Brevet' },
            { id: 'Lycée (Seconde/Bac)', label: 'Lycée' }
          ].map((grade) => {
            const isSelected = gradeLevel === grade.id;
            return (
              <button
                key={grade.id}
                onClick={() => {
                  soundFx.playClick();
                  setGradeLevel(grade.id as GradeLevel);
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {grade.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FOCUS & STUDY TIMER BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Left: Homework Context / Selection */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                activeStudyHomework ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {activeStudyHomework 
                  ? (isIt ? 'Compito dal Diario' : 'Devoir du Cahier') 
                  : (isIt ? 'Studio Autonomo / Ripasso' : 'Révision Libre')}
              </span>
              {timerMode === 'break' && (
                <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                  ☕ {isIt ? 'Pausa' : 'Pause'}
                </span>
              )}
            </div>

            {activeStudyHomework ? (
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-extrabold text-amber-700 text-xs sm:text-sm shrink-0">[{activeStudyHomework.subject}]</span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                    {activeStudyHomework.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span>📅 {isIt ? 'Scadenza' : 'Pour le'} : {activeStudyHomework.dueDate}</span>
                  <span>⏳ ~{activeStudyHomework.estimatedMinutes} min</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isIt ? 'Timer per concentrarsi e ripassare' : 'Chronomètre d\'étude concentrée'}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate max-w-xl">
                  {isIt 
                    ? 'Puoi studiare liberamente o selezionare un compito per collegarlo al timer:' 
                    : 'Sélectionnez un devoir pour lier votre temps d\'étude :'}
                </p>
              </div>
            )}

            {/* Quick Homework Selector Dropdown */}
            {pendingHomework.length > 0 && (
              <div className="pt-0.5 flex items-center gap-2 flex-wrap">
                <select
                  value={activeStudyHomework?.id || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) {
                      onClearActiveHomework?.();
                    } else {
                      onSelectHomework?.(id);
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer max-w-xs truncate"
                >
                  <option value="">{isIt ? '-- Nessun compito (Ripasso libero) --' : '-- Aucun devoir (Révision libre) --'}</option>
                  {pendingHomework.map((h) => (
                    <option key={h.id} value={h.id}>
                      [{h.subject}] {h.title} (~{h.estimatedMinutes}m)
                    </option>
                  ))}
                </select>
                {activeStudyHomework && (
                  <button
                    onClick={() => onClearActiveHomework?.()}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                  >
                    {isIt ? 'Scollega' : 'Dissocier'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Tactile Timer & Control Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-slate-900 tracking-tight">
                {formatTimer(timerSeconds)}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                {timerMode === 'study' ? (isIt ? 'Concentrazione' : 'Concentration') : (isIt ? 'Pausa' : 'Pause')}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsRunning(!isRunning);
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs shadow-xs transition active:scale-95 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-400'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? (isIt ? 'Pausa' : 'Pause') : (isIt ? 'Avvia' : 'Démarrer')}</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsRunning(false);
                  setTimerSeconds(defaultMinutes * 60);
                }}
                className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                title={isIt ? 'Ricomincia timer' : 'Réinitialiser'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {activeStudyHomework && (
                <button
                  onClick={handleFinishHomework}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                  title={isIt ? 'Segna come completato' : 'Marquer comme fait'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isIt ? 'Fatto!' : 'Terminé !'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2.1 SMART CONTEXT STUDY KIT (Topic-Aware Guidance) */}
      {smartAid && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-xs shadow-xs border border-amber-500">
                {isIt ? smartAid.badgeLabel_it : smartAid.badgeLabel_fr}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {isIt ? '⚡ Riconoscimento automatico del compito' : '⚡ Reconnaissance automatique'}
              </span>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setSubTool('quiz');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border border-amber-500 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-900" />
              <span>{isIt ? 'Mettiti alla prova su questo argomento ➔' : 'Quiz sur ce sujet ➔'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Title & Formula */}
            <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-amber-200 space-y-2.5">
              <h4 className="text-sm font-black text-amber-950">
                {isIt ? smartAid.title_it : smartAid.title_fr}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {isIt ? smartAid.summary_it : smartAid.summary_fr}
              </p>
              {smartAid.formula && (
                <div className="bg-amber-100/70 p-2.5 rounded-xl border border-amber-300 font-mono text-xs font-black text-amber-950">
                  {smartAid.formula}
                </div>
              )}
            </div>

            {/* Middle: Mnemonic & Trap Alert */}
            <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-amber-200 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <span>💡</span>
                  <span>{isIt ? 'Trucco Mnemonico & Scorciatoia' : 'Astuce Mnémonique'}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  {isIt ? smartAid.memoryTrick_it : smartAid.memoryTrick_fr}
                </p>
              </div>

              {(smartAid.commonTrap_it || smartAid.commonTrap_fr) && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-900 font-medium">
                  <strong className="font-black text-red-950 block">⚠️ {isIt ? 'Attenzione al tranello:' : 'Attention au piège :'}</strong>
                  {isIt ? smartAid.commonTrap_it : smartAid.commonTrap_fr}
                </div>
              )}
            </div>

            {/* Right: Step-by-Step Method */}
            <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                <span>📋</span>
                <span>{isIt ? 'I Passaggi Chiave per le Verifiche' : 'Méthode Pas-à-Pas (DNB)'}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium max-h-48 overflow-y-auto pr-1">
                {(isIt ? smartAid.stepByStepGuide_it : smartAid.stepByStepGuide_fr).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-black shrink-0">✓</span>
                    <span className="text-[11px] leading-tight">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Subject Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80">
        {[
          { id: 'math', label: isIt ? 'Matematica' : 'Maths', icon: Calculator },
          { id: 'french', label: isIt ? 'Francese' : 'Français', icon: BookOpen },
          { id: 'science', label: isIt ? 'Scienze & Fisica' : 'Sciences & SVT', icon: Atom },
          { id: 'history', label: isIt ? 'Storia & Geo' : 'Histoire-Géo', icon: History },
          { id: 'quiz', label: isIt ? 'Quiz & Verifiche' : 'Quiz & Brevet', icon: Trophy },
          { id: 'tech', label: isIt ? 'Informatica' : 'Techno & Code', icon: Cpu },
          { id: 'languages', label: isIt ? 'Inglese' : 'Anglais', icon: Globe2 },
          { id: 'notes', label: isIt ? 'Appunti' : 'Notes', icon: FileText },
          { id: 'method', label: isIt ? 'Metodo' : 'Méthode', icon: Award },
          { id: 'serenity', label: isIt ? 'Anti-Ansia' : 'Sérénité', icon: Heart }
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = subTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                soundFx.playClick();
                setSubTool(tool.id as any);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 4. MATHEMATICS TAB */}
      {/* ============================================================ */}
      {subTool === 'math' && (
        <div className="space-y-5">
          {/* Conversions Table (Tableau de Conversion) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                  {isIt ? 'Conversione' : 'Conversion'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  {isIt ? 'Convertitore di Unità (m, g, L)' : 'Convertisseur d\'Unités (m, g, L)'}
                </h3>
              </div>

              {/* Type Switcher */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['length', 'mass', 'volume'] as const).map((tType) => (
                  <button
                    key={tType}
                    onClick={() => {
                      setConvType(tType);
                      if (tType === 'length') { setConvFrom('m'); setConvTo('cm'); }
                      if (tType === 'mass') { setConvFrom('kg'); setConvTo('g'); }
                      if (tType === 'volume') { setConvFrom('L'); setConvTo('mL'); }
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      convType === tType ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tType === 'length' ? (isIt ? 'Lunghezze (m)' : 'Longueurs') : tType === 'mass' ? (isIt ? 'Masse (g)' : 'Masses') : (isIt ? 'Capacità (L)' : 'Volumes')}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{isIt ? 'Valore :' : 'Valeur :'}</label>
                <input
                  type="number"
                  value={convInput}
                  onChange={(e) => setConvInput(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold text-sm bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{isIt ? 'Da :' : 'De :'}</label>
                <select
                  value={convFrom}
                  onChange={(e) => setConvFrom(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900"
                >
                  {Object.keys(convType === 'length' ? lengthUnits : convType === 'mass' ? massUnits : volUnits).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{isIt ? 'A :' : 'Vers :'}</label>
                <select
                  value={convTo}
                  onChange={(e) => setConvTo(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900"
                >
                  {Object.keys(convType === 'length' ? lengthUnits : convType === 'mass' ? massUnits : volUnits).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="sm:text-right pt-2 sm:pt-0">
                <div className="text-[10px] text-slate-500 font-bold">{isIt ? 'Risultato :' : 'Résultat :'}</div>
                <div className="text-xl font-mono font-black text-amber-700">
                  {getConvResult()} {convTo}
                </div>
              </div>
            </div>

            {/* Visual Tableau Columns */}
            {convType === 'length' && (
              <div className="overflow-x-auto">
                <table className="w-full text-center border border-amber-300 rounded-xl text-xs font-mono">
                  <thead className="bg-amber-200 text-amber-950 font-black">
                    <tr>
                      <th className="p-2 border-r border-amber-300">km</th>
                      <th className="p-2 border-r border-amber-300">hm</th>
                      <th className="p-2 border-r border-amber-300">dam</th>
                      <th className="p-2 border-r border-amber-300 bg-amber-300">m (Unité)</th>
                      <th className="p-2 border-r border-amber-300">dm</th>
                      <th className="p-2 border-r border-amber-300">cm</th>
                      <th className="p-2">mm</th>
                    </tr>
                  </thead>
                  <tbody className="bg-amber-50/50 text-slate-700">
                    <tr>
                      <td className="p-2 border-r border-amber-200">1 000 m</td>
                      <td className="p-2 border-r border-amber-200">100 m</td>
                      <td className="p-2 border-r border-amber-200">10 m</td>
                      <td className="p-2 border-r border-amber-200 font-bold">1 m</td>
                      <td className="p-2 border-r border-amber-200">0.1 m</td>
                      <td className="p-2 border-r border-amber-200">0.01 m</td>
                      <td className="p-2">0.001 m</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pythagoras with Direct & Reciprocal Modes + Visual SVG */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {isIt ? 'Geometria' : 'Géométrie'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  {isIt ? 'Teorema di Pitagora (Diretto & Reciproco)' : 'Théorème de Pythagore'}
                </h3>
              </div>
              <div className="text-2xl">📐</div>
            </div>

            {/* SVG Visual Triangle Diagram */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
              <svg viewBox="0 0 240 140" className="w-60 h-32">
                <polygon points="40,110 180,110 40,30" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
                <rect x="40" y="95" width="15" height="15" fill="none" stroke="#D97706" strokeWidth="2" />
                <text x="25" y="120" className="text-xs font-bold fill-slate-800">A (90°)</text>
                <text x="185" y="120" className="text-xs font-bold fill-slate-800">B</text>
                <text x="30" y="25" className="text-xs font-bold fill-slate-800">C</text>
                <text x="100" y="128" className="text-[11px] font-bold fill-slate-700">AB = {sideA || 'a'}</text>
                <text x="15" y="70" className="text-[11px] font-bold fill-slate-700">AC = {sideB || 'b'}</text>
                <text x="120" y="65" className="text-[11px] font-bold fill-amber-700">BC (Hypoténuse) = {pythagoreResult?.resultVal || sideC}</text>
              </svg>
              <p className="text-xs text-slate-600 font-medium text-center">
                {isIt ? 'Formula : BC² = AB² + AC² (Ipotenusa² = somma dei quadrati dei cateti)' : 'Formule : BC² = AB² + AC²'}
              </p>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setPythMode('hypotenuse')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                  pythMode === 'hypotenuse'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 font-black'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200'
                }`}
              >
                {isIt ? '1. Calcola Ipotenusa (BC)' : '1. Calculer l\'Hypoténuse'}
              </button>
              <button
                onClick={() => setPythMode('side')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                  pythMode === 'side'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 font-black'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200'
                }`}
              >
                {isIt ? '2. Calcola un Cateto (AC)' : '2. Calculer un Côté de l\'angle droit'}
              </button>
              <button
                onClick={() => setPythMode('reciproque')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                  pythMode === 'reciproque'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 font-black'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200'
                }`}
              >
                {isIt ? '3. Reciproca (È rettangolo ?)' : '3. Réciproque (Est-il rectangle ?)'}
              </button>
            </div>

            {/* Inputs */}
            {pythMode === 'hypotenuse' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Côté AB (cm) :</label>
                  <input
                    type="number"
                    value={sideA}
                    onChange={(e) => setSideA(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm text-amber-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Côté AC (cm) :</label>
                  <input
                    type="number"
                    value={sideB}
                    onChange={(e) => setSideB(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm text-amber-950"
                  />
                </div>
              </div>
            )}

            {pythMode === 'side' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Hypoténuse BC (cm) :</label>
                  <input
                    type="number"
                    value={sideC}
                    onChange={(e) => setSideC(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm text-amber-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Autre Côté AB (cm) :</label>
                  <input
                    type="number"
                    value={sideA}
                    onChange={(e) => setSideA(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm text-amber-950"
                  />
                </div>
              </div>
            )}

            {pythMode === 'reciproque' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Côté 1 (cm) :</label>
                  <input
                    type="number"
                    value={sideA}
                    onChange={(e) => setSideA(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm text-amber-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Côté 2 (cm) :</label>
                  <input
                    type="number"
                    value={sideB}
                    onChange={(e) => setSideB(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm text-amber-950"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Côté 3 (cm) :</label>
                  <input
                    type="number"
                    value={sideC}
                    onChange={(e) => setSideC(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm text-amber-950"
                  />
                </div>
              </div>
            )}

            {/* Steps Demonstration */}
            {pythagoreResult && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
                <div className="font-extrabold text-xs text-emerald-950 flex items-center justify-between">
                  <span>{isIt ? 'Dimostrazione formale (come richiesta dai professori francesi) :' : 'Rédaction officielle collège :'}</span>
                  <span className="text-emerald-700 text-sm font-black">✓ Modèle Type</span>
                </div>
                <div className="font-mono text-xs text-emerald-900 space-y-1 bg-white/70 p-3 rounded-xl border border-emerald-200">
                  {pythagoreResult.steps.map((step, idx) => (
                    <div key={idx}>{step}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Thalès Theorem & Identités Remarquables Helper */}
          <ThalesAndIdentities language={profile.language} />

          {/* Fractions & Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fractions Helper */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Calcolo con Frazioni' : 'Fractions & Simplification'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {isIt ? 'Calcolatore di Frazioni Completo' : 'Calculateur de Fractions'}
              </h3>

              <div className="flex items-center gap-3 flex-wrap bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                {/* Fraction 1 */}
                <div className="flex flex-col items-center gap-1">
                  <input type="number" value={fracA} onChange={(e) => setFracA(e.target.value)} className="w-12 p-1.5 text-center rounded-lg border font-mono font-bold text-xs bg-white" />
                  <div className="w-12 h-0.5 bg-slate-400" />
                  <input type="number" value={fracB} onChange={(e) => setFracB(e.target.value)} className="w-12 p-1.5 text-center rounded-lg border font-mono font-bold text-xs bg-white" />
                </div>

                {/* Operator Selector */}
                <select
                  value={fracOp}
                  onChange={(e) => setFracOp(e.target.value as any)}
                  className="p-2 rounded-xl border border-amber-300 font-mono font-black text-base bg-white text-amber-950"
                >
                  <option value="+">+</option>
                  <option value="-">−</option>
                  <option value="*">×</option>
                  <option value="/">÷</option>
                </select>

                {/* Fraction 2 */}
                <div className="flex flex-col items-center gap-1">
                  <input type="number" value={fracC} onChange={(e) => setFracC(e.target.value)} className="w-12 p-1.5 text-center rounded-lg border font-mono font-bold text-xs bg-white" />
                  <div className="w-12 h-0.5 bg-slate-400" />
                  <input type="number" value={fracD} onChange={(e) => setFracD(e.target.value)} className="w-12 p-1.5 text-center rounded-lg border font-mono font-bold text-xs bg-white" />
                </div>

                <span className="text-xl font-black text-amber-900">=</span>

                {/* Result */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-amber-400 text-amber-950 border border-amber-500 font-mono font-black text-sm">
                    <span>{simpNum}</span>
                    <div className="w-10 h-0.5 bg-amber-950 my-0.5" />
                    <span>{simpDen}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                💡 {fracOp === '+' || fracOp === '-' 
                  ? (isIt ? 'Somma/Sottrazione : si riducono allo stesso denominatore !' : 'Addition/Soustraction : même dénominateur obligatoire.')
                  : fracOp === '*'
                  ? (isIt ? 'Moltiplicazione : si moltiplicano i numeratori tra loro e i denominatori tra loro !' : 'Multiplication : on multiplie les numérateurs entre eux et les dénominateurs entre eux.')
                  : (isIt ? 'Divisione : si moltiplica per l\'inverso della seconda frazione (a/b ÷ c/d = a/b × d/c) !' : 'Division : on multiplie par l\'inverse de la deuxième fraction !')}
              </p>
            </div>

            {/* Scientific Notation & Powers of 10 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Potenze di 10 & Notazione Scientifica' : 'Puissances de 10 & Écriture Scientifique'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {isIt ? 'Convertitore in Notazione Scientifica' : 'Écriture Scientifique (a × 10ⁿ)'}
              </h3>

              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isIt ? 'Numero decimale da convertire :' : 'Nombre à convertir :'}
                  </label>
                  <input
                    type="number"
                    value={powerBase}
                    onChange={(e) => setPowerBase(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-mono font-bold text-sm bg-white"
                  />
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{isIt ? 'Forma scientifica :' : 'Écriture scientifique :'}</span>
                  <span className="font-mono font-black text-base text-amber-950">
                    {sciResult.a} × 10<sup>{sciResult.exp}</sup>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                📐 {isIt ? 'Regola ufficiale : il numero "a" deve essere compreso tra 1 e 9.999 (1 ≤ a < 10).' : 'Règle : "a" doit toujours être compris entre 1 et 10 strictement (1 ≤ a < 10).'}
              </p>
            </div>
          </div>

          {/* Linear Equation Solver (ax + b = c) & Solid Volumes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Linear Equation Solver */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Algebra 4ème • Calcolo Letterale' : 'Équations du 1er Degré (ax + b = c)'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {isIt ? 'Risolutore di Equazioni di 1° Grado' : 'Résolveur d\'Équations Guidé'}
              </h3>

              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 flex-wrap text-sm font-mono font-bold text-amber-950">
                  <input
                    type="number"
                    value={eqA}
                    onChange={(e) => setEqA(e.target.value)}
                    className="w-14 p-1.5 text-center rounded-xl border border-amber-300 bg-white"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    value={eqB}
                    onChange={(e) => setEqB(e.target.value)}
                    className="w-14 p-1.5 text-center rounded-xl border border-amber-300 bg-white"
                  />
                  <span>=</span>
                  <input
                    type="number"
                    value={eqC}
                    onChange={(e) => setEqC(e.target.value)}
                    className="w-14 p-1.5 text-center rounded-xl border border-amber-300 bg-white"
                  />
                </div>

                {eqResult && !eqResult.error && (
                  <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-1 font-mono text-xs text-amber-900">
                    <div className="text-slate-500 font-sans font-bold">{isIt ? 'Passaggi :' : 'Étapes de résolution :'}</div>
                    <div>1. {eqResult.step1}</div>
                    <div>2. {eqResult.step2}</div>
                    <div className="text-emerald-700 font-bold text-sm pt-1">➔ Solution : x = {eqResult.x}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Geometric Solids & Volumes */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Geometria nello Spazio' : 'Géométrie dans l\'Espace • Volumes'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {isIt ? 'Volumi dei Solidi (Prismi, Cilindri, Piramidi)' : 'Formulaire des Volumes'}
              </h3>

              <div className="flex gap-1 overflow-x-auto pb-1">
                {geometricSolids.map((solid, idx) => (
                  <button
                    key={solid.name}
                    onClick={() => setSelectedSolid(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                      selectedSolid === idx ? 'bg-amber-400 text-amber-950 font-black' : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {solid.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {geometricSolids[selectedSolid] && (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-amber-950 text-sm">
                      {isIt ? geometricSolids[selectedSolid].itName : geometricSolids[selectedSolid].name}
                    </h4>
                    <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                      {geometricSolids[selectedSolid].volumeFormula}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    {isIt ? geometricSolids[selectedSolid].itExplanation : geometricSolids[selectedSolid].explanation}
                  </p>
                  <div className="text-[11px] font-mono bg-white p-2 rounded-xl border border-amber-300 text-amber-900">
                    💡 Exemple : {geometricSolids[selectedSolid].example}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. FRENCH & LITERATURE TAB */}
      {/* ============================================================ */}
      {subTool === 'french' && (
        <div className="space-y-6">
          {/* Interactive Verb Conjugator */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                  {isIt ? 'Coniugatore di Verbi Francesi del Collège' : 'Conjugueur Officiel de Collège'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {isIt ? 'Coniugazione Completa per i Compiti di Francese' : 'Tableaux de Conjugaison'}
                </h3>
              </div>

              {/* Verb Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={isIt ? 'Cerca verbo (es: avoir, faire)...' : 'Rechercher un verbe...'}
                  value={verbSearch}
                  onChange={(e) => setVerbSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-amber-300 text-xs font-bold bg-amber-50 text-amber-950 w-52"
                />
              </div>
            </div>

            {/* Verb Selection Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {filteredVerbs.map((v, idx) => (
                <button
                  key={v.verb}
                  onClick={() => setSelectedVerbIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition cursor-pointer ${
                    (filteredVerbs[selectedVerbIdx]?.verb === v.verb)
                      ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-500 scale-[1.02]'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {v.verb} <span className="text-[10px] opacity-75">({v.meaning_it})</span>
                </button>
              ))}
            </div>

            {/* Tense Tabs */}
            <div className="flex gap-1 bg-amber-50 p-1 rounded-2xl border border-amber-200 overflow-x-auto">
              {[
                { id: 'present', label: isIt ? 'Présent' : 'Présent' },
                { id: 'imparfait', label: isIt ? 'Imparfait' : 'Imparfait' },
                { id: 'passeSimple', label: isIt ? 'Passé Simple (Récits)' : 'Passé Simple' },
                { id: 'futur', label: isIt ? 'Futur Simple' : 'Futur' },
                { id: 'conditionnel', label: isIt ? 'Conditionnel' : 'Conditionnel' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTense(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                    selectedTense === t.id ? 'bg-amber-400 text-amber-950 font-black' : 'text-slate-600 hover:text-amber-950'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Conjugation Display Grid */}
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <span className="font-extrabold text-amber-950 text-base capitalize">
                  Verbe : <span className="underline decoration-amber-400">{currentVerb.verb}</span> ({currentVerb.group} groupe)
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
                  Passé composé : {currentVerb.passeCompose}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentVerb[selectedTense].map((form, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-amber-300 font-mono font-bold text-sm text-amber-950 shadow-xs">
                    {form}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Official 4ème Literary Themes (Maupassant, Poésie, Molière, etc.) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Programma Ministeriale di Letteratura 4ème' : 'Programme de Littérature 4ème (Cycle 4)'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'I 5 Grandi Temi Letterari di 4ème' : 'Les 5 Thèmes Littéraires au Programme'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frenchLiteratureThemes4eme.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="font-black text-sm text-amber-950">{item.theme}</div>
                  <div className="text-xs font-extrabold text-amber-800">Auteurs clés : {item.author}</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{item.keyPoint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Homophones Guide (Anti-Faute d'orthographe) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Ortografia & Omofoni (I tranelli classici dei prof)' : 'Guide des Homophones Grammaticaux'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'I Tranelli Ortografici più Frequenti (a/à, et/est, son/sont...)' : 'Les Pièges Classiques à Éviter'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {homophones.map((h, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                  <div className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-300">{h.pair}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{h.rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Boîte à mots (Synonyms) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Lessico Ricco per le Redazioni' : 'Boîte à Mots & Synonymes Riches'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'Come Sostituire le Parole Ripetitive nei Testi Scritti' : 'Éviter les Mots Simples dans les Récits'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {richSynonyms.map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="font-extrabold text-xs text-amber-950 flex items-center justify-between">
                    <span>Ne plus dire : <span className="underline decoration-red-400 font-black">"{s.word}"</span></span>
                    <span className="text-[10px] text-slate-500 font-normal">({s.itWord})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.synonyms.map((syn, synIdx) => (
                      <span key={synIdx} className="px-2 py-1 bg-white text-emerald-900 font-bold text-xs rounded-lg border border-amber-300">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Figures de Style (Collège & Brevet) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Figure Retoriche & Analisi del Testo' : 'Figures de Style & Brevet'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'Le 6 Figure di Stile Essenziali per i Compiti' : 'Les Figures de Style Majeures'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {frenchFiguresOfStyle.map((fig, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-amber-950">{fig.name}</span>
                    <span className="text-[10px] font-bold text-slate-500">({fig.itName})</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {isIt ? fig.itDefinition : fig.definition}
                  </p>
                  <div className="p-2 bg-white rounded-xl border border-amber-200 text-[11px] text-amber-900 italic">
                    {fig.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. SCIENCE TAB (PHYSIQUE-CHIMIE & SVT) */}
      {/* ============================================================ */}
      {subTool === 'science' && (
        <div className="space-y-6">
          {/* Ohm's Law Pyramid */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                  {isIt ? 'Fisica 4ème • Elettricità' : 'Physique 4ème • Loi d\'Ohm'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {isIt ? 'Piramide Interattiva della Legge di Ohm (U = R × I)' : 'Pyramide de Calcul Loi d\'Ohm'}
                </h3>
              </div>
              <div className="text-2xl">⚡</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Pyramid SVG */}
              <div className="flex flex-col items-center justify-center p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
                <svg viewBox="0 0 200 160" className="w-52 h-40">
                  <polygon points="100,10 10,150 190,150" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
                  <line x1="55" y1="80" x2="145" y2="80" stroke="#D97706" strokeWidth="2" />
                  <line x1="100" y1="80" x2="100" y2="150" stroke="#D97706" strokeWidth="2" />
                  <text
                    x="92" y="60"
                    className={`text-lg font-black cursor-pointer ${ohmTarget === 'U' ? 'fill-emerald-700 font-extrabold scale-110' : 'fill-slate-800'}`}
                    onClick={() => setOhmTarget('U')}
                  >
                    U
                  </text>
                  <text
                    x="50" y="125"
                    className={`text-lg font-black cursor-pointer ${ohmTarget === 'R' ? 'fill-emerald-700 font-extrabold' : 'fill-slate-800'}`}
                    onClick={() => setOhmTarget('R')}
                  >
                    R
                  </text>
                  <text
                    x="135" y="125"
                    className={`text-lg font-black cursor-pointer ${ohmTarget === 'I' ? 'fill-emerald-700 font-extrabold' : 'fill-slate-800'}`}
                    onClick={() => setOhmTarget('I')}
                  >
                    I
                  </text>
                </svg>
                <div className="text-xs text-amber-900 font-bold mt-1 text-center">
                  {isIt ? 'Clicca su U, R o I nella piramide per isolare la formula' : 'Cliquez sur la grandeur cherchée'}
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(['U', 'R', 'I'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setOhmTarget(g)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                        ohmTarget === g ? 'bg-amber-400 text-amber-950 border-amber-500' : 'bg-white text-slate-700 border-amber-200'
                      }`}
                    >
                      {g === 'U' ? (isIt ? 'Trova U (Volt)' : 'Trouver U (Tension)') : g === 'R' ? (isIt ? 'Trova R (Ohm)' : 'Trouver R (Résistance)') : (isIt ? 'Trova I (Ampère)' : 'Trouver I (Intensité)')}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
                  <div className="font-mono font-black text-emerald-950 text-sm">
                    {ohmResult.formula} ➔ {ohmResult.val} {ohmResult.unit}
                  </div>
                  <div className="text-xs text-slate-600">
                    {ohmTarget === 'U' && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <label className="text-[10px] font-bold block">Résistance R (Ω) :</label>
                          <input type="number" value={valR} onChange={(e) => setValR(e.target.value)} className="w-full p-1.5 rounded-lg border font-mono text-xs bg-white" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block">Intensité I (A) :</label>
                          <input type="number" value={valI} onChange={(e) => setValI(e.target.value)} className="w-full p-1.5 rounded-lg border font-mono text-xs bg-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Speed & Density Calculators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speed & Light vs Sound */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Movimento & Velocità' : 'Vitesse & Signaux (v = d / t)'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {isIt ? 'Convertitore km/h ➔ m/s' : 'Convertisseur de Vitesse'}
              </h3>

              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={speedKmH}
                    onChange={(e) => setSpeedKmH(e.target.value)}
                    className="w-24 p-2 rounded-xl border border-amber-300 font-mono font-bold text-sm bg-white"
                  />
                  <span className="font-bold text-xs text-slate-700">km/h =</span>
                  <span className="font-mono font-black text-base text-amber-950 bg-white px-3 py-1.5 rounded-xl border border-amber-300">
                    {speedMS} m/s
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  💡 {isIt ? 'Regola facile : Per passare da km/h a m/s basta dividere per 3.6 (e moltiplicare per 3.6 per fare il contrario) !' : 'Astuce : Diviser par 3,6 pour passer des km/h aux m/s.'}
                </div>
              </div>

              {/* Speed of light vs sound box */}
              <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-300 space-y-1 text-xs">
                <div className="font-black text-amber-950">⚡ Repères Universels :</div>
                <div>• Vitesse de la lumière : <strong>300 000 km/s</strong> (quasi-instantané).</div>
                <div>• Vitesse du son dans l'air : <strong>340 m/s</strong> (1 km en 3 secondes).</div>
              </div>
            </div>

            {/* Masse Volumique (Density) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Chimica 4ème • Materia' : 'Masse Volumique (ρ = m / V)'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {isIt ? 'Calcolatore di Massa Volumica' : 'Calculateur de Masse Volumique'}
              </h3>

              <div className="grid grid-cols-2 gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Masse m (g) :</label>
                  <input
                    type="number"
                    value={massG}
                    onChange={(e) => setMassG(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-300 font-mono font-bold text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Volume V (cm³) :</label>
                  <input
                    type="number"
                    value={volCm3}
                    onChange={(e) => setVolCm3(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-300 font-mono font-bold text-xs bg-white"
                  />
                </div>
                <div className="col-span-2 pt-2 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Masse volumique ρ :</span>
                  <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                    {density} g/cm³
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600">
                💧 Eau pure = 1 g/cm³ (si ρ &lt; 1, l'objet flotte sur l'eau !).
              </p>
            </div>
          </div>

          {/* Curriculum Summary Cards (Circuits, Air, Plate Tectonics, Genetics) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Schede di Ripasso Ministeriali 4ème' : 'Fiches Synthèse Sciences de 4ème'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'I Concetti Chiave da Sapere per le Interrogazioni' : 'Les Notions Indispensables'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scienceTopics4eme.map((topic, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-300 text-amber-950">
                      {topic.category}
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-amber-950">
                    {isIt ? topic.itTitle : topic.title}
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    {topic.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Periodic Table & pH Scale */}
          <PeriodicTableSection language={profile.language} />
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. HISTORY-GEOGRAPHY & CIVICS (EMC) */}
      {/* ============================================================ */}
      {subTool === 'history' && (
        <div className="space-y-6">
          {/* Method D.A.N.S. for Analyzing Documents */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Metodo Indispensabile per le Verifiche' : 'Méthode d\'Analyse Documentaire Collège'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'Il Metodo D.A.N.S. (per presentare qualsiasi documento)' : 'La Méthode D.A.N.S.'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { letter: 'D', word: 'Date', desc: isIt ? 'Quando è stato creato il documento ?' : 'Date de création' },
                { letter: 'A', word: 'Auteur', desc: isIt ? 'Chi l\'ha scritto o dipinto ?' : 'Qui a écrit / peint ?' },
                { letter: 'N', word: 'Nature', desc: isIt ? 'Che cos\'è ? (Lettera, quadro, legge, articolo)' : 'Texte, carte, tableau...' },
                { letter: 'S', word: 'Sujet', desc: isIt ? 'Di cosa parla esattamente ?' : 'De quoi ça parle ?' }
              ].map((item) => (
                <div key={item.letter} className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-1">
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black inline-flex items-center justify-center text-sm shadow-xs">
                    {item.letter}
                  </span>
                  <div className="font-extrabold text-xs text-amber-950">{item.word}</div>
                  <div className="text-[11px] text-slate-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 4ème History & Geography Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Programma Ufficiale di Storia-Geografia 4ème' : 'Programme Histoire-Géographie-EMC 4ème'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'I Capitoli Chiave del Programma Scolastico' : 'Fiches de Cours par Période'}
            </h3>

            <div className="space-y-4">
              {historyGeography4eme.map((topic, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-300 text-amber-950">
                      {topic.period}
                    </span>
                    <span className="text-xs font-extrabold text-amber-900">
                      {isIt ? topic.itTitle : topic.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {isIt ? topic.itDescription : topic.description}
                  </p>
                  <div className="pt-2 border-t border-amber-200/80">
                    <div className="text-[11px] font-bold text-amber-950 mb-1">
                      {isIt ? 'Concetti e date da memorizzare :' : 'Points clés à retenir :'}
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-800">
                      {topic.keyConcepts.map((c, cIdx) => (
                        <li key={cIdx} className="bg-white p-2 rounded-xl border border-amber-200 flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Historical Timeline & Geography */}
          <HistoryTimelineSection language={profile.language} />
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. LANGUAGES & BILINGUAL TOOLS */}
      {/* ============================================================ */}
      {subTool === 'languages' && (
        <div className="space-y-6">
          {/* English Irregular Verbs with Search */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                  {isIt ? 'Inglese 4ème • I Verbi Irregolari' : 'Verbes Irréguliers d\'Anglais'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {isIt ? 'Dizionario Istantaneo dei Verbi Irregolari' : 'Tableau des Verbes Irréguliers'}
                </h3>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={isIt ? 'Cerca verbo inglese o traduzione...' : 'Rechercher un verbe...'}
                  value={englishSearch}
                  onChange={(e) => setEnglishSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-amber-300 text-xs font-bold bg-amber-50 text-amber-950 w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-200 text-amber-950 font-black">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">Base Form</th>
                    <th className="p-2.5">Past Simple</th>
                    <th className="p-2.5">Past Participle</th>
                    <th className="p-2.5">Français</th>
                    <th className="p-2.5 rounded-r-xl">Italiano</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 font-mono">
                  {filteredEnglishVerbs.map((v) => (
                    <tr key={v.base} className="hover:bg-amber-50/50">
                      <td className="p-2.5 font-bold text-amber-950">{v.base}</td>
                      <td className="p-2.5 text-emerald-800 font-extrabold">{v.past}</td>
                      <td className="p-2.5 text-amber-800">{v.part}</td>
                      <td className="p-2.5 font-sans text-slate-700">{v.fr}</td>
                      <td className="p-2.5 font-sans text-slate-700">{v.it}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* False Friends (Italo-French) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Falsi Amici Italo-Francesi (Attenzione ai tranelli !)' : 'Faux-Amis Français - Italien'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'Parole che sembrano uguali ma hanno significati diversi' : 'Les Pièges Bilingues'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {falseFriends.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-amber-950">🇮🇹 {f.it} ↔ 🇫🇷 {f.fr}</span>
                  </div>
                  <p className="text-xs text-rose-800 font-bold">⚠️ {f.danger}</p>
                  <p className="text-[11px] text-slate-700 italic">Ex : {f.ex}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. TECHNOLOGY & ALGORITHMIC (SCRATCH & PYTHON) */}
      {/* ============================================================ */}
      {subTool === 'tech' && (
        <TechAlgorithmSection language={profile.language} />
      )}

      {/* ============================================================ */}
      {/* 10. MULTI-SUBJECT QUIZ LABORATORY */}
      {/* ============================================================ */}
      {subTool === 'quiz' && (
        <QuizLaboratorySection 
          language={profile.language} 
          activeDomain={smartAid?.domain}
          gradeCycle={currentGradeCycle}
          defaultGradeLevel={defaultGradeLevel}
        />
      )}

      {/* ============================================================ */}
      {/* 11. METHODOLOGY & EXAM TIPS (Anti-Stress) */}
      {/* ============================================================ */}
      {subTool === 'method' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Consigli per Voti Alti senza Stress' : 'Méthode de Travail & Réussite'}
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {isIt ? 'I Segreti del Metodo di Studio nel Collège Francese' : 'Comment Réussir ses Contrôles'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {studyMethods.map((method, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm">
                      {idx + 1}
                    </div>
                    <h4 className="font-extrabold text-sm text-amber-950">
                      {isIt ? method.itTitle : method.title}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {isIt ? method.itDescription : method.description}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5 text-xs text-slate-800">
                    {method.checklist.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 10. SERENITY & MINDFULNESS SPACE */}
      {/* ============================================================ */}
      {subTool === 'serenity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                  {isIt ? 'Bolla di Calma • Anti-Ansia' : 'Pause & Respiration'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {isIt ? 'La Respirazione del Girasole (4-4-4)' : 'Respiration Guidée du Tournesol'}
                </h3>
              </div>
              <div className="text-2xl">🌻</div>
            </div>

            <p className="text-xs text-slate-600 font-medium max-w-xl">
              {isIt 
                ? 'Quando senti la testa pesante o un po\' di agitazione prima di un compito, fai 2 minuti di respirazione guidata : abbassa il battito cardiaco e riossigena il cervello.' 
                : 'Prenez 2 minutes pour respirer calmement et retrouver toute votre concentration.'}
            </p>

            <div className="flex flex-col items-center justify-center p-8 bg-amber-50/60 rounded-3xl border border-amber-200 space-y-5">
              <div
                className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-1000 shadow-lg ${
                  breathePhase === 'inspire'
                    ? 'scale-125 bg-amber-400 text-amber-950'
                    : breathePhase === 'hold'
                    ? 'scale-125 bg-yellow-300 text-amber-950 ring-8 ring-amber-300/40'
                    : breathePhase === 'expire'
                    ? 'scale-90 bg-amber-200 text-amber-900'
                    : 'scale-90 bg-amber-100 text-amber-800'
                }`}
              >
                <div className="text-center font-extrabold text-sm px-2">
                  {breathePhase === 'inspire' && (isIt ? 'Inspira con calma...' : 'Inspirez...')}
                  {breathePhase === 'hold' && (isIt ? 'Trattieni dolcemente' : 'Bloquez doucement')}
                  {breathePhase === 'expire' && (isIt ? 'Espira a fondo...' : 'Expirez lentement...')}
                  {breathePhase === 'wait' && (isIt ? 'Pausa serena' : 'Pause')}
                </div>
              </div>

              <button
                onClick={() => setBreatheActive(!breatheActive)}
                className={`px-5 py-2 rounded-2xl font-black text-xs transition cursor-pointer shadow-xs ${
                  breatheActive ? 'bg-amber-500 text-white' : 'bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-500'
                }`}
              >
                {breatheActive ? (isIt ? 'Ferma Respirazione' : 'Arrêter') : (isIt ? 'Inizia 2 Minuti di Calma' : 'Démarrer')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 11. PERSONAL STUDY NOTES */}
      {/* ============================================================ */}
      {subTool === 'notes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Taccuino Personale' : 'Cahier de Brouillon'}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {isIt ? `Gli Appunti & Promemoria di ${profile.name.split(' ')[0] || 'Studio'}` : `Notes de Travail de ${profile.name.split(' ')[0] || 'l\'Élève'}`}
              </h3>
            </div>

            <button
              onClick={saveNotes}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border border-amber-500 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {noteSaved ? <span>✓ {isIt ? 'Salvato !' : 'Enregistré !'}</span> : <span>💾 {isIt ? 'Salva Appunti' : 'Enregistrer'}</span>}
            </button>
          </div>

          <textarea
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            rows={10}
            className="w-full p-4 rounded-2xl border-2 border-amber-300 font-mono text-xs text-amber-950 bg-amber-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder={isIt ? 'Scrivi qui le formule da ricordare, i compiti o le parole nuove...' : 'Écrivez ici vos notes...'}
          />
        </div>
      )}
    </div>
  );
};
