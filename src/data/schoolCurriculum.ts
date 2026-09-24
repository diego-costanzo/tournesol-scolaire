// Comprehensive educational knowledge base for French 4ème (Cycle 4 - 13-14 years old)
// Designed to keep students focused and autonomous without needing web searches

export interface FrenchVerbConjugation {
  verb: string;
  group: '1er' | '2e' | '3e' | 'auxiliaire';
  meaning_it: string;
  present: [string, string, string, string, string, string];
  imparfait: [string, string, string, string, string, string];
  passeSimple: [string, string, string, string, string, string];
  futur: [string, string, string, string, string, string];
  passeCompose: string;
  conditionnel: [string, string, string, string, string, string];
  participePasse: string;
}

export const commonFrenchVerbs: FrenchVerbConjugation[] = [
  {
    verb: 'être',
    group: 'auxiliaire',
    meaning_it: 'essere',
    present: ['je suis', 'tu es', 'il/elle est', 'nous sommes', 'vous êtes', 'ils/elles sont'],
    imparfait: ['j\'étais', 'tu étais', 'il/elle était', 'nous étions', 'vous étiez', 'ils/elles étaient'],
    passeSimple: ['je fus', 'tu fus', 'il/elle fut', 'nous fûmes', 'vous fûtes', 'ils/elles furent'],
    futur: ['je serai', 'tu seras', 'il/elle sera', 'nous serons', 'vous serez', 'ils/elles seront'],
    passeCompose: 'j\'ai été',
    conditionnel: ['je serais', 'tu serais', 'il/elle serait', 'nous serions', 'vous seriez', 'ils/elles seraient'],
    participePasse: 'été'
  },
  {
    verb: 'avoir',
    group: 'auxiliaire',
    meaning_it: 'avere',
    present: ['j\'ai', 'tu as', 'il/elle a', 'nous avons', 'vous avez', 'ils/elles ont'],
    imparfait: ['j\'avais', 'tu avais', 'il/elle avait', 'nous avions', 'vous aviez', 'ils/elles avaient'],
    passeSimple: ['j\'eus', 'tu eus', 'il/elle eut', 'nous eûmes', 'vous eûtes', 'ils/elles eurent'],
    futur: ['j\'aurai', 'tu auras', 'il/elle aura', 'nous aurons', 'vous aurez', 'ils/elles auront'],
    passeCompose: 'j\'ai eu',
    conditionnel: ['j\'aurais', 'tu aurais', 'il/elle aurait', 'nous aurions', 'vous auriez', 'ils/elles auraient'],
    participePasse: 'eu'
  },
  {
    verb: 'aimer',
    group: '1er',
    meaning_it: 'amare / piacere',
    present: ['j\'aime', 'tu aimes', 'il/elle aime', 'nous aimons', 'vous aimez', 'ils/elles aiment'],
    imparfait: ['j\'aimais', 'tu aimais', 'il/elle aimait', 'nous aimions', 'vous aimiez', 'ils/elles aimaient'],
    passeSimple: ['j\'aimai', 'tu aimas', 'il/elle aima', 'nous aimâmes', 'vous aimâtes', 'ils/elles aimèrent'],
    futur: ['j\'aimerai', 'tu aimeras', 'il/elle aimera', 'nous aimerons', 'vous aimerez', 'ils/elles aimeront'],
    passeCompose: 'j\'ai aimé',
    conditionnel: ['j\'aimerais', 'tu aimerais', 'il/elle aimerait', 'nous aimerions', 'vous aimeriez', 'ils/elles aimeraient'],
    participePasse: 'aimé'
  },
  {
    verb: 'finir',
    group: '2e',
    meaning_it: 'finire',
    present: ['je finis', 'tu finis', 'il/elle finit', 'nous finissons', 'vous finissez', 'ils/elles finissent'],
    imparfait: ['je finissais', 'tu finissais', 'il/elle finissait', 'nous finissions', 'vous finissiez', 'ils/elles finissaient'],
    passeSimple: ['je finis', 'tu finis', 'il/elle finit', 'nous finîmes', 'vous finîtes', 'ils/elles finirent'],
    futur: ['je finirai', 'tu finiras', 'il/elle finira', 'nous finirons', 'vous finirez', 'ils/elles finiront'],
    passeCompose: 'j\'ai fini',
    conditionnel: ['je finirais', 'tu finirais', 'il/elle finirait', 'nous finirions', 'vous finiriez', 'ils/elles finiraient'],
    participePasse: 'fini'
  },
  {
    verb: 'aller',
    group: '3e',
    meaning_it: 'andare',
    present: ['je vais', 'tu vas', 'il/elle va', 'nous allons', 'vous allez', 'ils/elles vont'],
    imparfait: ['j\'allais', 'tu allais', 'il/elle allait', 'nous allions', 'vous alliez', 'ils/elles allaient'],
    passeSimple: ['j\'allai', 'tu allas', 'il/elle alla', 'nous allâmes', 'vous allâtes', 'ils/elles allèrent'],
    futur: ['j\'irai', 'tu iras', 'il/elle ira', 'nous irons', 'vous irez', 'ils/elles iront'],
    passeCompose: 'je suis allé(e)',
    conditionnel: ['j\'irais', 'tu irais', 'il/elle irait', 'nous irions', 'vous iriez', 'ils/elles iraient'],
    participePasse: 'allé'
  },
  {
    verb: 'faire',
    group: '3e',
    meaning_it: 'fare',
    present: ['je fais', 'tu fais', 'il/elle fait', 'nous faisons', 'vous faites', 'ils/elles font'],
    imparfait: ['je faisais', 'tu faisais', 'il/elle faisait', 'nous faisions', 'vous faisiez', 'ils/elles faisaient'],
    passeSimple: ['je fis', 'tu fis', 'il/elle fit', 'nous fîmes', 'vous fîtes', 'ils/elles firent'],
    futur: ['je ferai', 'tu feras', 'il/elle fera', 'nous ferons', 'vous ferez', 'ils/elles feront'],
    passeCompose: 'j\'ai fait',
    conditionnel: ['je ferais', 'tu ferais', 'il/elle ferait', 'nous ferions', 'vous feriez', 'ils/elles feraient'],
    participePasse: 'fait'
  },
  {
    verb: 'prendre',
    group: '3e',
    meaning_it: 'prendere',
    present: ['je prends', 'tu prends', 'il/elle prend', 'nous prenons', 'vous prenez', 'ils/elles prennent'],
    imparfait: ['je prenais', 'tu prenais', 'il/elle prenait', 'nous prenions', 'vous preniez', 'ils/elles prenaient'],
    passeSimple: ['je pris', 'tu pris', 'il/elle prit', 'nous prîmes', 'vous prîtes', 'ils/elles prirent'],
    futur: ['je prendrai', 'tu prendras', 'il/elle prendra', 'nous prendrons', 'vous prendrez', 'ils/elles prendront'],
    passeCompose: 'j\'ai pris',
    conditionnel: ['je prendrais', 'tu prendrais', 'il/elle prendrait', 'nous prendrions', 'vous prendriez', 'ils/elles prendraient'],
    participePasse: 'pris'
  },
  {
    verb: 'pouvoir',
    group: '3e',
    meaning_it: 'potere',
    present: ['je peux / puis', 'tu peux', 'il/elle peut', 'nous pouvons', 'vous pouvez', 'ils/elles peuvent'],
    imparfait: ['je pouvais', 'tu pouvais', 'il/elle pouvait', 'nous pouvions', 'vous pouviez', 'ils/elles pouvaient'],
    passeSimple: ['je pus', 'tu pus', 'il/elle put', 'nous pûmes', 'vous pûtes', 'ils/elles purent'],
    futur: ['je pourrai', 'tu pourras', 'il/elle pourra', 'nous pourrons', 'vous pourrez', 'ils/elles pourront'],
    passeCompose: 'j\'ai pu',
    conditionnel: ['je pourrais', 'tu pourrais', 'il/elle pourrait', 'nous pourrions', 'vous pourriez', 'ils/elles pourraient'],
    participePasse: 'pu'
  },
  {
    verb: 'vouloir',
    group: '3e',
    meaning_it: 'volere',
    present: ['je veux', 'tu veux', 'il/elle veut', 'nous voulons', 'vous voulez', 'ils/elles veulent'],
    imparfait: ['je voulais', 'tu voulais', 'il/elle voulait', 'nous voulions', 'vous vouliez', 'ils/elles voulaient'],
    passeSimple: ['je voulus', 'tu voulus', 'il/elle voulut', 'nous voulûmes', 'vous voulûtes', 'ils/elles voulurent'],
    futur: ['je voudrai', 'tu voudras', 'il/elle voudra', 'nous voudrons', 'vous voudrez', 'ils/elles voudront'],
    passeCompose: 'j\'ai voulu',
    conditionnel: ['je voudrais', 'tu voudrais', 'il/elle voudrait', 'nous voudrions', 'vous voudriez', 'ils/elles voudraient'],
    participePasse: 'voulu'
  },
  {
    verb: 'savoir',
    group: '3e',
    meaning_it: 'sapere',
    present: ['je sais', 'tu sais', 'il/elle sait', 'nous savons', 'vous savez', 'ils/elles savent'],
    imparfait: ['je savais', 'tu savais', 'il/elle savait', 'nous savions', 'vous saviez', 'ils/elles savaient'],
    passeSimple: ['je sus', 'tu sus', 'il/elle sut', 'nous sûmes', 'vous sûtes', 'ils/elles surent'],
    futur: ['je saurai', 'tu sauras', 'il/elle saura', 'nous saurons', 'vous saurez', 'ils/elles sauront'],
    passeCompose: 'j\'ai su',
    conditionnel: ['je saurais', 'tu saurais', 'il/elle saurait', 'nous saurions', 'vous sauriez', 'ils/elles sauraient'],
    participePasse: 'su'
  },
  {
    verb: 'voir',
    group: '3e',
    meaning_it: 'vedere',
    present: ['je vois', 'tu vois', 'il/elle voit', 'nous voyons', 'vous voyez', 'ils/elles voient'],
    imparfait: ['je voyais', 'tu voyais', 'il/elle voyait', 'nous voyions', 'vous voyiez', 'ils/elles voyaient'],
    passeSimple: ['je vis', 'tu vis', 'il/elle vit', 'nous vîmes', 'vous vîtes', 'ils/elles virent'],
    futur: ['je verrai', 'tu verras', 'il/elle verra', 'nous verrons', 'vous verrez', 'ils/elles verront'],
    passeCompose: 'j\'ai vu',
    conditionnel: ['je verrais', 'tu verrais', 'il/elle verrait', 'nous verrions', 'vous verriez', 'ils/elles verraient'],
    participePasse: 'vu'
  },
  {
    verb: 'devoir',
    group: '3e',
    meaning_it: 'dovere',
    present: ['je dois', 'tu dois', 'il/elle doit', 'nous devons', 'vous devez', 'ils/elles doivent'],
    imparfait: ['je devais', 'tu devais', 'il/elle devait', 'nous devions', 'vous deviez', 'ils/elles devaient'],
    passeSimple: ['je dus', 'tu dus', 'il/elle dut', 'nous dûmes', 'vous dûtes', 'ils/elles durent'],
    futur: ['je devrai', 'tu devras', 'il/elle devra', 'nous devrons', 'vous devrez', 'ils/elles devront'],
    passeCompose: 'j\'ai dû',
    conditionnel: ['je devrais', 'tu devrais', 'il/elle devrait', 'nous devrions', 'vous devriez', 'ils/elles devraient'],
    participePasse: 'dû'
  }
];

