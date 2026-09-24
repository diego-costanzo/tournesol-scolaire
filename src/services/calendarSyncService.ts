import { TimetableSlot, HomeworkItem, GradeCycle } from '../types';

export interface ParsedICalResult {
  timetableSlots: Omit<TimetableSlot, 'id'>[];
  homeworkItems: Omit<HomeworkItem, 'id' | 'completed'>[];
  totalEventsFound: number;
}

const DAY_MAP_FROM_NUM: Array<'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi'> = [
  'lundi', // 0: Sunday fallback or 1 Monday
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'lundi'
];

const BYDAY_MAP: Record<string, 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi'> = {
  MO: 'lundi',
  TU: 'mardi',
  WE: 'mercredi',
  TH: 'jeudi',
  FR: 'vendredi'
};

const SUBJECT_COLOR_MAP: Record<string, string> = {
  math: 'bg-amber-100 text-amber-900 border-amber-300',
  matematica: 'bg-amber-100 text-amber-900 border-amber-300',
  fran: 'bg-blue-100 text-blue-900 border-blue-300',
  hist: 'bg-orange-100 text-orange-900 border-orange-300',
  géo: 'bg-orange-100 text-orange-900 border-orange-300',
  phys: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  chim: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  svt: 'bg-teal-100 text-teal-900 border-teal-300',
  scien: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  angl: 'bg-purple-100 text-purple-900 border-purple-300',
  esp: 'bg-rose-100 text-rose-900 border-rose-300',
  ital: 'bg-green-100 text-green-900 border-green-300',
  tech: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  art: 'bg-pink-100 text-pink-900 border-pink-300',
  musi: 'bg-violet-100 text-violet-900 border-violet-300',
  eps: 'bg-lime-100 text-lime-900 border-lime-300',
  sport: 'bg-lime-100 text-lime-900 border-lime-300'
};

