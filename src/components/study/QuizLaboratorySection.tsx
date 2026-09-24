import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Trophy,
  Dices,
  Target,
  BookOpen,
  AlertTriangle,
  Flame,
  GraduationCap,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parametricQuizEngine } from '../../services/parametricQuizEngine';
import { curriculumQuizPool } from '../../data/schoolCurriculum';
import { soundFx } from '../../utils/audio';
import { 
  ParametricQuizQuestion, 
  GradeCycle, 
  FrenchGradeLevel, 
  QuizDifficultyLevel 
} from '../../types';

interface QuizLaboratorySectionProps {
  language: 'it' | 'fr';
  activeDomain?: string;
  gradeCycle?: GradeCycle;
  defaultGradeLevel?: FrenchGradeLevel;
}

interface GradeMeta {
  id: FrenchGradeLevel;
  shortName: string;
  fullName_it: string;
  fullName_fr: string;
  stage_it: string;
  stage_fr: string;
  age: string;
  cycle: GradeCycle;
  focus_it: string;
  focus_fr: string;
}

const FRENCH_GRADES: GradeMeta[] = [
  {
    id: 'cm1',
    shortName: 'CM1',
    fullName_it: 'CM1 (4ª Elementare)',
    fullName_fr: 'CM1 (Cycle 3)',
    stage_it: 'Primaria',
    stage_fr: 'Primaire',
    age: '9-10 ans',
    cycle: 'primaire',
    focus_it: 'Tabelline, Omofoni a/à, et/est, Grandi Numeri, Perimetri',
    focus_fr: 'Tables, Homophones de base, Périmètres, Numération'
  },
  {
    id: 'cm2',
    shortName: 'CM2',
    fullName_it: 'CM2 (5ª Elementare)',
    fullName_fr: 'CM2 (Cycle 3)',
    stage_it: 'Primaria',
    stage_fr: 'Primaire',
    age: '10-11 ans',
    cycle: 'primaire',
    focus_it: 'Decimali, Frazioni semplici, Aree rettangolo/triangolo, Accordi verbi',
    focus_fr: 'Nombres décimaux, Fractions simples, Aires, Accords être/avoir'
  },
  {
    id: '6eme',
    shortName: '6ème',
    fullName_it: '6ème (1ª Media)',
    fullName_fr: '6ème (Cycle 3)',
    stage_it: 'Collège',
    stage_fr: 'Collège',
    age: '11-12 ans',
    cycle: 'college',
    focus_it: 'Priorità operative, Angoli acuti/ottusi, COD/COI, Percentuali',
    focus_fr: 'Priorités opératoires, Vocabulaire des angles, COD/COI, Pourcentages'
  },
  {
    id: '5eme',
    shortName: '5ème',
    fullName_it: '5ème (2ª Media)',
    fullName_fr: '5ème (Cycle 4)',
    stage_it: 'Collège',
    stage_fr: 'Collège',
    age: '12-13 ans',
    cycle: 'college',
    focus_it: 'Numeri relativi, Somma angoli triangolo (180°), Regola dei segni',
    focus_fr: 'Nombres relatifs, Somme angles triangle (180°), Règle des signes'
  },
  {
    id: '4eme',
    shortName: '4ème',
    fullName_it: '4ème (3ª Media)',
    fullName_fr: '4ème (Cycle 4)',
    stage_it: 'Collège',
    stage_fr: 'Collège',
    age: '13-14 ans',
    cycle: 'college',
    focus_it: 'Pitagora, Legge di Ohm (U=R×I), Equazioni 1° grado, Subgiuntivo',
    focus_fr: 'Théorème de Pythagore, Loi d\'Ohm, Équations 1er degré, Subjonctif'
  },
  {
    id: '3eme',
    shortName: '3ème (Brevet)',
    fullName_it: '3ème (Esame Brevetto DNB)',
    fullName_fr: '3ème (Brevet DNB)',
    stage_it: 'Brevet',
    stage_fr: 'Brevet',
    age: '14-15 ans',
    cycle: 'brevet',
    focus_it: 'Thalès, Trigonometria (SOH CAH TOA), Energia Cinetica, Identità Notevoli',
    focus_fr: 'Thalès, Trigonométrie, Énergie cinétique, Identités remarquables'
  },
  {
    id: 'seconde',
    shortName: '2nde',
    fullName_it: '2nde (1° Superiore Lycée)',
    fullName_fr: 'Seconde (Tronc Commun)',
    stage_it: 'Lycée',
    stage_fr: 'Lycée',
    age: '15-16 ans',
    cycle: 'lycee',
    focus_it: 'Vettori del piano, Quantità di materia (Mole), Rette e collinearità',
    focus_fr: 'Vecteurs, Quantité de matière (Mole), Équations de droites'
  },
  {
    id: 'premiere',
    shortName: '1ère',
    fullName_it: '1ère (2° Superiore Spé & Bac)',
    fullName_fr: 'Première Spécialités',
    stage_it: 'Lycée',
    stage_fr: 'Lycée',
    age: '16-17 ans',
    cycle: 'lycee',
    focus_it: 'Discriminante Δ, Derivata xⁿ, Segno trinomio, Probabilità condizionate',
    focus_fr: 'Second degré (Δ), Dérivation, Signe du trinôme, Suites'
  },
  {
    id: 'terminale',
    shortName: 'Terminale',
    fullName_it: 'Terminale (Maturità Bac & Oral)',
    fullName_fr: 'Terminale (Baccalauréat)',
    stage_it: 'Lycée',
    stage_fr: 'Lycée',
    age: '17-18 ans',
    cycle: 'lycee',
    focus_it: 'Funzione Esponenziale, Logaritmo ln(u), Limiti e TVI, Integrali',
    focus_fr: 'Exponentielle, Logarithme népérien, Croissances comparées, Intégrales'
  }
];

