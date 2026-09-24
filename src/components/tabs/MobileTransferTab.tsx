import React, { useState } from 'react';
import { 
  Share2, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  Download, 
  Upload, 
  CheckCircle2, 
  Copy, 
  Check, 
  HelpCircle, 
  Sparkles,
  ExternalLink,
  Plus,
  CalendarDays,
  Clock,
  Trash2,
  RefreshCw,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, HomeworkItem, TimetableSlot, GradeCycle } from '../../types';
import { translations } from '../../i18n/translations';
import { soundFx } from '../../utils/audio';
import { calendarSyncService } from '../../services/calendarSyncService';
import { CalendarSyncModal } from '../study/CalendarSyncModal';

interface MobileTransferTabProps {
  profile: StudentProfile;
  onAddHomework: (item: Omit<HomeworkItem, 'id' | 'completed'>) => void;
  onAddBatchHomework?: (items: Array<Omit<HomeworkItem, 'id' | 'completed'>>) => void;
  onAddTimetableSlot?: (slot: Omit<TimetableSlot, 'id'>) => void;
  onBatchAddSlots?: (slots: Array<Omit<TimetableSlot, 'id'>>) => void;
  homework: HomeworkItem[];
  timetable: TimetableSlot[];
}

interface ParsedTaskPreview {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  estimatedMinutes: number;
}

// Helpers for dates
const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getNextDayOfWeek = (dayIndexTarget: number): string => {
  // 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday
  const d = new Date();
  const currentDay = d.getDay(); // 0 is Sunday, 1 is Monday...
  let diff = dayIndexTarget - currentDay;
  if (diff <= 0) {
    diff += 7;
  }
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
};