export interface GeometricSolid {
  name: string;
  itName: string;
  volumeFormula: string;
  explanation: string;
  itExplanation: string;
  example: string;
}

export const geometricSolids: GeometricSolid[] = [
  {
    name: 'Pavé Droit (Parallélépipède rectangle)',
    itName: 'Parallelepipedo Rettangolo',
    volumeFormula: 'V = L × l × h',
    explanation: 'Multiplier la Longueur par la largeur par la hauteur.',
    itExplanation: 'Moltiplica Lunghezza × larghezza × altezza.',
    example: 'L = 5 cm, l = 3 cm, h = 4 cm → V = 5 × 3 × 4 = 60 cm³'
  },
  {
    name: 'Prisme Droit',
    itName: 'Prisma Retto',
    volumeFormula: 'V = Aire de la base × h',
    explanation: 'Calculer d\'abord l\'aire de la base (souvent un triangle ou rectangle) puis multiplier par la hauteur.',
    itExplanation: 'Calcola l\'area della base e moltiplica per l\'altezza del prisma.',
    example: 'Base triangulaire de 12 cm², hauteur 5 cm → V = 12 × 5 = 60 cm³'
  },
  {
    name: 'Cylindre de Révolution',
    itName: 'Cilindro',
    volumeFormula: 'V = π × r² × h',
    explanation: 'L\'aire de la base est un disque (π × r²), multipliée par la hauteur h.',
    itExplanation: 'Area del cerchio di base (π × r²) moltiplicata per l\'altezza.',
    example: 'Rayon r = 3 cm, hauteur h = 10 cm → V = π × 9 × 10 ≈ 282.74 cm³'
  },
  {
    name: 'Pyramide',
    itName: 'Piramide',
    volumeFormula: 'V = (1/3) × Aire de la base × h',
    explanation: 'Le volume d\'une pyramide est exactement le tiers d\'un prisme de même base et même hauteur.',
    itExplanation: 'Un terzo dell\'area di base per l\'altezza: si divide sempre per 3!',
    example: 'Base carrée de 4×4 = 16 cm², hauteur 6 cm → V = (16 × 6) ÷ 3 = 32 cm³'
  },
  {
    name: 'Cône de Révolution',
    itName: 'Cono',
    volumeFormula: 'V = (1/3) × π × r² × h',
    explanation: 'Exactement le tiers d\'un cylindre de même rayon et même hauteur.',
    itExplanation: 'Un terzo del volume del cilindro: (π × r² × h) ÷ 3.',
    example: 'Rayon r = 3 cm, h = 7 cm → V = (π × 9 × 7) ÷ 3 = 21π ≈ 65.97 cm³'
  }
];