export const QuizLaboratorySection: React.FC<QuizLaboratorySectionProps> = ({ 
  language,
  activeDomain,
  gradeCycle = 'college',
  defaultGradeLevel
}) => {
  const isIt = language === 'it';

  // 1. CLASS / GRADE SELECTION (Specific French school classes)
  const [selectedGrade, setSelectedGrade] = useState<FrenchGradeLevel>(() => {
    if (defaultGradeLevel) return defaultGradeLevel;
    if (gradeCycle === 'primaire') return 'cm2';
    if (gradeCycle === 'brevet') return '3eme';
    if (gradeCycle === 'lycee') return 'seconde';
    return '4eme';
  });

  // 2. DIFFICULTY LEVEL SELECTION (Easy / Medium / Hard / All)
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficultyLevel | 'all'>('all');

  // Mode: 'parametric' (infinite dynamic) | 'leitner' (spaced repetition review) | 'curriculum' (classic static)
  const [quizMode, setQuizMode] = useState<'parametric' | 'leitner' | 'curriculum'>('parametric');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Question State
  const [questions, setQuestions] = useState<ParametricQuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Mistakes count for spaced repetition badge
  const [pendingMistakesCount, setPendingMistakesCount] = useState(0);

  const updateMistakesCount = () => {
    setPendingMistakesCount(parametricQuizEngine.getPendingMistakesCount());
  };

  useEffect(() => {
    updateMistakesCount();
  }, []);

  // Sync if defaultGradeLevel prop updates from outside
  useEffect(() => {
    if (defaultGradeLevel) {
      setSelectedGrade(defaultGradeLevel);
    }
  }, [defaultGradeLevel]);

  // Generate or load questions when grade, difficulty, mode, or subject changes
  const loadQuestions = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentIdx(0);

    if (quizMode === 'parametric') {
      const currentMeta = FRENCH_GRADES.find(g => g.id === selectedGrade);
      const generated = parametricQuizEngine.generateQuizSet({
        gradeLevel: selectedGrade,
        gradeCycle: currentMeta ? currentMeta.cycle : gradeCycle,
        difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
        subject: subjectFilter === 'all' ? undefined : subjectFilter,
        count: 5
      });
      setQuestions(generated);
    } else if (quizMode === 'leitner') {
      const mistakes = parametricQuizEngine.getMistakes().filter(m => !m.mastered);
      if (mistakes.length > 0) {
        setQuestions(mistakes.map(m => m.question));
      } else {
        setQuestions([]);
      }
    } else {
      // Classic static pool adapted to parametric interface
      const pool = curriculumQuizPool
        .filter(q => subjectFilter === 'all' || q.subject === subjectFilter)
        .map(q => ({
          id: q.id,
          domain: 'general_study' as const,
          gradeLevel: selectedGrade,
          gradeCycle: 'college' as const,
          subject: q.subject,
          subject_it: q.subject,
          subject_fr: q.subject,
          difficulty: 'medium' as const,
          question_it: q.question_it,
          question_fr: q.question_fr,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation_it: q.explanation_it,
          explanation_fr: q.explanation_fr
        }));
      setQuestions(pool);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedGrade, selectedDifficulty, quizMode, subjectFilter]);

  const currentQuiz = questions[currentIdx];
  const activeGradeMeta = FRENCH_GRADES.find(g => g.id === selectedGrade) || FRENCH_GRADES[4];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQuiz) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuiz.correctIndex;
    if (isCorrect) {
      soundFx.playSuccess();
      setScore(s => s + 1);
      setStreak(st => st + 1);

      if (quizMode === 'leitner') {
        parametricQuizEngine.recordReviewResult(currentQuiz.id, true);
        updateMistakesCount();
      }
    } else {
      soundFx.playError();
      setStreak(0);
      parametricQuizEngine.saveMistake(currentQuiz, idx);
      updateMistakesCount();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      soundFx.playSuccess();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#A855F7']
      });
      loadQuestions();
    }
  };

  const handleReset = () => {
    soundFx.playClick();
    setScore(0);
    setStreak(0);
    loadQuestions();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-md space-y-6">
        {/* Header with Title and Score */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-md border border-amber-500 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{isIt ? 'Generatore Quiz Algoritmico per Classe' : 'Générateur de Quiz par Classe'}</span>
              </span>
              {streak >= 3 && (
                <span className="flex items-center gap-1 text-[11px] font-black text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300 animate-bounce">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{streak} {isIt ? 'di fila!' : 'd\'affilée !'}</span>
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-600" />
              <span>{isIt ? 'Quiz Dinamici Suddivisi per Classe & Difficoltà' : 'Quiz Personnalisés par Classe & Niveau'}</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
              {isIt
                ? 'Ogni classe del sistema scolastico francese (da CM1 fino a Terminale) dispone di algoritmi e livelli di difficoltà calibrati sul programma ministeriale.'
                : 'Chaque niveau scolaire (du CM1 à la Terminale) bénéficie d\'algorithmes paramétriques avec 3 niveaux de difficulté calibrés sur l\'Éducation Nationale.'}
            </p>
          </div>

          {/* Live Score pill */}
          <div className="flex items-center gap-3 bg-amber-100/90 px-4 py-2.5 rounded-2xl border-2 border-amber-300 shadow-xs">
            <Award className="w-5 h-5 text-amber-800" />
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                {isIt ? 'Punteggio' : 'Score'}
              </div>
              <div className="text-sm font-black text-amber-950">
                {score} / {questions.length > 0 ? `${currentIdx + (isAnswered ? 1 : 0)} / ${questions.length}` : '0'}
              </div>
            </div>
            <button
              onClick={handleReset}
              title={isIt ? 'Azzera e genera nuova serie' : 'Réinitialiser'}
              className="ml-2 p-1.5 rounded-lg hover:bg-amber-200 text-amber-900 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. QUIZ MODES: Parametric vs Spaced Repetition vs Classic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-amber-50 rounded-2xl border border-amber-200">
          <button
            onClick={() => setQuizMode('parametric')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-black text-xs transition cursor-pointer ${
              quizMode === 'parametric'
                ? 'bg-amber-500 text-white shadow-sm border border-amber-600 scale-[1.01]'
                : 'text-amber-950 hover:bg-white/80'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>{isIt ? '🎲 Quiz Infinito per Classe' : '🎲 Quiz Infini par Classe'}</span>
          </button>

          <button
            onClick={() => setQuizMode('leitner')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-black text-xs transition cursor-pointer relative ${
              quizMode === 'leitner'
                ? 'bg-purple-600 text-white shadow-sm border border-purple-700 scale-[1.01]'
                : 'text-purple-950 hover:bg-white/80'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>{isIt ? '🎯 Ripasso Errori (Leitner)' : '🎯 Révision des Erreurs'}</span>
            {pendingMistakesCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                quizMode === 'leitner' ? 'bg-white text-purple-700' : 'bg-purple-200 text-purple-950'
              }`}>
                {pendingMistakesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setQuizMode('curriculum')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-black text-xs transition cursor-pointer ${
              quizMode === 'curriculum'
                ? 'bg-emerald-600 text-white shadow-sm border border-emerald-700 scale-[1.01]'
                : 'text-emerald-950 hover:bg-white/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isIt ? '📚 Annali Ministeriali' : '📚 Annales Officielles'}</span>
          </button>
        </div>

        {/* 2. CLASS SELECTOR (All 9 French School Grades: CM1 to Terminale) */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>{isIt ? '1. Seleziona la Classe Scolastica :' : '1. Choisissez la Classe :'}</span>
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
              {isIt ? activeGradeMeta.fullName_it : activeGradeMeta.fullName_fr} ({activeGradeMeta.age})
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
            {FRENCH_GRADES.map((grade) => {
              const isSelected = selectedGrade === grade.id;
              return (
                <button
                  key={grade.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedGrade(grade.id);
                  }}
                  className={`p-2 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 font-black border-amber-500 shadow-sm scale-[1.03]'
                      : 'bg-white text-slate-700 hover:bg-amber-100/60 border-amber-200'
                  }`}
                >
                  <span className="text-xs font-black">{grade.shortName}</span>
                  <span className="text-[9px] text-amber-900/70 font-semibold truncate max-w-full">
                    {isIt ? grade.stage_it : grade.stage_fr}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
            <span className="text-amber-600 font-black shrink-0">💡 {isIt ? 'Obiettivi didattici :' : 'Compétences ciblées :'}</span>
            <span className="font-medium text-slate-700">
              {isIt ? activeGradeMeta.focus_it : activeGradeMeta.focus_fr}
            </span>
          </div>
        </div>

        {/* 3. DIFFICULTY LEVEL SELECTOR (Easy / Medium / Hard / All) */}
        <div className="bg-amber-100/60 p-3 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 shrink-0">
            <Sliders className="w-4 h-4 text-amber-700" />
            <span>{isIt ? '2. Livello di Difficoltà :' : '2. Niveau de Difficulté :'}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { 
                id: 'all' as const, 
                label_it: '🎯 Tutti i Livelli (Mix)', 
                label_fr: '🎯 Tous Niveaux (Mix)',
                activeBg: 'bg-slate-800 text-white'
              },
              { 
                id: 'easy' as const, 
                label_it: '🟢 Facile (Concetti base)', 
                label_fr: '🟢 Découverte & Formules',
                activeBg: 'bg-emerald-600 text-white'
              },
              { 
                id: 'medium' as const, 
                label_it: '🟡 Medio (Standard verifica)', 
                label_fr: '🟡 Entraînement & Contrôle',
                activeBg: 'bg-amber-500 text-white'
              },
              { 
                id: 'hard' as const, 
                label_it: '🔴 Difficile (Sfida & Trabocchetti)', 
                label_fr: '🔴 Défi, Pièges & Examens',
                activeBg: 'bg-rose-600 text-white'
              }
            ].map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedDifficulty(diff.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer font-bold border ${
                    isSelected
                      ? `${diff.activeBg} font-black shadow-xs border-transparent scale-[1.02]`
                      : 'bg-white text-slate-700 hover:bg-amber-100 border-amber-200'
                  }`}
                >
                  {isIt ? diff.label_it : diff.label_fr}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. REFRESH BUTTON */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-amber-100">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span>
              {isIt ? 'Algoritmo attivo per' : 'Génération pour'} : <strong className="text-amber-950 font-black">{activeGradeMeta.shortName}</strong>
            </span>
            <span>•</span>
            <span>
              {isIt ? 'Difficoltà' : 'Niveau'} : <strong className="text-amber-950 font-black">
                {selectedDifficulty === 'all' ? (isIt ? 'Tutti' : 'Tous') : selectedDifficulty.toUpperCase()}
              </strong>
            </span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              loadQuestions();
            }}
            className="flex items-center gap-1.5 text-xs font-black text-amber-950 bg-amber-300 hover:bg-amber-400 px-4 py-2 rounded-xl transition cursor-pointer border border-amber-400 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-800" />
            <span>{isIt ? 'Genera nuova serie di 5 domande' : 'Nouvelle série de 5 questions'}</span>
          </button>
        </div>

        {/* 5. QUESTION CARD OR EMPTY STATE */}
        {!currentQuiz ? (
          <div className="bg-amber-50/70 rounded-3xl p-8 border-2 border-amber-200 text-center space-y-3">
            <div className="text-4xl">🎉</div>
            <h4 className="text-base font-extrabold text-amber-950">
              {quizMode === 'leitner' 
                ? (isIt ? 'Nessun errore in sospeso! Ottimo lavoro!' : 'Aucune erreur en attente ! Bravo !')
                : (isIt ? 'Nessuna domanda disponibile.' : 'Aucune question disponible.')}
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {quizMode === 'leitner'
                ? (isIt ? 'Hai superato tutte le domande che avevi sbagliato in precedenza. Continua con il Quiz Infinito!' : 'Vous avez maîtrisé tous vos points faibles. Lancez une série de Quiz Infini !')
                : (isIt ? 'Clicca su "Genera nuova serie" per iniziare.' : 'Cliquez sur "Nouvelle série" pour débuter.')}
            </p>
            {quizMode === 'leitner' && (
              <button
                onClick={() => setQuizMode('parametric')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                {isIt ? 'Passa al Quiz Infinito ➔' : 'Lancer le Quiz Infini ➔'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-amber-50/80 p-5 sm:p-7 rounded-3xl border-2 border-amber-300 space-y-5">
            {/* Meta bar */}
            <div className="flex items-center justify-between text-xs font-black text-amber-900 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-md border border-amber-400">
                  {currentQuiz.subject}
                </span>

                {/* Grade Badge */}
                <span className="bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md font-extrabold border border-amber-300">
                  🏫 {currentQuiz.gradeLevel ? currentQuiz.gradeLevel.toUpperCase() : activeGradeMeta.shortName}
                </span>

                {/* Difficulty Badge */}
                {currentQuiz.difficulty && (
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-black ${
                    currentQuiz.difficulty === 'hard' 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : currentQuiz.difficulty === 'medium' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {currentQuiz.difficulty === 'hard' ? (isIt ? '🔴 Difficile / Sfida' : '🔴 Défi / Épreuve') :
                     currentQuiz.difficulty === 'medium' ? (isIt ? '🟡 Medio / Standard' : '🟡 Standard / Contrôle') :
                     (isIt ? '🟢 Facile / Basi' : '🟢 Découverte / Base')}
                  </span>
                )}
              </div>
              <span className="text-slate-600 font-bold">
                {isIt ? 'Domanda' : 'Question'} {currentIdx + 1} / {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug whitespace-pre-line">
              {isIt ? currentQuiz.question_it : currentQuiz.question_fr}
            </h4>

            {/* Formula badge if present and answered */}
            {currentQuiz.formula && isAnswered && (
              <div className="bg-white/90 p-3 rounded-xl border border-amber-300 font-mono text-xs font-bold text-amber-950 flex items-center gap-2">
                <span className="text-amber-600 font-black">Formula / Règle :</span>
                <span>{currentQuiz.formula}</span>
              </div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {currentQuiz.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === currentQuiz.correctIndex;

                let btnStyle = 'bg-white border-amber-300 text-slate-900 hover:bg-amber-100 hover:border-amber-400';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-md';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-500 border-red-600 text-white font-black shadow-sm';
                  } else {
                    btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(i)}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Detailed Explanation & Trap Warning (Revealed when answered) */}
            {isAnswered && (
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 space-y-3 animate-in fade-in duration-300 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>{isIt ? 'Spiegazione e Dimostrazione Didattica :' : 'Explication pédagogique & Démonstration :'}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {isIt ? currentQuiz.explanation_it : currentQuiz.explanation_fr}
                </p>

                {/* Common Trap Alert Box */}
                {(currentQuiz.trapWarning_it || currentQuiz.trapWarning_fr) && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-black text-amber-900 block">
                        {isIt ? 'Attenzione al tranello tipico nelle verifiche :' : 'Piège classique à éviter au contrôle :'}
                      </strong>
                      <span className="font-medium text-amber-900/90">
                        {isIt ? currentQuiz.trapWarning_it : currentQuiz.trapWarning_fr}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>
                      {currentIdx + 1 < questions.length
                        ? (isIt ? 'Domanda Successiva ➔' : 'Question Suivante ➔')
                        : (isIt ? 'Completa Serie & Ricarica 🎉' : 'Terminer la Série 🎉')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