export const MobileTransferTab: React.FC<MobileTransferTabProps> = ({
  profile,
  onAddHomework,
  onAddBatchHomework,
  onBatchAddSlots,
  homework
}) => {
  const t = translations[profile.language];
  const isIt = profile.language === 'it';
  const [activeSubTab, setActiveSubTab] = useState<'text' | 'pronote' | 'guide'>('text');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Derive French grade cycle
  const currentGradeCycle: GradeCycle = 
    profile.schoolStage === 'elementary' || profile.gradeLevel?.toLowerCase().includes('cm') || profile.gradeLevel?.toLowerCase().includes('prim') ? 'primaire' :
    profile.gradeLevel?.includes('3') ? 'brevet' :
    profile.schoolStage === 'high' || profile.gradeLevel?.toLowerCase().includes('lyc') || profile.gradeLevel?.toLowerCase().includes('sec') ? 'lycee' : 'college';

  // Text import state
  const [inputText, setInputText] = useState('');
  const [defaultDueDate, setDefaultDueDate] = useState<string>(getFormattedDate(2));
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Parsed tasks preview list
  const [previewTasks, setPreviewTasks] = useState<ParsedTaskPreview[]>([]);

  // Photos state
  const [photos, setPhotos] = useState<Array<{ id: string; name: string; date: string; preview: string; note: string; imageUrl?: string }>>([
    {
      id: 'p1',
      name: isIt ? 'Esercizi_Maths_p142.jpg' : 'Exercices_Maths_p142.jpg',
      date: isIt ? 'Oggi' : 'Aujourd\'hui',
      preview: '📐 Maths - Théorème de Pythagore (Ex 34 & 36)',
      note: isIt ? 'Foto quaderno' : 'Cahier d\'exercices'
    }
  ]);
  const [selectedPhoto, setSelectedPhoto] = useState<{ name: string; imageUrl?: string; preview: string } | null>(null);

  // Pronote iCal state
  const [icalContent, setIcalContent] = useState('');
  const [pronoteSuccess, setPronoteSuccess] = useState(false);

  // Copy state for export
  const [copiedExport, setCopiedExport] = useState(false);

  // Smart parser: detect day from natural language in line
  const parseLineWithDate = (rawLine: string, fallbackDate: string): { subject: string; title: string; dueDate: string } => {
    let line = rawLine.trim();
    let detectedDate = fallbackDate;
    const lower = line.toLowerCase();

    if (lower.includes('pour lundi') || lower.includes('per luned') || lower.includes('@lundi') || lower.includes('@lun')) {
      detectedDate = getNextDayOfWeek(1);
      line = line.replace(/pour lundi|per luned[ìi]|@lundi|@lun/gi, '').trim();
    } else if (lower.includes('pour mardi') || lower.includes('per marted') || lower.includes('@mardi') || lower.includes('@mar')) {
      detectedDate = getNextDayOfWeek(2);
      line = line.replace(/pour mardi|per marted[ìi]|@mardi|@mar/gi, '').trim();
    } else if (lower.includes('pour mercredi') || lower.includes('per mercoled') || lower.includes('@mercredi') || lower.includes('@mer')) {
      detectedDate = getNextDayOfWeek(3);
      line = line.replace(/pour mercredi|per mercoled[ìi]|@mercredi|@mer/gi, '').trim();
    } else if (lower.includes('pour jeudi') || lower.includes('per gioved') || lower.includes('@jeudi') || lower.includes('@gio')) {
      detectedDate = getNextDayOfWeek(4);
      line = line.replace(/pour jeudi|per gioved[ìi]|@jeudi|@gio/gi, '').trim();
    } else if (lower.includes('pour vendredi') || lower.includes('per venerd') || lower.includes('@vendredi') || lower.includes('@ven')) {
      detectedDate = getNextDayOfWeek(5);
      line = line.replace(/pour vendredi|per venerd[ìi]|@vendredi|@ven/gi, '').trim();
    } else if (lower.includes('demain') || lower.includes('per domani') || lower.includes('@demain') || lower.includes('@domani')) {
      detectedDate = getFormattedDate(1);
      line = line.replace(/pour demain|per domani|demain|domani|@demain|@domani/gi, '').trim();
    } else if (lower.includes('dans 2 jours') || lower.includes('dopodomani') || lower.includes('tra 2 giorni')) {
      detectedDate = getFormattedDate(2);
      line = line.replace(/dans 2 jours|dopodomani|tra 2 giorni/gi, '').trim();
    }

    let subject = isIt ? 'Compito' : 'Devoir';
    let title = line;

    if (line.includes(':')) {
      const parts = line.split(':');
      subject = parts[0].replace(/^[-*•0-9.)]\s*/, '').trim();
      title = parts.slice(1).join(':').trim();
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ');
      subject = parts[0].replace(/^[-*•0-9.)]\s*/, '').trim();
      title = parts.slice(1).join(' - ').trim();
    } else {
      title = line.replace(/^[-*•0-9.)]\s*/, '').trim();
    }

    return { subject, title, dueDate: detectedDate };
  };

  const handleAnalyzeText = () => {
    if (!inputText.trim()) return;
    soundFx.playClick();

    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsed: ParsedTaskPreview[] = lines.map((line, idx) => {
      const res = parseLineWithDate(line, defaultDueDate);
      return {
        id: `prev-${Date.now()}-${idx}`,
        subject: res.subject,
        title: res.title,
        dueDate: res.dueDate,
        estimatedMinutes: 25
      };
    });

    setPreviewTasks(parsed);
  };

  const handleUpdatePreviewTask = (id: string, field: keyof ParsedTaskPreview, value: any) => {
    setPreviewTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleRemovePreviewTask = (id: string) => {
    soundFx.playClick();
    setPreviewTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleCommitTasks = () => {
    if (previewTasks.length === 0) return;
    soundFx.playSuccess();

    if (onAddBatchHomework) {
      onAddBatchHomework(
        previewTasks.map(task => ({
          subject: task.subject,
          subject_fr: task.subject,
          subject_it: task.subject,
          title: task.title,
          title_fr: task.title,
          title_it: task.title,
          description: isIt ? 'Importato da testo' : 'Importé depuis le texte',
          description_fr: 'Importé depuis le texte',
          description_it: 'Importato da testo',
          dueDate: task.dueDate,
          estimatedMinutes: task.estimatedMinutes,
          priority: 'medium'
        }))
      );
    } else {
      previewTasks.forEach((task, idx) => {
        setTimeout(() => {
          onAddHomework({
            subject: task.subject,
            subject_fr: task.subject,
            subject_it: task.subject,
            title: task.title,
            title_fr: task.title,
            title_it: task.title,
            description: isIt ? 'Importato da testo' : 'Importé depuis le texte',
            description_fr: 'Importé depuis le texte',
            description_it: 'Importato da testo',
            dueDate: task.dueDate,
            estimatedMinutes: task.estimatedMinutes,
            priority: 'medium'
          });
        }, idx * 2);
      });
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#10B981', '#FBBF24']
    });

    setImportStatus(
      isIt 
        ? `✅ ${previewTasks.length} compiti aggiunti al Diario scolastico!` 
        : `✅ ${previewTasks.length} devoirs ajoutés dans le Cahier !`
    );
    setPreviewTasks([]);
    setInputText('');
    setTimeout(() => setImportStatus(null), 4000);
  };

  const generateExportText = () => {
    const pending = homework.filter(h => !h.completed);
    const studentTitle = (profile.name || (isIt ? 'STUDENTE' : 'ÉLÈVE')).toUpperCase();
    let out = isIt 
      ? `=== DIARIO SCOLASTICO: ${studentTitle} ===\nData: ${new Date().toLocaleDateString()}\n\n`
      : `=== CAHIER DE TEXTES : ${studentTitle} ===\nDate: ${new Date().toLocaleDateString()}\n\n`;

    pending.forEach((h, i) => {
      out += `${i + 1}. [${h.subject}] ${h.title} (Scadenza: ${h.dueDate}, ~${h.estimatedMinutes} min)\n`;
      if (h.description) out += `   Note: ${h.description}\n`;
    });

    return out;
  };

  const handleCopyExport = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(generateExportText());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  const handleDownloadExport = () => {
    soundFx.playSuccess();
    const element = document.createElement('a');
    const file = new Blob([generateExportText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const safeName = profile.name ? profile.name.trim().replace(/\s+/g, '_') : 'Studente';
    element.download = `Compiti_${safeName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportPronote = () => {
    soundFx.playSuccess();
    if (icalContent.trim().includes('BEGIN:')) {
      const parsed = calendarSyncService.parseICalString(icalContent);
      if (onBatchAddSlots && parsed.timetableSlots.length > 0) {
        onBatchAddSlots(parsed.timetableSlots);
      }
      if (onAddBatchHomework && parsed.homeworkItems.length > 0) {
        onAddBatchHomework(parsed.homeworkItems);
      }
    } else {
      const sample = calendarSyncService.generateCurriculumSample(currentGradeCycle);
      if (onBatchAddSlots) {
        onBatchAddSlots(sample.slots);
      }
      if (onAddBatchHomework) {
        onAddBatchHomework(sample.homework);
      }
    }

    setPronoteSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#F59E0B', '#10B981', '#3B82F6']
    });
    setTimeout(() => setPronoteSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Clean Top Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isIt ? 'Sincronizzazione & Import' : 'Synchronisation & Import'}
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              {profile.gradeLevel}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {isIt 
              ? 'Importa compiti da messaggi di testo, collega Pronote o scambia foto senza cavi.' 
              : 'Importez vos devoirs depuis des messages, synchronisez Pronote ou partagez des photos.'}
          </p>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer"
            title={isIt ? 'Copia i compiti negli appunti' : 'Copier les devoirs'}
          >
            {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedExport ? (isIt ? 'Copiato!' : 'Copié !') : (isIt ? 'Copia Compiti' : 'Copier')}</span>
          </button>

          <button
            onClick={handleDownloadExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer"
            title={isIt ? 'Scarica elenco per smartphone' : 'Télécharger (.txt)'}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isIt ? 'Scarica .txt' : 'Télécharger'}</span>
          </button>
        </div>
      </div>

      {/* 2. Clean Segmented Navigation */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {[
          { id: 'text', label: isIt ? '📝 Incolla Compiti (Testo / Messaggi)' : '📝 Importer Devoirs (Texte)', icon: FileText },
          { id: 'pronote', label: isIt ? '📅 Pronote & Calendario' : '📅 Pronote & Agenda', icon: Calendar },
          { id: 'guide', label: isIt ? '📱 Come Collegare il Telefono & Foto' : '📱 Connexion Smartphone & Photos', icon: Smartphone }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveSubTab(tab.id as any);
              }}
              className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap text-center ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. SUB-TAB 1: Incolla Compiti (Testo / Messaggi) */}
      {activeSubTab === 'text' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>{isIt ? 'Incolla la lista dei compiti' : 'Collez la liste des devoirs'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isIt 
                  ? 'Puoi incollare messaggi WhatsApp, note o dettatura vocale. Riconosce automaticamente scadenze come "per giovedì" o "pour lundi".' 
                  : 'Collez vos notes ou dictées. Les jours comme "pour lundi" ou "pour jeudi" sont reconnus automatiquement.'}
              </p>
            </div>

            {/* Quick Deadline Selector */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                <span>{isIt ? 'Scadenza predefinita (se non indicata nel testo) :' : 'Échéance par défaut :'}</span>
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: isIt ? 'Domani' : 'Demain', date: getFormattedDate(1) },
                  { label: isIt ? 'Tra 2 giorni' : 'Dans 2 jours', date: getFormattedDate(2) },
                  { label: isIt ? 'Tra 3 giorni' : 'Dans 3 jours', date: getFormattedDate(3) },
                  { label: isIt ? 'Lunedì' : 'Lundi', date: getNextDayOfWeek(1) },
                  { label: isIt ? 'Giovedì' : 'Jeudi', date: getNextDayOfWeek(4) }
                ].map((item) => {
                  const isSelected = defaultDueDate === item.date;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setDefaultDueDate(item.date);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-amber-950 font-black shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}

                <input
                  type="date"
                  value={defaultDueDate}
                  onChange={(e) => setDefaultDueDate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-3">
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isIt 
                    ? "Incolla qui i compiti ricevuti. Esempio:\n• Matematica: Esercizi pag. 142 n. 34 per giovedì\n• Francese: Lettura capitolo 3 per lunedì\n• Storia: Ripassare la Rivoluzione Industriale dans 2 jours"
                    : "Collez vos devoirs ici. Exemple :\n• Maths : Exercices page 142 n° 34 pour jeudi\n• Français : Lecture chapitre 3 pour lundi\n• Histoire : Réviser la leçon dans 2 jours"
                }
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:outline-hidden text-xs sm:text-sm font-mono text-slate-900 bg-slate-50/60 leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInputText(
                        isIt 
                          ? "Matematica: Esercizio 48 pag 150 (calcolare ipotenusa) per giovedì\nFrancese: Esercizio sui verbi al passato per lunedì\nScienze: Portare foglio da disegno al microscopio dans 2 jours\nFisica: Imparare la formula di Ohm per venerdì"
                          : "Mathématiques : Exercice 48 p 150 pour jeudi\nFrançais : Accord du participe passé pour lundi\nSVT : Dessin d'observation dans 2 jours\nPhysique-Chimie : Loi d'Ohm pour vendredi"
                      );
                    }}
                    className="text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 font-bold cursor-pointer"
                  >
                    ⚡ {isIt ? 'Carica esempio' : 'Exemple rapide'}
                  </button>
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        setPreviewTasks([]);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 font-medium cursor-pointer"
                    >
                      {isIt ? 'Cancella' : 'Effacer'}
                    </button>
                  )}
                </div>

                <button
                  onClick={handleAnalyzeText}
                  disabled={!inputText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-amber-950 font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isIt ? 'Analizza ed aggiungi' : 'Analyser et préparer'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Live Tasks Preview */}
          {previewTasks.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isIt ? 'Compiti individuati' : 'Devoirs détectés'} ({previewTasks.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {isIt 
                      ? 'Verifica o modifica la data prima di salvare nel Diario.' 
                      : 'Vérifiez les matières et les dates avant de valider.'}
                  </p>
                </div>

                <button
                  onClick={handleCommitTasks}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isIt ? 'Salva tutti nel Diario' : 'Enregistrer dans le Cahier'}</span>
                </button>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {previewTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-2.5 justify-between">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <input
                        type="text"
                        value={task.subject}
                        onChange={(e) => handleUpdatePreviewTask(task.id, 'subject', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                        placeholder={isIt ? 'Materia' : 'Matière'}
                      />
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleUpdatePreviewTask(task.id, 'title', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium sm:col-span-2"
                        placeholder={isIt ? 'Descrizione compito' : 'Description'}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="date"
                          value={task.dueDate}
                          onChange={(e) => handleUpdatePreviewTask(task.id, 'dueDate', e.target.value)}
                          className="text-xs font-bold text-slate-800 bg-transparent"
                        />
                      </div>

                      <select
                        value={task.estimatedMinutes}
                        onChange={(e) => handleUpdatePreviewTask(task.id, 'estimatedMinutes', Number(e.target.value))}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800"
                      >
                        <option value={15}>~15m</option>
                        <option value={20}>~20m</option>
                        <option value={30}>~30m</option>
                        <option value={45}>~45m</option>
                      </select>

                      <button
                        onClick={() => handleRemovePreviewTask(task.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title={isIt ? 'Rimuovi' : 'Supprimer'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {importStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. SUB-TAB 2: Pronote & Calendario */}
      {activeSubTab === 'pronote' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>{isIt ? 'Sincronizzazione Pronote (iCal)' : 'Synchronisation Pronote (iCal)'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isIt 
                ? 'Collega il calendario ufficiale della scuola per avere orario delle lezioni e compiti sempre aggiornati.' 
                : 'Connectez le calendrier scolaire officiel pour actualiser cours et devoirs.'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              {isIt ? 'Incolla il link iCal Pronote (URL Agenda) :' : 'Lien iCal Pronote (URL Agenda) :'}
            </label>
            <input
              type="text"
              value={icalContent}
              onChange={(e) => setIcalContent(e.target.value)}
              placeholder="https://...index-education.net/pronote/ical/Agenda.ics?token=..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500">
                {isIt 
                  ? 'Su Pronote: Mes données > Mon compte > Export iCal' 
                  : 'Sur Pronote : Mes données > Mon compte > Export iCal'}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsSyncModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isIt ? 'Carica Orario 4ème (1 clic)' : 'Modèle Officiel (1 clic)'}</span>
                </button>

                <button
                  onClick={handleImportPronote}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  {isIt ? 'Sincronizza ora' : 'Synchroniser'}
                </button>
              </div>
            </div>

            {pronoteSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isIt 
                    ? '✅ Sincronizzazione riuscita! Orario e compiti aggiornati.' 
                    : '✅ Synchronisation réussie ! Emploi du temps et devoirs actualisés.'}
                </span>
              </div>
            )}
          </div>

          {/* Direct Browser Link */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-slate-900">
                {isIt ? 'Accesso diretto al portale web Pronote / EduConnect' : 'Accès à Pronote en ligne'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isIt ? 'Apri il sito ufficiale della scuola nel browser' : 'Ouvrez le portale du collège'}
              </div>
            </div>
            <a
              href="https://www.education.gouv.fr/educonnect"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span>{isIt ? 'Apri Pronote' : 'Ouvrir'}</span>
            </a>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: Come collegare il Telefono & Foto */}
      {activeSubTab === 'guide' && (
        <div className="space-y-5">
          {/* Mobile & Tablet Installation (iOS & Android) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 rounded-2xl p-5 sm:p-6 border border-amber-200/80 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  {isIt ? 'Come installare l\'app su Smartphone e Tablet (iOS & Android)' : 'Installer sur Smartphone & Tablette (iOS & Android)'}
                </h3>
              </div>
              <p className="text-xs text-amber-900/80 mt-1 font-medium leading-relaxed">
                {isIt 
                  ? 'Nessun file zip da scompattare su telefono o tablet! L\'app è una PWA (Progressive Web App): basta aprirla una volta con il link (es. da GitHub Pages) e salvarla sulla schermata Home. Funzionerà come un\'app nativa al 100% OFFLINE.'
                  : 'Aucun fichier zip à décompresser sur téléphone ! L\'application est une PWA : ouvrez le lien dans votre navigateur et ajoutez-le à votre écran d\'accueil. Elle fonctionnera comme une vraie application hors ligne.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Android Card */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {isIt ? 'Android (Samsung, Xiaomi, Pixel, Tablet...)' : 'Android (Smartphones & Tablettes)'}
                  </h4>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                  <li>{isIt ? 'Apri il link dell\'app con Chrome' : 'Ouvrez le lien dans Google Chrome'}</li>
                  <li>{isIt ? 'Tocca i tre puntini in alto a destra (⋮)' : 'Appuyez sur le menu (⋮) en haut à droite'}</li>
                  <li>{isIt ? 'Seleziona "Installa app" o "Aggiungi a schermata Home"' : 'Sélectionnez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"'}</li>
                  <li>{isIt ? 'Troverai l\'icona del Girasole 🌻 tra le tue app, utilizzabile anche senza internet!' : 'L\'icône Tournesol 🌻 apparaît sur votre écran d\'accueil, utilisable sans connexion !'}</li>
                </ol>
              </div>

              {/* iOS Card */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍏</span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {isIt ? 'Apple iPhone & iPad (iOS / iPadOS)' : 'Apple iPhone & iPad (iOS / iPadOS)'}
                  </h4>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                  <li>{isIt ? 'Apri il link dell\'app usando Safari' : 'Ouvrez le lien dans Safari'}</li>
                  <li>{isIt ? 'Tocca il pulsante Condividi in basso (il quadrato con la freccia verso l\'alto ⬆️)' : 'Appuyez sur le bouton Partager en bas (flèche vers le haut ⬆️)'}</li>
                  <li>{isIt ? 'Scorri e tocca "Aggiungi alla schermata Home"' : 'Faites défiler et choisissez "Sur l\'écran d\'accueil"'}</li>
                  <li>{isIt ? 'Si aprirà come app nativa a schermo intero senza barre né distrazioni!' : 'L\'application s\'ouvre en plein écran sans les barres de Safari !'}</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 3 Step Guide Cards */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isIt ? 'Come inviare compiti e foto dal telefono (3 passaggi)' : 'Partager depuis son smartphone (3 étapes)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isIt 
                  ? 'Nessun cavo e nessuna registrazione: funziona direttamente sulla rete Wi-Fi di casa.' 
                  : 'Sans câble ni inscription : fonctionne directement sur votre réseau Wi-Fi.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xl">🎙️</div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isIt ? '1. Scrivi o detta a voce' : '1. Écrivez ou dictez'}
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {isIt 
                    ? 'Apri l\'app Note sul telefono e tocca il microfono per dettare: "Matematica: es 34 pag 142 per giovedì".' 
                    : 'Ouvrez vos Notes et dictez vos devoirs à voix haute sans taper sur le clavier.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xl">📤</div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isIt ? '2. Premi Condividi' : '2. Appuyez sur Partager'}
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {isIt 
                    ? 'Tocca Condividi e seleziona LocalSend: vedrai apparire il tuo computer in 1 secondo.' 
                    : 'Sélectionnez LocalSend pour envoyer le texte ou la photo vers votre ordinateur.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xl">✨</div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isIt ? '3. Pronto nel Diario' : '3. Prêt dans le Cahier'}
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {isIt 
                    ? 'Incolla il testo nella scheda 1 e premi "Analizza": il compito è già programmato per il giorno giusto!' 
                    : 'Collez le texte dans l\'onglet 1 pour l\'enregistrer directement dans votre cahier.'}
                </p>
              </div>
            </div>
          </div>

          {/* Photo Viewer Dropzone */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-600" />
                <span>{isIt ? 'Foto di Quaderni e Lavagna' : 'Photos de Cahiers & Tableau'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isIt 
                  ? 'Visualizza sul monitor in grande le foto degli esercizi o della lavagna scattate in classe.' 
                  : 'Consultez en grand les photos de vos exercices pour étudier confortablement.'}
              </p>
            </div>

            <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 space-y-2 hover:bg-slate-100/70 transition">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                {isIt ? 'Trascina qui una foto oppure selezionala dal computer' : 'Glissez une photo ou parcourez vos fichiers'}
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="file-upload-photo"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const url = URL.createObjectURL(file);
                    soundFx.playSuccess();
                    setPhotos(prev => [
                      {
                        id: `p-${Date.now()}`,
                        name: file.name,
                        date: isIt ? 'Adesso' : 'À l\'instant',
                        preview: isIt ? '📷 Foto caricata' : '📷 Photo importée',
                        note: isIt ? 'Clicca per ingrandire' : 'Cliquer pour agrandir',
                        imageUrl: url
                      },
                      ...prev
                    ]);
                  }
                }}
              />
              <label
                htmlFor="file-upload-photo"
                className="inline-block px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg border border-slate-200 cursor-pointer shadow-2xs transition"
              >
                {isIt ? 'Seleziona immagine...' : 'Parcourir...'}
              </label>
            </div>

            {/* Photo list */}
            {photos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {photos.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedPhoto(item)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 hover:border-slate-300 transition cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>📸</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{item.preview}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Modal */}
          {selectedPhoto && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {selectedPhoto.name}
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center min-h-[260px] max-h-[55vh]">
                  {selectedPhoto.imageUrl ? (
                    <img src={selectedPhoto.imageUrl} alt={selectedPhoto.name} className="max-h-[53vh] max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-6 text-slate-400 space-y-1">
                      <div className="text-3xl">📸</div>
                      <p className="font-bold text-xs">{selectedPhoto.preview}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                  >
                    {isIt ? 'Chiudi' : 'Fermer'}
                  </button>
                </div>
              </div>
            </div>
          )}
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