export interface ScienceTopic {
  category: 'Physique' | 'Chimie' | 'SVT';
  title: string;
  itTitle: string;
  summary: string;
  itSummary: string;
  keyPoints: string[];
  mnemonic?: string;
}

export const scienceTopics4eme: ScienceTopic[] = [
  {
    category: 'Physique',
    title: 'Circuits Électriques : Série vs Dérivation',
    itTitle: 'Circuiti Elettrici : Serie vs Parallelo (Dérivation)',
    summary: 'Comprendre comment le courant et la tension se partagent dans une maison ou une lampe.',
    itSummary: 'Regole fondamentali per non sbagliare mai nei compiti di scienze.',
    keyPoints: [
      'Circuit en série (une seule boucle) : L\'intensité du courant I est la même partout (loi d\'unicité). Si une ampoule grille, toutes s\'éteignent !',
      'Circuit en dérivation (plusieurs boucles) : La tension U est la même aux bornes de chaque branche (comme les prises de la maison à 230V !). Si une ampoule grille, les autres restent allumées.',
      'Loi d\'Ohm : U = R × I (La tension U en Volts est égale à la résistance R en Ohms multipliée par l\'intensité I en Ampères).'
    ],
    mnemonic: 'Penser aux guirlandes de Noël : en série, une casse et tout s\'éteint ; en dérivation, chacune est autonome.'
  },
  {
    category: 'Physique',
    title: 'Lumière, Son et Vitesse dans l\'Univers',
    itTitle: 'Luce, Suono e Velocità',
    summary: 'La lumière voyage presque instantanément, le son prend son temps.',
    itSummary: 'Differenza fondamentale di velocità tra luce e suono.',
    keyPoints: [
      'Vitesse de la lumière dans le vide : c = 300 000 km/s (soit 300 000 000 m/s). C\'est la vitesse limite absolue.',
      'Vitesse du son dans l\'air : environ 340 m/s (soit 1 km toutes les 3 secondes !). Le son a besoin de matière pour se propager (pas de son dans l\'espace vide).',
      'Astuce orage : quand on voit l\'éclair, on compte les secondes jusqu\'au tonnerre et on divise par 3 pour connaître la distance en kilomètres !'
    ]
  },
  {
    category: 'Chimie',
    title: 'L\'Air et les Combustions',
    itTitle: 'Composizione dell\'Aria e Combustioni',
    summary: 'De quoi est fait l\'air qu\'on respire et que se passe-t-il quand ça brûle ?',
    itSummary: 'La miscela di gas dell\'atmosfera e il triangolo del fuoco.',
    keyPoints: [
      'Composition de l\'air sec : environ 78% de Diazote (N₂), 21% de Dioxygène (O₂), et 1% d\'autres gaz (Argon, CO₂).',
      'Le Dioxygène (O₂) est le gaz indispensable à la respiration et aux combustions.',
      'Triangle du feu : Pour qu\'un feu brûle, il faut 3 éléments : Combustible (bois, papier, gaz) + Comburant (le dioxygène O₂) + Source de chaleur (étincelle, flamme).'
    ]
  },
  {
    category: 'SVT',
    title: 'Tectonique des Plaques, Séismes et Volcans',
    itTitle: 'Tettonica delle Placche, Terremoti e Vulcani',
    summary: 'La surface de la Terre bouge en permanence sur l\'asthénosphère.',
    itSummary: 'La litosfera divisa in placche in continuo movimento.',
    keyPoints: [
      'La lithosphère (rigide) est découpée en une douzaine de grandes plaques tectoniques qui flottent lentement sur l\'asthénosphère plus chaude.',
      'Écartement (Divergence) : se produit au fond des océans (dorsales océaniques) où naît le plancher océanique.',
      'Rapprochement (Convergence / Subduction) : une plaque plonge sous une autre, provoquant de violents séismes et des volcans explosifs (ex: ceinture de feu du Pacifique).',
      'Volcans effusifs (lave fluide rouge) vs Volcans explosifs (nuées ardentes, dômes de lave visqueuse, très dangereux).'
    ]
  },
  {
    category: 'SVT',
    title: 'Génétique : Chromosomes et ADN de l\'Être Humain',
    itTitle: 'Genetica : Cromosomi e DNA',
    summary: 'Le programme génétique qui définit chaque être vivant.',
    itSummary: 'Il cariotipo umano: 23 coppie di cromosomi nel nucleo di ogni cellula.',
    keyPoints: [
      'L\'être humain possède 46 chromosomes classés en 23 paires dans le noyau de chaque cellule.',
      'Paire n°23 (chromosomes sexuels) : XX chez la femme, XY chez l\'homme.',
      'Une anomalie du nombre de chromosomes (ex: 3 chromosomes sur la 21e paire = trisomie 21) modifie le développement.',
      'Chaque chromosome porte de nombreux gènes constitués d\'ADN, responsables des caractères héréditaires.'
    ]
  }
];

export interface HistoryTopic {
  period: string;
  title: string;
  itTitle: string;
  description: string;
  itDescription: string;
  keyConcepts: string[];
}

