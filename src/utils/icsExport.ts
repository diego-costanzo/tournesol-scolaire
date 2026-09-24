import { TimetableSlot, HomeworkItem } from '../types';

const generateICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const exportTimetableToICS = (timetable: TimetableSlot[], currentWeek: 'A' | 'B' | 'both', language: 'it' | 'fr') => {
  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tournesol Scolaire//Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const daysMap: Record<string, number> = {
    'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 'vendredi': 5
  };

  // Generate slots for the next 4 weeks as an example
  const today = new Date();
  
  timetable.forEach(slot => {
    if (slot.weekType !== 'both' && slot.weekType !== currentWeek) return;

    for (let i = 0; i < 4; i++) {
      const targetDate = new Date(today);
      const currentDayIndex = targetDate.getDay(); // 0 = Sunday
      const diff = daysMap[slot.day] - currentDayIndex;
      targetDate.setDate(targetDate.getDate() + diff + (i * 7));
      
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      
      const startDate = new Date(targetDate);
      startDate.setHours(startH, startM, 0);
      
      const endDate = new Date(targetDate);
      endDate.setHours(endH, endM, 0);

      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${slot.id}-${i}@tournesol`,
        `DTSTAMP:${generateICSDate(new Date())}`,
        `DTSTART:${generateICSDate(startDate)}`,
        `DTEND:${generateICSDate(endDate)}`,
        `SUMMARY:${slot.subject}`,
        `LOCATION:${slot.room}`,
        `DESCRIPTION:Prof: ${slot.teacher}`,
        'END:VEVENT'
      );
    }
  });

  icsLines.push('END:VCALENDAR');
  
  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orario_tournesol.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
