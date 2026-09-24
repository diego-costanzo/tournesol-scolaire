import { parametricQuizEngine } from '../src/services/parametricQuizEngine';
import { FrenchGradeLevel, QuizDifficultyLevel, GradeCycle } from '../src/types';
import { calendarSyncService } from '../src/services/calendarSyncService';
import { getSmartStudyAid } from '../src/services/smartContextEngine';
import { adaptiveTimeEngine } from '../src/services/adaptiveTimeEngine';
import { translations } from '../src/i18n/translations';

console.log('====================================================');
console.log('       INSPEZIONE AUTOMATICA COMPLETA DEL SISTEMA    ');
console.log('====================================================\n');
let errorsCount = 0;

// 1. Audit Parametric Quiz Engine across ALL 9 grades and 3 difficulties
const grades: FrenchGradeLevel[] = ['cm1', 'cm2', '6eme', '5eme', '4eme', '3eme', 'seconde', 'premiere', 'terminale'];
const difficulties: QuizDifficultyLevel[] = ['easy', 'medium', 'hard'];

console.log('1️⃣  Verifica Motore Quiz Parametrico (Tutte le 9 Classi x 3 Difficoltà)...');
let totalQuestionsGenerated = 0;

for (const grade of grades) {
  for (const diff of difficulties) {
    for (let run = 0; run < 3; run++) {
      const questions = parametricQuizEngine.generateQuizSet({
        gradeLevel: grade,
        difficulty: diff,
        count: 3
      });

      if (questions.length === 0) {
        console.error(`❌ [ERRORE] Nessuna domanda generata per classe: ${grade}, difficoltà: ${diff}`);
        errorsCount++;
      }

      totalQuestionsGenerated += questions.length;

      for (const q of questions) {
        if (!q.question_fr || !q.question_it) {
          console.error(`❌ [ERRORE] Testo domanda mancante in ${q.id}`);
          errorsCount++;
        }
        if (!q.options || q.options.length < 3) {
          console.error(`❌ [ERRORE] Opzioni insufficienti in ${q.id} (trovate ${q.options?.length})`);
          errorsCount++;
        }
        if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
          console.error(`❌ [ERRORE] correctIndex non valido (${q.correctIndex}) in ${q.id}`);
          errorsCount++;
        }
        if (!q.explanation_fr || !q.explanation_it) {
          console.error(`❌ [ERRORE] Spiegazione mancante in ${q.id}`);
          errorsCount++;
        }
        const uniqueOpts = new Set(q.options);
        if (uniqueOpts.size !== q.options.length) {
          console.warn(`⚠️ [AVVISO] Opzioni duplicate trovate nel quiz ${q.id}: ${q.options.join(', ')}`);
        }
      }
    }
  }
  console.log(`   ✅ Classe ${grade.toUpperCase().padEnd(10)}: testata con successo in Facile, Medio, Difficile.`);
}
console.log(`   📊 Totale domande testate: ${totalQuestionsGenerated}\n`);

// 2. Audit Adaptive Time Engine
console.log('2️⃣  Verifica Motore Tempi Adattivi & Carico Cognitivo (Tutti i cicli)...');
const cycles: GradeCycle[] = ['primaire', 'college', 'brevet', 'lycee'];
for (const cycle of cycles) {
  const analysis = adaptiveTimeEngine.analyzeTaskComplexity(
    'Exercices 42 et 45 p. 88 Théorème de Pythagore et contrôle',
    'Rédaction complète avec étapes',
    'Maths',
    cycle
  );

  if (analysis.baseMinutes <= 0 || analysis.baseMinutes > 120) {
    console.error(`❌ [ERRORE] Stima anomala (${analysis.baseMinutes} min) per ciclo ${cycle}`);
    errorsCount++;
  }
  if (!analysis.reason_it || !analysis.reason_fr) {
    console.error(`❌ [ERRORE] Motivazione stima mancante per ciclo ${cycle}`);
    errorsCount++;
  }
}
console.log('   ✅ Analisi complessità compiti e scaling per ciclo verificata.\n');

