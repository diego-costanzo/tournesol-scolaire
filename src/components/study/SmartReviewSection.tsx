import React, { useMemo, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Eye,
  ListPlus,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Volume2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, SrsCard } from '../../types';
import { spacedRepetition, SrsGrade } from '../../services/spacedRepetition';
import { parametricQuizEngine } from '../../services/parametricQuizEngine';
import { speech } from '../../utils/speech';
import { soundFx } from '../../utils/audio';

interface SmartReviewSectionProps {
  profile: StudentProfile;
}

const NOTES_KEY = 'tournesol_study_notes';

export const SmartReviewSection: React.FC<SmartReviewSectionProps> = ({ profile }) => {
  const isIt = profile.language === 'it';

  // Bumped after every mutation to recompute the derived lists.
  const [version, setVersion] = useState(0);
  const [queue, setQueue] = useState<SrsCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [outcome, setOutcome] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [sessionDone, setSessionDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const stats = useMemo(() => spacedRepetition.stats(), [version]);
  const subjects = useMemo(() => spacedRepetition.cardsBySubject(), [version]);
  const dueCards = useMemo(() => spacedRepetition.dueCards(), [version]);
  const hasVoice = speech.isSupported();

  const current = queue[index] || null;
  const total = queue.length;

  const startSession = (includeFuture: boolean) => {
    const cards = spacedRepetition.dueCards(includeFuture);
    if (cards.length === 0) return;
    soundFx.playClick();
    setQueue(cards);
    setIndex(0);
    setRevealed(false);
    setSelected(null);
    setOutcome({ again: 0, hard: 0, good: 0, easy: 0 });
    setSessionDone(false);
    setMessage(null);
  };

  const finishSession = () => {
    setSessionDone(true);
    setQueue([]);
    setIndex(0);
    setRevealed(false);
    setSelected(null);
    setVersion((v) => v + 1);
    if (outcome.good + outcome.easy >= outcome.again) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.65 }, colors: ['#F59E0B', '#FBBF24', '#10B981'] });
      soundFx.playSuccess();
    }
  };

  const grade = (value: SrsGrade) => {
    if (!current) return;
    spacedRepetition.review(current.id, value);
    if (value === 0) setOutcome((o) => ({ ...o, again: o.again + 1 }));
    if (value === 3) setOutcome((o) => ({ ...o, hard: o.hard + 1 }));
    if (value === 4) setOutcome((o) => ({ ...o, good: o.good + 1 }));
    if (value === 5) setOutcome((o) => ({ ...o, easy: o.easy + 1 }));

    if (index + 1 >= total) {
      finishSession();
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
      setSelected(null);
    }
  };

  const importMistakes = () => {
    soundFx.playClick();
    const created = spacedRepetition.importQuizMistakes(parametricQuizEngine.getMistakes());
    setVersion((v) => v + 1);
    setMessage(
      created > 0
        ? (isIt ? `Importate ${created} nuove carte dai quiz.` : `${created} nouvelles cartes importées depuis les quiz.`)
        : (isIt ? 'Nessun nuovo errore da importare.' : 'Aucune nouvelle erreur à importer.')
    );
  };

  const importNotes = () => {
    soundFx.playClick();
    const notes = localStorage.getItem(NOTES_KEY) || '';
    const created = spacedRepetition.createFromNotes(notes);
    setVersion((v) => v + 1);
    setMessage(
      created > 0
        ? (isIt ? `Create ${created} carte dagli appunti.` : `${created} cartes créées depuis vos notes.`)
        : (isIt
          ? 'Nessuna carta riconosciuta: scrivi righe come "termine : definizione" nel taccuino.'
          : 'Aucune carte reconnue : écrivez des lignes "terme : définition" dans les notes.')
    );
  };

  const addManualCard = () => {
    const card = spacedRepetition.addCard({ front, back });
    if (!card) {
      setMessage(isIt ? 'Carta non valida o già presente.' : 'Carte invalide ou déjà existante.');
      return;
    }
    soundFx.playClick();
    setFront('');
    setBack('');
    setShowForm(false);
    setVersion((v) => v + 1);
    setMessage(isIt ? 'Carta aggiunta al ripasso.' : 'Carte ajoutée à la révision.');
  };

  const speakCurrent = () => {
    if (!current) return;
    const body = revealed
      ? `${isIt ? current.front_it : current.front_fr}. ${isIt ? current.back_it : current.back_fr}`
      : (isIt ? current.front_it : current.front_fr);
    speech.speak(body, profile.language);
  };

  return (
    <div className="space-y-5">
      {/* Overview */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-md">
              <Brain className="w-3 h-3" />
              {isIt ? 'Ripasso a ripetizione dilazionata' : 'Révision espacée (SM-2)'}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5 break-words">
              {isIt ? 'Ripasso Intelligente' : 'Révision Intelligente'}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-1 max-w-2xl break-words">
              {isIt
                ? 'Le carte tornano esattamente quando stai per dimenticarle: algoritmo SM-2, tutto sul tuo dispositivo.'
                : 'Les cartes reviennent juste avant l\'oubli : algorithme SM-2, tout reste sur votre appareil.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => startSession(false)}
            disabled={stats.due === 0}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-amber-950 font-black text-xs border border-amber-500 shadow-xs transition cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>
              {stats.due > 0
                ? (isIt ? `Ripassa ora (${stats.due})` : `Réviser (${stats.due})`)
                : (isIt ? 'Niente da ripassare' : 'Rien à réviser')}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { label: isIt ? 'Da ripassare' : 'À réviser', value: stats.due, tone: 'bg-amber-100 text-amber-900 border-amber-300' },
            { label: isIt ? 'Nuove' : 'Nouvelles', value: stats.newToday, tone: 'bg-sky-100 text-sky-900 border-sky-300' },
            { label: isIt ? 'Padroneggiate' : 'Maîtrisées', value: stats.mastered, tone: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
            { label: isIt ? 'Totale carte' : 'Total cartes', value: stats.total, tone: 'bg-slate-100 text-slate-800 border-slate-300' }
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border p-3 ${item.tone}`}>
              <div className="text-xl font-black leading-none">{item.value}</div>
              <div className="text-[11px] font-bold mt-1 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session */}
      {current && !sessionDone && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {isIt ? 'Carta' : 'Carte'} {index + 1} / {total}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
              {current.subject}
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${total > 0 ? (index / total) * 100 : 0}%` }}
            />
          </div>

          <div className="text-center space-y-3 py-2">
            <p className="text-base sm:text-lg font-black text-slate-900 break-words">
              {isIt ? current.front_it : current.front_fr}
            </p>

            {hasVoice && (
              <button
                type="button"
                onClick={speakCurrent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isIt ? 'Ascolta' : 'Écouter'}</span>
              </button>
            )}
          </div>

          {current.choices && current.correctIndex !== null && !revealed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {current.choices.map((choice, choiceIndex) => (
                <button
                  key={choiceIndex}
                  type="button"
                  onClick={() => {
                    setSelected(choiceIndex);
                    setRevealed(true);
                  }}
                  className="px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 text-xs font-bold text-slate-800 text-left transition cursor-pointer break-words"
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {!revealed && !(current.choices && current.correctIndex !== null) && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setRevealed(true);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{isIt ? 'Mostra la risposta' : 'Voir la réponse'}</span>
            </button>
          )}

          {revealed && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isIt ? 'Risposta' : 'Réponse'}
                </div>
                <p className="text-sm font-bold text-emerald-950 break-words">
                  {isIt ? current.back_it : current.back_fr}
                </p>
                {selected !== null && current.correctIndex !== null && (
                  <p className="text-[11px] font-bold mt-1.5 text-emerald-800">
                    {selected === current.correctIndex
                      ? (isIt ? 'Hai scelto la risposta corretta.' : 'Bonne réponse.')
                      : (isIt ? 'Risposta diversa: rileggi con calma.' : 'Réponse différente : relisez calmement.')}
                  </p>
                )}
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-600 mb-1.5 text-center">
                  {isIt ? 'Quanto è stato facile ricordarla?' : 'À quel point était-ce facile ?'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 0 as SrsGrade, label: isIt ? 'Da rivedere' : 'À revoir', tone: 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300' },
                    { value: 3 as SrsGrade, label: isIt ? 'Difficile' : 'Difficile', tone: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300' },
                    { value: 4 as SrsGrade, label: isIt ? 'Bene' : 'Bien', tone: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300' },
                    { value: 5 as SrsGrade, label: isIt ? 'Facile' : 'Facile', tone: 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => grade(option.value)}
                      className={`px-2 py-2.5 rounded-xl border-2 font-black text-[11px] transition cursor-pointer ${option.tone}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session summary */}
      {sessionDone && (
        <div className="bg-emerald-50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-200 space-y-3">
          <div className="flex items-start gap-2 min-w-0">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="font-black text-emerald-950 text-sm">
                {isIt ? 'Sessione completata!' : 'Session terminée !'}
              </h4>
              <p className="text-xs font-bold text-emerald-900 mt-0.5 break-words">
                {isIt
                  ? `Da rivedere: ${outcome.again} · Difficili: ${outcome.hard} · Bene: ${outcome.good} · Facili: ${outcome.easy}`
                  : `À revoir : ${outcome.again} · Difficiles : ${outcome.hard} · Bien : ${outcome.good} · Faciles : ${outcome.easy}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startSession(false)}
              disabled={spacedRepetition.stats().due === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-[11px] disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isIt ? 'Ripassa di nuovo' : 'Réviser encore'}
            </button>
            <button
              type="button"
              onClick={() => setSessionDone(false)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
            >
              {isIt ? 'Torna alle statistiche' : 'Retour aux statistiques'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-xs space-y-3">
        <h4 className="text-sm font-black text-slate-900">
          {isIt ? 'Crea le tue carte' : 'Créer vos cartes'}
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={importMistakes}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-[11px] cursor-pointer"
          >
            <ListPlus className="w-3.5 h-3.5" />
            {isIt ? 'Importa errori dei quiz' : 'Importer les erreurs des quiz'}
          </button>
          <button
            type="button"
            onClick={importNotes}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-950 font-bold text-[11px] cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5" />
            {isIt ? 'Crea dagli appunti' : 'Créer depuis les notes'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-[11px] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isIt ? 'Nuova carta' : 'Nouvelle carte'}
          </button>
          {stats.due === 0 && stats.total > 0 && (
            <button
              type="button"
              onClick={() => startSession(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 font-bold text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isIt ? 'Ripassa tutte' : 'Réviser tout'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="space-y-2 pt-1">
            <input
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder={isIt ? 'Domanda o termine (es. Teorema di Pitagora)' : 'Question ou terme (ex. Théorème de Pythagore)'}
              className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
              maxLength={200}
            />
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder={isIt ? 'Risposta o definizione' : 'Réponse ou définition'}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
              maxLength={400}
            />
            <button
              type="button"
              onClick={addManualCard}
              disabled={front.trim().length < 3 || back.trim().length < 2}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-amber-950 font-black text-[11px] border border-amber-500 cursor-pointer"
            >
              {isIt ? 'Aggiungi al ripasso' : 'Ajouter à la révision'}
            </button>
          </div>
        )}

        {message && (
          <p className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 break-words">
            {message}
          </p>
        )}

        {!hasVoice && (
          <p className="text-[11px] font-medium text-slate-500 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {isIt
                ? 'La lettura ad alta voce non è disponibile in questo browser: le carte funzionano comunque.'
                : 'La lecture à voix haute n\'est pas disponible dans ce navigateur : les cartes fonctionnent quand même.'}
            </span>
          </p>
        )}
      </div>

      {/* Subject breakdown */}
      {subjects.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-xs space-y-2">
          <h4 className="text-sm font-black text-slate-900">
            {isIt ? 'Carte per materia' : 'Cartes par matière'}
          </h4>
          <div className="space-y-1.5">
            {subjects.map((entry) => (
              <div
                key={entry.subject}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50/60 border border-amber-200"
              >
                <span className="text-xs font-bold text-amber-950 truncate min-w-0">{entry.subject}</span>
                <span className="text-[11px] font-black text-amber-900 shrink-0">
                  {entry.due > 0
                    ? (isIt ? `${entry.due} da fare` : `${entry.due} à faire`)
                    : (isIt ? 'in pari' : 'à jour')}
                  <span className="text-slate-500 font-bold"> · {entry.total}</span>
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(isIt ? 'Eliminare tutte le carte di ripasso?' : 'Supprimer toutes les cartes de révision ?')) return;
              spacedRepetition.clearAll();
              setVersion((v) => v + 1);
              setMessage(isIt ? 'Carte eliminate.' : 'Cartes supprimées.');
            }}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 hover:text-rose-800 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isIt ? 'Elimina tutte le carte' : 'Supprimer toutes les cartes'}
          </button>
        </div>
      )}
    </div>
  );
};
