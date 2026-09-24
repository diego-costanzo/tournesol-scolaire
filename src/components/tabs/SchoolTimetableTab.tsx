import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  User, 
  Sparkles, 
  Plus, 
  Layers, 
  Trash2,
  BookOpen,
  Printer
} from 'lucide-react';
import { TimetableSlot, StudentProfile, GradeCycle, HomeworkItem } from '../../types';
import { translations } from '../../i18n/translations';
import { soundFx } from '../../utils/audio';
import { CalendarSyncModal } from '../study/CalendarSyncModal';
import { getThemeConfig } from '../../utils/themeStyles';
import { exportTimetableToICS } from '../../utils/icsExport';

interface SchoolTimetableTabProps {
  profile: StudentProfile;
  timetable: TimetableSlot[];
  onToggleWeek: () => void;
  onAddSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  onDeleteSlot: (id: string) => void;
  onBatchAddSlots?: (slots: Array<Omit<TimetableSlot, 'id'>>) => void;
  onAddBatchHomework?: (items: Array<Omit<HomeworkItem, 'id' | 'completed'>>) => void;
}

export const SchoolTimetableTab: React.FC<SchoolTimetableTabProps> = ({
  profile,
  timetable,
  onToggleWeek,
  onAddSlot,
  onDeleteSlot,
  onBatchAddSlots,
  onAddBatchHomework
}) => {
  const t = translations[profile.language];
  const isIt = profile.language === 'it';
  const [selectedDay, setSelectedDay] = useState<'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi'>('lundi');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  
  const theme = getThemeConfig(profile.theme);

  // Derive student's French school cycle
  const currentGradeCycle: GradeCycle = 
    profile.schoolStage === 'elementary' || profile.gradeLevel?.toLowerCase().includes('cm') || profile.gradeLevel?.toLowerCase().includes('prim') ? 'primaire' :
    profile.gradeLevel?.includes('3') ? 'brevet' :
    profile.schoolStage === 'high' || profile.gradeLevel?.toLowerCase().includes('lyc') || profile.gradeLevel?.toLowerCase().includes('sec') ? 'lycee' : 'college';

  // New slot form state
  const [newSubject, setNewSubject] = useState('Mathématiques');
  const [newDay, setNewDay] = useState<'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi'>('lundi');
  const [newStart, setNewStart] = useState('08:30');
  const [newEnd, setNewEnd] = useState('09:25');
  const [newRoom, setNewRoom] = useState('Salle 204');
  const [newTeacher, setNewTeacher] = useState('M. Martin');
  const [newWeekType, setNewWeekType] = useState<'both' | 'A' | 'B'>('both');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const days: Array<'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi'> = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi'
  ];

  // Subject localization helper
  const localizeSubject = (subjectName: string): string => {
    if (!isIt) return subjectName;
    const map: Record<string, string> = {
      'Mathématiques': 'Matematica (Maths)',
      'Français': 'Francese (Français)',
      'Histoire-Géographie': 'Storia & Geografia',
      'Physique-Chimie': 'Fisica & Chimica',
      'SVT (Sciences de la Vie)': 'Scienze Naturali (SVT)',
      'SVT (Travaux Pratiques)': 'Scienze (Laboratorio TP)',
      'Physique (Travaux Pratiques)': 'Fisica (Laboratorio TP)',
      'Anglais (LV1)': 'Inglese (LV1)',
      'Italien (LV2)': 'Italiano (LV2)',
      'Technologie': 'Tecnologia & Scratch',
      'Technologie Projets': 'Tecnologia & Progetti',
      'Éducation Musicale': 'Musica',
      'Arts Plastiques': 'Arti Plastiche & Disegno',
      'EPS (Sport)': 'Educazione Fisica (EPS)',
      'EPS (Plein Air)': 'Educazione Fisica all\'aperto',
      'Permanence / Devoirs': 'Studio assistito (Permanence)'
    };
    return map[subjectName] || subjectName;
  };

  const localizeRoom = (roomName: string): string => {
    if (!isIt) return roomName;
    return roomName
      .replace(/^Salle\s*/i, 'Aula ')
      .replace(/^Labo\s*/i, 'Laboratorio ')
      .replace(/^Gymnase/i, 'Palestra')
      .replace(/^CDI/i, 'Biblioteca CDI')
      .replace(/^Atelier Art/i, "Laboratorio d'Arte")
      .replace(/^Stade/i, 'Stadio Comunale');
  };

  const localizeTeacher = (teacherName: string): string => {
    if (!isIt) return teacherName;
    return teacherName.replace(/^M\.\s*/, 'Prof. ').replace(/^Mme\s*/, 'Prof.ssa ');
  };

  // Filter slots for current week (A/B or both)
  const activeSlots = timetable.filter(
    (slot) => slot.weekType === 'both' || slot.weekType === profile.currentWeek
  );

  const daySlots = activeSlots
    .filter((slot) => slot.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine current active class
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentDayIndex = currentTime.getDay(); // 1 = Monday, 5 = Friday
  const currentDayKey = days[currentDayIndex - 1];

  const currentClass = activeSlots.find((slot) => {
    if (slot.day !== currentDayKey) return false;
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    return currentMinutes >= startMin && currentMinutes <= endMin;
  });

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    onAddSlot({
      day: newDay,
      startTime: newStart,
      endTime: newEnd,
      subject: newSubject,
      room: newRoom,
      teacher: newTeacher,
      color: '#F59E0B',
      weekType: newWeekType
    });
    setIsAddModalOpen(false);
  };

  const handleExportIcs = () => {
    soundFx.playSuccess();
    exportTimetableToICS(timetable, profile.currentWeek, profile.language);
  };

  return (
    <div className="space-y-6">
      {/* Clean Compact Header */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.timetable.title}
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              {profile.gradeLevel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
            <span>{profile.schoolName}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-bold text-slate-800">{isIt ? 'Settimana attiva:' : 'Semaine active :'} <strong className="text-amber-800 font-extrabold">{profile.currentWeek}</strong></span>
          </div>
        </div>

        {/* Controls: Week A/B switcher, Pronote Sync & Add Lesson */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleWeek();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition active:scale-95 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>{isIt ? 'Cambia Settimana' : 'Changer Semaine'}</span>
            <span className="bg-slate-800 text-white px-1.5 py-0.2 rounded text-[10px] font-black">
              {profile.currentWeek}
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsSyncModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition active:scale-95 cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-600" />
            <span>{isIt ? 'Pronote' : 'Pronote'}</span>
          </button>

          <button
            onClick={handleExportIcs}
            title={isIt ? 'Esporta in Apple/Google Calendar' : 'Exporter vers Apple/Google Calendar'}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition active:scale-95 cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>iCal</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-950" />
            <span>{t.timetable.addLessonBtn}</span>
          </button>
        </div>
      </div>

      {/* Currently happening lesson highlight (if applicable) */}
      {currentClass && (
        <div className="bg-amber-400 text-amber-950 p-4 sm:p-5 rounded-3xl border-2 border-amber-500 shadow-md flex items-center justify-between gap-4 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3.5 min-w-0 flex-1 overflow-hidden">
            <div className="p-2.5 sm:p-3 bg-amber-500/60 rounded-2xl animate-pulse shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-md inline-block">
                {t.timetable.currentLesson}
              </span>
              <h3 className="text-base sm:text-xl font-black mt-0.5 break-words leading-tight">
                {localizeSubject(currentClass.subject)}
              </h3>
              <p className="text-xs font-semibold opacity-90 truncate mt-0.5">
                {currentClass.startTime} - {currentClass.endTime} • {localizeRoom(currentClass.room)} • {localizeTeacher(currentClass.teacher)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Switcher: Day vs Full Week */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('day');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'day'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.timetable.viewDay}
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('week');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.timetable.viewWeek}
          </button>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <span>{isIt ? 'Settimana attiva :' : 'Semaine en cours :'} <strong>{profile.currentWeek === 'A' ? t.weekA : t.weekB}</strong></span>
        </div>
      </div>

      {/* Day Selector Tabs */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = currentDayKey === day;
            const count = activeSlots.filter((s) => s.day === day).length;
            return (
              <button
                key={day}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedDay(day);
                }}
                className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer text-left ${
                  isSelected
                    ? 'bg-white text-slate-900 border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize font-black text-xs sm:text-sm">{t.timetable.days[day]}</span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                      {isIt ? 'Oggi' : 'Auj.'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {count} {t.timetable.countLessons}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Day View Slots */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          {daySlots.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border-2 border-amber-200 text-center text-amber-900 font-medium">
              {t.timetable.noLessonsDay}
            </div>
          ) : (
            daySlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white rounded-2xl p-3.5 sm:p-5 border-2 border-amber-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 group w-full max-w-full overflow-hidden"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 w-full flex-1">
                  <div className="w-18 sm:w-24 text-center p-1.5 sm:p-2 bg-amber-100/70 rounded-xl border border-amber-200 shrink-0 mt-0.5 sm:mt-0">
                    <span className="font-extrabold text-amber-950 text-xs sm:text-sm block">
                      {slot.startTime}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-amber-800 font-medium block">
                      {slot.endTime}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base md:text-lg leading-snug break-words">
                        {localizeSubject(slot.subject)}
                      </h4>
                      {slot.weekType !== 'both' && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-md shrink-0">
                          {t.timetable.weekTag} {slot.weekType}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1 text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded-md max-w-full truncate">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{localizeRoom(slot.room)}</span>
                      </span>
                      <span className="flex items-center gap-1 max-w-full truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{localizeTeacher(slot.teacher)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onDeleteSlot(slot.id);
                  }}
                  title={t.timetable.deleteTooltip}
                  className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer self-end sm:self-center shrink-0 -mt-1 sm:mt-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Week Grid View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {days.map((day) => {
            const currentDaySlots = activeSlots
              .filter((s) => s.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={day} className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-xs flex flex-col">
                <div className="bg-amber-100/80 px-3 py-2 border-b border-amber-200 flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 capitalize text-xs">
                    {t.timetable.days[day]}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md">
                    {currentDaySlots.length}
                  </span>
                </div>

                <div className="p-2 space-y-2 flex-1 min-h-[140px]">
                  {currentDaySlots.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 font-medium py-4">
                      {isIt ? 'Nessuna lezione' : 'Aucun cours'}
                    </div>
                  ) : (
                    currentDaySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1 hover:border-amber-400 transition"
                      >
                        <div className="text-[10px] font-mono font-bold text-amber-800">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="font-extrabold text-slate-900 leading-tight text-[11px]">
                          {localizeSubject(slot.subject)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          {localizeRoom(slot.room)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Lesson */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-amber-300 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>{t.timetable.modalTitle}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.timetable.modalSubject}
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.timetable.modalDay}
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-semibold capitalize"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {t.timetable.days[d]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.timetable.modalWeekType}
                  </label>
                  <select
                    value={newWeekType}
                    onChange={(e) => setNewWeekType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-semibold"
                  >
                    <option value="both">{t.timetable.bothWeeksTag}</option>
                    <option value="A">{t.weekA}</option>
                    <option value="B">{t.weekB}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.timetable.modalStartTime}
                  </label>
                  <input
                    type="time"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.timetable.modalEndTime}
                  </label>
                  <input
                    type="time"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.timetable.modalRoom}
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t.timetable.modalTeacher}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-amber-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  {t.timetable.modalCancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-500 shadow-xs transition"
                >
                  {t.timetable.modalSave}
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
        onImportSlots={onBatchAddSlots}
        onImportHomework={onAddBatchHomework}
      />
    </div>
  );
};
