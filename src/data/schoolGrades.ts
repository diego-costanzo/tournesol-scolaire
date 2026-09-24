import { SchoolGradeOption, SchoolStage } from '../types';

export const schoolStagesList: Array<{
  id: SchoolStage;
  name_it: string;
  name_fr: string;
  ageRange: string;
  icon: string;
  summary_it: string;
  summary_fr: string;
}> = [
  {
    id: 'elementary',
    name_it: 'Scuola Primaria (Elementari)',
    name_fr: 'École Élémentaire / Primaire',
    ageRange: '6 - 11 anni',
    icon: '🎒',
    summary_it: 'Basi di lettura, scrittura, calcolo e prime scoperte del mondo',
    summary_fr: 'Apprentissages fondamentaux : lecture, écriture, calcul et découverte'
  },
  {
    id: 'middle',
    name_it: 'Scuola Media (Secondaria I grado)',
    name_fr: 'Collège (Secondaire Ier degré)',
    ageRange: '11 - 15 anni',
    icon: '🎓',
    summary_it: 'Approfondimento materie, studio autonomo e preparazione al Brevet',
    summary_fr: 'Cycle 4 d\'approfondissement, autonomie et Diplôme National du Brevet'
  },
  {
    id: 'high',
    name_it: 'Scuola Superiore (Secondaria II grado)',
    name_fr: 'Lycée (Secondaire IIe degré)',
    ageRange: '15 - 18 anni',
    icon: '🏛️',
    summary_it: 'Specializzazione, metodo scientifico/umanistico e Baccalauréat',
    summary_fr: 'Enseignements généraux ou technologiques et examen du Baccalauréat'
  }
];

