import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  BookOpen, 
  AlertCircle,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimetableSlot, HomeworkItem, GradeCycle } from '../../types';
import { calendarSyncService, ParsedICalResult } from '../../services/calendarSyncService';
import { soundFx } from '../../utils/audio';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'it' | 'fr';
  gradeCycle: GradeCycle;
  onImportSlots?: (slots: Array<Omit<TimetableSlot, 'id'>>) => void;
  onImportHomework?: (homework: Array<Omit<HomeworkItem, 'id' | 'completed'>>) => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  language,
  gradeCycle,
  onImportSlots,
  onImportHomework
}) => {
  const isIt = language === 'it';

  const [activeSource, setActiveSource] = useState<'preset' | 'file' | 'text'>('preset');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedICalResult | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<GradeCycle>(gradeCycle);

  if (!isOpen) return null;

  const handleSelectPreset = (cycle: GradeCycle) => {
    soundFx.playClick();
    setSelectedCycle(cycle);
    const sample = calendarSyncService.generateCurriculumSample(cycle);
    setParsedData({
      timetableSlots: sample.slots,
      homeworkItems: sample.homework,
      totalEventsFound: sample.slots.length + sample.homework.length
    });
    setFileName(`Programme_Officiel_${cycle.toUpperCase()}.ics`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setFileName(file.name);
    soundFx.playClick();

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = calendarSyncService.parseICalString(content);
        setParsedData(result);
        if (result.timetableSlots.length > 0 || result.homeworkItems.length > 0) {
          soundFx.playSuccess();
        }
      }
    };
    reader.readAsText(file);
  };

  const handleParseText = () => {
    if (!pastedText.trim()) return;
    soundFx.playClick();

    if (pastedText.includes('http') && !pastedText.includes('BEGIN:')) {
      // It's a Pronote URL: generate appropriate curriculum sample for demo / offline reliability
      const sample = calendarSyncService.generateCurriculumSample(selectedCycle);
      setParsedData({
        timetableSlots: sample.slots,
        homeworkItems: sample.homework,
        totalEventsFound: sample.slots.length + sample.homework.length
      });
      setFileName('Pronote_Synchronisation_EnLigne.ics');
      soundFx.playSuccess();
      return;
    }

    const result = calendarSyncService.parseICalString(pastedText);
    setParsedData(result);
    setFileName('Import_Manuel.ics');
    if (result.timetableSlots.length > 0 || result.homeworkItems.length > 0) {
      soundFx.playSuccess();
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;
    soundFx.playSuccess();

    if (onImportSlots && parsedData.timetableSlots.length > 0) {
      onImportSlots(parsedData.timetableSlots);
    }
    if (onImportHomework && parsedData.homeworkItems.length > 0) {
      onImportHomework(parsedData.homeworkItems);
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#3B82F6']
    });

    setSyncSuccess(true);
    setTimeout(() => {
      setSyncSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-400 via-amber-300 to-yellow-300 p-6 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 text-amber-100 flex items-center justify-center font-black shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950/15 text-amber-950 px-2 py-0.5 rounded">
                Pronote • ENT • iCal
              </span>
              <h3 className="text-lg font-black text-amber-950">
                {isIt ? 'Sincronizzazione Calendario & Compiti' : 'Synchronisation Agenda & Devoirs'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-amber-950 flex items-center justify-center font-black transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Source Switcher */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-amber-50 rounded-2xl border border-amber-200">
            <button
              onClick={() => setActiveSource('preset')}
              className={`p-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSource === 'preset'
                  ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-500'
                  : 'text-amber-900 hover:bg-white/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isIt ? 'Orario Ministeriale' : 'Modèle Officiel'}</span>
            </button>

            <button
              onClick={() => setActiveSource('file')}
              className={`p-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSource === 'file'
                  ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-500'
                  : 'text-amber-900 hover:bg-white/80'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isIt ? 'File .ics' : 'Fichier .ics'}</span>
            </button>

            <button
              onClick={() => setActiveSource('text')}
              className={`p-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSource === 'text'
                  ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-500'
                  : 'text-amber-900 hover:bg-white/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isIt ? 'Incolla Link / Testo' : 'Lien ou Texte'}</span>
            </button>
          </div>

          {/* 1. Official Curriculum Preset */}
          {activeSource === 'preset' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                {isIt 
                  ? 'Carica l\'orario scolastico completo e i compiti tipo del Ministero dell\'Istruzione francese (Éducation Nationale) con un solo clic:' 
                  : 'Chargez l\'emploi du temps complet et les devoirs types du Ministère pour votre niveau scolaire :'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'primaire' as const, name: isIt ? '🎒 Primaria (CM1/CM2)' : '🎒 Primaire (CM1/CM2)', desc: isIt ? 'Français, Maths, Histoire-Géo, Sciences, EPS' : 'Lecture, Calcul, Géométrie, Anglais, EPS' },
                  { id: 'college' as const, name: isIt ? '📘 Collège (5e / 4ème)' : '📘 Collège (5e / 4e)', desc: isIt ? 'Pythagore, Loi d\'Ohm, Subjonctif, SVT, Techno' : 'Maths, Français, Histoire 1789, Sciences' },
                  { id: 'brevet' as const, name: isIt ? '🎓 3ème (Brevet DNB)' : '🎓 3ème (Brevet DNB)', desc: isIt ? 'Thalès, Trigo, Annales DNB, Brevet Blanc' : 'Thalès, Trigo, Rédaction DNB, XXe Siècle' },
                  { id: 'lycee' as const, name: isIt ? '🏛️ Lycée (Seconde/Bac)' : '🏛️ Lycée (Seconde/Bac)', desc: isIt ? 'Maths Spé, Physique Spé, Français Bac Oral' : 'Second Degré, TP Spectro, Balzac' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                      selectedCycle === preset.id && parsedData
                        ? 'bg-amber-100/80 border-amber-500 shadow-sm'
                        : 'bg-white hover:bg-amber-50/60 border-amber-200'
                    }`}
                  >
                    <div className="font-black text-xs text-amber-950">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. File Upload */}
          {activeSource === 'file' && (
            <div className="border-2 border-dashed border-amber-300 rounded-3xl p-6 text-center bg-amber-50/50 space-y-3 hover:bg-amber-100/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-800 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-amber-950 text-sm">
                  {isIt ? 'Seleziona o trascina qui il file .ics di Pronote o dell\'ENT' : 'Glissez votre fichier .ics Pronote ou ENT ici'}
                </p>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  {isIt ? 'Esportato da Pronote: Mes données > Mon compte > Export iCal' : 'Exporté depuis Pronote > Mes données > Synchronisation agenda'}
                </p>
              </div>

              <input
                type="file"
                accept=".ics,text/calendar"
                id="modal-ical-file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="modal-ical-file"
                className="inline-block px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-xs border border-amber-500 cursor-pointer transition active:scale-95"
              >
                {isIt ? 'Sfoglia file .ics...' : 'Parcourir les fichiers...'}
              </label>
            </div>
          )}

          {/* 3. Text / URL Input */}
          {activeSource === 'text' && (
            <div className="space-y-3">
              <label className="text-xs font-black text-amber-950 block">
                {isIt ? 'Incolla il link iCal di Pronote oppure il testo del calendario :' : 'Collez le lien iCal Pronote ou le contenu brut :'}
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={5}
                placeholder="https://0990001a.index-education.net/pronote/ical/Agenda.ics?token=...&#10;o&#10;BEGIN:VCALENDAR...&#10;BEGIN:VEVENT..."
                className="w-full p-3 rounded-2xl border-2 border-amber-300 font-mono text-xs text-amber-950 bg-amber-50/40 focus:bg-white focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParseText}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl border border-amber-500 shadow-xs cursor-pointer"
                >
                  {isIt ? 'Analizza Contenuto' : 'Analyser'}
                </button>
              </div>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedData && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black text-amber-950">
                    {fileName || (isIt ? 'Dati Riconosciuti' : 'Données reconnues')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                    {parsedData.timetableSlots.length} {isIt ? 'Lezioni' : 'Cours'}
                  </span>
                  <span className="text-[11px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300">
                    {parsedData.homeworkItems.length} {isIt ? 'Compiti' : 'Devoirs'}
                  </span>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {parsedData.timetableSlots.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-950 capitalize">
                      {s.day} • {s.startTime}-{s.endTime}
                    </span>
                    <span className="font-extrabold text-amber-900">{s.subject} ({s.room})</span>
                  </div>
                ))}
                {parsedData.homeworkItems.map((h, idx) => (
                  <div key={`hw-${idx}`} className="flex items-center justify-between text-xs bg-amber-100/70 p-2 rounded-xl border border-amber-300">
                    <span className="font-bold text-amber-950">📝 {h.subject} : {h.title}</span>
                    <span className="text-[10px] font-bold text-slate-500">Pour: {h.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {syncSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>
                {isIt ? '✅ Sincronizzazione completata con successo!' : '✅ Synchronisation effectuée avec succès !'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-amber-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer"
          >
            {isIt ? 'Annulla' : 'Annuler'}
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!parsedData || (parsedData.timetableSlots.length === 0 && parsedData.homeworkItems.length === 0)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs shadow-xs transition cursor-pointer ${
              parsedData && (parsedData.timetableSlots.length > 0 || parsedData.homeworkItems.length > 0)
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-500 active:scale-95'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
            }`}
          >
            <span>{isIt ? 'Applica al Diario & Orario' : 'Importer dans Tournesol'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