export const historyGeography4eme: HistoryTopic[] = [
  {
    period: 'XVIIIe siècle',
    title: 'Les Lumières : La Raison contre l\'Absolutisme',
    itTitle: 'L\'Illuminismo (Les Lumières)',
    description: 'Des philosophes et scientifiques qui veulent « éclairer » le monde par la raison et la science.',
    itDescription: 'Filosofi come Voltaire, Rousseau, Montesquieu e Diderot che sfidano la monarchia assoluta.',
    keyConcepts: [
      'Voltaire : défend la tolérance religieuse et la liberté de pensée.',
      'Montesquieu : propose la séparation des pouvoirs (législatif, exécutif, judiciaire).',
      'Rousseau : affirme que la souveraineté appartient au peuple (Contrat Social).',
      'Diderot et d\'Alembert : créent l\'Encyclopédie (1751-1772) pour diffuser tout le savoir humain.'
    ]
  },
  {
    period: '1789 - 1815',
    title: 'La Révolution Française et l\'Empire',
    itTitle: 'La Rivoluzione Francese e l\'Impero',
    description: 'La fin de la monarchie absolue et la naissance de la citoyenneté moderne.',
    itDescription: 'Dalla presa della Bastiglia alla Dichiarazione dei diritti dell\'uomo.',
    keyConcepts: [
      '14 juillet 1789 : Prise de la Bastille (symbole du pouvoir royal arbitraire).',
      '26 août 1789 : Déclaration des Droits de l\'Homme et du Citoyen (liberté, égalité en droit).',
      '1792 : Proclamation de la Première République.',
      'Napoléon Bonaparte : prend le pouvoir en 1799, crée le Code Civil (1804) et le baccalauréat.'
    ]
  },
  {
    period: 'XIXe siècle',
    title: 'La Révolution Industrielle et les Villes',
    itTitle: 'La Rivoluzione Industriale',
    description: 'La machine à vapeur transforme le travail, les usines et les paysages d\'Europe.',
    itDescription: 'Il treno a vapore, le miniere di carbone, la borghesia e la nascita del movimento operaio.',
    keyConcepts: [
      'Invention de la machine à vapeur (James Watt) : alimentée au charbon.',
      'Révolution des transports : le chemin de fer réduit les distances et accélère le commerce.',
      'Nouvelles classes sociales : la bourgeoisie industrielle (patrons) et le prolétariat (ouvriers d\'usines et de mines).',
      'Exode rural : les paysans quittent les campagnes pour travailler dans les grandes villes qui explosent démographiquement.'
    ]
  },
  {
    period: 'Géographie 4ème',
    title: 'L\'Urbanisation du Monde et les Métropoles',
    itTitle: 'L\'Urbanizzazione Globale e le Metropoli',
    description: 'Plus de la moitié des humains vivent aujourd\'hui dans des villes.',
    itDescription: 'Megalopoli globali (Tokyo, New York, Parigi) e disparità territoriali.',
    keyConcepts: [
      'Métropolisation : concentration des populations, des richesses et des fonctions de commandement dans les très grandes villes.',
      'CBD (Central Business District) : quartier d\'affaires avec gratte-ciels (ex: Manhattan, La Défense à Paris).',
      'Ségrégation socio-spatiale : quartiers riches fermés (gated communities) vs bidonvilles (favelas, slums) dans les pays émergents.'
    ]
  },
  {
    period: 'EMC (Civique)',
    title: 'Les Valeurs et Principes de la République',
    itTitle: 'I Valori della Repubblica e la Laicità',
    description: 'Les fondements de la citoyenneté à l\'école et dans la société.',
    itDescription: 'Libertà, Uguaglianza, Fraternità e la Laicità a scuola.',
    keyConcepts: [
      'Devise : Liberté, Égalité, Fraternité.',
      'Laïcité (Loi de 1905) : neutralité de l\'État vis-à-vis des religions, liberté de croire ou de ne pas croire. À l\'école publique, aucun signe religieux ostensible n\'est porté par respect de la neutralité.',
      'Démocratie : suffrage universel, vote secret et respect des lois communes.'
    ]
  }
];

export interface StudyMethodTip {
  title: string;
  itTitle: string;
  description: string;
  itDescription: string;
  checklist: string[];
}

export const studyMethods: StudyMethodTip[] = [
  {
    title: 'La méthode J-3 pour réussir un contrôle sans stress',
    itTitle: 'Il Metodo J-3 per le verifiche senza ansia',
    description: 'Réviser 25 minutes trois jours de suite vaut 10 fois mieux que réviser 3 heures la veille au soir !',
    itDescription: 'La curva dell\'oblio dimostra che ripassare a piccoli sorsi fissa la memoria a lungo termine.',
    checklist: [
      'J-3 (3 jours avant) : Relire la leçon et surligner les définitions / formules clés. Écrire une mini-fiche résumé.',
      'J-2 (2 jours avant) : Refaire 2 exercices du cahier sans regarder la solution, puis vérifier.',
      'J-1 (la veille) : Relire la fiche de synthèse 15 minutes, préparer son cartable et DORMIR tôt (le cerveau range les souvenirs la nuit !).'
    ]
  },
  {
    title: 'Comment soigner sa copie et gagner +2 points d\'office',
    itTitle: 'Come presentare la verifica per prendere +2 punti facili',
    description: 'Les professeurs de collège corrigent des centaines de copies : une copie soignée prédispose positivement à la notation.',
    itDescription: 'Consigli pratici che fanno la differenza tra un 12 e un 15 su 20.',
    checklist: [
      'Tracer une marge propre et souligner les titres à la règle.',
      'Ne jamais raturer brutalement : tirer un seul trait propre avec la règle sur une erreur.',
      'Toujours faire une phrase de réponse complète (ex: "Le périmètre du triangle est égal à 18 cm.").',
      'Numéroter clairement les exercices (ex: Exercice 2, Question 3a).'
    ]
  },
  {
    title: 'Comment réussir une rédaction en Français (Schéma Narratif)',
    itTitle: 'Come strutturare una bella redazione (Schéma Narratif)',
    description: 'Le canevas infaillible pour captiver le lecteur et avoir une note maximale.',
    itDescription: 'Lo schema in 5 fasi richiesto da tutti i professori francesi.',
    checklist: [
      '1. Situation Initiale : Présenter le héros, le lieu, l\'époque, le calme (à l\'Imparfait).',
      '2. Élément Déclencheur : Un événement soudain brise le calme (au Passé Simple : "Tout à coup...").',
      '3. Péripéties : Les actions, les obstacles rencontrés par le héros.',
      '4. Élément de Résolution : L\'épreuve finale qui dénoue la situation.',
      '5. Situation Finale : Le retour au calme, la morale ou la transformation du héros.'
    ]
  }
];

// ============================================================
// CHIMIE : TABLEAU PÉRIODIQUE DES ÉLÉMENTS ESSENTIELS
// ============================================================
export interface PeriodicElement {
  z: number;
  symbol: string;
  name_fr: string;
  name_it: string;
  mass: number;
  category: 'non-metal' | 'noble-gas' | 'alkali' | 'alkaline-earth' | 'metalloid' | 'halogen' | 'transition-metal';
  electrons: string;
  description_fr: string;
  description_it: string;
}

