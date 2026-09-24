import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  Plus, 
  PartyPopper,
  Trash2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HomeworkItem, StudentProfile, GradeCycle } from '../../types';
import { translations } from '../../i18n/translations';
import { getHomeworkDisplay } from '../../data/mockData';
import { soundFx } from '../../utils/audio';
import { adaptiveTimeEngine } from '../../services/adaptiveTimeEngine';
import { CalendarSyncModal } from '../study/CalendarSyncModal';

interface HomeworkTabProps {
  profile: StudentProfile;
  homework: HomeworkItem[];
  onToggleHomework: (id: string) => void;
  onAddHomework: (item: Omit<HomeworkItem, 'id' | 'completed'>) => void;
  onAddBatchHomework?: (items: Array<Omit<HomeworkItem, 'id' | 'completed'>>) => void;
  onDeleteHomework: (id: string) => void;
  activeStudyHomeworkId?: string | null;
  onStartStudy?: (item: HomeworkItem) => void;
}

export const HomeworkTab: React.FC<HomeworkTabProps> = ({
  profile,
  homework,
  onToggleHomework,
  onAddHomework,
  onAddBatchHomework,
  onDeleteHomework,
  activeStudyHomeworkId,
  onStartStudy
}) => {
  const t = translations[profile.language];
  const isIt = profile.language === 'it';
  const [filter, setFilter] = useState<'pending' | 'done' | 'all'>('pending');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Derive student's current French school cycle
  const currentGradeCycle: GradeCycle = 
    profile.schoolStage === 'elementary' || profile.gradeLevel?.toLowerCase().includes('cm') || profile.gradeLevel?.toLowerCase().includes('prim') ? 'primaire' :
    profile.gradeLevel?.includes('3') ? 'brevet' :
    profile.schoolStage === 'high' || profile.gradeLevel?.toLowerCase().includes('lyc') || profile.gradeLevel?.toLowerCase().includes('sec') ? 'lycee' : 'college';

  // New item form
  const [subjectKey, setSubjectKey] = useState('math');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoEstimateReason, setAutoEstimateReason] = useState<string | null>(null);

  const subjectsList = [
    { key: 'math', fr: 'Mathématiques', it: 'Matematica (Maths)' },
    { key: 'french', fr: 'Français', it: 'Francese (Français)' },
    { key: 'history', fr: 'Histoire-Géographie', it: 'Storia & Geografia' },
    { key: 'physics', fr: 'Physique-Chimie', it: 'Fisica & Chimica' },
    { key: 'svt', fr: 'SVT (Sciences de la Vie)', it: 'Scienze Naturali (SVT)' },
    { key: 'english', fr: 'Anglais (LV1)', it: 'Inglese (LV1)' },
    { key: 'italian', fr: 'Italien (LV2)', it: 'Italiano (LV2)' },
    { key: 'techno', fr: 'Technologie', it: 'Tecnologia & Scratch' },
    { key: 'art', fr: 'Arts Plastiques', it: 'Arti Plastiche & Disegno' },
    { key: 'music', fr: 'Éducation Musicale', it: 'Educazione Musicale' }
  ];

  const handleToggle = (item: HomeworkItem) => {
    soundFx.playClick();
    onToggleHomework(item.id);
    if (!item.completed) {
      soundFx.playSuccess();
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#10B981']
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    soundFx.playSuccess();

    const selectedSub = subjectsList.find(s => s.key === subjectKey) || subjectsList[0];

    onAddHomework({
      subject: selectedSub.fr,
      subject_fr: selectedSub.fr,
      subject_it: selectedSub.it,
      title,
      title_fr: title,
      title_it: title,
      description,
      description_fr: description,
      description_it: description,
      dueDate,
      estimatedMinutes,
      priority
    });

    setTitle('');
    setDescription('');
    setIsAddOpen(false);
  };

  const filteredHomework = homework.filter((item) => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'done') return item.completed;
    return true;
  });

  const completedCount = homework.filter((h) => h.completed).length;
  const pendingCount = homework.length - completedCount;

  const getDueBadge = (dueDateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDateString);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-300">
          {t.homework.overdue}
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-400">
          {t.homework.dueToday}
        </span>
      );
    }
    if (diffDays === 1) {
      return (
        <span className="bg-amber-300 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-500">
          {t.homework.dueTomorrow}
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
        {t.homework.dueInDays.replace('{days}', diffDays.toString())}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Clean Compact Header */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.homework.title}
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              {profile.gradeLevel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
            <span className="font-bold text-amber-700">{pendingCount} {isIt ? 'da completare' : 'à faire'}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">{completedCount} {isIt ? 'completati' : 'terminés'}</span>
          </div>
        </div>

        {/* Actions: Add Homework & Pronote / iCal Sync */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsSyncModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>{isIt ? 'Pronote' : 'Pronote'}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsAddOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-950" />
            <span>{t.homework.btnNewHomework}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('pending');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.homework.filterPending} ({pendingCount})
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('done');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'done'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.homework.filterDone} ({completedCount})
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.homework.filterAll} ({homework.length})
          </button>
        </div>

        {pendingCount === 0 && homework.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
            <PartyPopper className="w-4 h-4 text-emerald-600" />
            <span>{t.homework.congratsAllDone}</span>
          </div>
        )}
      </div>

      {/* Homework Cards List */}
      <div className="space-y-3">
        {filteredHomework.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-500">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {filter === 'pending'
                ? (isIt ? 'Nessun compito da fare al momento!' : 'Aucun devoir à faire pour le moment !')
                : (isIt ? 'Nessun compito in questa categoria.' : 'Aucun devoir dans cette catégorie.')}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              {filter === 'pending'
                ? (isIt ? 'Tutto completato! Puoi riposarti o ripassare una formula nella sezione Studio.' : 'Tout est terminé ! Vous pouvez vous reposer ou réviser dans l\'Espace Étude.')
                : ''}
            </p>
          </div>
        ) : (
          filteredHomework.map((item, index) => {
            const display = getHomeworkDisplay(item, profile.language);

            return (
              <div
                key={`${item.id}-${index}`}
                className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 group ${
                  item.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item)}
                    className={`mt-0.5 p-0.5 rounded-lg transition cursor-pointer shrink-0 ${
                      item.completed
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-slate-400 hover:text-amber-500'
                    }`}
                  >
                    {item.completed ? (
                      <CheckSquare className="w-6 h-6" />
                    ) : (
                      <Square className="w-6 h-6" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 bg-slate-100 text-xs px-2 py-0.5 rounded-md">
                        {display.subject}
                      </span>
                      {getDueBadge(item.dueDate)}

                      {item.priority === 'high' && (
                        <span className="text-[10px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                          {t.homework.priorityHigh}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-bold text-base sm:text-lg break-words ${
                        item.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900'
                      }`}
                    >
                      {display.title}
                    </h3>

                    {display.description && (
                      <p
                        className={`text-xs mt-1 max-w-2xl font-medium break-words ${
                          item.completed ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {display.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.dueDate}
                      </span>
                      {(() => {
                        const adaptive = adaptiveTimeEngine.getAdaptiveEstimate(item.title, item.description, item.subject, currentGradeCycle);
                        return (
                          <span 
                            className="flex items-center gap-1.5 cursor-help" 
                            title={isIt ? adaptive.reason_it : adaptive.reason_fr}
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>~{item.estimatedMinutes || adaptive.estimatedMinutes} min</span>
                            {adaptive.isPersonalized && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {isIt ? 'Tempo stimato' : 'Temps estimé'}
                              </span>
                            )}
                          </span>
                        );
                      })()}
                      {activeStudyHomeworkId === item.id && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          ⚡ {isIt ? 'In studio' : 'En cours'}
                        </span>
                      )}
                    </div>

                    {/* Start Study Button */}
                    {!item.completed && onStartStudy && (
                      <div className="mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartStudy(item);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            activeStudyHomeworkId === item.id
                              ? 'bg-amber-500 text-white font-black'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            {activeStudyHomeworkId === item.id
                              ? (isIt ? 'Torna al Timer di Studio' : 'Reprendre le Timer')
                              : (isIt ? 'Studia con Timer' : 'Étudier avec Timer')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onDeleteHomework(item.id);
                  }}
                  title={isIt ? 'Elimina questo compito' : 'Supprimer ce devoir'}
                  className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer self-start shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Homework Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-amber-300 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>{t.homework.modalTitle}</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.homework.modalSubject}
                </label>
                <select
                  value={subjectKey}
                  onChange={(e) => setSubjectKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-sm font-semibold"
                >
                  {subjectsList.map((s) => (
                    <option key={s.key} value={s.key}>
                      {isIt ? s.it : s.fr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.homework.modalTaskTitle}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isIt ? "es. Esercizi pag. 142 n. 34 e 36" : "ex. Exercices p. 142 n° 34 et 36"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.homework.modalDescription}
                </label>
                <textarea
                  rows={2}
                  placeholder={isIt ? "Dettagli o istruzioni per il compito..." : "Consignes ou détails utiles..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.homework.modalDueDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.homework.modalDuration}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const selectedSub = subjectsList.find((s) => s.key === subjectKey) || subjectsList[0];
                        const est = adaptiveTimeEngine.getAdaptiveEstimate(title, description, selectedSub.fr, currentGradeCycle);
                        setEstimatedMinutes(est.estimatedMinutes);
                        setAutoEstimateReason(isIt ? est.reason_it : est.reason_fr);
                        soundFx.playClick();
                      }}
                      className="text-[10px] font-black text-amber-800 hover:text-amber-950 bg-amber-200/90 hover:bg-amber-300 px-2 py-0.5 rounded-md border border-amber-300 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>✨ {isIt ? 'Stima Intelligente' : 'Estimer'}</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Auto Estimate Reasoning Pill */}
              {autoEstimateReason && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 font-medium flex items-center gap-2">
                  <span className="text-amber-600 font-bold shrink-0">🧠</span>
                  <span>{autoEstimateReason}</span>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.homework.modalPriority}
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        priority === p
                          ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      {p === 'low'
                        ? t.homework.priorityLow
                        : p === 'medium'
                        ? t.homework.priorityMedium
                        : t.homework.priorityHigh}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-amber-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  {t.homework.modalCancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-500 shadow-xs transition"
                >
                  {t.homework.modalSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar & Pronote Sync Modal */}
      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        language={profile.language}
        gradeCycle={currentGradeCycle}
        onImportHomework={onAddBatchHomework}
      />
    </div>
  );
};
