import { 
  ParametricQuizQuestion, 
  QuizMistakeRecord, 
  PedagogicalDomain, 
  GradeCycle, 
  FrenchGradeLevel, 
  QuizDifficultyLevel 
} from '../types';

const MISTAKES_STORAGE_KEY = 'tournesol_quiz_mistakes';

// Standard Pythagorean integer triples (a, b, c) where a² + b² = c²
const PYTHAGOREAN_TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [9, 40, 41],
  [20, 21, 29]
];

function shuffleOptions(correctOpt: string, distractors: string[]): { options: string[]; correctIndex: number } {
  // Deduplicate distractors and exclude the correct option
  const uniqueDistractors: string[] = [];
  const seen = new Set<string>([correctOpt.trim()]);

  for (const d of distractors) {
    const trimmed = (d || '').trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      uniqueDistractors.push(trimmed);
    }
  }

  // If fewer than 3 unique distractors, synthesize alternatives
  let fallbackCounter = 1;
  while (uniqueDistractors.length < 3) {
    // Check if correctOpt ends with a unit or number
    const numMatch = correctOpt.match(/^([+-]?\d+(?:,\d+)?)(.*)$/);
    let fallback = '';
    if (numMatch) {
      const baseNum = parseFloat(numMatch[1].replace(',', '.'));
      const unit = numMatch[2] || '';
      fallback = `${(baseNum + fallbackCounter * 2).toFixed(1).replace('.0', '').replace('.', ',')}${unit}`;
    } else {
      fallback = `Autre option ${fallbackCounter}`;
    }

    if (!seen.has(fallback)) {
      seen.add(fallback);
      uniqueDistractors.push(fallback);
    }
    fallbackCounter++;
  }

  const all = [correctOpt, ...uniqueDistractors.slice(0, 3)];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    options: all,
    correctIndex: all.indexOf(correctOpt)
  };
}

export interface QuizGenerationOptions {
  gradeLevel?: FrenchGradeLevel;
  gradeCycle?: GradeCycle;
  difficulty?: QuizDifficultyLevel;
  subject?: string;
  count?: number;
}

export class ParametricQuizEngine {

  // =========================================================================
  // 1. CM1 (9 ANS - CYCLE 3 FONDAMENTAUX)
  // =========================================================================