export const periodicTableTopElements: PeriodicElement[] = [
  { z: 1, symbol: 'H', name_fr: 'Hydrogène', name_it: 'Idrogeno', mass: 1.008, category: 'non-metal', electrons: '1', description_fr: 'Le plus léger et le plus abondant de l\'univers. Forme l\'eau (H₂O).', description_it: 'L\'elemento più leggero dell\'universo. Forma l\'acqua (H₂O).' },
  { z: 2, symbol: 'He', name_fr: 'Hélium', name_it: 'Elio', mass: 4.003, category: 'noble-gas', electrons: '2', description_fr: 'Gaz rare inerte. Plus léger que l\'air, utilisé dans les ballons dirigeables.', description_it: 'Gas nobile inerte. Più leggero dell\'aria, usato per gonfiare i palloncini.' },
  { z: 3, symbol: 'Li', name_fr: 'Lithium', name_it: 'Litio', mass: 6.94, category: 'alkali', electrons: '2, 1', description_fr: 'Métal très réactif. Composant clé des batteries rechargeables de smartphones.', description_it: 'Metallo alcalino reattivo. Cuore delle batterie per telefoni e veicoli elettrici.' },
  { z: 4, symbol: 'Be', name_fr: 'Béryllium', name_it: 'Berillio', mass: 9.012, category: 'alkaline-earth', electrons: '2, 2', description_fr: 'Métal léger et résistant, présent dans les émeraudes.', description_it: 'Metallo leggero e rigido presente nelle pietre preziose come gli smeraldi.' },
  { z: 5, symbol: 'B', name_fr: 'Bore', name_it: 'Boro', mass: 10.81, category: 'metalloid', electrons: '2, 3', description_fr: 'Utilisé pour fabriquer du verre résistant à la chaleur (Pyrex).', description_it: 'Usato per la produzione del vetro pyrex resistente alle alte temperature.' },
  { z: 6, symbol: 'C', name_fr: 'Carbone', name_it: 'Carbonio', mass: 12.011, category: 'non-metal', electrons: '2, 4', description_fr: 'Base de toute la vie organique sur Terre. Existe en graphite ou diamant.', description_it: 'Elemento fondamento della vita biologica. Esiste come grafite o diamante.' },
  { z: 7, symbol: 'N', name_fr: 'Azote (Nitrogène)', name_it: 'Azoto', mass: 14.007, category: 'non-metal', electrons: '2, 5', description_fr: 'Constitue 78% de notre atmosphère respirable sous forme N₂.', description_it: 'Costituisce il 78% dell\'aria che respiriamo sotto forma di gas N₂.' },
  { z: 8, symbol: 'O', name_fr: 'Oxygène', name_it: 'Ossigeno', mass: 15.999, category: 'non-metal', electrons: '2, 6', description_fr: 'Essentiel à la respiration cellulaire et aux combustions (21% de l\'air).', description_it: 'Indispensabile per la respirazione dei viventi e per alimentare il fuoco.' },
  { z: 9, symbol: 'F', name_fr: 'Fluor', name_it: 'Fluoro', mass: 18.998, category: 'halogen', electrons: '2, 7', description_fr: 'Halogène réactif renforçant l\'émail des dents dans les dentifrices.', description_it: 'Alogeno molto reattivo che protegge i denti dalla carie nei dentifrici.' },
  { z: 10, symbol: 'Ne', name_fr: 'Néon', name_it: 'Neon', mass: 20.18, category: 'noble-gas', electrons: '2, 8', description_fr: 'Gaz noble inerte s\'illuminant en rouge-orangé sous haute tension.', description_it: 'Gas nobile inerte che produce luce rossa brillante nelle insegne luminose.' },
  { z: 11, symbol: 'Na', name_fr: 'Sodium', name_it: 'Sodio', mass: 22.99, category: 'alkali', electrons: '2, 8, 1', description_fr: 'S\'associe au chlore pour former le sel de cuisine (NaCl).', description_it: 'Si lega al cloro per formare il comune sale da cucina (NaCl).' },
  { z: 12, symbol: 'Mg', name_fr: 'Magnésium', name_it: 'Magnesio', mass: 24.305, category: 'alkaline-earth', electrons: '2, 8, 2', description_fr: 'Métal léger au cœur de la chlorophylle végétale, brûle avec une vive lueur blanche.', description_it: 'Metallo essenziale per la clorofilla delle piante e per il sistema nervoso.' },
  { z: 13, symbol: 'Al', name_fr: 'Aluminium', name_it: 'Alluminio', mass: 26.982, category: 'transition-metal', electrons: '2, 8, 3', description_fr: 'Métal léger et résistant à la corrosion, canettes et aéronautique.', description_it: 'Metallo leggerissimo riciclabile all\'infinito, usato per aerei e lattine.' },
  { z: 14, symbol: 'Si', name_fr: 'Silicium', name_it: 'Silicio', mass: 28.085, category: 'metalloid', electrons: '2, 8, 4', description_fr: 'Principal composant du sable et matière première des puces informatiques.', description_it: 'Componente principale della sabbia e dei microprocessori per computer.' },
  { z: 15, symbol: 'P', name_fr: 'Phosphore', name_it: 'Fosforo', mass: 30.974, category: 'non-metal', electrons: '2, 8, 5', description_fr: 'Indispensable à l\'ADN et aux os. Utilisé au bout des allumettes.', description_it: 'Elemento cardine dello scheletro osseo, del DNA e degli zolfanelli.' },
  { z: 16, symbol: 'S', name_fr: 'Soufre', name_it: 'Zolfo', mass: 32.06, category: 'non-metal', electrons: '2, 8, 6', description_fr: 'Solide jaune odorant issu des volcans, composant des protéines.', description_it: 'Minerale giallo tipico delle zone vulcaniche, essenziale nelle proteine.' },
  { z: 17, symbol: 'Cl', name_fr: 'Chlore', name_it: 'Cloro', mass: 35.45, category: 'halogen', electrons: '2, 8, 7', description_fr: 'Désinfectant puissant utilisé pour l\'eau des piscines et le sel NaCl.', description_it: 'Disinfettante fondamentale per potabilizzare l\'acqua e disinfettare le piscine.' },
  { z: 18, symbol: 'Ar', name_fr: 'Argon', name_it: 'Argon', mass: 39.948, category: 'noble-gas', electrons: '2, 8, 8', description_fr: 'Gaz rare représentant 0,93% de l\'atmosphère terrestre.', description_it: 'Il gas nobile più presente nell\'atmosfera terrestre (quasi l\'1%).' },
  { z: 19, symbol: 'K', name_fr: 'Potassium', name_it: 'Potassio', mass: 39.098, category: 'alkali', electrons: '2, 8, 8, 1', description_fr: 'Minéral vital pour les contractions musculaires, abondant dans la banane.', description_it: 'Fondamentale per il cuore e i muscoli, molto presente nelle banane.' },
  { z: 20, symbol: 'Ca', name_fr: 'Calcium', name_it: 'Calcio', mass: 40.078, category: 'alkaline-earth', electrons: '2, 8, 8, 2', description_fr: 'Minéral de structure des os, des dents et de la craie calcaire.', description_it: 'Costituente principale di ossa, denti, latte e rocce calcaree.' },
  { z: 26, symbol: 'Fe', name_fr: 'Fer', name_it: 'Ferro', mass: 55.845, category: 'transition-metal', electrons: '2, 8, 14, 2', description_fr: 'Pilier des constructions (acier) et pigment rouge de notre sang (hémoglobine).', description_it: 'Metallo dell\'acciaio e dell\'emoglobina che trasporta l\'ossigeno nel sangue.' },
  { z: 29, symbol: 'Cu', name_fr: 'Cuivre', name_it: 'Rame', mass: 63.546, category: 'transition-metal', electrons: '2, 8, 18, 1', description_fr: 'Excellente conduction électrique, utilisé dans tous les fils électriques.', description_it: 'Conduttore elettrico per eccellenza, usato in tutti i cavi e circuiti.' }
];