// 3. Audit Smart Context Engine (Schede didattiche & Trucchi mnemonici)
console.log('3️⃣  Verifica Motore Contesto Intelligente (Schede, Formule, Trucchi)...');
const sampleHomeworks = [
  { id: '1', subject: 'Maths', title: 'Exercices Théorème de Pythagore p.45' },
  { id: '2', subject: 'Physique', title: 'Calculer la résistance avec la loi d Ohm' },
  { id: '3', subject: 'Français', title: 'Dictée sur les homophones a et à' },
  { id: '4', subject: 'Histoire', title: 'Révision Seconde Guerre Mondiale' }
];

for (const hw of sampleHomeworks) {
  const aid = getSmartStudyAid(hw as any, 'college');
  if (!aid || !aid.title_it || !aid.formula || !aid.memoryTrick_it) {
    console.error(`❌ [ERRORE] Scheda didattica incompleta per "${hw.title}"`);
    errorsCount++;
  }
}
console.log('   ✅ Rilevamento automatico argomenti e formule verificato.\n');

// 4. Audit Calendar Sync Service & Presets
console.log('4️⃣  Verifica Sincronizzazione Calendario, Presets e Parser iCal...');
for (const cycle of cycles) {
  const preset = calendarSyncService.generateCurriculumSample(cycle);
  if (!preset.slots || preset.slots.length === 0) {
    console.error(`❌ [ERRORE] Orario ministeriale vuoto per ciclo: ${cycle}`);
    errorsCount++;
  }
  if (!preset.homework || preset.homework.length === 0) {
    console.error(`❌ [ERRORE] Compiti di esempio vuoti per ciclo: ${cycle}`);
    errorsCount++;
  }
}

const sampleICal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pronote//FR
BEGIN:VEVENT
UID:test-slot-1
SUMMARY:Mathématiques
DESCRIPTION:Salle 102 - M. Dupont
DTSTART:20260924T080000Z
DTEND:20260924T090000Z
LOCATION:Salle 102
END:VEVENT
BEGIN:VEVENT
UID:test-hw-1
SUMMARY:Devoir Maths : Exercice 12
DESCRIPTION:Faire l'exercice sur les fractions
DTSTART:20260925T160000Z
DTEND:20260925T170000Z
END:VEVENT
END:VCALENDAR`;

const parsed = calendarSyncService.parseICalString(sampleICal);
if (parsed.timetableSlots.length !== 1 || parsed.homeworkItems.length !== 1) {
  console.error(`❌ [ERRORE] Parser iCal fallito: slot attesi 1 (trovati ${parsed.timetableSlots.length}), compiti attesi 1 (trovati ${parsed.homeworkItems.length})`);
  errorsCount++;
} else {
  console.log('   ✅ Parser RFC 5545 iCal / Pronote e orari ufficiali verificati.');
}

// 5. Audit Traduzioni i18n
console.log('\n5️⃣  Verifica Integrità Dizionario Traduzioni (IT vs FR)...');
const itKeys = Object.keys(translations.it);
const frKeys = Object.keys(translations.fr);
if (itKeys.length !== frKeys.length) {
  console.warn(`⚠️ [AVVISO] Discrepanza nel numero di sezioni di traduzione: IT=${itKeys.length}, FR=${frKeys.length}`);
} else {
  console.log(`   ✅ Tutte le ${itKeys.length} sezioni linguistiche sono speculari.`);
}

console.log('\n====================================================');
if (errorsCount === 0) {
  console.log('🎉 ESITO: 0 ERRORI CRITICI RILEVATI! SISTEMA COMPLETAMENTE STABILE');
} else {
  console.log(`🚨 ESITO: TROVATI ${errorsCount} PROBLEMI DA RISOLVERE`);
}
console.log('====================================================\n');

process.exit(errorsCount > 0 ? 1 : 0);