  public generateCM1Easy(): ParametricQuizQuestion {
    const a = Math.floor(Math.random() * 5) + 3; // 3 to 7
    const b = Math.floor(Math.random() * 6) + 3; // 3 to 8
    const prod = a * b;
    const { options, correctIndex } = shuffleOptions(`${prod}`, [`${prod + a}`, `${prod - b}`, `${prod + 10}`]);

    return {
      id: `cm1-easy-math-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_math_ops',
      gradeCycle: 'primaire',
      gradeLevel: 'cm1',
      subject: 'Maths',
      subject_it: 'Matematica CM1 (4ª Elementare)',
      subject_fr: 'Mathématiques CM1',
      difficulty: 'easy',
      question_it: `Calcolo mentale: quanto fa ${a} × ${b} ?`,
      question_fr: `Calcul mental : combien font ${a} × ${b} ?`,
      options,
      correctIndex,
      formula: `${a} × ${b} = ${prod}`,
      explanation_it: `Tabellina del ${a}: ${a} moltiplicato per ${b} dà esattamente ${prod}.`,
      explanation_fr: `Table de multiplication : ${a} × ${b} = ${prod}.`
    };
  }

  public generateCM1Medium(): ParametricQuizQuestion {
    const isMath = Math.random() > 0.4;
    if (isMath) {
      const L = Math.floor(Math.random() * 5) + 6; // 6 to 10
      const l = Math.floor(Math.random() * 3) + 3; // 3 to 5
      const P = 2 * (L + l);
      const { options, correctIndex } = shuffleOptions(`${P} cm`, [`${L + l} cm`, `${L * l} cm`, `${P + 4} cm`]);

      return {
        id: `cm1-med-geom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        domain: 'primaire_math_ops',
        gradeCycle: 'primaire',
        gradeLevel: 'cm1',
        subject: 'Maths',
        subject_it: 'Geometria CM1',
        subject_fr: 'Géométrie CM1',
        difficulty: 'medium',
        question_it: `Un rettangolo ha Lunghezza L = ${L} cm e larghezza l = ${l} cm. Qual è il suo perimetro?`,
        question_fr: `Un rectangle a pour Longueur L = ${L} cm et largeur l = ${l} cm. Quel est son périmètre ?`,
        options,
        correctIndex,
        formula: `P = 2 × (L + l) = 2 × (${L} + ${l}) = ${P} cm`,
        explanation_it: `Il perimetro è il giro completo della figura: 2 volte la somma di Lunghezza e larghezza.`,
        explanation_fr: `Le périmètre est le tour complet : 2 × (L + l) = ${P} cm.`,
        trapWarning_it: `Attenzione: non calcolare l'area (${L * l} cm²), ma il contorno!`,
        trapWarning_fr: `Ne confondez pas le périmètre (en cm) avec l'aire (en cm²) !`
      };
    } else {
      const { options, correctIndex } = shuffleOptions('est', ['et', 'ai', 'es']);
      return {
        id: `cm1-med-gram-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        domain: 'primaire_homophones',
        gradeCycle: 'primaire',
        gradeLevel: 'cm1',
        subject: 'Français',
        subject_it: 'Grammatica CM1 (Omofoni)',
        subject_fr: 'Orthographe CM1 (et / est)',
        difficulty: 'medium',
        question_it: `Completa la frase : "Le cartable de Lucas ______ très lourd."`,
        question_fr: `Complétez la phrase : "Le cartable de Lucas ______ très lourd."`,
        options,
        correctIndex,
        formula: `Astuce : remplacer par "était" → Le cartable ÉTAIT très lourd.`,
        explanation_it: `Si scrive "est" (verbo essere) perché si può sostituire con l'imperfetto "était". "Et" serve solo a unire due elementi ("e").`,
        explanation_fr: `On écrit "est" (verbe être) car on peut dire "était très lourd". "Et" est une conjonction de coordination ("et puis").`
      };
    }
  }

  public generateCM1Hard(): ParametricQuizQuestion {
    const thousands = Math.floor(Math.random() * 5) + 2; // 2 to 6
    const hundreds = Math.floor(Math.random() * 7) + 2;  // 2 to 8
    const total = thousands * 1000 + hundreds;
    const { options, correctIndex } = shuffleOptions(`${total}`, [`${thousands * 100 + hundreds}`, `${thousands * 10000 + hundreds}`, `${thousands}${hundreds}`]);

    return {
      id: `cm1-hard-num-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_math_ops',
      gradeCycle: 'primaire',
      gradeLevel: 'cm1',
      subject: 'Maths',
      subject_it: 'Grandi Numeri CM1 (Sfida)',
      subject_fr: 'Numération CM1 (Décomposition)',
      difficulty: 'hard',
      question_it: `A quale numero corrisponde : ${thousands} migliaia e ${hundreds} unità ?`,
      question_fr: `À quel nombre correspond : ${thousands} milliers et ${hundreds} unités ?`,
      options,
      correctIndex,
      formula: `(${thousands} × 1000) + ${hundreds} = ${total}`,
      explanation_it: `Non dimenticare gli zeri nelle colonne delle centinaia e delle decine: ${thousands} 000 + ${hundreds} = ${total}.`,
      explanation_fr: `Attention aux zéros intercalés dans les centaines et dizaines : ${thousands} 000 + ${hundreds} = ${total}.`,
      trapWarning_it: `Trabocchetto frequente: dimenticare lo zero per le centinaia e le decine mancanti!`,
      trapWarning_fr: `Piège classique : oublier les zéros dans les colonnes vides du tableau de numération !`
    };
  }

  // =========================================================================
  // 2. CM2 (10 ANS - CYCLE 3 CONSOLIDATION & TRANSIZIONE)
  // =========================================================================

  public generateCM2Easy(): ParametricQuizQuestion {
    const intA = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const decA = Math.floor(Math.random() * 7) + 2; // 2 to 8
    const intB = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const decB = Math.floor(Math.random() * 5) + 1; // 1 to 5
    const sum = ((intA * 10 + decA) + (intB * 10 + decB)) / 10;
    const valA = `${intA},${decA}`;
    const valB = `${intB},${decB}`;
    const correct = `${sum}`.replace('.', ',');
    const { options, correctIndex } = shuffleOptions(correct, [`${sum + 1}`.replace('.', ','), `${sum - 0.2}`.replace('.', ','), `${intA + intB},${decA * decB}`]);

    return {
      id: `cm2-easy-dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_math_ops',
      gradeCycle: 'primaire',
      gradeLevel: 'cm2',
      subject: 'Maths',
      subject_it: 'Numeri Decimali CM2',
      subject_fr: 'Nombres Décimaux CM2',
      difficulty: 'easy',
      question_it: `Calcola : ${valA} + ${valB} = ?`,
      question_fr: `Calculez : ${valA} + ${valB} = ?`,
      options,
      correctIndex,
      formula: `${valA} + ${valB} = ${correct}`,
      explanation_it: `Somma prima la parte intera e poi quella decimale allineando la virgola: ${correct}.`,
      explanation_fr: `Alignez bien les virgules pour additionner la partie entière et la partie décimale : ${correct}.`
    };
  }

  public generateCM2Medium(): ParametricQuizQuestion {
    const fractions = [
      { fr: '1/2', dec: '0,5', name: 'un demi' },
      { fr: '1/4', dec: '0,25', name: 'un quart' },
      { fr: '3/4', dec: '0,75', name: 'trois quarts' },
      { fr: '1/10', dec: '0,1', name: 'un dixième' }
    ];
    const picked = fractions[Math.floor(Math.random() * fractions.length)];
    const { options, correctIndex } = shuffleOptions(picked.dec, ['0,2', '0,4', '0,7', '1,25']);

    return {
      id: `cm2-med-frac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_fractions',
      gradeCycle: 'primaire',
      gradeLevel: 'cm2',
      subject: 'Maths',
      subject_it: 'Frazioni e Decimali CM2',
      subject_fr: 'Fractions & Décimaux CM2',
      difficulty: 'medium',
      question_it: `Qual è la scrittura decimale della frazione ${picked.fr} (${picked.name}) ?`,
      question_fr: `Quelle est l'écriture décimale de la fraction ${picked.fr} (${picked.name}) ?`,
      options,
      correctIndex,
      formula: `${picked.fr} = ${picked.dec}`,
      explanation_it: `La frazione ${picked.fr} corrisponde a dividere il numeratore per il denominatore: ${picked.dec}.`,
      explanation_fr: `Diviser le numérateur par le dénominateur donne l'écriture décimale : ${picked.fr} = ${picked.dec}.`
    };
  }

  public generateCM2Hard(): ParametricQuizQuestion {
    const base = Math.floor(Math.random() * 4) + 4; // 4 to 7
    const height = (Math.floor(Math.random() * 3) + 2) * 2; // 4, 6, 8 (even)
    const area = (base * height) / 2;
    const { options, correctIndex } = shuffleOptions(`${area} cm²`, [`${base * height} cm²`, `${base + height} cm²`, `${area + 4} cm²`]);

    return {
      id: `cm2-hard-tri-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_math_ops',
      gradeCycle: 'primaire',
      gradeLevel: 'cm2',
      subject: 'Maths',
      subject_it: 'Area del Triangolo Rettangolo CM2',
      subject_fr: 'Aire du Triangle Rectangle CM2',
      difficulty: 'hard',
      question_it: `Qual è l'area di un triangolo rettangolo con i due lati dell'angolo retto di base b = ${base} cm e altezza h = ${height} cm ?`,
      question_fr: `Quelle est l'aire d'un triangle rectangle de base b = ${base} cm et hauteur h = ${height} cm ?`,
      options,
      correctIndex,
      formula: `Aire = (base × hauteur) ÷ 2 = (${base} × ${height}) ÷ 2 = ${base * height} ÷ 2 = ${area} cm²`,
      explanation_it: `Un triangolo rettangolo è la metà esatta di un rettangolo: moltiplica base per altezza e dividi per 2!`,
      explanation_fr: `Un triangle rectangle est un demi-rectangle : formule = (b × h) ÷ 2 = ${area} cm².`,
      trapWarning_it: `Trabocchetto frequente: dimenticare di dividere per 2 (calcolando l'area dell'intero rettangolo)!`,
      trapWarning_fr: `Piège classique : oublier de diviser par 2 à la fin !`
    };
  }

  // =========================================================================
  // 3. 6ÈME (11 ANS - ENTRATA AL COLLÈGE & CYCLE 3 ADAPTATION)
  // =========================================================================

  public generate6emeEasy(): ParametricQuizQuestion {
    const a = Math.floor(Math.random() * 6) + 3; // 3 to 8
    const b = Math.floor(Math.random() * 5) + 2; // 2 to 6
    const c = Math.floor(Math.random() * 4) + 3; // 3 to 6
    const res = a + b * c; // b * c first
    const wrongNoPriority = (a + b) * c;
    const { options, correctIndex } = shuffleOptions(`${res}`, [`${wrongNoPriority}`, `${a * b + c}`, `${res + 5}`]);

    return {
      id: `6e-easy-priorities-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_math_ops',
      gradeCycle: 'college',
      gradeLevel: '6eme',
      subject: 'Maths',
      subject_it: 'Priorità delle Operazioni 6ème',
      subject_fr: 'Priorités Opératoires 6ème',
      difficulty: 'easy',
      question_it: `Calcola rispettando le priorità operative : ${a} + ${b} × ${c} = ?`,
      question_fr: `Calculez en respectant les priorités : ${a} + ${b} × ${c} = ?`,
      options,
      correctIndex,
      formula: `${b} × ${c} = ${b * c} puis ${a} + ${b * c} = ${res}`,
      explanation_it: `La moltiplicazione ha sempre la precedenza sull'addizione: si calcola prima ${b} × ${c} = ${b * c}, poi si somma ${a}.`,
      explanation_fr: `La multiplication est prioritaire sur l'addition : on calcule ${b} × ${c} = ${b * c}, puis ${a} + ${b * c} = ${res}.`,
      trapWarning_it: `Non calcolare da sinistra a destra (${a} + ${b} = ${a + b} × ${c} = ${wrongNoPriority})!`,
      trapWarning_fr: `Ne calculez pas de gauche à droite sans priorité !`
    };
  }

  public generate6emeMedium(): ParametricQuizQuestion {
    const angles = [
      { deg: '42°', type_fr: 'Angle aigu (< 90°)', type_it: 'Angolo acuto (< 90°)' },
      { deg: '90°', type_fr: 'Angle droit (= 90°)', type_it: 'Angolo retto (= 90°)' },
      { deg: '125°', type_fr: 'Angle obtus (> 90° et < 180°)', type_it: 'Angolo ottuso (> 90° e < 180°)' },
      { deg: '180°', type_fr: 'Angle plat (= 180°)', type_it: 'Angolo piatto (= 180°)' }
    ];
    const picked = angles[Math.floor(Math.random() * angles.length)];
    const correct = picked.type_fr;
    const distractors = angles.filter(a => a.type_fr !== correct).map(a => a.type_fr);
    const { options, correctIndex } = shuffleOptions(correct, distractors);

    return {
      id: `6e-med-angles-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'general_study',
      gradeCycle: 'college',
      gradeLevel: '6eme',
      subject: 'Maths',
      subject_it: 'Classificazione degli Angoli 6ème',
      subject_fr: 'Vocabulaire des Angles 6ème',
      difficulty: 'medium',
      question_it: `Come si classifica un angolo la cui misura è ${picked.deg} ?`,
      question_fr: `Comment qualifie-t-on un angle dont la mesure est ${picked.deg} ?`,
      options,
      correctIndex,
      explanation_it: `Un angolo di ${picked.deg} è un ${picked.type_it}.`,
      explanation_fr: `Rappel de 6ème : aigu (<90°), droit (=90°), obtus (>90° et <180°), plat (=180°).`
    };
  }

  public generate6emeHard(): ParametricQuizQuestion {
    const initialPrice = [30, 40, 50, 60, 80][Math.floor(Math.random() * 5)];
    const discountPercent = 20;
    const discountAmount = (initialPrice * discountPercent) / 100;
    const finalPrice = initialPrice - discountAmount;
    const { options, correctIndex } = shuffleOptions(`${finalPrice} €`, [`${initialPrice - 20} €`, `${discountAmount} €`, `${finalPrice + 4} €`]);

    return {
      id: `6e-hard-percent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'proportions',
      gradeCycle: 'college',
      gradeLevel: '6eme',
      subject: 'Maths',
      subject_it: 'Percentuali e Sconti 6ème (Sfida)',
      subject_fr: 'Pourcentages & Réduction 6ème',
      difficulty: 'hard',
      question_it: `Un maglione costa ${initialPrice} €. Durante i saldi c'è uno sconto del ${discountPercent}%. Qual è il prezzo scontato finale?`,
      question_fr: `Un pull coûte ${initialPrice} €. En soldes, il bénéficie d'une réduction de ${discountPercent}%. Quel est son nouveau prix ?`,
      options,
      correctIndex,
      formula: `Réduction = ${initialPrice} × 0,20 = ${discountAmount} € → Prix = ${initialPrice} - ${discountAmount} = ${finalPrice} €`,
      explanation_it: `Calcola il 20% di ${initialPrice} €: ${discountAmount} €. Poi sottrai dallo prezzo iniziale: ${initialPrice} - ${discountAmount} = ${finalPrice} €.`,
      explanation_fr: `20% de ${initialPrice} font ${discountAmount} €. Le prix final est donc ${initialPrice} - ${discountAmount} = ${finalPrice} €.`,
      trapWarning_it: `Non confondere il valore dello sconto (${discountAmount} €) con il prezzo da pagare alla cassa (${finalPrice} €)!`,
      trapWarning_fr: `Ne confondez pas le montant de la remise (${discountAmount} €) et le prix final à payer !`
    };
  }

  // =========================================================================
  // 4. 5ÈME (12 ANS - CYCLE 4 DÉBUT, RELATIFS & SOMME DES ANGLES)
  // =========================================================================

  public generate5emeEasy(): ParametricQuizQuestion {
    const negA = -(Math.floor(Math.random() * 6) + 4); // -4 to -9
    const negB = -(Math.floor(Math.random() * 3) + 1); // -1 to -3
    // negB is greater than negA (e.g. -2 > -7)
    const { options, correctIndex } = shuffleOptions(`${negB}`, [`${negA}`, 'Ils sont égaux', 'Impossible à comparer']);

    return {
      id: `5e-easy-rel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_math_ops',
      gradeCycle: 'college',
      gradeLevel: '5eme',
      subject: 'Maths',
      subject_it: 'Confronto di Numeri Relativi 5ème',
      subject_fr: 'Comparaison de Nombres Relatifs 5ème',
      difficulty: 'easy',
      question_it: `Qual è il numero più grande (maggiore) tra ${negA} e ${negB} ?`,
      question_fr: `Quel est le plus grand nombre entre ${negA} et ${negB} ?`,
      options,
      correctIndex,
      formula: `${negB} > ${negA} (car ${negB} est plus proche de 0)`,
      explanation_it: `Tra due numeri negativi, il più grande è sempre quello più vicino allo zero: ${negB} > ${negA}.`,
      explanation_fr: `Entre deux nombres négatifs, le plus grand est celui qui a la plus petite distance à zéro : ${negB} > ${negA}.`,
      trapWarning_it: `Attenzione: con i negativi le grandezze si invertono rispetto ai numeri positivi!`,
      trapWarning_fr: `Attention : pour les négatifs, c'est l'inverse des positifs ! -1 est plus chaud que -10 !`
    };
  }

  public generate5emeMedium(): ParametricQuizQuestion {
    const angleA = Math.floor(Math.random() * 20) + 40; // 40 to 60
    const angleB = Math.floor(Math.random() * 25) + 50; // 50 to 75
    const angleC = 180 - (angleA + angleB);
    const { options, correctIndex } = shuffleOptions(`${angleC}°`, [`${angleC + 10}°`, `${angleA + angleB}°`, `${180 - angleA}°`]);

    return {
      id: `5e-med-triangle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'general_study',
      gradeCycle: 'college',
      gradeLevel: '5eme',
      subject: 'Maths',
      subject_it: 'Somma degli Angoli nel Triangolo 5ème',
      subject_fr: 'Somme des Angles d\'un Triangle 5ème',
      difficulty: 'medium',
      question_it: `In un triangolo ABC, l'angolo Â misura ${angleA}° e l'angolo B̂ misura ${angleB}°. Quanto misura l'angolo Ĉ ?`,
      question_fr: `Dans un triangle ABC, l'angle Â = ${angleA}° et l'angle B̂ = ${angleB}°. Combien mesure l'angle Ĉ ?`,
      options,
      correctIndex,
      formula: `Â + B̂ + Ĉ = 180° → Ĉ = 180° - (${angleA}° + ${angleB}°) = 180° - ${angleA + angleB}° = ${angleC}°`,
      explanation_it: `In qualsiasi triangolo la somma dei tre angoli è sempre uguale a 180°. Quindi Ĉ = 180 - ${angleA + angleB} = ${angleC}°.`,
      explanation_fr: `Propriété clé de 5ème : la somme des 3 angles d'un triangle vaut toujours 180°.`
    };
  }

  public generate5emeHard(): ParametricQuizQuestion {
    const a = Math.floor(Math.random() * 5) + 3; // 3 to 7
    const b = Math.floor(Math.random() * 6) + 2; // 2 to 7
    const prod = a * b;
    const { options, correctIndex } = shuffleOptions(`+${prod}`, [`-${prod}`, `${-(a + b)}`, `+${a + b}`]);

    return {
      id: `5e-hard-signs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'primaire_math_ops',
      gradeCycle: 'college',
      gradeLevel: '5eme',
      subject: 'Maths',
      subject_it: 'Regola dei Segni 5ème (Sfida)',
      subject_fr: 'Règle des Signes (Multiplication) 5ème',
      difficulty: 'hard',
      question_it: `Calcola il prodotto con numeri relativi : (-${a}) × (-${b}) = ?`,
      question_fr: `Calculez : (-${a}) × (-${b}) = ?`,
      options,
      correctIndex,
      formula: `(-) × (-) = (+) → (-${a}) × (-${b}) = +${prod}`,
      explanation_it: `Il prodotto di due numeri negativi (stesso segno) dà sempre un risultato POSITIVO: +${prod}.`,
      explanation_fr: `Règle des signes : le produit de deux nombres de même signe est toujours positif. Moins par moins donne plus !`,
      trapWarning_it: `Non confondere la moltiplicazione (-a × -b = +) con l'addizione (-a + -b = -)!`,
      trapWarning_fr: `Ne confondez pas la multiplication (- × - = +) avec l'addition de deux dettes !`
    };
  }

  // =========================================================================
  // 5. 4ÈME (13 ANS - THÉORÈME DE PYTHAGORE, LOI D'OHM, SUBJONCTIF)
  // =========================================================================

  public generate4emeEasy(): ParametricQuizQuestion {
    const triple = PYTHAGOREAN_TRIPLES[Math.floor(Math.random() * 3)]; // 3-4-5, 5-12-13, 8-15-17
    const [a, b, c] = triple;
    const { options, correctIndex } = shuffleOptions(`${c} cm`, [`${a + b} cm`, `${c + 2} cm`, `${c * 2} cm`]);

    return {
      id: `4e-easy-pyth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'pythagoras',
      gradeCycle: 'college',
      gradeLevel: '4eme',
      subject: 'Maths',
      subject_it: 'Teorema di Pitagora Diretto (Ipotenusa)',
      subject_fr: 'Théorème de Pythagore Direct',
      difficulty: 'easy',
      question_it: `Un triangolo rettangolo ha i cateti di ${a} cm e ${b} cm. Quanto misura l'ipotenusa?`,
      question_fr: `Dans un triangle rectangle, les deux côtés de l'angle droit mesurent ${a} cm et ${b} cm. Combien mesure l'hypoténuse ?`,
      options,
      correctIndex,
      formula: `BC² = AB² + AC² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} → BC = √${c * c} = ${c} cm`,
      explanation_it: `Applica il teorema di Pitagora: ${a}² + ${b}² = ${a * a + b * b} = ${c}². L'ipotenusa misura ${c} cm.`,
      explanation_fr: `D'après le théorème de Pythagore : le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés. Donc BC = ${c} cm.`
    };
  }

  public generate4emeMedium(): ParametricQuizQuestion {
    const isPhysics = Math.random() > 0.5;
    if (isPhysics) {
      const R = [10, 20, 50, 100][Math.floor(Math.random() * 4)];
      const I = [0.2, 0.5, 2][Math.floor(Math.random() * 3)];
      const U = R * I;
      const { options, correctIndex } = shuffleOptions(`${U} V`, [`${R + I} V`, `${R / I} V`, `${U * 2} V`]);

      return {
        id: `4e-med-ohm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        domain: 'ohms_law',
        gradeCycle: 'college',
        gradeLevel: '4eme',
        subject: 'Sciences',
        subject_it: 'Legge di Ohm U = R × I',
        subject_fr: 'Loi d\'Ohm (U = R × I)',
        difficulty: 'medium',
        question_it: `Un resistore di resistenza R = ${R} Ω è attraversato da una corrente I = ${I} A. Qual è la tensione U ai suoi capi?`,
        question_fr: `Un conducteur ohmique de résistance R = ${R} Ω est traversé par un courant d'intensité I = ${I} A. Quelle est la tension U à ses bornes ?`,
        options,
        correctIndex,
        formula: `U = R × I = ${R} × ${I} = ${U} V`,
        explanation_it: `Legge di Ohm fondamentale: U = R × I = ${R} × ${I} = ${U} Volt.`,
        explanation_fr: `La tension U (en Volts) est égale au produit de la résistance R (en Ohms) par l'intensité I (en Ampères) : U = ${U} V.`
      };
    } else {
      const triple = PYTHAGOREAN_TRIPLES[Math.floor(Math.random() * 3)];
      const [a, b, c] = triple;
      // Calculate missing side b: b² = c² - a²
      const { options, correctIndex } = shuffleOptions(`${b} cm`, [`${c - a} cm`, `${Math.round(Math.sqrt(c * c + a * a))} cm`, `${b + 1} cm`]);

      return {
        id: `4e-med-pyth-side-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        domain: 'pythagoras',
        gradeCycle: 'college',
        gradeLevel: '4eme',
        subject: 'Maths',
        subject_it: 'Pitagora: Calcolo di un Cateto 4ème',
        subject_fr: 'Pythagore : Calcul d\'un côté de l\'angle droit',
        difficulty: 'medium',
        question_it: `In un triangolo rettangolo, l'ipotenusa misura ${c} cm e un cateto misura ${a} cm. Quanto misura l'altro cateto?`,
        question_fr: `Dans un triangle rectangle, l'hypoténuse mesure ${c} cm et un côté de l'angle droit mesure ${a} cm. Combien mesure l'autre côté ?`,
        options,
        correctIndex,
        formula: `AC² = BC² - AB² = ${c}² - ${a}² = ${c * c} - ${a * a} = ${b * b} → AC = ${b} cm`,
        explanation_it: `Per trovare un cateto, si SOTTRAE: ipotenusa² - cateto² = ${c * c} - ${a * a} = ${b * b}, quindi il lato misura ${b} cm.`,
        explanation_fr: `Pour calculer un côté de l'angle droit, on soustrait : BC² - AB² = ${b * b}, donc AC = ${b} cm.`,
        trapWarning_it: `Non sommare i quadrati! L'ipotenusa è già il lato più lungo: bisogna fare una sottrazione!`,
        trapWarning_fr: `Piège classique : additionner au lieu de soustraire le carré de l'hypoténuse !`
      };
    }
  }

  public generate4emeHard(): ParametricQuizQuestion {
    // Equation of 1st degree: ax + b = c
    const a = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const x = Math.floor(Math.random() * 7) + 2; // 2 to 8
    const b = Math.floor(Math.random() * 6) + 1; // 1 to 6
    const c = a * x + b;
    const { options, correctIndex } = shuffleOptions(`x = ${x}`, [`x = ${x + 1}`, `x = ${c - b}`, `x = ${Math.round((c + b) / a)}`]);

    return {
      id: `4e-hard-eq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'equations',
      gradeCycle: 'college',
      gradeLevel: '4eme',
      subject: 'Maths',
      subject_it: 'Risoluzione di Equazioni 4ème (Sfida)',
      subject_fr: 'Résolution d\'Équation du 1er degré 4ème',
      difficulty: 'hard',
      question_it: `Risolvi l'equazione : ${a}x + ${b} = ${c}`,
      question_fr: `Résolvez l'équation : ${a}x + ${b} = ${c}`,
      options,
      correctIndex,
      formula: `${a}x = ${c} - ${b} = ${c - b} → x = ${c - b} ÷ ${a} = ${x}`,
      explanation_it: `Sottrai prima ${b} da entrambi i membri: ${a}x = ${c - b}. Poi dividi per ${a}: x = ${x}.`,
      explanation_fr: `Isolez x : on soustrait ${b} des deux côtés (${a}x = ${c - b}), puis on divise par ${a} (x = ${x}).`,
      trapWarning_it: `Attenzione quando sposti un termine dall'altra parte dell'uguale: il segno + diventa -!`,
      trapWarning_fr: `N'oubliez pas de changer le signe en passant le terme de l'autre côté !`
    };
  }

  // =========================================================================
  // 6. 3ÈME (14 ANS - CYCLE 4 FINAL & BREVET DES COLLÈGES DNB)
  // =========================================================================

  public generate3emeEasy(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('Ec = 1/2 × m × v²', ['Ec = m × v', 'Ec = m × g × h', 'Ec = 1/2 × m × v']);
    return {
      id: `3e-easy-ec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'kinetic_energy',
      gradeCycle: 'brevet',
      gradeLevel: '3eme',
      subject: 'Sciences',
      subject_it: 'Energia Cinetica (Formula Brevetto)',
      subject_fr: 'Énergie Cinétique (Brevet DNB)',
      difficulty: 'easy',
      question_it: `Qual è la formula dell'energia cinetica Ec di un oggetto di massa m che si muove a velocità v ?`,
      question_fr: `Quelle est la formule de l'énergie cinétique Ec d'un objet de masse m et de vitesse v ?`,
      options,
      correctIndex,
      formula: `Ec = 1/2 × m × v² (en Joules, avec m en kg et v en m/s)`,
      explanation_it: `L'energia cinetica è proporzionale alla massa e al quadrato della velocità: Ec = 1/2 m v².`,
      explanation_fr: `L'énergie cinétique dépend du carré de la vitesse : doubler la vitesse quadruple l'énergie cinétique !`
    };
  }

  public generate3emeMedium(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('Adjacent / Hypoténuse', ['Opposé / Hypoténuse', 'Opposé / Adjacent', 'Hypoténuse / Adjacent']);
    return {
      id: `3e-med-trigo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'trigonometry',
      gradeCycle: 'brevet',
      gradeLevel: '3eme',
      subject: 'Maths',
      subject_it: 'Trigonometria Brevetto (SOH CAH TOA)',
      subject_fr: 'Trigonométrie Brevet (CAH SOH TOA)',
      difficulty: 'medium',
      question_it: `In un triangolo rettangolo, come si definisce il COSINUS di un angolo acuto ?`,
      question_fr: `Dans un triangle rectangle, quelle est la définition du COSINUS d'un angle aigu ?`,
      options,
      correctIndex,
      formula: `Moyen mnémotechnique : CAH → Cosinus = Adjacent / Hypoténuse`,
      explanation_it: `Ricorda il trucco mnemonico: CAH (Cos = Adiacente / Ipotenusa), SOH (Sin = Opposto / Ipotenusa), TOA (Tan = Opposto / Adiacente).`,
      explanation_fr: `Mémo officiel : CAH SOH TOA. Le cosinus est égal au côté adjacent divisé par l'hypoténuse.`
    };
  }

  public generate3emeHard(): ParametricQuizQuestion {
    const a = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const b = Math.floor(Math.random() * 5) + 3; // 3 to 7
    // Factorization: a²x² - b² = (ax - b)(ax + b)
    const a2 = a * a;
    const b2 = b * b;
    const correct = `(${a}x - ${b})(${a}x + ${b})`;
    const distractors = [
      `(${a}x - ${b})²`,
      `(${a2}x - ${b2})²`,
      `(${a}x + ${b})²`
    ];
    const { options, correctIndex } = shuffleOptions(correct, distractors);

    return {
      id: `3e-hard-identite-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'identites_remarquables',
      gradeCycle: 'brevet',
      gradeLevel: '3eme',
      subject: 'Maths',
      subject_it: 'Identità Notevoli DNB (Fattorizzazione)',
      subject_fr: 'Identités Remarquables (Factorisation DNB)',
      difficulty: 'hard',
      question_it: `Fattorizza l'espressione tipica dell'esame del Brevetto : ${a2}x² - ${b2}`,
      question_fr: `Factorisez l'expression type Brevet : ${a2}x² - ${b2}`,
      options,
      correctIndex,
      formula: `a² - b² = (a - b)(a + b) avec a = ${a}x et b = ${b}`,
      explanation_it: `Si riconosce la 3ª identità notevole a² - b² = (a - b)(a + b) con a = ${a}x e b = ${b}.`,
      explanation_fr: `3ème identité remarquable : a² - b² = (a - b)(a + b). Donc ${a2}x² - ${b2} = (${a}x - ${b})(${a}x + ${b}).`,
      trapWarning_it: `Non confondere a² - b² con (a - b)² che produce il doppio prodotto -2ab !`,
      trapWarning_fr: `Ne confondez pas a² - b² avec (a - b)² qui développerait un double produit -2ab !`
    };
  }

  // =========================================================================
  // 7. SECONDE (2NDE - 15 ANS, ENTRATA AL LYCÉE, VECTEURS & MOLES)
  // =========================================================================

  public generateSecondeEasy(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('n = m / M', ['n = m × M', 'n = M / m', 'n = m + M']);
    return {
      id: `2nde-easy-mole-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'mole_chemistry',
      gradeCycle: 'lycee',
      gradeLevel: 'seconde',
      subject: 'Sciences',
      subject_it: 'La Mole e Quantità di Materia 2nde',
      subject_fr: 'La Quantité de Matière (Mole) 2nde',
      difficulty: 'easy',
      question_it: `Qual è la relazione tra la quantità di materia n (mol), la massa m (g) e la massa molare M (g/mol) ?`,
      question_fr: `Quelle est la formule reliant la quantité de matière n, la masse m et la masse molaire M ?`,
      options,
      correctIndex,
      formula: `n = m / M (avec n en mol, m en g et M en g/mol)`,
      explanation_it: `La quantità di materia n è uguale alla massa m divisa per la massa molare atomica o molecolare M.`,
      explanation_fr: `Formule essentielle du lycée : n = m / M. On divise la masse de l'échantillon par la masse d'une mole.`
    };
  }

  public generateSecondeMedium(): ParametricQuizQuestion {
    const xA = Math.floor(Math.random() * 5) - 2; // -2 to 2
    const yA = Math.floor(Math.random() * 5) - 2;
    const xB = xA + (Math.floor(Math.random() * 5) + 2); // strictly greater
    const yB = yA + (Math.floor(Math.random() * 5) + 2);
    const vX = xB - xA;
    const vY = yB - yA;
    const correct = `(${vX} ; ${vY})`;
    const distractors = [`(${xA + xB} ; ${yA + yB})`, `(${xA - xB} ; ${yA - yB})`, `(${vY} ; ${vX})`];
    const { options, correctIndex } = shuffleOptions(correct, distractors);

    return {
      id: `2nde-med-vector-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'vectors_plane',
      gradeCycle: 'lycee',
      gradeLevel: 'seconde',
      subject: 'Maths',
      subject_it: 'Coordinate di un Vettore nel Piano 2nde',
      subject_fr: 'Coordonnées d\'un Vecteur dans le Plan 2nde',
      difficulty: 'medium',
      question_it: `Dati i punti A(${xA} ; ${yA}) e B(${xB} ; ${yB}), quali sono le coordinate del vettore AB ?`,
      question_fr: `Soient les points A(${xA} ; ${yA}) et B(${xB} ; ${yB}). Quelles sont les coordonnées du vecteur AB ?`,
      options,
      correctIndex,
      formula: `AB(xB - xA ; yB - yA) = (${xB} - ${xA} ; ${yB} - ${yA}) = (${vX} ; ${vY})`,
      explanation_it: `Le coordinate del vettore si ottengono facendo le coordinate del punto di arrivo (B) meno quelle del punto di partenza (A).`,
      explanation_fr: `Règle de 2nde : Extrémité - Origine. AB = (xB - xA ; yB - yA) = (${vX} ; ${vY}).`,
      trapWarning_it: `Non fare l'inverso A - B e non sommare le coordinate (che darebbe il punto medio raddoppiato)!`,
      trapWarning_fr: `Attention à l'ordre : toujours B moins A, et non A moins B !`
    };
  }

  public generateSecondeHard(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('x y\' - x\' y = 0', ['x x\' + y y\' = 0', 'x / x\' = y\' / y', 'x + y = x\' + y\'']);
    return {
      id: `2nde-hard-colin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'vectors_plane',
      gradeCycle: 'lycee',
      gradeLevel: 'seconde',
      subject: 'Maths',
      subject_it: 'Condizione di Collinarità 2nde (Determinante)',
      subject_fr: 'Condition de Colinéarité de deux vecteurs 2nde',
      difficulty: 'hard',
      question_it: `A quale condizione due vettori u(x ; y) e v(x' ; y') sono collineari nel piano ?`,
      question_fr: `À quelle condition deux vecteurs u(x ; y) et v(x' ; y') sont-ils colinéaires ?`,
      options,
      correctIndex,
      formula: `Déterminant nul : det(u, v) = x y' - x' y = 0`,
      explanation_it: `Due vettori sono collineari se e solo se il loro determinante è nullo: x × y' - x' × y = 0 (prodotto a croce nullo).`,
      explanation_fr: `Théorème de Seconde : u et v sont colinéaires équivaut à x y' - x' y = 0.`
    };
  }

  // =========================================================================
  // 8. PREMIÈRE (1ÈRE SPÉ - 16 ANS, SECOND DEGRÉ, DÉRIVÉES, BAC EAF)
  // =========================================================================

  public generatePremiereEasy(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('Δ = b² - 4ac', ['Δ = b² + 4ac', 'Δ = 2b - 4ac', 'Δ = b - 4ac²']);
    return {
      id: `1ere-easy-delta-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'quadratic_equations',
      gradeCycle: 'lycee',
      gradeLevel: 'premiere',
      subject: 'Maths',
      subject_it: 'Discriminante del 2° Grado (Delta)',
      subject_fr: 'Discriminant du Second Degré (Δ)',
      difficulty: 'easy',
      question_it: `Nel polinomio ax² + bx + c, come si calcola il discriminante Δ ?`,
      question_fr: `Pour un trinôme du second degré ax² + bx + c, comment calcule-t-on le discriminant Δ ?`,
      options,
      correctIndex,
      formula: `Δ = b² - 4ac`,
      explanation_it: `La formula del discriminante è Δ = b² - 4ac. Se Δ > 0 ci sono 2 radici, se Δ = 0 ce n'è 1, se Δ < 0 nessuna radice reale.`,
      explanation_fr: `Formule fondamentale de 1ère Spé : Δ = b² - 4ac.`
    };
  }

  public generatePremiereMedium(): ParametricQuizQuestion {
    const n = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const correct = `${n}x^${n - 1}`.replace('^1', '');
    const distractors = [`x^${n - 1}`.replace('^1', ''), `${n}x^${n}`, `${n - 1}x^${n}`];
    const { options, correctIndex } = shuffleOptions(correct, distractors);

    return {
      id: `1ere-med-deriv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'quadratic_equations',
      gradeCycle: 'lycee',
      gradeLevel: 'premiere',
      subject: 'Maths',
      subject_it: 'Derivata di una Potenza (1ère Spé)',
      subject_fr: 'Dérivation : formule de (xⁿ)\'',
      difficulty: 'medium',
      question_it: `Qual è la funzione derivata di f(x) = x^${n} ?`,
      question_fr: `Quelle est la dérivée de la fonction f(x) = x^${n} ?`,
      options,
      correctIndex,
      formula: `(xⁿ)' = n × xⁿ⁻¹`,
      explanation_it: `La regola di derivazione di una potenza xⁿ abbassa l'esponente n e riduce il grado di 1: f'(x) = ${correct}.`,
      explanation_fr: `Règle de dérivation : (xⁿ)' = n × xⁿ⁻¹. Donc la dérivée de x^${n} est ${correct}.`
    };
  }

  public generatePremiereHard(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('Du signe de a à l\'extérieur des racines', ['Du signe de a à l\'intérieur des racines', 'Toujours positif', 'Du signe de b']);
    return {
      id: `1ere-hard-signe-trinome-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'quadratic_equations',
      gradeCycle: 'lycee',
      gradeLevel: 'premiere',
      subject: 'Maths',
      subject_it: 'Segno del Trinomio con Δ > 0 (1ère Spé)',
      subject_fr: 'Signe du Trinôme lorsque Δ > 0',
      difficulty: 'hard',
      question_it: `Se un trinomio ax² + bx + c ha Δ > 0 e ammette due radici x1 < x2, qual è il suo segno ?`,
      question_fr: `Si un trinôme ax² + bx + c a un discriminant Δ > 0 avec deux racines x1 < x2, quel est son signe ?`,
      options,
      correctIndex,
      formula: `Signe de a à l'extérieur des racines [ -∞ ; x1 [ et ] x2 ; +∞ [ et signe de (-a) entre les racines`,
      explanation_it: `Teorema del segno del trinomio: è sempre dello stesso segno di a all'ESTERNO delle radici, e del segno opposto (-a) tra le radici.`,
      explanation_fr: `Règle d'or de 1ère : un trinôme du second degré est toujours du signe de a à l'extérieur des racines.`
    };
  }

  // =========================================================================
  // 9. TERMINALE (TLE SPÉ - 17 ANS, EXPONENTIELLE, LOGARITHME, INTÉGRALES)
  // =========================================================================

  public generateTerminaleEasy(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('e^(a+b)', ['e^(a×b)', 'e^a + e^b', 'e^(a-b)']);
    return {
      id: `tle-easy-exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'general_study',
      gradeCycle: 'lycee',
      gradeLevel: 'terminale',
      subject: 'Maths',
      subject_it: 'Proprietà dell\'Esponenziale (Terminale)',
      subject_fr: 'Propriété de l\'Exponentielle (Terminale)',
      difficulty: 'easy',
      question_it: `Semplifica l'espressione : e^a × e^b = ?`,
      question_fr: `Simplifiez l'expression : e^a × e^b = ?`,
      options,
      correctIndex,
      formula: `e^a × e^b = e^(a + b) et (e^x)' = e^x`,
      explanation_it: `La funzione esponenziale trasforma un prodotto in una somma degli esponenti: e^a × e^b = e^(a+b).`,
      explanation_fr: `Propriété algébrique majeure de l'exponentielle : elle transforme un produit en somme au niveau des exposants.`
    };
  }

  public generateTerminaleMedium(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('u\' / u', ['1 / u', 'u\' × u', 'u / u\'']);
    return {
      id: `tle-med-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'general_study',
      gradeCycle: 'lycee',
      gradeLevel: 'terminale',
      subject: 'Maths',
      subject_it: 'Derivata del Logaritmo Naturale ln(u)',
      subject_fr: 'Dérivée de ln(u) (Terminale Spé)',
      difficulty: 'medium',
      question_it: `Per una funzione strettamente positiva e derivabile u, qual è la derivata di f(x) = ln(u(x)) ?`,
      question_fr: `Pour une fonction dérivable et strictement positive u, quelle est la dérivée de f(x) = ln(u(x)) ?`,
      options,
      correctIndex,
      formula: `(ln(u))' = u' / u`,
      explanation_it: `La derivata della funzione composta ln(u) è uguale alla derivata interna u' divisa per la funzione stessa u: u' / u.`,
      explanation_fr: `Formule de dérivation de Terminale : (ln(u))' = u' / u.`
    };
  }

  public generateTerminaleHard(): ParametricQuizQuestion {
    const { options, correctIndex } = shuffleOptions('+∞', ['0', '1', 'Forme indéterminée sans limite']);
    return {
      id: `tle-hard-croissance-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      domain: 'general_study',
      gradeCycle: 'lycee',
      gradeLevel: 'terminale',
      subject: 'Maths',
      subject_it: 'Crescite Comparate in +∞ (Terminale)',
      subject_fr: 'Croissances Comparées en +∞ (Terminale Spé)',
      difficulty: 'hard',
      question_it: `Per i teoremi di crescita comparata, qual è il limite : lim (x → +∞) (e^x / x) ?`,
      question_fr: `D'après les théorèmes de croissances comparées, quelle est la limite : lim (x → +∞) (e^x / x) ?`,
      options,
      correctIndex,
      formula: `lim (x → +∞) (e^x / xⁿ) = +∞ (l'exponentielle l'emporte sur toute puissance)`,
      explanation_it: `In +∞ l'esponenziale cresce infinitamente più rapidamente di qualsiasi potenza di x: il limite è +∞.`,
      explanation_fr: `Théorème fondamental de Terminale : l'exponentielle l'emporte sur toute puissance de x en +∞, donc la limite vaut +∞.`,
      trapWarning_it: `Sebbene sia una forma indeterminata '∞/∞', il teorema di crescita comparata rimuove l'indeterminazione!`,
      trapWarning_fr: `Ne répondez pas forme indéterminée : le cours tranche définitivement grâce aux croissances comparées !`
    };
  }

  // =========================================================================
  // MAIN QUIZ SET GENERATOR (DISPATCH BY GRADE LEVEL & DIFFICULTY)
  // =========================================================================

  public generateQuizSet(options: QuizGenerationOptions = {}): ParametricQuizQuestion[] {
    const count = options.count || 5;
    const questions: ParametricQuizQuestion[] = [];
    const usedTexts = new Set<string>();

    const targetGrade = options.gradeLevel || this.cycleToDefaultGrade(options.gradeCycle);
    const targetDiff = options.difficulty; // 'easy' | 'medium' | 'hard' or undefined (mixed)

    const generators: Array<() => ParametricQuizQuestion> = [];

    // Map each grade to its level-specific generators
    switch (targetGrade) {
      case 'cm1':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generateCM1Easy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generateCM1Medium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generateCM1Hard());
        break;

      case 'cm2':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generateCM2Easy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generateCM2Medium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generateCM2Hard());
        break;

      case '6eme':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generate6emeEasy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generate6emeMedium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generate6emeHard());
        break;

      case '5eme':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generate5emeEasy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generate5emeMedium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generate5emeHard());
        break;

      case '4eme':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generate4emeEasy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generate4emeMedium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generate4emeHard());
        break;

      case '3eme':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generate3emeEasy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generate3emeMedium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generate3emeHard());
        break;

      case 'seconde':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generateSecondeEasy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generateSecondeMedium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generateSecondeHard());
        break;

      case 'premiere':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generatePremiereEasy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generatePremiereMedium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generatePremiereHard());
        break;

      case 'terminale':
        if (!targetDiff || targetDiff === 'easy') generators.push(() => this.generateTerminaleEasy());
        if (!targetDiff || targetDiff === 'medium') generators.push(() => this.generateTerminaleMedium());
        if (!targetDiff || targetDiff === 'hard') generators.push(() => this.generateTerminaleHard());
        break;

      default:
        // Default 4ème
        generators.push(
          () => this.generate4emeEasy(),
          () => this.generate4emeMedium(),
          () => this.generate4emeHard()
        );
    }

    if (generators.length === 0) {
      generators.push(() => this.generate4emeMedium());
    }

    let attempts = 0;
    while (questions.length < count && attempts < 35) {
      attempts++;
      const gen = generators[Math.floor(Math.random() * generators.length)];
      const q = gen();
      if (!usedTexts.has(q.question_fr)) {
        usedTexts.add(q.question_fr);
        questions.push(q);
      }
    }

    return questions;
  }

  private cycleToDefaultGrade(cycle?: GradeCycle): FrenchGradeLevel {
    if (cycle === 'primaire') return 'cm2';
    if (cycle === 'brevet') return '3eme';
    if (cycle === 'lycee') return 'seconde';
    return '4eme';
  }

  // ==========================================
  // SPACED REPETITION / LEITNER MISTAKE BANK
  // ==========================================

  public getMistakes(): QuizMistakeRecord[] {
    try {
      const data = localStorage.getItem(MISTAKES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveMistake(question: ParametricQuizQuestion, selectedOptionIndex: number): void {
    const list = this.getMistakes();
    const existing = list.find(m => m.question.question_fr === question.question_fr);

    if (existing) {
      existing.timesWrong += 1;
      existing.consecutiveCorrect = 0;
      existing.mastered = false;
      existing.timestamp = new Date().toISOString();
    } else {
      list.push({
        id: `mistake-${Date.now()}`,
        question,
        selectedOptionIndex,
        timestamp: new Date().toISOString(),
        timesWrong: 1,
        consecutiveCorrect: 0,
        mastered: false
      });
    }

    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  public recordReviewResult(questionId: string, isCorrect: boolean): void {
    const list = this.getMistakes();
    const record = list.find(m => m.id === questionId || m.question.id === questionId);
    if (!record) return;

    if (isCorrect) {
      record.consecutiveCorrect += 1;
      if (record.consecutiveCorrect >= 2) {
        record.mastered = true;
      }
    } else {
      record.consecutiveCorrect = 0;
      record.timesWrong += 1;
      record.mastered = false;
    }

    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  public getPendingMistakesCount(): number {
    return this.getMistakes().filter(m => !m.mastered).length;
  }
}

export const parametricQuizEngine = new ParametricQuizEngine();