// ============================================================
// HISTOIRE : FRISE CHRONOLOGIQUE MULTI-CYCLES
// ============================================================
export interface TimelineEvent {
  year: string;
  cycle: 'Collège' | 'Lycée' | 'Repère Brevet';
  title_fr: string;
  title_it: string;
  summary_fr: string;
  summary_it: string;
  keyFigure: string;
}

export const historyTimelineEvents: TimelineEvent[] = [
  { year: '52 av. J.-C.', cycle: 'Collège', title_fr: 'Bataille d\'Alésia', title_it: 'Battaglia di Alesia', summary_fr: 'Victoire de Jules César sur Vercingétorix : la Gaule devient romaine.', summary_it: 'Cesare sconfigge Vercingetorige: la Gallia entra nel mondo romano.', keyFigure: 'Jules César & Vercingétorix' },
  { year: '476', cycle: 'Collège', title_fr: 'Chute de l\'Empire Romain d\'Occident', title_it: 'Caduta dell\'Impero Romano d\'Occidente', summary_fr: 'Fin de l\'Antiquité et début du Moyen Âge en Europe.', summary_it: 'Fine dell\'età antica e inizio del Medioevo.', keyFigure: 'Romulus Augustule' },
  { year: '800', cycle: 'Collège', title_fr: 'Couronnement de Charlemagne', title_it: 'Incoronazione di Carlo Magno', summary_fr: 'Charlemagne est couronné empereur d\'Occident à Rome le jour de Noël.', summary_it: 'Carlo Magno è incoronato imperatore da Papa Leone III.', keyFigure: 'Charlemagne' },
  { year: '1453', cycle: 'Collège', title_fr: 'Chute de Constantinople & Fin Guerre 100 ans', title_it: 'Caduta di Costantinopoli', summary_fr: 'Les Ottomans prennent la ville. Début de la Renaissance et essor de l\'imprimerie.', summary_it: 'Segna la fine del Medioevo e la nascita dell\'Umanesimo e della stampa.', keyFigure: 'Gutenberg & Mehmed II' },
  { year: '1492', cycle: 'Repère Brevet', title_fr: 'Arrivée de Christophe Colomb en Amérique', title_it: 'Scoperta dell\'America', summary_fr: 'Ouverture du monde atlantique et début des grandes découvertes européennes.', summary_it: 'Inizio dell\'Età Moderna e delle grandi rotte oceaniche.', keyFigure: 'Christophe Colomb' },
  { year: '1598', cycle: 'Collège', title_fr: 'Édit de Nantes', title_it: 'Editto di Nantes', summary_fr: 'Henri IV accorde la liberté de culte aux protestants et pacifie la France.', summary_it: 'Enrico IV concede tolleranza religiosa ai protestanti pacificando la Francia.', keyFigure: 'Henri IV' },
  { year: '1661-1715', cycle: 'Collège', title_fr: 'Règne personnel de Louis XIV', title_it: 'Il Re Sole (Luigi XIV)', summary_fr: 'Apogée de la monarchie absolue de droit divin et construction de Versailles.', summary_it: 'Apogeo della monarchia assoluta di diritto divino e reggia di Versailles.', keyFigure: 'Louis XIV' },
  { year: '1789', cycle: 'Repère Brevet', title_fr: 'Révolution Française', title_it: 'Rivoluzione Francese', summary_fr: '14 juillet : Prise de la Bastille. 26 août : Déclaration des Droits de l\'Homme.', summary_it: '14 luglio: presa della Bastiglia. Nasce la cittadinanza democratica.', keyFigure: 'Mirabeau, Danton, Robespierre' },
  { year: '1804', cycle: 'Repère Brevet', title_fr: 'Sacre de Napoléon & Code Civil', title_it: 'Codice Civile e Impero di Napoleone', summary_fr: 'Napoléon Ier crée le Code Civil, base du droit moderne, et le baccalauréat.', summary_it: 'Napoleone promulga il Codice Civile che unifica le leggi europee.', keyFigure: 'Napoléon Bonaparte' },
  { year: '1848', cycle: 'Repère Brevet', title_fr: 'IIe République & Abolition de l\'Esclavage', title_it: 'Abolizione della Schiavitù e Suffragio', summary_fr: 'Victor Schoelcher abolit l\'esclavage. Instauration du suffrage universel masculin.', summary_it: 'Abolizione definitiva della schiavitù e suffragio universale maschile.', keyFigure: 'Victor Schoelcher' },
  { year: '1882', cycle: 'Repère Brevet', title_fr: 'Lois Scolaires de Jules Ferry', title_it: 'Scuola Pubblica di Jules Ferry', summary_fr: 'L\'école primaire devient gratuite, laïque et obligatoire.', summary_it: 'La scuola diventa pubblica, gratuita, laica e obbligatoria per tutti.', keyFigure: 'Jules Ferry' },
  { year: '1905', cycle: 'Repère Brevet', title_fr: 'Loi de Séparation des Églises et de l\'État', title_it: 'Legge di Separazione Stato-Chiesa (Laicità)', summary_fr: 'Naissance de la laïcité républicaine en France : liberté absolue de conscience.', summary_it: 'La Francia proclama la laicità statale garantendo la libertà di culto.', keyFigure: 'Aristide Briand & Jaurès' },
  { year: '1914 - 1918', cycle: 'Repère Brevet', title_fr: 'Première Guerre Mondiale', title_it: 'Prima Guerra Mondiale', summary_fr: 'Guerre totale, tranchées de Verdun (1916), armistice le 11 novembre 1918.', summary_it: 'La Grande Guerra di trincea; Verdun 1916 e armistizio dell\'11 novembre 1918.', keyFigure: 'Clémenceau & soldats Poilus' },
  { year: '1936', cycle: 'Repère Brevet', title_fr: 'Front Populaire', title_it: 'Il Fronte Popolare', summary_fr: 'Accords de Matignon : premiers congés payés (2 semaines) et semaine de 40 heures.', summary_it: 'Primi congedi pagati per gli operai e settimana lavorativa ridotta.', keyFigure: 'Léon Blum' },
  { year: '1939 - 1945', cycle: 'Repère Brevet', title_fr: 'Seconde Guerre Mondiale', title_it: 'Seconda Guerra Mondiale', summary_fr: '18 juin 1940 : Appel du général de Gaulle. Résistance, Shoah, Libération (1944).', summary_it: 'Appello del 18 giugno, Resistenza contro il nazismo, Shoah e Liberazione.', keyFigure: 'Général de Gaulle & Jean Moulin' },
  { year: '1944', cycle: 'Repère Brevet', title_fr: 'Droit de Vote des Femmes', title_it: 'Diritto di Voto alle Donne in Francia', summary_fr: 'Les Françaises votent pour la première fois aux élections municipales de 1945.', summary_it: 'Le donne ottengono il diritto di voto e di eleggibilità in Francia.', keyFigure: 'Gouvernement Provisoire' },
  { year: '1957', cycle: 'Repère Brevet', title_fr: 'Traité de Rome', title_it: 'Trattato di Roma (Nascita CEE)', summary_fr: 'Création de la Communauté Économique Européenne (CEE), ancêtre de l\'Union Européenne.', summary_it: 'Nasce la Comunità Europea per garantire pace e cooperazione nel continente.', keyFigure: 'Robert Schuman & Jean Monnet' },
  { year: '1989', cycle: 'Repère Brevet', title_fr: 'Chute du Mur de Berlin', title_it: 'Caduta del Muro di Berlino', summary_fr: 'Fin de la Guerre Froide et réunification de l\'Allemagne et de l\'Europe.', summary_it: 'Crollo della cortina di ferro e fine della Guerra Fredda.', keyFigure: 'Helmut Kohl & Mikhaïl Gorbatchev' }
];

