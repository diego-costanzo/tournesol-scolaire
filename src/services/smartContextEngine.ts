import { HomeworkItem, PedagogicalDomain, SmartStudyAid, GradeCycle } from '../types';

/**
 * Smart Context Engine (Multi-Cycle: Primaire, Collège 5e/4e, 3ème Brevet, Lycée)
 * Delivers grade-appropriate pedagogical cheat sheets, formulas, mnemonic tricks,
 * and step-by-step exam writing structures across the entire French curriculum.
 */

export const SMART_STUDY_AIDS: Record<PedagogicalDomain, SmartStudyAid> = {
  // ==========================================
  // 1. PRIMAIRE (CM1 / CM2 - CYCLE 3)
  // ==========================================
  primaire_math_ops: {
    domain: 'primaire_math_ops',
    gradeCycle: 'primaire',
    subjectKey: 'math',
    badgeLabel_it: '🌟 Calcolo Mentale & Tabelline (Elementari)',
    badgeLabel_fr: '🌟 Tables & Calcul Mental (CM1/CM2)',
    title_it: 'Le 4 Operazioni & Tabelline Magiche',
    title_fr: 'Les 4 Opérations & Tables de Multiplication',
    summary_it: 'Moltiplicare per 10, 100, 1000 aggiungendo gli zeri. Calcolo rapido del perimetro.',
    summary_fr: 'Multiplier par 10, 100, 1000 et calculer rapidement le périmètre d\'une figure.',
    formula: 'Périmètre rectangle = 2 × (Longueur + largeur)  |  Carré = 4 × côté',
    memoryTrick_it: 'Tabellina del 9 sulle dita: abbassa il dito corrispondente al numero per cui moltiplichi! Quante dita a sinistra = decine, a destra = unità!',
    memoryTrick_fr: 'Table de 9 avec les doigts : baissez le doigt du multiplicateur. Doigts à gauche = dizaines, doigts à droite = unités !',
    stepByStepGuide_it: [
      '1. Per moltiplicare per 10: aggiungi uno 0 alla fine (es: 34 × 10 = 340).',
      '2. Per moltiplicare per 100: aggiungi due zeri (es: 15 × 100 = 1500).',
      '3. Perimetro: fai il giro completo della figura sommando tutti i lati.',
      '4. Area del rettangolo: moltiplica la Lunghezza per la larghezza (L × l).'
    ],
    stepByStepGuide_fr: [
      '1. Multiplier par 10 : ajouter un zéro à droite (ex : 42 × 10 = 420).',
      '2. Multiplier par 100 : ajouter deux zéros à droite (ex : 18 × 100 = 1800).',
      '3. Périmètre : c\'est le contour de la figure (somme des côtés).',
      '4. Aire du rectangle : Longueur × largeur (ex : 5 cm × 3 cm = 15 cm²).'
    ]
  },

  primaire_fractions: {
    domain: 'primaire_fractions',
    gradeCycle: 'primaire',
    subjectKey: 'math',
    badgeLabel_it: '🍕 Frazioni Intuitive (Metà, Terzi, Quarti)',
    badgeLabel_fr: '🍕 Fractions Visuelles (Demi, Tiers, Quart)',
    title_it: 'Capire le Frazioni con le Pizze e le Torte',
    title_fr: 'Comprendre les Fractions Partagées',
    summary_it: 'Il numeratore (in alto) conta le fette prese; il denominatore (in basso) indica in quante fette è divisa la torta.',
    summary_fr: 'Le numérateur (en haut) compte les parts prises ; le dénominateur (en bas) indique le nombre total de parts.',
    formula: '1/2 = la moitié  |  1/4 = le quart  |  3/4 = trois quarts  |  4/4 = 1 tout entier',
    memoryTrick_it: 'In alto c\'è il cielo (Numeratore che sale), in basso c\'è la terra (Denominatore che sta giù)!',
    memoryTrick_fr: 'Astuce : Le Numérateur est au ciel (en haut, Nuage), le Dénominateur est en bas (par Terre) !',
    stepByStepGuide_it: [
      '1. Conta in quante parti uguali è diviso l\'oggetto (questo è il numero sotto).',
      '2. Conta quante parti colorate ci sono (questo è il numero sopra).',
      '3. 1/2 è la metà esatta.',
      '4. Se il numero sopra è uguale a quello sotto (4/4), hai la torta intera (= 1)!'
    ],
    stepByStepGuide_fr: [
      '1. Compter en combien de parts égales l\'objet est partagé (chiffre du bas).',
      '2. Compter le nombre de parts coloriées (chiffre du haut).',
      '3. 1/2 = la moitié exacte de l\'unité.',
      '4. Si le numérateur égale le dénominateur (ex : 6/6), on a 1 unité entière !'
    ]
  },

  primaire_homophones: {
    domain: 'primaire_homophones',
    gradeCycle: 'primaire',
    subjectKey: 'french',
    badgeLabel_it: '🎯 Omofoni Magici (a/à, et/est, son/sont)',
    badgeLabel_fr: '🎯 Homophones Grammaticaux (a/à, et/est, son/sont)',
    title_it: 'Zero Errori di Ortografia con i Trucchi di Sostituzione',
    title_fr: 'Ne Plus Confondre les Homophones',
    summary_it: 'Sostituisci la parola nella frase: se funziona con "avait" o "était", è il verbo senza accento!',
    summary_fr: 'Remplacez le mot : si on peut dire « avait » ou « était », c\'est le verbe sans accent !',
    formula: 'a ➔ avait  |  est ➔ était  |  sont ➔ étaient  |  ont ➔ avaient',
    memoryTrick_it: 'Se puoi dire "aveva", scrivi "a" senza accento. Altrimenti metti l\'accento "à"!',
    memoryTrick_fr: 'Remplace par « avait » : si la phrase a du sens, écris « a » sans accent. Sinon, écris « à » !',
    stepByStepGuide_it: [
      '• a / à : "Il a un vélo" ➔ "Il avait un vélo" (funziona!) ➔ "a" senza accento.',
      '• et / est : "Il est gentil" ➔ "Il était gentil" (funziona!) ➔ "est". Se significa "e anche", scrivi "et".',
      '• son / sont : "Ils sont là" ➔ "Ils étaient là" (funziona!) ➔ "sont". Se è il suo cane ("son chien"), scrivi "son".',
      '• on / ont : "Ils ont peur" ➔ "Ils avaient peur" ➔ "ont". "On" con la N si può sostituire con "il".'
    ],
    stepByStepGuide_fr: [
      '• a / à : « Il a faim » ➔ « Il avait faim » (marche) ➔ verbe « a » sans accent.',
      '• et / est : « Il est grand » ➔ « Il était grand » ➔ verbe « est ». Si c\'est « et puis », écris « et ».',
      '• son / sont : « Les oiseaux sont partis » ➔ « étaient partis » ➔ verbe « sont ».',
      '• on / ont : « Elles ont gagné » ➔ « avaient gagné » ➔ verbe « ont ».'
    ]
  },

  primaire_verbes: {
    domain: 'primaire_verbes',
    gradeCycle: 'primaire',
    subjectKey: 'french',
    badgeLabel_it: '📖 Coniugazione Base (Présent, Futur, Imparfait)',
    badgeLabel_fr: '📖 Conjugaison CM1/CM2 (Présent & Futur)',
    title_it: 'Verbi del 1° e 2° Gruppo + Être e Avoir',
    title_fr: 'Les Verbes Clés du Primaire',
    summary_it: 'Le desinenze del presente per i verbi in -er: -e, -es, -e, -ons, -ez, -ent.',
    summary_fr: 'Terminaisons du présent en -er : -e, -es, -e, -ons, -ez, -ent.',
    formula: 'Futur : infinitif + -ai, -as, -a, -ons, -ez, -ont',
    memoryTrick_it: 'Con "tu" c\'è SEMPRE la "s" a passeggio! (tu chantes, tu finis, tu auras).',
    memoryTrick_fr: 'Avec « tu », il y a TOUJOURS un « s » qui se promène ! (tu manges, tu finis).',
    stepByStepGuide_it: [
      '• Con "nous", la desinenza finisce sempre con -ons (nous chantons).',
      '• Con "vous", la desinenza finisce sempre con -ez (vous chantez).',
      '• Con "ils / elles", la desinenza finisce con -ent che non si pronuncia!',
      '• Al futuro, mantieni l\'infinito e aggiungi: -ai, -as, -a, -ons, -ez, -ont.'
    ],
    stepByStepGuide_fr: [
      '• Avec « nous » : toujours -ons (nous marchons).',
      '• Avec « vous » : toujours -ez (vous marchez).',
      '• Avec « ils / elles » : toujours -ent muet (ils chantent).',
      '• Au futur : on garde le verbe entier et on ajoute -ai, -as, -a, -ons, -ez, -ont.'
    ]
  },

  primaire_sciences: {
    domain: 'primaire_sciences',
    gradeCycle: 'primaire',
    subjectKey: 'science',
    badgeLabel_it: '💧 Il Ciclo dell\'Acqua & Stati della Materia',
    badgeLabel_fr: '💧 Le Cycle de l\'Eau & la Matière (Cycle 3)',
    title_it: 'Solido, Liquido, Gas & Il Viaggio della Goccia',
    title_fr: 'Les 3 États de l\'Eau & la Terre',
    summary_it: 'L\'acqua evapora con il calore del sole, forma le nuvole (condensazione) e ricade come pioggia o neve.',
    summary_fr: 'L\'eau s\'évapore au soleil, forme les nuages (condensation) et retombe en pluie (précipitations).',
    formula: 'Glace (Solide) ⇄ Eau (Liquide) ⇄ Vapeur (Gaz)',
    memoryTrick_it: '0°C è il numero magico: sotto zero l\'acqua gela in ghiaccio, sopra zero si scioglie!',
    memoryTrick_fr: '0°C = fusion / solidification. 100°C = ébullition de l\'eau liquide en vapeur !',
    stepByStepGuide_it: [
      '1. Evaporazione: il sole scalda mari e laghi trasformando l\'acqua in vapore invisibile.',
      '2. Condensazione: in alto fa freddo, il vapore forma miliardi di goccioline (le nuvole).',
      '3. Precipitazioni: pioggia, neve o grandine cadono a terra.',
      '4. Infiltrazione: l\'acqua penetra nel suolo e alimenta sorgenti e fiumi.'
    ],
    stepByStepGuide_fr: [
      '1. Évaporation : les rayons du soleil transforment l\'eau liquide en vapeur d\'eau.',
      '2. Condensation : en altitude, la vapeur refroidit et forme les nuages.',
      '3. Précipitations : l\'eau retombe sous forme de pluie ou de neige.',
      '4. Infiltration et ruissellement : l\'eau rejoint les fleuves et l\'océan.'
    ]
  },

  // ==========================================
  // 2. COLLÈGE INTERMÉDIAIRE (5e / 4e - CYCLE 4)
  // ==========================================
  pythagoras: {
    domain: 'pythagoras',
    gradeCycle: 'college',
    subjectKey: 'math',
    badgeLabel_it: '📐 Teorema di Pitagora • Collège 4e',
    badgeLabel_fr: '📐 Théorème de Pythagore • Collège 4e',
    title_it: 'Teorema di Pitagora & Ipotenusa',
    title_fr: 'Théorème de Pythagore & Hypoténuse',
    summary_it: 'In ogni triangolo rettangolo, il quadrato dell\'ipotenusa è uguale alla somma dei quadrati dei cateti.',
    summary_fr: 'Dans un triangle rectangle, le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés.',
    formula: 'BC² = AB² + AC²  ⟹  BC = √(AB² + AC²)',
    memoryTrick_it: 'Terne pitagoriche magiche da ricordare a mente: (3, 4, 5) e (5, 12, 13). Se i cateti sono 3 e 4, l\'ipotenusa è SUBITO 5 senza calcoli!',
    memoryTrick_fr: 'Triplets magiques : (3, 4, 5) et (5, 12, 13). Si les côtés mesurent 3 et 4 cm, l\'hypoténuse vaut DIRECTEMENT 5 cm !',
    stepByStepGuide_it: [
      '1. Scrivi la frase magica per i punti: "Nel triangolo ABC rettangolo in A, per il teorema di Pitagora:"',
      '2. Scrivi l\'uguaglianza con le lettere: BC² = AB² + AC²',
      '3. Sostituisci i valori numerici noti (es: BC² = 6² + 8² = 36 + 64 = 100)',
      '4. Calcola la radice quadrata con la calcolatrice: BC = √100 = 10 cm.',
      '5. Concludi con l\'unità di misura corretta (cm, m).'
    ],
    stepByStepGuide_fr: [
      '1. Rédaction type officielle : "Dans le triangle ABC rectangle en A, d\'après le théorème de Pythagore :"',
      '2. Poser la formule littérale : BC² = AB² + AC²',
      '3. Remplacer par les valeurs numériques : BC² = 6² + 8² = 36 + 64 = 100',
      '4. Passer à la racine carrée : BC = √100 = 10 cm',
      '5. Ne jamais oublier l\'unité (cm, m) dans la phrase de conclusion !'
    ],
    commonTrap_it: 'Attenzione a non sommare se stai cercando un cateto! Se cerchi un cateto, si SOTTRAE: AB² = BC² - AC².',
    commonTrap_fr: 'Attention : si l\'on cherche un côté de l\'angle droit, on SOUSTRAIT le carré : AB² = BC² - AC².'
  },

  powers_roots: {
    domain: 'powers_roots',
    gradeCycle: 'college',
    subjectKey: 'math',
    badgeLabel_it: '⚡ Potenze di 10 & Calcolo Letterale',
    badgeLabel_fr: '⚡ Puissances de 10 & Calcul Littéral',
    title_it: 'Regole d\'Oro delle Potenze & Notazione Scientifica',
    title_fr: 'Règles des Puissances & Notation Scientifique',
    summary_it: 'Moltiplicare potenze con la stessa base significa sommare gli esponenti.',
    summary_fr: 'Multiplier des puissances de même base revient à additionner leurs exposants.',
    formula: 'aⁿ × aᵐ = aⁿ⁺ᵐ  |  (aⁿ)ᵐ = aⁿˣᵐ  |  a⁻ⁿ = 1 / aⁿ  |  a⁰ = 1',
    memoryTrick_it: 'Notazione scientifica: sempre della forma a × 10ⁿ dove 1 ≤ a < 10. Es: 45 000 = 4,5 × 10⁴.',
    memoryTrick_fr: 'Notation scientifique : toujours sous la forme a × 10ⁿ avec 1 ≤ a < 10. Ex: 45 000 = 4,5 × 10⁴.',
    stepByStepGuide_it: [
      '1. Prodotto: 10³ × 10⁵ = 10³⁺⁵ = 10⁸',
      '2. Frazione: 10⁷ / 10² = 10⁷⁻² = 10⁵',
      '3. Potenza di potenza: (10⁴)³ = 10⁴ˣ³ = 10¹²',
      '4. Esponente negativo: 10⁻³ = 0,001 (tre zeri a sinistra dell\'uno)'
    ],
    stepByStepGuide_fr: [
      '1. Produit : 10³ × 10⁵ = 10³⁺⁵ = 10⁸',
      '2. Quotient : 10⁷ / 10² = 10⁷⁻² = 10⁵',
      '3. Puissance de puissance : (10⁴)³ = 10⁴ˣ³ = 10¹²',
      '4. Exposant négatif : 10⁻³ = 0,001'
    ]
  },

  fractions: {
    domain: 'fractions',
    gradeCycle: 'college',
    subjectKey: 'math',
    badgeLabel_it: '🍕 Frazioni & Semplificazioni',
    badgeLabel_fr: '🍕 Fractions : Addition & Multiplication',
    title_it: 'Calcolo con le Frazioni Senza Errori',
    title_fr: 'Calcul Fractionnaire Sans Erreur',
    summary_it: 'Per sommare serve lo stesso denominatore; per moltiplicare si moltiplicano numeratori tra loro e denominatori tra loro.',
    summary_fr: 'Pour additionner il faut le même dénominateur ; pour multiplier, on multiplie en ligne droite.',
    formula: '(a/b) + (c/b) = (a+c)/b  |  (a/b) × (c/d) = (a×c)/(b×d)',
    memoryTrick_it: 'Per dividere due frazioni: NON dividere! Moltiplica per l\'inverso della seconda!',
    memoryTrick_fr: 'Diviser par une fraction, c\'est MULTIPLIER par son inverse !',
    stepByStepGuide_it: [
      '1. Somma/Sottrazione: Trova il minimo comune denominatore.',
      '2. Moltiplicazione: Semplifica PRIMA di moltiplicare.',
      '3. Divisione: Trasforma in moltiplicazione invertendo la seconda frazione.'
    ],
    stepByStepGuide_fr: [
      '1. Addition/Soustraction : Mettre au même dénominateur commun.',
      '2. Multiplication : Simplifier AVANT de calculer les grands produits.',
      '3. Division : Multiplier par l\'inverse de la 2ème fraction.'
    ]
  },

  equations: {
    domain: 'equations',
    gradeCycle: 'college',
    subjectKey: 'math',
    badgeLabel_it: '⚖️ Equazioni di 1° Grado',
    badgeLabel_fr: '⚖️ Équations du 1er Degré',
    title_it: 'Risolvere le Equazioni con la Regola della Bilancia',
    title_fr: 'Résolution d\'Équations (Règle de la Balance)',
    summary_it: 'Un\'equazione è come una bilancia a due piatti: ciò che fai da una parte devi farlo anche dall\'altra.',
    summary_fr: 'Une équation est une balance en équilibre : toute opération faite à gauche doit être faite à droite.',
    formula: 'ax + b = c  ⟹  ax = c - b  ⟹  x = (c - b) / a',
    memoryTrick_it: '"Quando attraversa l\'uguale (=), cambia di segno!" Il + diventa -, il × diventa ÷.',
    memoryTrick_fr: '"Quand un terme saute par-dessus le égal (=), il change de signe !" Le + devient -, le × devient ÷.',
    stepByStepGuide_it: [
      '1. Raggruppa tutte le "x" a sinistra.',
      '2. Raggruppa tutti i numeri puri a destra.',
      '3. Riduci i due membri (es: 3x = 15).',
      '4. Dividi per il coefficiente della x (x = 15 / 3 = 5).'
    ],
    stepByStepGuide_fr: [
      '1. Rassembler tous les termes avec "x" à gauche.',
      '2. Rassembler tous les nombres purs à droite.',
      '3. Réduire les deux membres (ex: 3x = 15).',
      '4. Diviser par le coefficient devant x (x = 15 / 3 = 5).'
    ]
  },

  proportions: {
    domain: 'proportions',
    gradeCycle: 'college',
    subjectKey: 'math',
    badgeLabel_it: '📊 Proporzioni & Percentuali',
    badgeLabel_fr: '📊 Pourcentages & Proportionnalité',
    title_it: 'Regola del Tre & Coefficiente di Proporzionalità',
    title_fr: 'Produit en Croix & Pourcentages',
    summary_it: 'Il prodotto dei medi è uguale al prodotto degli estremi (prodotto a croce).',
    summary_fr: 'Dans un tableau de proportionnalité, les produits en croix sont égaux.',
    formula: 'a / b = c / d  ⟹  x = (b × c) / a',
    memoryTrick_it: 'Per il 10%: sposta la virgola a sinistra di un posto! Per il 50%: dimezza!',
    memoryTrick_fr: 'Pour 10%, décaler la virgule d\'un rang vers la gauche. Pour 50%, diviser par 2.',
    stepByStepGuide_it: [
      '1. Disegna una tabellina 2x2.',
      '2. Moltiplica i due numeri in diagonale.',
      '3. Dividi per il numero rimasto da solo.'
    ],
    stepByStepGuide_fr: [
      '1. Construire le tableau de proportionnalité 2x2.',
      '2. Multiplier les deux nombres en diagonale.',
      '3. Diviser par le troisième nombre isolé.'
    ]
  },

  french_conjugation: {
    domain: 'french_conjugation',
    gradeCycle: 'college',
    subjectKey: 'french',
    badgeLabel_it: '📖 Coniugatore & Temi Verbali',
    badgeLabel_fr: '📖 Conjugaison : Subjonctif & Passé Simple',
    title_it: 'Padronanza dei Verbi Irregolari di 4ème',
    title_fr: 'Maîtrise des Verbes du 3e Groupe & Subjonctif',
    summary_it: 'Il congiuntivo esprime dubbio, desiderio o necessità (introdotto sempre da "que").',
    summary_fr: 'Le subjonctif exprime l\'obligation, le doute ou le sentiment, toujours précédé de "que".',
    formula: 'Subjonctif : -e, -es, -e, -ions, -iez, -ent',
    memoryTrick_it: 'Trucco del congiuntivo: pensa alla frase "Il faut que..." prima di coniugare!',
    memoryTrick_fr: 'Astuce : commencez mentalement la phrase par « Il faut que... » !',
    stepByStepGuide_it: [
      '1. Prendi la radice della 3ª persona plurale (ils).',
      '2. Togli "-ent".',
      '3. Aggiungi le desinenze: -e, -es, -e, -ions, -iez, -ent.'
    ],
    stepByStepGuide_fr: [
      '1. Prendre le radical de la 3e personne du pluriel (ils).',
      '2. Retirer « -ent ».',
      '3. Ajouter les terminaisons du subjonctif : -e, -es, -e, -ions, -iez, -ent.'
    ]
  },

  french_accord: {
    domain: 'french_accord',
    gradeCycle: 'college',
    subjectKey: 'french',
    badgeLabel_it: '✍️ Accordo del Participio Passato',
    badgeLabel_fr: '✍️ Accord du Participe Passé (Être / Avoir)',
    title_it: 'La Regola d\'Oro dell\'Accordo con ÊTRE e AVOIR',
    title_fr: 'Règle d\'Accord du Participe Passé',
    summary_it: 'Con Être si concorda sempre col soggetto. Con Avoir si concorda SOLO se il COD è posto prima del verbo.',
    summary_fr: 'Avec Être, accord avec le sujet. Avec Avoir, accord UNIQUEMENT si le COD est placé AVANT le verbe.',
    formula: 'ÊTRE = accord Sujet  |  AVOIR = accord COD placé AVANT',
    memoryTrick_it: 'Fai la domanda: "Avoir + participe + QUI / QUOI ?". Se la risposta è PRIMA del verbo, ACCORDA!',
    memoryTrick_fr: 'Posez la question : "Verbe + QUI / QUOI ?". Si la réponse est AVANT, ON ACCORDE !',
    stepByStepGuide_it: [
      '1. Ausiliare ÊTRE: accordo col soggetto (Elles sont parties).',
      '2. Ausiliare AVOIR: cerca il COD.',
      '3. Se il COD è dopo: NON accordare (J\'ai mangé des pommes).',
      '4. Se il COD è prima: ACCORDA (Les pommes que j\'ai mangées).'
    ],
    stepByStepGuide_fr: [
      '1. Auxiliaire ÊTRE : accord systématique avec le sujet (Elles sont parties).',
      '2. Auxiliaire AVOIR : chercher le COD.',
      '3. Si COD placé après : invariable (J\'ai mangé des pommes).',
      '4. Si COD placé avant : accord (Les pommes que j\'ai mangées).'
    ]
  },

  french_connectors: {
    domain: 'french_connectors',
    gradeCycle: 'college',
    subjectKey: 'french',
    badgeLabel_it: '📝 Connettori Logici & Redazione',
    badgeLabel_fr: '📝 Connecteurs Logiques & Argumentation',
    title_it: 'Connettori per Arricchire Temi e Relazioni',
    title_fr: 'Connecteurs Logiques pour le Brevet',
    summary_it: 'I connettori logici strutturano il pensiero e permettono di ottenere voti alti.',
    summary_fr: 'Les connecteurs structurent l\'argumentation et garantissent les points de rédaction.',
    formula: 'Cause (car, parce que)  |  Conséquence (donc, ainsi)  |  Opposition (cependant)',
    memoryTrick_it: 'Metodo P.E.E.: Point (Idea) + Explanation (Spiegazione) + Example (Esempio concreto).',
    memoryTrick_fr: '1 Idée principale + 1 Connecteur + 1 Justification + 1 Exemple précis.',
    stepByStepGuide_it: [
      '• Per iniziare: Tout d\'abord, en premier lieu.',
      '• Per aggiungere: De plus, en outre, par ailleurs.',
      '• Per opporre: Cependant, néanmoins, toutefois.',
      '• Per concludere: En conclusion, ainsi, finalement.'
    ],
    stepByStepGuide_fr: [
      '• Introduire : Tout d\'abord, en premier lieu.',
      '• Enrichir : De surcroît, par ailleurs, en outre.',
      '• Opposer : Cependant, néanmoins, toutefois.',
      '• Conclure : En définitive, ainsi, en conclusion.'
    ]
  },

  ohms_law: {
    domain: 'ohms_law',
    gradeCycle: 'college',
    subjectKey: 'physics',
    badgeLabel_it: '⚡ Legge di Ohm & Circuiti Elettrici',
    badgeLabel_fr: '⚡ Loi d\'Ohm & Électricité (4ème)',
    title_it: 'La Legge di Ohm: U = R × I',
    title_fr: 'Loi d\'Ohm : U = R × I',
    summary_it: 'La tensione U (Volt) ai capi di un resistore è proporzionale all\'intensità di corrente I (Ampere).',
    summary_fr: 'La tension U (en Volts) est égale au produit de sa résistance R par l\'intensité I.',
    formula: 'U = R × I  ⟹  R = U / I  ⟹  I = U / R',
    memoryTrick_it: 'Disegna un triangolo con la U in alto e R e I in basso. Copri con il dito ciò che cerchi!',
    memoryTrick_fr: 'Le triangle magique : U en haut, R et I en bas. Cachez la grandeur cherchée !',
    stepByStepGuide_it: [
      '1. Tensione U espressa in Volt (V).',
      '2. Resistenza R espressa in Ohm (Ω).',
      '3. Intensità I espressa in Ampere (A).',
      '4. Se I è in mA, dividi per 1000 prima di moltiplicare (es: 200 mA = 0,2 A).'
    ],
    stepByStepGuide_fr: [
      '1. Tension U en Volts (V).',
      '2. Résistance R en Ohms (Ω).',
      '3. Intensité I en Ampères (A).',
      '4. Convertir les mA en A en divisant par 1000 (ex : 200 mA = 0,2 A) !'
    ]
  },

  atoms_ions: {
    domain: 'atoms_ions',
    gradeCycle: 'college',
    subjectKey: 'physics',
    badgeLabel_it: '🔬 Atomi, Molecole & Ioni',
    badgeLabel_fr: '🔬 Atomes, Molécules & Ions (Cycle 4)',
    title_it: 'Costituzione della Materia & Conservazione della Massa',
    title_fr: 'Structure de l\'Atome & Équations Chimiques',
    summary_it: 'Un atomo è elettricamente neutro. Uno ione ha perso o guadagnato elettroni.',
    summary_fr: 'Un atome est électriquement neutre. Un ion a gagné ou perdu un ou plusieurs électrons.',
    formula: 'Rien ne se perd, rien ne se crée, tout se transforme (Lavoisier)',
    memoryTrick_it: 'Catione = Positivo (+). Anione = Negativo (-).',
    memoryTrick_fr: 'Cation = Positif (a perdu des e-) | Anion = Négatif (a gagné des e-).',
    stepByStepGuide_it: [
      '• Acqua: H₂O (2 Idrogeno, 1 Ossigeno).',
      '• Diossido di carbonio: CO₂.',
      '• Nelle reazioni, il numero di atomi a sinistra deve essere UGUALE a quello a destra!'
    ],
    stepByStepGuide_fr: [
      '• Eau : H₂O (2 H, 1 O).',
      '• Dioxyde de carbone : CO₂.',
      '• Équilibrer l\'équation : autant d\'atomes de chaque sorte à gauche qu\'à droite !'
    ]
  },

  speed_motion: {
    domain: 'speed_motion',
    gradeCycle: 'college',
    subjectKey: 'physics',
    badgeLabel_it: '🚗 Velocità, Distanza & Tempo',
    badgeLabel_fr: '🚗 Vitesse, Distance & Temps',
    title_it: 'Calcolo della Velocità Media e Conversioni',
    title_fr: 'Calcul de la Vitesse & Mouvement',
    summary_it: 'La velocità media è il rapporto tra distanza percorsa e durata del tragitto.',
    summary_fr: 'La vitesse moyenne est égale au quotient de la distance par le temps.',
    formula: 'v = d / t  ⟹  d = v × t  ⟹  t = d / v',
    memoryTrick_it: 'Fattore 3,6: da m/s a km/h si moltiplica per 3,6! Da km/h a m/s si divide per 3,6!',
    memoryTrick_fr: 'Facteur 3,6 : m/s vers km/h on multiplie par 3,6 (ex: 10 m/s = 36 km/h).',
    stepByStepGuide_it: [
      '1. Distanza in km o m.',
      '2. Tempo in ore o secondi.',
      '3. Attenzione: 1h30 = 1,5 ore (30 min = 0,5 h)!'
    ],
    stepByStepGuide_fr: [
      '1. Distance d en km ou m.',
      '2. Temps t en h ou s.',
      '3. 1h30 = 1,5 h (et non 1,30 h) !'
    ]
  },

  french_revolution: {
    domain: 'french_revolution',
    gradeCycle: 'college',
    subjectKey: 'history',
    badgeLabel_it: '🏛️ Rivoluzione Francese (1789-1799)',
    badgeLabel_fr: '🏛️ Révolution Française & Empire',
    title_it: 'Le Tappe Fondamentali del 1789',
    title_fr: 'Les Repères Clés de 1789 au DNB',
    summary_it: 'Fine dell\'Ancien Régime, sovranità nazionale e Dichiarazione dei Diritti dell\'Uomo.',
    summary_fr: 'Fin de la société d\'ordres, affirmation de la souveraineté nationale et DDHC.',
    formula: 'Liberté, Égalité, Fraternité',
    memoryTrick_it: '1789: 14 Luglio (Bastiglia) e 26 Agosto (DDHC).',
    memoryTrick_fr: 'Repère : 14 juillet (Bastille) et 26 août (DDHC).',
    stepByStepGuide_it: [
      '• 5 Maggio 1789: Stati Generali.',
      '• 14 Luglio 1789: Presa della Bastiglia.',
      '• 26 Agosto 1789: Dichiarazione Diritti dell\'Uomo (DDHC).'
    ],
    stepByStepGuide_fr: [
      '• 5 mai 1789 : États Généraux.',
      '• 14 juillet 1789 : Prise de la Bastille.',
      '• 26 août 1789 : Déclaration des Droits de l\'Homme.'
    ]
  },

  industrial_revolution: {
    domain: 'industrial_revolution',
    gradeCycle: 'college',
    subjectKey: 'history',
    badgeLabel_it: '🏭 Rivoluzione Industriale & Città',
    badgeLabel_fr: '🏭 L\'Europe de la Révolution Industrielle',
    title_it: 'Carbone, Vapore & Trasformazioni Sociali',
    title_fr: 'Machine à Vapeur & Essor Urbain au XIXe',
    summary_it: 'La macchina a vapore rivoluziona i trasporti (ferrovie) e le industrie.',
    summary_fr: 'La vapeur transforme l\'économie, entraîne l\'exode rural et voit naître la bourgeoisie et le prolétariat.',
    formula: 'Charbon + Vapeur = Révolution des Transports (Chemin de fer)',
    memoryTrick_it: 'Due classi sociali: Borghesia industriale vs Proletariato operaio.',
    memoryTrick_fr: 'Opposition centrale : Bourgeoisie capitaliste vs Prolétariat ouvrier.',
    stepByStepGuide_it: [
      '• Macchina a vapore di James Watt (1769).',
      '• Nascita delle ferrovie e delle fabbriche.',
      '• Esodo dalle campagne verso le città.'
    ],
    stepByStepGuide_fr: [
      '• Machine à vapeur alimentée au charbon.',
      '• Essor du train et des usines.',
      '• Exode rural vers les bassins industriels.'
    ]
  },

  scratch_algorithms: {
    domain: 'scratch_algorithms',
    gradeCycle: 'college',
    subjectKey: 'techno',
    badgeLabel_it: '💻 Algoritmi Scratch & Python',
    badgeLabel_fr: '💻 Algorithmique : Scratch & Python',
    title_it: 'Logica dei Blocchi & Variabili per il Brevet',
    title_fr: 'Algorithmique & Programmation au Brevet',
    summary_it: 'Sequenze, cicli (ripeti) e condizioni (se... allora... altrimenti).',
    summary_fr: 'Comprendre les instructions, les boucles d\'itération et les structures conditionnelles.',
    formula: 'Si [condition] Alors [action 1] Sinon [action 2]',
    memoryTrick_it: 'Scratch: X orizzontale (-240 a +240), Y verticale (-180 a +180). Centro = (0, 0).',
    memoryTrick_fr: 'Repère Scratch : X horizontal (-240 à +240) et Y vertical (-180 à +180). Centre = (0, 0).',
    stepByStepGuide_it: [
      '1. Bandierina verde per iniziare.',
      '2. Inizializza posizione: vai a x:0 y:0.',
      '3. Ciclo: "ripeti 4 volte [avanza di 100, gira di 90°]" disegna un quadrato.'
    ],
    stepByStepGuide_fr: [
      '1. Bloc départ : "Quand le drapeau vert est cliqué".',
      '2. Initialisation : aller à x:0 y:0.',
      '3. Boucle : répéter 4 fois [avancer 100, tourner 90°] = un carré.'
    ]
  },

  // ==========================================
  // 3. 3ÈME (DIPLÔME NATIONAL DU BREVET - DNB)
  // ==========================================
  thales: {
    domain: 'thales',
    gradeCycle: 'brevet',
    subjectKey: 'math',
    badgeLabel_it: '📐 Teorema di Talete • Ufficiale DNB (3ème)',
    badgeLabel_fr: '📐 Théorème de Thalès • Rédaction DNB 3ème',
    title_it: 'Teorema di Talete & Réciproque',
    title_fr: 'Théorème de Thalès & Réciproque',
    summary_it: 'Se due rette secanti sono tagliate da due rette parallele, i segmenti corrispondenti sono proporzionali.',
    summary_fr: 'Dans un triangle ou configuration papillon avec droites parallèles, les longueurs sont proportionnelles.',
    formula: 'AM / AB = AN / AC = MN / BC',
    memoryTrick_it: '"Piccolo su Grande = Piccolo su Grande = Terzo Piccolo su Terzo Grande"!',
    memoryTrick_fr: 'La règle : « Petit côté sur Grand côté = Petit côté sur Grand côté = Base sur Base » !',
    stepByStepGuide_it: [
      '1. Ipotesi obbligatorie per i punti al Brevet: "I punti A, M, B sono allineati nello stesso ordine di A, N, C e le rette (MN) e (BC) sono parallele."',
      '2. Scrivi l\'uguaglianza dei tre rapporti: AM/AB = AN/AC = MN/BC',
      '3. Sostituisci i valori numerici noti.',
      '4. Calcola la misura mancante con il prodotto a croce.'
    ],
    stepByStepGuide_fr: [
      '1. Rédaction type officielle : "Les points A, M, B et A, N, C sont alignés dans cet ordre, et les droites (MN) et (BC) sont parallèles."',
      '2. D\'après le théorème de Thalès : AM/AB = AN/AC = MN/BC',
      '3. Remplacer par les valeurs numériques.',
      '4. Calculer la longueur par un produit en croix.'
    ]
  },

  trigonometry: {
    domain: 'trigonometry',
    gradeCycle: 'brevet',
    subjectKey: 'math',
    badgeLabel_it: '📐 Trigonometria Brevet (Cos, Sin, Tan)',
    badgeLabel_fr: '📐 Trigonométrie Brevet (Cos, Sin, Tan)',
    title_it: 'Trigonometria nel Triangolo Rettangolo',
    title_fr: 'Trigonométrie (CAH-SOH-TOA)',
    summary_it: 'Il coseno, il seno e la tangente permettono di calcolare angoli e lunghezze nei triangoli rettangoli.',
    summary_fr: 'Les formules trigonométriques relient angles et longueurs dans le triangle rectangle.',
    formula: 'cos = Adiacente / Ipotenusa  |  sin = Opposto / Ipotenusa  |  tan = Opposto / Adiacente',
    memoryTrick_it: 'Formula magica universale: CAH - SOH - TOA !',
    memoryTrick_fr: 'Mot magique indispensable : CAH - SOH - TOA ! (Cosinus Adjacent Hypothénuse...)',
    stepByStepGuide_it: [
      '1. Individua l\'ipotenusa (lato più lungo di fronte all\'angolo retto).',
      '2. Individua il lato opposto (di fronte all\'angolo acuto considerato).',
      '3. Il terzo lato è il lato adiacente (tocca l\'angolo).',
      '4. Scegli la formula che contiene le due misure note e l\'incognita.'
    ],
    stepByStepGuide_fr: [
      '1. Repérer l\'hypoténuse (face à l\'angle droit).',
      '2. Repérer le côté opposé (en face de l\'angle cherché).',
      '3. Repérer le côté adjacent (qui touche l\'angle).',
      '4. Appliquer la formule adaptée (ex : cosinus si on a adjacent et hypoténuse).'
    ]
  },

  affine_functions: {
    domain: 'affine_functions',
    gradeCycle: 'brevet',
    subjectKey: 'math',
    badgeLabel_it: '📈 Funzioni Lineari & Affini (f(x) = ax + b)',
    badgeLabel_fr: '📈 Fonctions Linéaires & Affines (3ème)',
    title_it: 'Rette, Immagini & Antecedenti',
    title_fr: 'Fonctions Affines : f(x) = ax + b',
    summary_it: 'Una funzione lineare passa per l\'origine (b=0); una funzione affine è una retta che taglia l\'asse y in b.',
    summary_fr: 'Une fonction linéaire passe par l\'origine (b=0). La droite d\'une fonction affine coupe l\'axe y en b.',
    formula: 'f(x) = ax + b  |  a = coefficient directeur (pente)  |  b = ordonnée à l\'origine',
    memoryTrick_it: '"a" è la pendenza (quanto sale la retta ogni passo verso destra), "b" è dove la retta tocca l\'asse verticale!',
    memoryTrick_fr: '« a » est la pente (inclinaison), « b » est le point de départ sur l\'axe vertical (ordonnée à l\'origine) !',
    stepByStepGuide_it: [
      '• Immagine di un numero: calcola f(3) sostituendo x con 3.',
      '• Antecedente di un numero: risolvi l\'equazione f(x) = valore.',
      '• Trovare "a": a = (yB - yA) / (xB - xA).'
    ],
    stepByStepGuide_fr: [
      '• Image : calculer f(3) en remplaçant x par 3.',
      '• Antécédent : résoudre l\'équation f(x) = k.',
      '• Calculer le coefficient a : a = (yB - yA) / (xB - xA).'
    ]
  },

  identites_remarquables: {
    domain: 'identites_remarquables',
    gradeCycle: 'brevet',
    subjectKey: 'math',
    badgeLabel_it: '✨ Identità Notevoli & Scomposizione',
    badgeLabel_fr: '✨ Identités Remarquables (3ème)',
    title_it: 'Le 3 Formule per Sviluppare e Fattorizzare',
    title_fr: 'Développement & Factorisation',
    summary_it: 'Formule per espandere rapidamente i quadrati di binomio e fattorizzare le differenze di quadrati.',
    summary_fr: 'Trois identités fondamentales pour développer et factoriser sans calculatrice.',
    formula: '(a+b)² = a² + 2ab + b²  |  (a-b)² = a² - 2ab + b²  |  (a-b)(a+b) = a² - b²',
    memoryTrick_it: 'Attenzione al "doppio prodotto" 2ab: non dimenticarlo mai nei quadrati di binomio!',
    memoryTrick_fr: 'Attention au double produit « 2ab » : (a+b)² n\'est PAS égal à a² + b² !',
    stepByStepGuide_it: [
      '1. (x + 3)² = x² + 2(x)(3) + 3² = x² + 6x + 9',
      '2. (2x - 5)² = (2x)² - 2(2x)(5) + 5² = 4x² - 20x + 25',
      '3. x² - 16 = (x - 4)(x + 4) (fattorizzazione)'
    ],
    stepByStepGuide_fr: [
      '1. (x + 3)² = x² + 2×x×3 + 3² = x² + 6x + 9',
      '2. (2x - 5)² = (2x)² - 2×2x×5 + 5² = 4x² - 20x + 25',
      '3. x² - 16 = (x - 4)(x + 4) (différence de deux carrés)'
    ]
  },

  kinetic_energy: {
    domain: 'kinetic_energy',
    gradeCycle: 'brevet',
    subjectKey: 'physics',
    badgeLabel_it: '⚡ Energia Cinetica & Peso/Massa (DNB)',
    badgeLabel_fr: '⚡ Énergie Cinétique & Poids/Masse (DNB)',
    title_it: 'Ec = 1/2 m v² e la Relazione P = m × g',
    title_fr: 'Mécanique : Énergie Cinétique & Gravitation',
    summary_it: 'L\'energia cinetica dipende dal quadrato della velocità: se raddoppi la velocità, l\'energia quadruplica!',
    summary_fr: 'L\'énergie cinétique est proportionnelle au carré de la vitesse : vitesse ×2 ⟹ énergie ×4 !',
    formula: 'Ec = 1/2 × m × v²  (Joules)  |  P = m × g  (Newtons)',
    memoryTrick_it: 'La massa (in kg) non cambia mai nell\'universo; il peso P (in Newton) cambia a seconda del pianeta (g)!',
    memoryTrick_fr: 'La masse m (kg) est invariante partout ; le poids P (N) dépend de la gravité du lieu (g) !',
    stepByStepGuide_it: [
      '1. Massa m SEMPRE in chilogrammi (kg).',
      '2. Velocità v SEMPRE in metri al secondo (m/s).',
      '3. Calcola v² prima di moltiplicare per la massa.',
      '4. Dividi per 2 per ottenere i Joule (J).'
    ],
    stepByStepGuide_fr: [
      '1. Convertir la masse en kg et la vitesse en m/s (÷ 3,6).',
      '2. Calculer v² en premier.',
      '3. Multiplier par m puis diviser par 2.',
      '4. Résultat en Joules (J).'
    ]
  },

  ph_scale: {
    domain: 'ph_scale',
    gradeCycle: 'brevet',
    subjectKey: 'physics',
    badgeLabel_it: '🧪 Scala del pH, Acidi & Basi (3ème)',
    badgeLabel_fr: '🧪 Échelle de pH, Acides & Bases (3ème)',
    title_it: 'Ioni H+ e HO- & Misura dell\'Acidità',
    title_fr: 'Acides, Bases et Ions H+ / HO-',
    summary_it: 'La scala del pH va da 0 a 14. Un pH < 7 è acido (eccesso di H+); pH = 7 è neutro; pH > 7 è basico (eccesso di HO-).',
    summary_fr: 'Le pH va de 0 à 14. pH < 7 = acide (ions H+) ; pH = 7 = neutre ; pH > 7 = basique (ions HO-).',
    formula: '0 ──── Acide (H+) ──── 7 ──── Basique (HO-) ──── 14',
    memoryTrick_it: 'La diluizione: aggiungendo acqua a una soluzione acida o basica, il suo pH si avvicina sempre a 7 (neutro)!',
    memoryTrick_fr: 'Effet de dilution : ajouter de l\'eau rapproche toujours le pH de la neutralité (7) !',
    stepByStepGuide_it: [
      '• Strumenti di misura: carta pH (approssimata) o pH-metro (molto preciso).',
      '• Se pH = 2 : fortemente acido (es: succo di limone, acido cloridrico).',
      '• Se pH = 7 : neutro (acqua pura).',
      '• Se pH = 12 : fortemente basico (es: candeggina, soda caustica).'
    ],
    stepByStepGuide_fr: [
      '• Papier pH (estimation couleur) ou pH-mètre (mesure électronique précise).',
      '• pH = 2 : très acide (ions hydrogène H+ majoritaires).',
      '• pH = 7 : neutre (eau pure).',
      '• pH = 12 : très basique (ions hydroxyde HO- majoritaires).'
    ]
  },

  brevet_history: {
    domain: 'brevet_history',
    gradeCycle: 'brevet',
    subjectKey: 'history',
    badgeLabel_it: '🏛️ Guerre Mondiali & Guerra Fredda (DNB)',
    badgeLabel_fr: '🏛️ Repères Historiques 3ème (Guerres & DNB)',
    title_it: 'Il XX Secolo: 1914-1918, 1939-1945 & Guerra Fredda',
    title_fr: 'Les Grandes Guerres & le XXe Siècle',
    summary_it: 'Le tappe fondamentali del programma di 3ème per ottenere il massimo dei punti nella prova di Storia.',
    summary_fr: 'Les repères chronologiques obligatoires du Diplôme National du Brevet.',
    formula: '1914-1918 (1ère GM) | 1939-1945 (2nde GM) | 1947-1991 (Guerre Froide)',
    memoryTrick_it: '18 Giugno 1940: De Gaulle lancia il celebre appello da Londra alla BBC per non arrendersi!',
    memoryTrick_fr: '18 juin 1940 = Appel du général de Gaulle à Londres à la résistance !',
    stepByStepGuide_it: [
      '• 1914-1918: Prima Guerra Mondiale (guerra di trincea, battaglia di Verdun 1916).',
      '• 11 Novembre 1918: Armistizio di Rethondes.',
      '• 18 Giugno 1940: Appello del Generale de Gaulle.',
      '• 6 Giugno 1944: Sbarco in Normandia (D-Day).',
      '• 8 Maggio 1945: Fine della guerra in Europa.'
    ],
    stepByStepGuide_fr: [
      '• 1914-1918 : Première Guerre mondiale (Verdun en 1916, génocide arménien).',
      '• 11 novembre 1918 : Armistice.',
      '• 18 juin 1940 : Appel du général de Gaulle.',
      '• 6 juin 1944 : Débarquement en Normandie.',
      '• 8 mai 1945 : Capitulation nazie en Europe.'
    ]
  },

  // ==========================================
  // 4. LYCÉE (SECONDE / BAC)
  // ==========================================
  quadratic_equations: {
    domain: 'quadratic_equations',
    gradeCycle: 'lycee',
    subjectKey: 'math',
    badgeLabel_it: '📈 Equazioni di 2° Grado & Discriminante Δ',
    badgeLabel_fr: '📈 Polynôme du 2nd Degré & Discriminant Δ',
    title_it: 'Risoluzione di ax² + bx + c = 0',
    title_fr: 'Trinôme du Second Degré & Racines',
    summary_it: 'Calcola il discriminante Δ = b² - 4ac per sapere se ci sono 0, 1 o 2 soluzioni reali.',
    summary_fr: 'Calculer le discriminant Δ = b² - 4ac pour déterminer les racines et le signe.',
    formula: 'Δ = b² - 4ac  |  x₁,₂ = (-b ± √Δ) / 2a',
    memoryTrick_it: 'Se Δ > 0: 2 radici! Se Δ = 0: 1 radice doppia (-b/2a)! Se Δ < 0: nessuna radice reale!',
    memoryTrick_fr: 'Δ > 0 : 2 racines distinctes | Δ = 0 : 1 racine double (-b/2a) | Δ < 0 : pas de racine réelle !',
    stepByStepGuide_it: [
      '1. Metti l\'equazione sotto forma normale: ax² + bx + c = 0.',
      '2. Identifica i coefficienti a, b, c.',
      '3. Calcola il discriminante: Δ = b² - 4ac.',
      '4. Se Δ > 0: calcola x₁ = (-b - √Δ) / (2a) e x₂ = (-b + √Δ) / (2a).'
    ],
    stepByStepGuide_fr: [
      '1. Écrire sous la forme canonique ax² + bx + c = 0.',
      '2. Identifier a, b et c.',
      '3. Calculer Δ = b² - 4ac.',
      '4. Si Δ > 0, calculer x₁ = (-b - √Δ) / (2a) et x₂ = (-b + √Δ) / (2a).'
    ]
  },

  vectors_plane: {
    domain: 'vectors_plane',
    gradeCycle: 'lycee',
    subjectKey: 'math',
    badgeLabel_it: '🧭 Vettori nel Piano & Collinearità (Lycée)',
    badgeLabel_fr: '🧭 Vecteurs dans le Plan & Colinéarité (2nde)',
    title_it: 'Coordinate di Vettori & Rette Parallele',
    title_fr: 'Vecteurs & Condition de Colinéarité',
    summary_it: 'Il vettore AB ha coordinate (xB - xA ; yB - yA). Due vettori sono collineari se xy\' - x\'y = 0.',
    summary_fr: 'Le vecteur AB a pour coordonnées (xB - xA, yB - yA). Colinéaires si det(u, v) = 0.',
    formula: 'AB(xB - xA ; yB - yA)  |  u(x, y) et v(x\', y\') colinéaires ⟺ xy\' - x\'y = 0',
    memoryTrick_it: 'Attenzione all\'ordine: sempre COORDINATE DI ARRIVO MENO PARTENZA (B meno A)!',
    memoryTrick_fr: 'Règle d\'or : Toujours « Point d\'arrivée moins point de départ » : (xB - xA ; yB - yA) !',
    stepByStepGuide_it: [
      '1. Calcola xAB = xB - xA e yAB = yB - yA.',
      '2. Norma del vettore: ||AB|| = √((xB - xA)² + (yB - yA)²).',
      '3. Test di collinearità (rette parallele): calcola xy\' - x\'y.'
    ],
    stepByStepGuide_fr: [
      '1. Calculer xAB = xB - xA et yAB = yB - yA.',
      '2. Norme de AB : ||AB|| = √((xB - xA)² + (yB - yA)²).',
      '3. Tester la colinéarité en calculant xy\' - x\'y = 0.'
    ]
  },

  mole_chemistry: {
    domain: 'mole_chemistry',
    gradeCycle: 'lycee',
    subjectKey: 'physics',
    badgeLabel_it: '🧪 La Mole & Quantità di Materia (Lycée)',
    badgeLabel_fr: '🧪 La Mole & Quantité de Matière (Lycée)',
    title_it: 'La Mole (mol), Massa Molare & Concentrazione',
    title_fr: 'Quantité de Matière : n = m / M',
    summary_it: 'Una mole contiene il numero di Avogadro di entità (NA = 6,022 × 10²³).',
    summary_fr: 'La mole est l\'unité de quantité de matière (NA = 6,022 × 10²³ entités par mole).',
    formula: 'n = m / M  (mol)  |  C = n / V  (mol/L)  |  Cm = m / V  (g/L)',
    memoryTrick_it: 'Formula a triangolo: m in alto, n e M in basso: m = n × M !',
    memoryTrick_fr: 'Le triangle magique : m en haut, n et M en bas ⟹ m = n × M !',
    stepByStepGuide_it: [
      '1. Massa m in grammi (g).',
      '2. Massa molare M in g/mol (dalla tavola periodica).',
      '3. Quantità di materia n in moli (mol).',
      '4. Concentrazione molare: C = n / V (con V in Litri).'
    ],
    stepByStepGuide_fr: [
      '1. Masse m en grammes (g).',
      '2. Masse molaire M en g/mol (tableau périodique).',
      '3. Calculer n = m / M.',
      '4. Concentration molaire C = n / V avec V en litres.'
    ]
  },

  general_study: {
    domain: 'general_study',
    subjectKey: 'general',
    badgeLabel_it: '🌻 Metodo di Studio Attivo',
    badgeLabel_fr: '🌻 Méthode de Travail Active',
    title_it: 'Concentrazione & Metodo Pomodoro (25 + 5)',
    title_fr: 'Concentration & Technique Pomodoro (25 + 5)',
    summary_it: 'Studia con blocchi mirati di concentrazione senza distrazioni, alternati a pause rigeneranti.',
    summary_fr: 'Travaillez par sessions ciblées sans aucune interruption, puis accordez-vous une pause.',
    formula: 'Focus + Pause = Mémorisation Maximale',
    memoryTrick_it: 'Scrivi schemi a mano o rispondi a voce alta per fissare le informazioni nella memoria a lungo termine.',
    memoryTrick_fr: 'Mémoire active : écrivez des fiches ou récitez la leçon à voix haute.',
    stepByStepGuide_it: [
      '1. Chiudi tutte le schede del browser non necessarie e metti via il telefono.',
      '2. Prepara sul tavolo solo il quaderno e il libro.',
      '3. Avvia il cronometro della sessione.',
      '4. A fine sessione riposati 5 minuti.'
    ],
    stepByStepGuide_fr: [
      '1. Éloigner toute source de distraction.',
      '2. Préparer le cahier et la trousse sur le bureau.',
      '3. Lancer le chronomètre de Tournesol.',
      '4. Faire 5 minutes de pause à la sonnerie.'
    ]
  }
};