export class CalendarSyncService {
  /**
   * Parse standard RFC 5545 iCalendar (.ics) format from Pronote, ENT, or Apple/Google Calendar
   */
  public parseICalString(icsContent: string): ParsedICalResult {
    const lines = icsContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    // Unfold multi-line iCal properties (lines starting with space or tab)
    const unfolded: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.slice(1);
      } else {
        unfolded.push(line);
      }
    }

    const timetableSlots: Omit<TimetableSlot, 'id'>[] = [];
    const homeworkItems: Omit<HomeworkItem, 'id' | 'completed'>[] = [];
    let totalEvents = 0;

    let inEvent = false;
    let currentEvent: Record<string, string> = {};

    for (const rawLine of unfolded) {
      const line = rawLine.trim();
      if (line === 'BEGIN:VEVENT' || line === 'BEGIN:VTODO') {
        inEvent = true;
        currentEvent = {};
        totalEvents++;
        continue;
      }

      if (line === 'END:VEVENT' || line === 'END:VTODO') {
        inEvent = false;
        this.processEvent(currentEvent, timetableSlots, homeworkItems);
        currentEvent = {};
        continue;
      }

      if (inEvent) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const rawKey = line.slice(0, colonIdx);
          const value = line.slice(colonIdx + 1).trim();
          // Extract main key without params (e.g. DTSTART;TZID=... -> DTSTART)
          const key = rawKey.split(';')[0].toUpperCase();
          currentEvent[key] = value;
          if (rawKey.includes('BYDAY=')) {
            const match = rawKey.match(/BYDAY=([A-Z]{2})/);
            if (match) currentEvent['BYDAY'] = match[1];
          }
        }
      }
    }

    return {
      timetableSlots,
      homeworkItems,
      totalEventsFound: totalEvents
    };
  }

  private processEvent(
    evt: Record<string, string>,
    slots: Omit<TimetableSlot, 'id'>[],
    homework: Omit<HomeworkItem, 'id' | 'completed'>[]
  ) {
    const summary = evt['SUMMARY'] || 'Cours';
    const description = evt['DESCRIPTION'] || '';
    const location = evt['LOCATION'] || 'Salle de cours';
    const dtstart = evt['DTSTART'] || '';
    const dtend = evt['DTEND'] || '';
    const rrule = evt['RRULE'] || '';

    // Check if this event looks like a homework assignment
    const isHomework = 
      evt['DUE'] !== undefined ||
      summary.toLowerCase().includes('devoir') ||
      summary.toLowerCase().includes('compito') ||
      summary.toLowerCase().includes('à rendre') ||
      summary.toLowerCase().includes('exercice') ||
      summary.toLowerCase().includes('contrôle') ||
      summary.toLowerCase().includes('évaluation') ||
      summary.toLowerCase().includes('dnb') ||
      description.toLowerCase().includes('à faire') ||
      description.toLowerCase().includes('pour le');

    if (isHomework) {
      // Determine due date
      let dueDate = new Date().toISOString().split('T')[0];
      const targetDateStr = evt['DUE'] || dtstart;
      if (targetDateStr) {
        const match = targetDateStr.match(/(\d{4})(\d{2})(\d{2})/);
        if (match) {
          dueDate = `${match[1]}-${match[2]}-${match[3]}`;
        }
      }

      // Extract subject
      const subject = this.detectSubject(summary, description);

      homework.push({
        subject,
        subject_fr: subject,
        subject_it: subject,
        title: summary.replace(/^(Devoir|Compito|Travail à faire)\s*[:\-–]\s*/i, '').trim() || summary,
        title_fr: summary,
        title_it: summary,
        description: description.replace(/\\n/g, ' ').slice(0, 180),
        description_fr: description.replace(/\\n/g, ' ').slice(0, 180),
        description_it: description.replace(/\\n/g, ' ').slice(0, 180),
        dueDate,
        estimatedMinutes: summary.toLowerCase().includes('contrôle') ? 45 : 25,
        priority: summary.toLowerCase().includes('contrôle') ? 'high' : 'medium'
      });
    } else {
      // It's a recurring school timetable class
      let day: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' = 'lundi';
      
      // Check RRULE for BYDAY
      if (rrule.includes('BYDAY=')) {
        const match = rrule.match(/BYDAY=([A-Z]{2})/);
        if (match && BYDAY_MAP[match[1]]) {
          day = BYDAY_MAP[match[1]];
        }
      } else if (evt['BYDAY'] && BYDAY_MAP[evt['BYDAY']]) {
        day = BYDAY_MAP[evt['BYDAY']];
      } else if (dtstart) {
        const match = dtstart.match(/(\d{4})(\d{2})(\d{2})/);
        if (match) {
          const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
          const dayNum = d.getDay(); // 0 is Sun, 1 is Mon...
          day = DAY_MAP_FROM_NUM[dayNum] || 'lundi';
        }
      }

      // Extract start and end times (HH:MM)
      let startTime = '08:30';
      let endTime = '09:25';

      if (dtstart) {
        const matchTime = dtstart.match(/T(\d{2})(\d{2})/);
        if (matchTime) {
          startTime = `${matchTime[1]}:${matchTime[2]}`;
        }
      }
      if (dtend) {
        const matchTime = dtend.match(/T(\d{2})(\d{2})/);
        if (matchTime) {
          endTime = `${matchTime[1]}:${matchTime[2]}`;
        }
      }

      const subject = this.detectSubject(summary, description);
      const color = this.getSubjectColor(subject);

      // Avoid exact duplicates in slots
      const exists = slots.some(
        s => s.day === day && s.startTime === startTime && s.subject === subject
      );

      if (!exists) {
        slots.push({
          day,
          startTime,
          endTime,
          subject,
          subject_fr: subject,
          subject_it: subject,
          room: location || 'Salle 101',
          room_fr: location || 'Salle 101',
          room_it: location || 'Aula 101',
          teacher: description ? description.split('\n')[0].replace(/^Prof[:\s]*/i, '') : 'Enseignant',
          color,
          weekType: 'both'
        });
      }
    }
  }

  public detectSubject(summary: string, desc: string): string {
    const text = `${summary} ${desc}`.toLowerCase();
    if (text.includes('math') || text.includes('géom') || text.includes('algè')) return 'Mathématiques';
    if (text.includes('fran') || text.includes('litt')) return 'Français';
    if (text.includes('hist') || text.includes('géo') || text.includes('emc')) return 'Histoire-Géographie';
    if (text.includes('phys') || text.includes('chim')) return 'Physique-Chimie';
    if (text.includes('svt') || text.includes('biol') || text.includes('terre')) return 'SVT';
    if (text.includes('angl') || text.includes('english')) return 'Anglais';
    if (text.includes('esp') || text.includes('span')) return 'Espagnol';
    if (text.includes('ital')) return 'Italien';
    if (text.includes('allem') || text.includes('deutsch')) return 'Allemand';
    if (text.includes('tech') || text.includes('scratch') || text.includes('info')) return 'Technologie';
    if (text.includes('art') || text.includes('plast')) return 'Arts Plastiques';
    if (text.includes('musi')) return 'Éducation Musicale';
    if (text.includes('eps') || text.includes('sport') || text.includes('gym')) return 'EPS';
    return summary.split(' - ')[0].trim() || 'Matière Générale';
  }

  public getSubjectColor(subject: string): string {
    const low = subject.toLowerCase();
    for (const [key, colorClass] of Object.entries(SUBJECT_COLOR_MAP)) {
      if (low.includes(key)) return colorClass;
    }
    return 'bg-amber-100 text-amber-900 border-amber-300';
  }

  /**
   * Generates a realistic official French School Timetable (Emploi du Temps Pronote)
   * aligned with the French Ministry of Education (Éducation Nationale) for the chosen cycle.
   */
  public generateCurriculumSample(cycle: GradeCycle): {
    slots: Omit<TimetableSlot, 'id'>[];
    homework: Omit<HomeworkItem, 'id' | 'completed'>[];
  } {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    const inTwoDaysStr = inTwoDays.toISOString().split('T')[0];

    const inFourDays = new Date();
    inFourDays.setDate(inFourDays.getDate() + 4);
    const inFourDaysStr = inFourDays.toISOString().split('T')[0];

    if (cycle === 'primaire') {
      return {
        slots: [
          { day: 'lundi', startTime: '08:45', endTime: '10:15', subject: 'Français (Lecture & Écriture)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
          { day: 'lundi', startTime: '10:30', endTime: '11:45', subject: 'Mathématiques (Calcul)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'lundi', startTime: '13:30', endTime: '15:00', subject: 'Histoire & Géographie', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-orange-100 text-orange-900 border-orange-300', weekType: 'both' },
          { day: 'lundi', startTime: '15:15', endTime: '16:30', subject: 'EPS (Sport de plein air)', room: 'Cour / Gymnase', teacher: 'M. Mercier', color: 'bg-lime-100 text-lime-900 border-lime-300', weekType: 'both' },
          { day: 'mardi', startTime: '08:45', endTime: '10:15', subject: 'Mathématiques (Géométrie)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'mardi', startTime: '10:30', endTime: '11:45', subject: 'Français (Grammaire & Dictée)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
          { day: 'mardi', startTime: '13:30', endTime: '15:00', subject: 'Sciences & Technologie', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', weekType: 'both' },
          { day: 'jeudi', startTime: '08:45', endTime: '10:15', subject: 'Français (Orthographe)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
          { day: 'jeudi', startTime: '10:30', endTime: '11:45', subject: 'Mathématiques (Problèmes)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'jeudi', startTime: '13:30', endTime: '14:30', subject: 'Anglais (Initiation)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-purple-100 text-purple-900 border-purple-300', weekType: 'both' },
          { day: 'vendredi', startTime: '08:45', endTime: '10:15', subject: 'Mathématiques (Calcul Mental)', room: 'Classe CM2', teacher: 'Mme Renaud', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'vendredi', startTime: '10:30', endTime: '11:45', subject: 'Arts Plastiques', room: 'Atelier Art', teacher: 'Mme Renaud', color: 'bg-pink-100 text-pink-900 border-pink-300', weekType: 'both' }
        ],
        homework: [
          { subject: 'Maths', subject_fr: 'Maths', subject_it: 'Matematica', title: 'Réviser les tables de 7 et 8', title_fr: 'Réviser les tables de 7 et 8', title_it: 'Ripassare le tabelline del 7 e dell\'8', description: 'Interrogation orale et calcul mental rapide', dueDate: tomorrowStr, estimatedMinutes: 15, priority: 'medium' },
          { subject: 'Français', subject_fr: 'Français', subject_it: 'Francese', title: 'Autodictée n°5 : Les homophones a / à', title_fr: 'Autodictée : Les homophones a / à', title_it: 'Dettato sugli omofoni a / à', description: 'Apprendre par cœur les 3 phrases du cahier', dueDate: inTwoDaysStr, estimatedMinutes: 20, priority: 'high' }
        ]
      };
    }

    if (cycle === 'brevet') {
      return {
        slots: [
          { day: 'lundi', startTime: '08:00', endTime: '09:00', subject: 'Mathématiques (Thalès & Trigo)', room: 'Salle 204', teacher: 'M. Martin', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'lundi', startTime: '09:00', endTime: '10:00', subject: 'Histoire (1ère Guerre Mondiale)', room: 'Salle 108', teacher: 'M. Petit', color: 'bg-orange-100 text-orange-900 border-orange-300', weekType: 'both' },
          { day: 'lundi', startTime: '10:15', endTime: '12:15', subject: 'Français (Annales DNB)', room: 'Salle 210', teacher: 'Mme Bernard', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
          { day: 'lundi', startTime: '13:45', endTime: '15:45', subject: 'Physique-Chimie (Énergie & Puissance)', room: 'Labo 3', teacher: 'M. Lefebvre', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', weekType: 'both' },
          { day: 'mardi', startTime: '08:00', endTime: '10:00', subject: 'EPS (Athlétisme & Demi-Fond)', room: 'Stade Municipal', teacher: 'Mme Robert', color: 'bg-lime-100 text-lime-900 border-lime-300', weekType: 'both' },
          { day: 'mardi', startTime: '10:15', endTime: '11:15', subject: 'Anglais (Préparation Oral DNB)', room: 'Salle 112', teacher: 'Mrs. Smith', color: 'bg-purple-100 text-purple-900 border-purple-300', weekType: 'both' },
          { day: 'mardi', startTime: '11:15', endTime: '12:15', subject: 'SVT (Génétique & ADN)', room: 'Labo SVT 1', teacher: 'Mme Dubois', color: 'bg-teal-100 text-teal-900 border-teal-300', weekType: 'both' },
          { day: 'mercredi', startTime: '08:00', endTime: '10:00', subject: 'Brevet Blanc Épreuve Maths', room: 'Salle Polyvalente', teacher: 'M. Martin', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'jeudi', startTime: '08:00', endTime: '09:00', subject: 'Technologie (Python & Algorithmique)', room: 'Salle Info 2', teacher: 'M. Laurent', color: 'bg-cyan-100 text-cyan-900 border-cyan-300', weekType: 'both' },
          { day: 'jeudi', startTime: '09:00', endTime: '11:00', subject: 'Français (Rédaction Type Brevet)', room: 'Salle 210', teacher: 'Mme Bernard', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
          { day: 'vendredi', startTime: '09:00', endTime: '10:00', subject: 'Histoire-Géo (Repères Chronologiques)', room: 'Salle 108', teacher: 'M. Petit', color: 'bg-orange-100 text-orange-900 border-orange-300', weekType: 'both' },
          { day: 'vendredi', startTime: '10:15', endTime: '11:15', subject: 'Mathématiques (Calcul Littéral)', room: 'Salle 204', teacher: 'M. Martin', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' }
        ],
        homework: [
          { subject: 'Maths', subject_fr: 'Maths', subject_it: 'Matematica', title: 'Sujet Brevet DNB Métropole 2024 : Thalès', title_fr: 'Sujet Brevet DNB 2024 : Exercice Thalès', title_it: 'Simulazione Esame Terza Media: Talete', description: 'Rédiger proprement avec hypothèses et conclusion', dueDate: tomorrowStr, estimatedMinutes: 40, priority: 'high' },
          { subject: 'Histoire-Géo', subject_fr: 'Histoire-Géo', subject_it: 'Storia-Geo', title: 'Fiche de Révision : La Seconde Guerre Mondiale', title_fr: 'Fiche Révision : Seconde Guerre Mondiale', title_it: 'Scheda di Ripasso: Seconda Guerra Mondiale', description: 'Dates clés : 18 juin 1940, 6 juin 1944, 8 mai 1945', dueDate: inTwoDaysStr, estimatedMinutes: 30, priority: 'medium' }
        ]
      };
    }

    if (cycle === 'lycee') {
      return {
        slots: [
          { day: 'lundi', startTime: '08:00', endTime: '10:00', subject: 'Mathématiques Spé (Second Degré)', room: 'Salle C12', teacher: 'M. Vasseur', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'lundi', startTime: '10:15', endTime: '12:15', subject: 'Physique-Chimie Spé (TP Spectroscopie)', room: 'Labo Chimie 2', teacher: 'Mme Girard', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', weekType: 'both' },
          { day: 'mardi', startTime: '08:00', endTime: '10:00', subject: 'Français (Bac Oral - Balzac)', room: 'Salle B04', teacher: 'M. Moreau', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
          { day: 'mardi', startTime: '10:15', endTime: '12:15', subject: 'Histoire-Géo & Géopolitique', room: 'Salle B12', teacher: 'Mme Roux', color: 'bg-orange-100 text-orange-900 border-orange-300', weekType: 'both' },
          { day: 'jeudi', startTime: '13:30', endTime: '15:30', subject: 'Mathématiques (Vecteurs & Produit Scalaire)', room: 'Salle C12', teacher: 'M. Vasseur', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
          { day: 'vendredi', startTime: '10:15', endTime: '12:15', subject: 'Anglais LLCER', room: 'Salle A02', teacher: 'Mr. Davis', color: 'bg-purple-100 text-purple-900 border-purple-300', weekType: 'both' }
        ],
        homework: [
          { subject: 'Maths', subject_fr: 'Maths', subject_it: 'Matematica', title: 'DM 4 : Résolution trinôme du second degré', title_fr: 'DM 4 : Équations du second degré et signe de Δ', title_it: 'Compito: Equazioni di secondo grado e discriminante', description: 'Étude complète de fonction et racines réelles', dueDate: tomorrowStr, estimatedMinutes: 45, priority: 'high' }
        ]
      };
    }

    // Default Collège 4ème
    return {
      slots: [
        { day: 'lundi', startTime: '08:30', endTime: '09:25', subject: 'Mathématiques (Pythagore)', room: 'Salle 204', teacher: 'M. Martin', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
        { day: 'lundi', startTime: '09:30', endTime: '10:25', subject: 'Français (Subjonctif)', room: 'Salle 210', teacher: 'Mme Bernard', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
        { day: 'lundi', startTime: '10:40', endTime: '11:35', subject: 'Histoire-Géographie (1789)', room: 'Salle 108', teacher: 'M. Petit', color: 'bg-orange-100 text-orange-900 border-orange-300', weekType: 'both' },
        { day: 'lundi', startTime: '13:30', endTime: '15:20', subject: 'EPS (Gymnastique)', room: 'Gymnase A', teacher: 'Mme Robert', color: 'bg-lime-100 text-lime-900 border-lime-300', weekType: 'both' },
        { day: 'mardi', startTime: '08:30', endTime: '10:25', subject: 'Physique-Chimie (Loi d\'Ohm)', room: 'Labo 3', teacher: 'M. Lefebvre', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', weekType: 'both' },
        { day: 'mardi', startTime: '10:40', endTime: '11:35', subject: 'Anglais (Irregular Verbs)', room: 'Salle 112', teacher: 'Mrs. Smith', color: 'bg-purple-100 text-purple-900 border-purple-300', weekType: 'both' },
        { day: 'mardi', startTime: '13:30', endTime: '14:25', subject: 'SVT (Volcanisme & Séismes)', room: 'Labo SVT 1', teacher: 'Mme Dubois', color: 'bg-teal-100 text-teal-900 border-teal-300', weekType: 'both' },
        { day: 'jeudi', startTime: '08:30', endTime: '09:25', subject: 'Mathématiques (Fractions & Puissances)', room: 'Salle 204', teacher: 'M. Martin', color: 'bg-amber-100 text-amber-900 border-amber-300', weekType: 'both' },
        { day: 'jeudi', startTime: '09:30', endTime: '10:25', subject: 'Technologie (Algorithmes)', room: 'Salle Info 2', teacher: 'M. Laurent', color: 'bg-cyan-100 text-cyan-900 border-cyan-300', weekType: 'both' },
        { day: 'vendredi', startTime: '08:30', endTime: '09:25', subject: 'Français (Accords & Texte)', room: 'Salle 210', teacher: 'Mme Bernard', color: 'bg-blue-100 text-blue-900 border-blue-300', weekType: 'both' },
        { day: 'vendredi', startTime: '09:30', endTime: '10:25', subject: 'Histoire-Géo (Révolution Française)', room: 'Salle 108', teacher: 'M. Petit', color: 'bg-orange-100 text-orange-900 border-orange-300', weekType: 'both' }
      ],
      homework: [
        { subject: 'Maths', subject_fr: 'Maths', subject_it: 'Matematica', title: 'Exercices 42 et 45 p. 88 (Théorème de Pythagore)', title_fr: 'Exercices 42 et 45 p. 88 (Théorème de Pythagore)', title_it: 'Esercizi 42 e 45 p. 88 (Teorema di Pitagora)', description: 'Calculer l\'hypoténuse d\'un triangle rectangle et rédiger la réciproque', dueDate: tomorrowStr, estimatedMinutes: 25, priority: 'high' },
        { subject: 'Français', subject_fr: 'Français', subject_it: 'Francese', title: 'Apprendre la conjugaison du subjonctif présent', title_fr: 'Apprendre le subjonctif présent', title_it: 'Studiare il congiuntivo presente', description: 'Verbes faire, savoir, aller et pouvoir', dueDate: inTwoDaysStr, estimatedMinutes: 20, priority: 'medium' },
        { subject: 'Sciences', subject_fr: 'Sciences', subject_it: 'Scienze', title: 'Schéma du circuit électrique et formule U = R × I', title_fr: 'Schéma circuit et loi d\'Ohm', title_it: 'Schema circuito elettrico e legge di Ohm', description: 'Revoir le cours de physique-chimie sur la tension et la résistance', dueDate: inFourDaysStr, estimatedMinutes: 15, priority: 'low' }
      ]
    };
  }
}

export const calendarSyncService = new CalendarSyncService();