// ============================================================
// FRANÇAIS : FIGURES DE STYLE & GRAMMAIRE ESSENTIELLE
// ============================================================
export interface FigureOfStyle {
  name: string;
  itName: string;
  definition: string;
  itDefinition: string;
  example: string;
  itExample: string;
}

export const frenchFiguresOfStyle: FigureOfStyle[] = [
  {
    name: 'La Métaphore',
    itName: 'La Metafora',
    definition: 'Associe deux éléments sans outil de comparaison (ressemble à, comme...).',
    itDefinition: 'Associa due elementi senza usare congiunzioni di paragone come "come".',
    example: '« Cet enfant est un ange. » ou « Un grand manteau blanc couvrait la plaine. »',
    itExample: '« Quell\'uomo è una roccia. »'
  },
  {
    name: 'La Comparaison',
    itName: 'La Comparazione / Similitudine',
    definition: 'Rapproche deux termes à l\'aide d\'un mot comparatif (comme, pareil à, tel que, ressemble à).',
    itDefinition: 'Paragone esplicito introdotto da termini come "come", "simile a", "sembra".',
    example: '« La lune brille comme une pièce d\'argent dans le ciel. »',
    itExample: '« Corre veloce come il vento. »'
  },
  {
    name: 'La Personnification',
    itName: 'La Personificazione',
    definition: 'Attribue des caractéristiques humaines à un objet inanimé ou à un animal.',
    itDefinition: 'Attribuisce comportamenti o sentimenti umani a oggetti o alla natura.',
    example: '« La forêt murmure ses secrets au vent d\'automne. »',
    itExample: '« Gli alberi sospiravano nella notte. »'
  },
  {
    name: 'L\'Hyperbole',
    itName: 'L\'Iperbole',
    definition: 'Exagération volontaire pour frapper les esprits et amplifier la réalité.',
    itDefinition: 'Esagerazione evidente per colpire l\'immaginazione.',
    example: '« Je meurs de faim ! » ou « J\'ai des tonnes de devoirs ce soir. »',
    itExample: '« È un secolo che ti aspetto ! »'
  },
  {
    name: 'L\'Anaphore',
    itName: 'L\'Anafora',
    definition: 'Répétition d\'un même mot ou d\'une même expression en début de phrases ou de vers successifs.',
    itDefinition: 'Ripetizione della stessa parola o frase all\'inizio di versi o periodi consecutivi.',
    example: '« Paris outragé ! Paris brisé ! Paris martyrisé ! mais Paris libéré ! » (De Gaulle)',
    itExample: '« Per me si va ne la città dolente, per me si va ne l\'etterno dolore... »'
  },
  {
    name: 'L\'Oxymore',
    itName: 'L\'Ossimoro',
    definition: 'Rapprochement de deux mots aux sens contradictoires dans une même expression.',
    itDefinition: 'Unione di due parole dai significati opposti nello stesso sintagma.',
    example: '« Une obscure clarté » (Corneille) ou « Un silence assourdissant »',
    itExample: '« Un silenzio assordante » o « Una lucida follia »'
  }
];

// ============================================================
// TECHNOLOGIE & ALGORITHMIQUE (SCRATCH & PYTHON BREVET)
// ============================================================
export interface AlgorithmConcept {
  concept: string;
  itConcept: string;
  scratchBlock: string;
  pythonSyntax: string;
  explanation_fr: string;
  explanation_it: string;
}