/**
 * Intelligent topic classifier tailored to the student's grade cycle
 */
export function detectPedagogicalDomain(
  title: string, 
  description: string = '', 
  subject: string = '',
  gradeCycle: GradeCycle = 'college'
): PedagogicalDomain {
  const combined = `${title} ${description} ${subject}`.toLowerCase();

  // 1. PRIMAIRE CYCLE 3
  if (gradeCycle === 'primaire') {
    if (combined.match(/fraction|demi|quart|tiers/)) return 'primaire_fractions';
    if (combined.match(/homophone|a\/à|et\/est|son\/sont|on\/ont|orthographe/)) return 'primaire_homophones';
    if (combined.match(/conjug|pr[ée]sent|futur|verbe|imparfait/)) return 'primaire_verbes';
    if (combined.match(/eau|cycle|mati[èe]re|solide|liquide|plan[èe]te|science/)) return 'primaire_sciences';
    if (combined.match(/math|calcul|table|p[ée]rim[èe]tre|multiplic/)) return 'primaire_math_ops';
  }

  // 2. 3ÈME BREVET
  if (gradeCycle === 'brevet') {
    if (combined.match(/thal[èe]s|papillon|parall[èe]le/)) return 'thales';
    if (combined.match(/trigo|cosinus|sinus|tangente|cah|soh|toa|angle/)) return 'trigonometry';
    if (combined.match(/affine|lin[ée]aire|f\(x\)|fonction|droite|pente|ant[ée]c[ée]dent/)) return 'affine_functions';
    if (combined.match(/identit[ée]|remarquable|\(a\+b\)|d[ée]velopp|factoris/)) return 'identites_remarquables';
    if (combined.match(/cin[ée]tique|1\/2\s*m|joule|p = m|gravit/)) return 'kinetic_energy';
    if (combined.match(/ph|acide|base|neutre|h\+|ho\-/)) return 'ph_scale';
    if (combined.match(/guerre|1914|1918|1939|1945|de gaulle|verdun|d-day|brevet/)) return 'brevet_history';
  }

  // 3. LYCÉE
  if (gradeCycle === 'lycee') {
    if (combined.match(/second degr[ée]|delta|discriminant|racine|polyn[ôo]me|ax\^2/)) return 'quadratic_equations';
    if (combined.match(/vecteur|colin[ée]aire|norme|coordonn[ée]es/)) return 'vectors_plane';
    if (combined.match(/mole|quantit[ée] de mati[èe]re|molaire|avogadro|concentration/)) return 'mole_chemistry';
  }

  // 4. COLLÈGE 5e/4e & GENERAL STEM
  if (combined.match(/pythagor|hypot[ée]nuse|triangle rectangle/)) return 'pythagoras';
  if (combined.match(/thal[èe]s/)) return 'thales';
  if (combined.match(/trigo|cosinus/)) return 'trigonometry';
  if (combined.match(/puissance|exposant|scientifique|racine carr[ée]e|10\^/)) return 'powers_roots';
  if (combined.match(/fraction|d[ée]nominateur|num[ée]rateur/)) return 'fractions';
  if (combined.match(/[ée]quation|inconnue|2x|3x/)) return 'equations';
  if (combined.match(/pourcentage|proportion|produit en croix/)) return 'proportions';
  if (combined.match(/subjonctif|pass[ée] simple|futur simple|conjug/)) return 'french_conjugation';
  if (combined.match(/accord.*participe|participe pass[ée]|auxiliaire/)) return 'french_accord';
  if (combined.match(/connecteur|argument|r[ée]daction|dissertation/)) return 'french_connectors';
  if (combined.match(/ohm|u = r|tension|volt|r[ée]sistance|intensit[ée]|amp[èe]re/)) return 'ohms_law';
  if (combined.match(/atome|ion|mol[ée]cule|chimie/)) return 'atoms_ions';
  if (combined.match(/vitesse|mouvement|km\/h|m\/s/)) return 'speed_motion';
  if (combined.match(/r[ée]volution|1789|bastille|ddhc/)) return 'french_revolution';
  if (combined.match(/industri|vapeur|charbon|usine|bourgeoisie/)) return 'industrial_revolution';
  if (combined.match(/scratch|algorithme|python|boucle/)) return 'scratch_algorithms';

  // Cycle fallback
  if (gradeCycle === 'primaire') return 'primaire_math_ops';
  if (gradeCycle === 'brevet') return 'thales';
  if (gradeCycle === 'lycee') return 'quadratic_equations';

  return 'general_study';
}

/**
 * Returns the smart study aid for an active homework item and grade cycle
 */
export function getSmartStudyAid(homework: HomeworkItem | null, gradeCycle: GradeCycle = 'college'): SmartStudyAid {
  if (!homework) {
    if (gradeCycle === 'primaire') return SMART_STUDY_AIDS.primaire_math_ops;
    if (gradeCycle === 'brevet') return SMART_STUDY_AIDS.thales;
    if (gradeCycle === 'lycee') return SMART_STUDY_AIDS.quadratic_equations;
    return SMART_STUDY_AIDS.general_study;
  }
  const domain = detectPedagogicalDomain(homework.title, homework.description, homework.subject, gradeCycle);
  return SMART_STUDY_AIDS[domain] || SMART_STUDY_AIDS.general_study;
}