export const allSchoolGrades: SchoolGradeOption[] = [
  // --- ÉCOLE ÉLÉMENTAIRE / SCUOLA PRIMARIA ---
  {
    id: 'elem-cp',
    stage: 'elementary',
    frenchName: 'CP (Cours Préparatoire)',
    italianName: '1ª Elementare (Primaria)',
    recommendedAge: 6,
    cycleDescription_fr: 'Cycle 2 - Apprentissages fondamentaux',
    cycleDescription_it: 'Ciclo 2 - Apprendimento della lettura e prime somme',
    defaultPackId: 'pack-elementaire-cycle2'
  },
  {
    id: 'elem-ce1',
    stage: 'elementary',
    frenchName: 'CE1 (Cours Élémentaire 1)',
    italianName: '2ª Elementare (Primaria)',
    recommendedAge: 7,
    cycleDescription_fr: 'Cycle 2 - Consolidation de la lecture et calcul',
    cycleDescription_it: 'Ciclo 2 - Consolidamento lettura, tabelline e ortografia',
    defaultPackId: 'pack-elementaire-cycle2'
  },
  {
    id: 'elem-ce2',
    stage: 'elementary',
    frenchName: 'CE2 (Cours Élémentaire 2)',
    italianName: '3ª Elementare (Primaria)',
    recommendedAge: 8,
    cycleDescription_fr: 'Cycle 2 - Maîtrise de la langue et autonomie',
    cycleDescription_it: 'Ciclo 2 - Padronanza linguistica e moltiplicazioni',
    defaultPackId: 'pack-elementaire-cycle2'
  },
  {
    id: 'elem-cm1',
    stage: 'elementary',
    frenchName: 'CM1 (Cours Moyen 1)',
    italianName: '4ª Elementare (Primaria)',
    recommendedAge: 9,
    cycleDescription_fr: 'Cycle 3 - Consolidation et logique',
    cycleDescription_it: 'Ciclo 3 - Frazioni elementari, scienze e storia',
    defaultPackId: 'pack-elementaire-cycle3'
  },
  {
    id: 'elem-cm2',
    stage: 'elementary',
    frenchName: 'CM2 (Cours Moyen 2)',
    italianName: '5ª Elementare (Primaria)',
    recommendedAge: 10,
    cycleDescription_fr: 'Cycle 3 - Préparation à l\'entrée au Collège',
    cycleDescription_it: 'Ciclo 3 - Preparazione al passaggio alle Medie',
    defaultPackId: 'pack-elementaire-cycle3'
  },

  // --- COLLÈGE / SCUOLA MEDIA (Contesto Principale) ---
  {
    id: 'coll-6eme',
    stage: 'middle',
    frenchName: '6ème (Sixième)',
    italianName: '1ª Media (Inizio Collège)',
    recommendedAge: 11,
    cycleDescription_fr: 'Cycle 3 - Adaptation au rythme du collège et professeurs multiples',
    cycleDescription_it: 'Ciclo 3 - Transizione alle medie, metodo e autonomia',
    defaultPackId: 'pack-college-6eme'
  },
  {
    id: 'coll-5eme',
    stage: 'middle',
    frenchName: '5ème (Cinquième)',
    italianName: '2ª Media',
    recommendedAge: 12,
    cycleDescription_fr: 'Cycle 4 - Début des enseignements pratiques interdisciplinaires',
    cycleDescription_it: 'Ciclo 4 - Approfondimento algebra, scienze e seconda lingua',
    defaultPackId: 'pack-college-5eme'
  },
  {
    id: 'coll-4eme',
    stage: 'middle',
    frenchName: '4ème (Quatrième)',
    italianName: '3ª Media (Classe di 4ème)',
    recommendedAge: 13,
    cycleDescription_fr: 'Cycle 4 - Pythagore, proportions, physique et littérature',
    cycleDescription_it: 'Ciclo 4 - Teorema di Pitagora, velocità, atomi e analisi testuale',
    defaultPackId: 'pack-college-4eme'
  },
  {
    id: 'coll-3eme',
    stage: 'middle',
    frenchName: '3ème (Troisième - Année Brevet)',
    italianName: 'Esame di 3ª Media / Fine Collège',
    recommendedAge: 14,
    cycleDescription_fr: 'Cycle 4 - Préparation intensive au Diplôme National du Brevet',
    cycleDescription_it: 'Ciclo 4 - Preparazione all\'Esame Nazionale (Brevet) e scelta indirizzo',
    nationalExam: 'Diplôme National du Brevet (DNB)',
    defaultPackId: 'pack-college-3eme'
  },

  // --- LYCÉE / SCUOLA SUPERIORE ---
  {
    id: 'lyc-2nde',
    stage: 'high',
    frenchName: '2nde Générale et Technologique',
    italianName: '1°/2° Anno Superiori (Biennio)',
    recommendedAge: 15,
    cycleDescription_fr: 'Cycle terminal - Tronc commun et choix des spécialités',
    cycleDescription_it: 'Biennio superiore - Metodo di studio critico e scelta materie',
    defaultPackId: 'pack-lycee-2nde'
  },
  {
    id: 'lyc-1ere',
    stage: 'high',
    frenchName: '1ère (Première)',
    italianName: '3°/4° Anno Superiori (Prove anticipate Bac)',
    recommendedAge: 16,
    cycleDescription_fr: 'Épreuves anticipées du Baccalauréat de Français',
    cycleDescription_it: 'Specializzazione e prima sessione esami di maturità',
    nationalExam: 'Épreuves Anticipées de Français (EAF)',
    defaultPackId: 'pack-lycee-terminal'
  },
  {
    id: 'lyc-term',
    stage: 'high',
    frenchName: 'Terminale (Année du Baccalauréat)',
    italianName: '5° Anno Superiori / Esame di Stato (Maturità)',
    recommendedAge: 17,
    cycleDescription_fr: 'Diplôme du Baccalauréat et orientation Parcoursup',
    cycleDescription_it: 'Esame di Stato finale e orientamento universitario',
    nationalExam: 'Baccalauréat Général / Technologique',
    defaultPackId: 'pack-lycee-terminal'
  }
];

export function findGradeById(id: string): SchoolGradeOption | undefined {
  return allSchoolGrades.find(g => g.id === id);
}

export function findGradeByFrenchName(name: string): SchoolGradeOption | undefined {
  return allSchoolGrades.find(g => g.frenchName.includes(name) || name.includes(g.frenchName));
}

export function getRecommendedGradeForAge(age: number): SchoolGradeOption {
  if (age <= 6) return allSchoolGrades[0];
  if (age >= 17) return allSchoolGrades[allSchoolGrades.length - 1];
  const found = allSchoolGrades.find(g => g.recommendedAge === age);
  return found || allSchoolGrades[7]; // Default to 4ème
}