export const algorithmCurriculum: AlgorithmConcept[] = [
  {
    concept: 'Variable & Affectation',
    itConcept: 'Variabile e Assegnazione',
    scratchBlock: 'mettre [score v] à (0)',
    pythonSyntax: 'score = 0',
    explanation_fr: 'Une boîte dans la mémoire de l\'ordinateur pour stocker une valeur (nombre ou texte).',
    explanation_it: 'Una scatola in memoria dove memorizzare un valore che può cambiare nel tempo.'
  },
  {
    concept: 'Instruction Conditionnelle',
    itConcept: 'Condizione Se... Allora... Altrimenti',
    scratchBlock: 'si <score > 10> alors ... sinon ...',
    pythonSyntax: 'if score > 10:\n    print("Gagné")\nelse:\n    print("Encore un effort")',
    explanation_fr: 'Permet au programme de prendre des décisions selon qu\'une condition est VRAIE ou FAUSSE.',
    explanation_it: 'Permette al programma di scegliere percorsi diversi in base a una verifica logica.'
  },
  {
    concept: 'Boucle Répéter n fois',
    itConcept: 'Ciclo For (Ripeti n volte)',
    scratchBlock: 'répéter (4) fois [avancer de 50; tourner de 90°]',
    pythonSyntax: 'for i in range(4):\n    avancer(50)\n    tourner(90)',
    explanation_fr: 'Répète un groupe d\'instructions un nombre précis de fois (ex: tracer un carré de 4 côtés).',
    explanation_it: 'Esegue lo stesso blocco di comandi un numero prefissato di volte.'
  },
  {
    concept: 'Boucle Tant que (While)',
    itConcept: 'Ciclo While (Finché)',
    scratchBlock: 'répéter jusqu\'à <touché bord ?>',
    pythonSyntax: 'while not touche_bord():\n    avancer(10)',
    explanation_fr: 'Répète l\'action indéfiniment tant qu\'une condition reste vraie.',
    explanation_it: 'Continua a ripetere i comandi finché la condizione indicata si mantiene vera.'
  }
];

// ============================================================
// BANQUE DE QUIZ MULTI-MATIÈRES & AUTOVALUATION
// ============================================================
export interface CurriculumQuiz {
  id: string;
  subject: 'Maths' | 'Français' | 'Sciences' | 'Histoire-Géo' | 'Anglais';
  question_fr: string;
  question_it: string;
  options: string[];
  correctIndex: number;
  explanation_fr: string;
  explanation_it: string;
}

export const curriculumQuizPool: CurriculumQuiz[] = [
  {
    id: 'q-math-1',
    subject: 'Maths',
    question_fr: 'Dans un triangle rectangle dont les côtés de l\'angle droit mesurent 6 cm et 8 cm, combien mesure l\'hypoténuse ?',
    question_it: 'In un triangolo rettangolo con cateti di 6 cm e 8 cm, quanto misura l\'ipotenusa ?',
    options: ['10 cm', '14 cm', '12 cm', '48 cm'],
    correctIndex: 0,
    explanation_fr: 'D\'après Pythagore : 6² + 8² = 36 + 64 = 100. La racine carrée de 100 est 10 cm !',
    explanation_it: 'Per Pitagora : 6² + 8² = 36 + 64 = 100. La radice quadrata di 100 è 10 cm !'
  },
  {
    id: 'q-math-2',
    subject: 'Maths',
    question_fr: 'Que vaut le développement de (x + 3)² ?',
    question_it: 'Qual è lo sviluppo corretto di (x + 3)² ?',
    options: ['x² + 6x + 9', 'x² + 9', 'x² + 3x + 9', '2x + 6'],
    correctIndex: 0,
    explanation_fr: 'Identité remarquable (a+b)² = a² + 2ab + b² : x² + 2(x)(3) + 3² = x² + 6x + 9.',
    explanation_it: 'Identità notevole (a+b)² = a² + 2ab + b² : x² + 6x + 9.'
  },
  {
    id: 'q-fra-1',
    subject: 'Français',
    question_fr: 'Dans la phrase « Les pommes que j\'ai mangé... », quelle est la bonne orthographe du participe passé ?',
    question_it: 'Nella frase « Les pommes que j\'ai mangé... », come si accorda il participio ?',
    options: ['mangées', 'mangé', 'mangés', 'manger'],
    correctIndex: 0,
    explanation_fr: 'Avec l\'auxiliaire AVOIR, on accorde avec le COD s\'il est placé avant (« que » mis pour « les pommes », féminin pluriel).',
    explanation_it: 'Con l\'ausiliare AVOIR il participio si accorda col COD posto prima (« les pommes », femm. plurale : mangées).'
  },
  {
    id: 'q-sci-1',
    subject: 'Sciences',
    question_fr: 'D\'après la loi d\'Ohm (U = R × I), si la résistance est de 100 Ω et l\'intensité de 0,2 A, quelle est la tension U ?',
    question_it: 'Legge di Ohm (U = R × I): con R = 100 Ω e I = 0,2 A, qual è la tensione U ?',
    options: ['20 Volts', '50 Volts', '500 Volts', '0,002 Volts'],
    correctIndex: 0,
    explanation_fr: 'U = 100 × 0,2 = 20 V.',
    explanation_it: 'U = 100 × 0,2 = 20 V.'
  },
  {
    id: 'q-sci-2',
    subject: 'Sciences',
    question_fr: 'Quel gaz compose 78% de l\'air atmosphérique que nous respirons ?',
    question_it: 'Quale gas costituisce il 78% dell\'aria che respiriamo ?',
    options: ['Le Diazote (N₂)', 'Le Dioxygène (O₂)', 'Le Dioxyde de carbone (CO₂)', 'L\'Argon'],
    correctIndex: 0,
    explanation_fr: 'L\'air sec contient environ 78% de diazote (N₂) et 21% de dioxygène (O₂).',
    explanation_it: 'L\'aria è composta per il 78% da azoto molecolare (N₂) e per il 21% da ossigeno (O₂).'
  },
  {
    id: 'q-hist-1',
    subject: 'Histoire-Géo',
    question_fr: 'En quelle année la loi de Séparation des Églises et de l\'État (fondement de la laïcité) a-t-elle été votée en France ?',
    question_it: 'In che anno fu promulgata in Francia la legge sulla laicità (separazione Stato-Chiesa) ?',
    options: ['1905', '1789', '1945', '1958'],
    correctIndex: 0,
    explanation_fr: 'La loi historique instaurant la laïcité en France date du 9 décembre 1905.',
    explanation_it: 'La storica legge che sancisce la laicità risale al 9 dicembre 1905.'
  },
  {
    id: 'q-ang-1',
    subject: 'Anglais',
    question_fr: 'Quel est le Past Simple du verbe irrégulier « to write » (écrire) ?',
    question_it: 'Qual è il Past Simple del verbo irregolare « to write » (scrivere) ?',
    options: ['wrote', 'written', 'writed', 'writes'],
    correctIndex: 0,
    explanation_fr: 'Infinitif : to write, Past Simple : wrote, Participe Passé : written.',
    explanation_it: 'Write -> Wrote -> Written.'
  }
];

