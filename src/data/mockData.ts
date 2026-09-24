import { SystemUpdate, VerifiedApp, TimetableSlot, HomeworkItem, StudentProfile, Language, CurriculumPack } from '../types';

export const initialProfile: StudentProfile = {
  name: "Studente",
  age: 13,
  schoolName: "Collège",
  schoolStage: "middle",
  gradeLevel: "4ème",
  avatar: "🌻",
  language: "it", // Default iniziale in italiano; commutabile istantaneamente in francese con 1 clic
  theme: "amber",
  operatingSystem: "debian",
  dyslexicFont: false,
  soundEffects: true,
  currentWeek: "A",
  firstTimeSetupDone: true,
  activePackId: "pack-college-4eme"
};

export const curriculumPacksList: CurriculumPack[] = [
  {
    id: "pack-college-4eme",
    name: "Collège 4ème • Cycle 4 (Officiel)",
    stage: "middle",
    gradeLevel: "4ème",
    version: "2026.1",
    author: "Ministère Éducation Nationale / Tournesol Core",
    description_it: "Teorema di Pitagora, frazioni, equazioni 1° grado, legge di Ohm, scienze (aria, vulcani, genetica), storia del XVIII-XIX sec. e temi di letteratura.",
    description_fr: "Théorème de Pythagore, calcul fractionnaire, équations 1er degré, loi d'Ohm, sciences de la matière et thèmes littéraires officiels.",
    isInstalled: true,
    lastUpdated: "2026-09-01",
    topicsCount: 28,
    downloadUrl: "https://raw.githubusercontent.com/tournesol-os/curriculum-packs/main/pack-college-4eme.json"
  },
  {
    id: "pack-college-3eme",
    name: "Collège 3ème • Préparation Brevet",
    stage: "middle",
    gradeLevel: "3ème",
    version: "2026.1",
    author: "Tournesol Edu Community",
    description_it: "Teorema di Talete, trigonometria, equazioni di 2° grado, probabilità, genetica avanzata, storia del XX secolo e simulazioni d'esame del Brevet.",
    description_fr: "Théorème de Thalès, trigonométrie, probabilités, génétique avancée, histoire du XXe siècle et entraînement officiel au Brevet.",
    isInstalled: false,
    lastUpdated: "2026-08-20",
    topicsCount: 34,
    downloadUrl: "https://raw.githubusercontent.com/tournesol-os/curriculum-packs/main/pack-college-3eme.json"
  },
  {
    id: "pack-lycee-2nde",
    name: "Lycée 2nde Générale & Technologique",
    stage: "high",
    gradeLevel: "Lycée (2nde)",
    version: "2026.1",
    author: "Tournesol Edu Community",
    description_it: "Funzioni, vettori, geometria analitica, chimica molecolare e studio del testo argomentativo per il Liceo.",
    description_fr: "Étude de fonctions, calcul vectoriel, géométrie repérée, chimie des solutions et dissertation littéraire.",
    isInstalled: false,
    lastUpdated: "2026-07-15",
    topicsCount: 42,
    downloadUrl: "https://raw.githubusercontent.com/tournesol-os/curriculum-packs/main/pack-lycee-2nde.json"
  },
  {
    id: "pack-college-5eme",
    name: "Collège 5ème • Cycle 4 Initiation",
    stage: "middle",
    gradeLevel: "5ème",
    version: "2026.1",
    author: "Tournesol Edu Community",
    description_it: "Proporzionalità, aree e perimetri, numeri relativi, fonti di energia e circuito elettrico di base.",
    description_fr: "Proportionnalité, aires et périmètres, nombres relatifs, sources d'énergie et circuits électriques simples.",
    isInstalled: false,
    lastUpdated: "2026-06-10",
    topicsCount: 22,
    downloadUrl: "https://raw.githubusercontent.com/tournesol-os/curriculum-packs/main/pack-college-5eme.json"
  },
  {
    id: "pack-elementaire-cycle3",
    name: "École Élémentaire • Cycle 3 (CM1 - CM2)",
    stage: "elementary",
    gradeLevel: "CM1 / CM2",
    version: "2026.1",
    author: "Tournesol Edu Community",
    description_it: "Frazioni di base, tabelline veloci, comprensione del testo, geografia regionale e prime scoperte scientifiche.",
    description_fr: "Fractions simples, tables de multiplication, conjugaison et consolidation Cycle 3.",
    isInstalled: false,
    lastUpdated: "2026-05-18",
    topicsCount: 18,
    downloadUrl: "https://raw.githubusercontent.com/tournesol-os/curriculum-packs/main/pack-elementaire-cycle3.json"
  }
];

export const initialUpdates: SystemUpdate[] = [
  {
    id: "sec-01",
    packageName: "linux-image-6.1.0-28-amd64",
    currentVersion: "6.1.119-1",
    newVersion: "6.1.123-1",
    category: "security",
    severity: "critical-security",
    size: "68.4 Mo",
    cveId: "CVE-2024-50012",
    cveDescription_fr: "Vulnérabilité critique de sécurité dans le sous-système réseau du noyau Linux. Risque d'exécution de code à distance.",
    cveDescription_it: "Vulnerabilità critica di sicurezza nel sottosistema di rete del kernel Linux. Rischio di esecuzione di codice remoto.",
    description_fr: "Noyau Linux officiel Debian 12 (Kernel Bookworm) • Patch de sécurité à haute priorité.",
    description_it: "Kernel Linux ufficiale Debian 12 (Kernel Bookworm) • Patch di sicurezza ad alta priorità.",
    description: "Kernel Linux ufficiale Debian 12",
    source: "debian-security"
  },
  {
    id: "sec-02",
    packageName: "firefox-esr",
    currentVersion: "128.5.0esr-1",
    newVersion: "128.6.0esr-1~deb12u1",
    category: "security",
    severity: "critical-security",
    size: "61.2 Mo",
    cveId: "CVE-2024-11693",
    cveDescription_fr: "Correction de corruption mémoire dans le moteur JavaScript SpiderMonkey lors du chargement de médias.",
    cveDescription_it: "Correzione di corruzione memoria nel motore JavaScript SpiderMonkey durante il caricamento multimediale.",
    description_fr: "Navigateur Web sécurisé Firefox ESR (Extended Support Release Debian pour l'école).",
    description_it: "Browser Web protetto Firefox ESR (Extended Support Release per Debian e la scuola).",
    description: "Browser Web protetto Firefox ESR",
    source: "debian-security"
  },
  {
    id: "sec-03",
    packageName: "openssl",
    currentVersion: "3.0.14-1~deb12u2",
    newVersion: "3.0.15-1~deb12u1",
    category: "security",
    severity: "critical-security",
    size: "1.4 Mo",
    cveId: "CVE-2024-9143",
    cveDescription_fr: "Correction de dépassement mémoire OSSL_STORE lors du traitement des certificati TLS X.509.",
    cveDescription_it: "Risoluzione buffer overflow OSSL_STORE durante la verifica dei certificati TLS X.509.",
    description_fr: "Bibliothèque cryptographique essentielle pour la sécurité des connexions HTTPS et des mots de passe.",
    description_it: "Libreria fondamentale per le connessioni HTTPS e la sicurezza dei certificati crittografici.",
    description: "Libreria fondamentale per HTTPS",
    source: "debian-security"
  },
  {
    id: "std-01",
    packageName: "plasma-desktop",
    currentVersion: "5.27.5-2",
    newVersion: "5.27.11-1",
    category: "kde",
    severity: "standard",
    size: "12.8 Mo",
    description_fr: "Amélioration de la réactivité de l'environnement de bureau KDE Plasma et baisse de la consommation CPU pour MacBook Haswell.",
    description_it: "Miglioramento della fluidità grafica del desktop KDE Plasma e riduzione consumo CPU per il MacBook Air 2014.",
    description: "Miglioramenti desktop KDE Plasma",
    source: "debian-stable"
  },
  {
    id: "std-02",
    packageName: "speedcrunch",
    currentVersion: "0.12.0-3",
    newVersion: "0.12.0-4",
    category: "app",
    severity: "standard",
    size: "2.1 Mo",
    description_fr: "Calculatrice scientifique ultra-légère en C++/Qt (consomme seulement 14 Mo de mémoire vive).",
    description_it: "Calcolatrice scientifica ultra-leggera nativa C++/Qt (richiede soltanto 14 MB di RAM).",
    description: "Calcolatrice scientifica ultra-leggera C++/Qt",
    source: "debian-stable"
  },
  {
    id: "std-03",
    packageName: "kate",
    currentVersion: "22.12.3-1",
    newVersion: "22.12.3-2",
    category: "kde",
    severity: "standard",
    size: "7.9 Mo",
    description_fr: "Éditeur de texte avancé avec coloration syntaxique Python et Scratch pour les cours de Technologie.",
    description_it: "Editor di testo avanzato con colorazione per Python e Scratch per la materia di Tecnologia.",
    description: "Editor di testo avanzato con evidenziazione codice",
    source: "debian-stable"
  }
];

export const verifiedAppsList: VerifiedApp[] = [
  {
    id: "geogebra",
    name: "GeoGebra Collège",
    category: "math",
    summary_fr: "Géométrie dynamique, calcul du Théorème de Pythagore, repère et fonctions.",
    summary_it: "Geometria dinamica, calcolo del Teorema di Pitagora, piano cartesiano e funzioni.",
    summary: "Geometria dinamica e Teorema di Pitagora",
    description_fr: "Le logiciel de référence pour l'enseignement des mathématiques au collège français (6e à 3e). Permet de tracer des figures géométriques, vérifier les égalités de Pythagore et visualiser les droites.",
    description_it: "Il software di riferimento per l'insegnamento della matematica nelle scuole medie francesi (dalla 6ème alla 3ème). Permette di tracciare figure, misurare angoli e verificare le formule di Pitagora.",
    description: "Software di riferimento per la matematica al collège",
    iconName: "Compass",
    version: "6.0.840",
    debSize: "44 Mo",
    ramUsageEstimate: "65 Mo",
    githubRepo: "geogebra/geogebra",
    gpgKeyId: "0x4C72B9F4E5A81D20",
    gpgFingerprint: "E612 809B 4C72 B9F4 E5A8 1D20 3FA1 9B70",
    sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    isInstalled: true,
    officialSite: "https://www.geogebra.org",
    pedagogicalUse_fr: "Géométrie en 4ème (Pythagore, triangles rectangles, cosinus)",
    pedagogicalUse_it: "Geometria in 4ª (Pitagora, triangoli rettangoli, formule)",
    pedagogicalUse: "Geometria in 4ème",
    packageCommands: {
      debian: "sudo apt install geogebra",
      fedora: "flatpak install flathub org.geogebra.GeoGebra",
      arch: "sudo pacman -S geogebra",
      macos: "brew install --cask geogebra"
    }
  },
  {
    id: "libreoffice-scolaire",
    name: "LibreOffice Writer & Calc",
    category: "writing",
    summary_fr: "Suite bureautique complète pour les rédactions de français et les exposés d'histoire.",
    summary_it: "Suite d'ufficio per temi di francese, ricerche di storia e relazioni scolastiche.",
    summary: "Suite d'ufficio per temi e ricerche",
    description_fr: "Indispensable pour rédiger les devoirs de Français, les rapports d'Histoire-Géographie et les comptes-rendus de sciences. Formats 100% compatibles PDF, ODT et DOCX.",
    description_it: "Indispensabile per redigere i compiti di Francese, le ricerche di Storia-Geografia e le relazioni di Scienze. Formati 100% compatibili PDF, ODT e DOCX.",
    description: "Suite d'ufficio per ricerche scolastiche",
    iconName: "FileText",
    version: "7.4.7-deb12u3",
    debSize: "180 Mo",
    ramUsageEstimate: "110 Mo",
    githubRepo: "LibreOffice/core",
    gpgKeyId: "0xAFEEAEA3",
    gpgFingerprint: "C6D4 13D1 8414 A4CA B8BE 84D0 AFEE AEA3 8A3F",
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    isInstalled: true,
    officialSite: "https://www.libreoffice.org",
    pedagogicalUse_fr: "Rédaction de textes en français, exposés et tableaux scientifiques",
    pedagogicalUse_it: "Scrittura di temi in francese, tesine e tabelle scientifiche",
    pedagogicalUse: "Temi e relazioni scolastiche"
  },
  {
    id: "speedcrunch",
    name: "SpeedCrunch (Qt)",
    category: "math",
    summary_fr: "Calculatrice scientifique instantanée ultra-rapide (seulement 14 Mo de RAM).",
    summary_it: "Calcolatrice scientifica istantanea ultra-rapida (soltanto 14 MB di RAM).",
    summary: "Calcolatrice scientifica istantanea",
    description_fr: "Calculs algébriques rapides, racines carrées pour Pythagore, puissances de 10, notation scientifique et constantes physiques. Démarre en un clin d'œil sans ralentir le MacBook.",
    description_it: "Calcoli algebrici rapidi, radici quadrate per Pitagora, potenze di 10, notazione scientifica e costanti fisiche. Si avvia all'istante senza appesantire il MacBook Air.",
    description: "Calcolatrice scientifica nativa istantanea",
    iconName: "Calculator",
    version: "0.12.0",
    debSize: "2.1 Mo",
    ramUsageEstimate: "14 Mo",
    githubRepo: "speedcrunch/SpeedCrunch",
    gpgKeyId: "0x892BF310",
    gpgFingerprint: "7A21 CD40 892B F310 9021 341B EF89 1230",
    sha256: "2c624232cdd221771294dfbb379201f41736c29e132d3f325c18f41dd6d44d85",
    isInstalled: true,
    officialSite: "https://speedcrunch.org",
    pedagogicalUse_fr: "Calculs numériques, racines carrées, fractions et puissances",
    pedagogicalUse_it: "Calcoli numerici, radici quadrate, frazioni e potenze di dieci",
    pedagogicalUse: "Calcoli numerici e radici"
  },
  {
    id: "scratch-desktop",
    name: "Scratch 3 Desktop",
    category: "science",
    summary_fr: "Programmation par blocs pour l'épreuve d'algorithmique du Brevet et la Technologie.",
    summary_it: "Programmazione a blocchi per la prova di algoritmi del Brevet e la materia di Tecnologia.",
    summary: "Programmazione a blocchi per la scuola",
    description_fr: "Le langage visuel officiel enseigné au collège en France et évalué lors des épreuves du Brevet des collèges. Permet de créer des jeux et d'animer des personnages.",
    description_it: "Il linguaggio visuale ufficiale insegnato nelle scuole medie francesi e valutato all'esame nazionale del Brevet per la parte di algoritmo e robotica.",
    description: "Linguaggio visuale adottato dal Ministero francese",
    iconName: "Code2",
    version: "3.29.1",
    debSize: "68 Mo",
    ramUsageEstimate: "95 Mo",
    githubRepo: "scratchfoundation/scratch-gui",
    gpgKeyId: "0x981C5320",
    gpgFingerprint: "11A3 BB4C 981C 5320 77E2 90D1 AA52 4F21",
    sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    isInstalled: false,
    officialSite: "https://scratch.mit.edu",
    pedagogicalUse_fr: "Algorithmes, boucles et programmation pour les cours de Technologie",
    pedagogicalUse_it: "Algoritmi, cicli e programmazione per le lezioni di Tecnologia",
    pedagogicalUse: "Algoritmi e robotica"
  },
  {
    id: "kalzium",
    name: "Kalzium (KDE Éducation)",
    category: "science",
    summary_fr: "Tableau périodique interactif et calculatrice moléculaire pour la Physique-Chimie.",
    summary_it: "Tavola periodica interattiva degli elementi e calcolatore molecolare per Fisica-Chimica.",
    summary: "Tavola periodica degli elementi",
    description_fr: "Application native KDE très légère. Idéale pour le programme de Physique-Chimie de 4ème (atomes, molécules, réactions chimiques et conservation de la masse de Lavoisier).",
    description_it: "Applicazione nativa C++/Qt sviluppata dal team KDE. Perfetta per il programma di Fisica-Chimica di 4ª (atomi, molecole, reazioni di combustione e legge di Lavoisier).",
    description: "Tavola periodica e formule molecolari",
    iconName: "Atom",
    version: "22.12.3",
    debSize: "8.5 Mo",
    ramUsageEstimate: "22 Mo",
    githubRepo: "KDE/kalzium",
    gpgKeyId: "0xD81D0E05",
    gpgFingerprint: "207B 64F6 8632 0925 85B0 3804 D81D 0E05",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    isInstalled: false,
    officialSite: "https://apps.kde.org/kalzium/",
    pedagogicalUse_fr: "Physique-Chimie en 4ème (atomes, molécules, réactions de combustion)",
    pedagogicalUse_it: "Fisica-Chimica in 4ª (atomi, molecole, combustioni e massa)",
    pedagogicalUse: "Chimica e atomi"
  },
  {
    id: "anki-school",
    name: "Anki Cartes Mémoire",
    category: "languages",
    summary_fr: "Répétition espacée pour mémoriser le vocabulaire d'italien, d'anglais et les dates d'histoire.",
    summary_it: "Ripasso a intervalli spaziati per vocaboli di Italiano, Inglese e date di Storia.",
    summary: "Memorizzazione vocaboli a intervalli",
    description_fr: "Système d'apprentissage basé sur les sciences cognitives. Permet de retenir facilement le vocabulaire des langues vivantes et les définitions avec 10 minutes d'entraînement par jour.",
    description_it: "Sistema scientifico di memorizzazione a lungo termine. Aiuta a fissare verbi irregolari, definizioni di scienze e vocaboli bilingue con 10 minuti di esercizio al giorno.",
    description: "Flashcards per memorizzare le lingue",
    iconName: "BrainCircuit",
    version: "24.06.3",
    debSize: "28 Mo",
    ramUsageEstimate: "48 Mo",
    githubRepo: "ankitects/anki",
    gpgKeyId: "0x539634C2",
    gpgFingerprint: "D83A 0B89 5396 34C2 4291 9283 BC41 12A1",
    sha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    isInstalled: true,
    officialSite: "https://apps.ankiweb.net",
    pedagogicalUse_fr: "Apprentissage des langues (Italien LV2, Anglais LV1) et dates d'Histoire",
    pedagogicalUse_it: "Studio delle lingue (Italiano LV2, Inglese LV1) e date storiche",
    pedagogicalUse: "Apprendimento lingue"
  },
  {
    id: "tuxtype",
    name: "TuxType Dactylographie",
    category: "utility",
    summary_fr: "Jeu éducatif ludique pour taper vite à 10 doigts sur le clavier AZERTY.",
    summary_it: "Gioco educativo per imparare a digitare a dieci dita sulla tastiera.",
    summary: "Dattilografia rapida per la tastiera",
    description_fr: "Aide l'élève à acquérir une frappe rapide et fluide sans regarder ses doigts. Très léger, consomme moins de 18 Mo de RAM.",
    description_it: "Aiuta lo studente ad acquisire una digitazione fluida e veloce senza guardare la tastiera, con un consumo inferiore a 18 MB di RAM.",
    description: "Dattilografia veloce",
    iconName: "Keyboard",
    version: "1.8.3",
    debSize: "9.2 Mo",
    ramUsageEstimate: "18 Mo",
    githubRepo: "tux4kids/tuxtype",
    gpgKeyId: "0x129B7F30",
    gpgFingerprint: "6541 3322 129B 7F30 89AC BB02 4431 DDE1",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    isInstalled: false,
    officialSite: "https://github.com/tux4kids/tuxtype",
    pedagogicalUse_fr: "Vitesse de frappe au clavier pour la prise de notes et devoirs",
    pedagogicalUse_it: "Velocità di digitazione per prendere appunti e svolgere compiti",
    pedagogicalUse: "Velocità di battitura",
    packageCommands: {
      debian: "sudo apt install tuxtype",
      fedora: "sudo dnf install tuxtype",
      arch: "sudo pacman -S tuxtype",
      macos: "brew install tuxtype"
    }
  },
  {
    id: "krita-light",
    name: "Krita Arts & Dessin",
    category: "creativity",
    summary_fr: "Atelier de dessin numérique et retouche d'images pour les cours d'Arts Plastiques.",
    summary_it: "Laboratorio di pittura e disegno digitale per la materia di Arti Plastiche.",
    summary: "Disegno e grafica digitale",
    description_fr: "Logiciel natif en C++/Qt conçu pour créer des illustrations, des affiches scolaires et des retouches avec gestion des calques sans surcharger le processeur.",
    description_it: "Software nativo C++/Qt progettato per creare illustrazioni, locandine scolastiche e disegni con livelli senza sovraccaricare la CPU del MacBook.",
    description: "Disegno e fotoritocco per la scuola",
    iconName: "Palette",
    version: "5.1.5",
    debSize: "75 Mo",
    ramUsageEstimate: "85 Mo",
    githubRepo: "KDE/krita",
    gpgKeyId: "0x0522432B",
    gpgFingerprint: "0522 432B 4F26 B819 095B 7A26 8E01 9A9D",
    sha256: "87924606b4131a8eae57dd6321f8bd9a1977d601b132d26994c34debdc613e7d",
    isInstalled: false,
    officialSite: "https://krita.org",
    pedagogicalUse_fr: "Création artistique pour les Arts Plastiques et affiches d'exposés",
    pedagogicalUse_it: "Creazioni artistiche per Arti Plastiche e cartelloni scolastici",
    pedagogicalUse: "Arti plastiche e grafica",
    packageCommands: {
      debian: "sudo apt install krita",
      fedora: "sudo dnf install krita",
      arch: "sudo pacman -S krita",
      macos: "brew install --cask krita"
    }
  },
  {
    id: "localsend",
    name: "LocalSend (Wi-Fi École & Famille)",
    category: "utility",
    summary_fr: "Transfert sans fil sécurisé entre le smartphone de l'élève/parents et l'ordinateur sans passer par Internet.",
    summary_it: "Trasferimento wireless sicuro tra il cellulare dello studente/genitori e il computer senza passare per Internet.",
    summary: "Trasferimento file e testo cellulare ⇄ PC",
    description_fr: "Alternative libre et chiffrée à AirDrop. Permet de transférer instantanément photos d'exercices, documents PDF et textes en Wi-Fi local sans aucun serveur tiers.",
    description_it: "Alternativa open source e crittografata ad AirDrop. Permette di trasferire istantaneamente foto di esercizi, PDF e testo via Wi-Fi locale con zero consumo di dati e massima privacy.",
    description: "Scambio file wireless locale sicuro",
    iconName: "Share2",
    version: "1.14.0",
    debSize: "18 Mo",
    ramUsageEstimate: "24 Mo",
    githubRepo: "localsend/localsend",
    gpgKeyId: "0xA981F4B0",
    gpgFingerprint: "A981 F4B0 82C1 9912 B105 77EE 32C0 99AF",
    sha256: "91ec55217ba9f83a48e72ba6f3c375da642054ffcfb061db82e666a4ee110291",
    isInstalled: true,
    officialSite: "https://localsend.org",
    pedagogicalUse_fr: "Envoi rapide des photos de devoirs et notes du smartphone vers l'ordinateur",
    pedagogicalUse_it: "Invio rapido di foto dei compiti e appunti dal cellulare al computer",
    pedagogicalUse: "Scambio foto compiti",
    packageCommands: {
      debian: "flatpak install flathub org.localsend.localsend_app",
      fedora: "flatpak install flathub org.localsend.localsend_app",
      arch: "sudo pacman -S localsend-bin",
      macos: "brew install --cask localsend"
    }
  },
  {
    id: "stellarium",
    name: "Stellarium Planétarium",
    category: "science",
    summary_fr: "Planétarium 3D open source pour observer le système solaire, les étoiles et la gravitation.",
    summary_it: "Planetario 3D open source per osservare sistema solare, costellazioni e gravità.",
    summary: "Planetario 3D astronomico",
    description_fr: "Affiche un ciel réaliste en 3D tel qu'on le voit à l'œil nu, aux jumelles ou au télescope. Parfait pour les leçons d'astronomie et physique de 4ème/3ème.",
    description_it: "Mostra una volta celeste 3D fotorealistica. Ideale per il programma di scienze e fisica del sistema solare, della luce e dei movimenti dei pianeti.",
    description: "Planetario scientifico open source",
    iconName: "Sparkles",
    version: "23.4",
    debSize: "140 Mo",
    ramUsageEstimate: "90 Mo",
    githubRepo: "Stellarium/stellarium",
    gpgKeyId: "0x1928BA31",
    gpgFingerprint: "1928 BA31 4402 C890 1201 EF89 9001 2410",
    sha256: "31048f029e840192a831e59c00b8492048f029e840192a831e59c00b8492048f",
    isInstalled: false,
    officialSite: "https://stellarium.org",
    pedagogicalUse_fr: "Astronomie, système solaire, vitesse de la lumière et gravitation",
    pedagogicalUse_it: "Astronomia, sistema solare, velocità della luce e gravità",
    pedagogicalUse: "Astronomia e spazio",
    packageCommands: {
      debian: "sudo apt install stellarium",
      fedora: "sudo dnf install stellarium",
      arch: "sudo pacman -S stellarium",
      macos: "brew install --cask stellarium"
    }
  }
];

export const initialTimetable: TimetableSlot[] = [
  // LUNDI / LUNEDÌ
  { id: "mon-1", day: "lundi", startTime: "08:30", endTime: "09:25", subject: "Mathématiques", subject_fr: "Mathématiques", subject_it: "Matematica (Maths)", room: "Salle 204", room_fr: "Salle 204", room_it: "Aula 204", teacher: "M. Martin", color: "#F59E0B", weekType: "both" },
  { id: "mon-2", day: "lundi", startTime: "09:30", endTime: "10:25", subject: "Français", subject_fr: "Français", subject_it: "Francese (Français)", room: "Salle 102", room_fr: "Salle 102", room_it: "Aula 102", teacher: "Mme Dubois", color: "#D97706", weekType: "both" },
  { id: "mon-3", day: "lundi", startTime: "10:40", endTime: "11:35", subject: "Histoire-Géographie", subject_fr: "Histoire-Géographie", subject_it: "Storia & Geografia", room: "Salle 110", room_fr: "Salle 110", room_it: "Aula 110", teacher: "M. Bernard", color: "#EAB308", weekType: "both" },
  { id: "mon-4", day: "lundi", startTime: "11:40", endTime: "12:35", subject: "Anglais (LV1)", subject_fr: "Anglais (LV1)", subject_it: "Inglese (LV1)", room: "Salle 201", room_fr: "Salle 201", room_it: "Aula 201", teacher: "Mme Taylor", color: "#CA8A04", weekType: "both" },
  { id: "mon-5", day: "lundi", startTime: "14:00", endTime: "15:55", subject: "EPS (Sport)", subject_fr: "EPS (Sport)", subject_it: "Educazione Fisica (EPS)", room: "Gymnase", room_fr: "Gymnase", room_it: "Palestra", teacher: "M. Leroy", color: "#B45309", weekType: "both" },
  { id: "mon-6", day: "lundi", startTime: "16:05", endTime: "17:00", subject: "Permanence / Devoirs", subject_fr: "Permanence / Devoirs", subject_it: "Studio assistito (Permanence)", room: "CDI", room_fr: "CDI", room_it: "Biblioteca CDI", teacher: "Mme Vincent", color: "#FBBF24", weekType: "both" },

  // MARDI / MARTEDÌ
  { id: "tue-1", day: "mardi", startTime: "08:30", endTime: "09:25", subject: "Physique-Chimie", subject_fr: "Physique-Chimie", subject_it: "Fisica & Chimica", room: "Labo 2", room_fr: "Labo 2", room_it: "Laboratorio 2", teacher: "Mme Roux", color: "#F59E0B", weekType: "both" },
  { id: "tue-2", day: "mardi", startTime: "09:30", endTime: "10:25", subject: "SVT (Sciences de la Vie)", subject_fr: "SVT (Sciences de la Vie)", subject_it: "Scienze Naturali (SVT)", room: "Labo 1", room_fr: "Labo 1", room_it: "Laboratorio 1", teacher: "M. Faure", color: "#D97706", weekType: "both" },
  { id: "tue-3", day: "mardi", startTime: "10:40", endTime: "11:35", subject: "Mathématiques", subject_fr: "Mathématiques", subject_it: "Matematica (Maths)", room: "Salle 204", room_fr: "Salle 204", room_it: "Aula 204", teacher: "M. Martin", color: "#F59E0B", weekType: "both" },
  { id: "tue-4", day: "mardi", startTime: "11:40", endTime: "12:35", subject: "Italien (LV2)", subject_fr: "Italien (LV2)", subject_it: "Italiano (LV2)", room: "Salle 207", room_fr: "Salle 207", room_it: "Aula 207", teacher: "Mme Rossi", color: "#EAB308", weekType: "both" },
  { id: "tue-5", day: "mardi", startTime: "14:00", endTime: "14:55", subject: "Français", subject_fr: "Français", subject_it: "Francese (Français)", room: "Salle 102", room_fr: "Salle 102", room_it: "Aula 102", teacher: "Mme Dubois", color: "#D97706", weekType: "both" },
  { id: "tue-6", day: "mardi", startTime: "15:00", endTime: "15:55", subject: "Technologie", subject_fr: "Technologie", subject_it: "Tecnologia & Scratch", room: "Salle Techno", room_fr: "Salle Techno", room_it: "Aula Tecnologia", teacher: "M. Mercier", color: "#B45309", weekType: "both" },

  // MERCREDI / MERCOLEDÌ
  { id: "wed-1", day: "mercredi", startTime: "08:30", endTime: "09:25", subject: "Français", subject_fr: "Français", subject_it: "Francese (Français)", room: "Salle 102", room_fr: "Salle 102", room_it: "Aula 102", teacher: "Mme Dubois", color: "#D97706", weekType: "both" },
  { id: "wed-2", day: "mercredi", startTime: "09:30", endTime: "10:25", subject: "Histoire-Géographie", subject_fr: "Histoire-Géographie", subject_it: "Storia & Geografia", room: "Salle 110", room_fr: "Salle 110", room_it: "Aula 110", teacher: "M. Bernard", color: "#EAB308", weekType: "both" },
  { id: "wed-3", day: "mercredi", startTime: "10:40", endTime: "11:35", subject: "Éducation Musicale", subject_fr: "Éducation Musicale", subject_it: "Educazione Musicale", room: "Salle Musique", room_fr: "Salle Musique", room_it: "Aula Musica", teacher: "Mme Blanc", color: "#CA8A04", weekType: "both" },
  { id: "wed-4", day: "mercredi", startTime: "11:40", endTime: "12:35", subject: "Arts Plastiques", subject_fr: "Arts Plastiques", subject_it: "Arti Plastiche & Disegno", room: "Atelier Art", room_fr: "Atelier Art", room_it: "Laboratorio d'Arte", teacher: "M. Robert", color: "#FBBF24", weekType: "both" },

  // JEUDI / GIOVEDÌ
  { id: "thu-1", day: "jeudi", startTime: "08:30", endTime: "09:25", subject: "Mathématiques", subject_fr: "Mathématiques", subject_it: "Matematica (Maths)", room: "Salle 204", room_fr: "Salle 204", room_it: "Aula 204", teacher: "M. Martin", color: "#F59E0B", weekType: "both" },
  { id: "thu-2", day: "jeudi", startTime: "09:30", endTime: "10:25", subject: "Italien (LV2)", subject_fr: "Italien (LV2)", subject_it: "Italiano (LV2)", room: "Salle 207", room_fr: "Salle 207", room_it: "Aula 207", teacher: "Mme Rossi", color: "#EAB308", weekType: "both" },
  { id: "thu-3", day: "jeudi", startTime: "10:40", endTime: "11:35", subject: "Anglais (LV1)", subject_fr: "Anglais (LV1)", subject_it: "Inglese (LV1)", room: "Salle 201", room_fr: "Salle 201", room_it: "Aula 201", teacher: "Mme Taylor", color: "#CA8A04", weekType: "both" },
  { id: "thu-4", day: "jeudi", startTime: "11:40", endTime: "12:35", subject: "SVT (Travaux Pratiques)", subject_fr: "SVT (Travaux Pratiques)", subject_it: "Scienze Naturali (Laboratorio TP)", room: "Labo 1", room_fr: "Labo 1", room_it: "Laboratorio 1", teacher: "M. Faure", color: "#D97706", weekType: "A" },
  { id: "thu-4b", day: "jeudi", startTime: "11:40", endTime: "12:35", subject: "Physique (Travaux Pratiques)", subject_fr: "Physique (Travaux Pratiques)", subject_it: "Fisica (Laboratorio TP)", room: "Labo 2", room_fr: "Labo 2", room_it: "Laboratorio 2", teacher: "Mme Roux", color: "#F59E0B", weekType: "B" },
  { id: "thu-5", day: "jeudi", startTime: "14:00", endTime: "14:55", subject: "Français", subject_fr: "Français", subject_it: "Francese (Français)", room: "Salle 102", room_fr: "Salle 102", room_it: "Aula 102", teacher: "Mme Dubois", color: "#D97706", weekType: "both" },
  { id: "thu-6", day: "jeudi", startTime: "15:00", endTime: "15:55", subject: "Histoire-Géographie", subject_fr: "Histoire-Géographie", subject_it: "Storia & Geografia", room: "Salle 110", room_fr: "Salle 110", room_it: "Aula 110", teacher: "M. Bernard", color: "#EAB308", weekType: "both" },

  // VENDREDI / VENERDÌ
  { id: "fri-1", day: "vendredi", startTime: "08:30", endTime: "09:25", subject: "Anglais (LV1)", subject_fr: "Anglais (LV1)", subject_it: "Inglese (LV1)", room: "Salle 201", room_fr: "Salle 201", room_it: "Aula 201", teacher: "Mme Taylor", color: "#CA8A04", weekType: "both" },
  { id: "fri-2", day: "vendredi", startTime: "09:30", endTime: "10:25", subject: "Mathématiques", subject_fr: "Mathématiques", subject_it: "Matematica (Maths)", room: "Salle 204", room_fr: "Salle 204", room_it: "Aula 204", teacher: "M. Martin", color: "#F59E0B", weekType: "both" },
  { id: "fri-3", day: "vendredi", startTime: "10:40", endTime: "11:35", subject: "Italien (LV2)", subject_fr: "Italien (LV2)", subject_it: "Italiano (LV2)", room: "Salle 207", room_fr: "Salle 207", room_it: "Aula 207", teacher: "Mme Rossi", color: "#EAB308", weekType: "both" },
  { id: "fri-4", day: "vendredi", startTime: "11:40", endTime: "12:35", subject: "Technologie Projets", subject_fr: "Technologie Projets", subject_it: "Tecnologia & Progetti", room: "Salle Techno", room_fr: "Salle Techno", room_it: "Aula Tecnologia", teacher: "M. Mercier", color: "#B45309", weekType: "both" },
  { id: "fri-5", day: "vendredi", startTime: "14:00", endTime: "15:55", subject: "EPS (Plein Air)", subject_fr: "EPS (Plein Air)", subject_it: "Educazione Fisica (All'aperto)", room: "Stade", room_fr: "Stade", room_it: "Stadio Comunale", teacher: "M. Leroy", color: "#F59E0B", weekType: "both" }
];

export const initialHomework: HomeworkItem[] = [
  {
    id: "hw-1",
    subject: "Mathématiques",
    subject_fr: "Mathématiques",
    subject_it: "Matematica",
    title: "Esercizi 34 e 36 pag. 142 (Teorema di Pitagora)",
    title_fr: "Exercices 34 et 36 page 142 (Théorème de Pythagore)",
    title_it: "Esercizi 34 e 36 pag. 142 (Teorema di Pitagora)",
    description_fr: "Calculer la longueur de l'hypoténuse BC dans les triangles rectangles. Rédiger soigneusement : 'Dans le triangle ABC rectangle en A...'",
    description_it: "Calcolare la lunghezza dell'ipotenusa BC nei triangoli rettangoli. Redazione formale richiesta: 'Nel triangolo ABC rettangolo in A...'",
    description: "Calcolare la lunghezza dell'ipotenusa BC",
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Domani
    estimatedMinutes: 25,
    completed: false,
    priority: "high"
  },
  {
    id: "hw-2",
    subject: "Français",
    subject_fr: "Français",
    subject_it: "Francese",
    title: "Lettura del racconto fantastico 'La Peur' di Maupassant",
    title_fr: "Lecture de la nouvelle fantastique 'La Peur' de Maupassant",
    title_it: "Lettura del racconto fantastico 'La Peur' di Maupassant",
    description_fr: "Souligner les indices de l'étrange et repérer l'alternance entre l'imparfait (description) et le passé simple (actions soudaines).",
    description_it: "Sottolineare gli elementi del mistero e notare l'alternanza tra l'imparfait (descrizione) e il passé simple (azioni improvvise).",
    description: "Analisi testo fantastico di Maupassant",
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Tra 2 giorni
    estimatedMinutes: 30,
    completed: false,
    priority: "medium"
  },
  {
    id: "hw-3",
    subject: "Physique-Chimie",
    subject_fr: "Physique-Chimie",
    subject_it: "Fisica & Chimica",
    title: "Schema del circuito elettrico e Legge di Ohm (U = R × I)",
    title_fr: "Schéma d'un circuit électrique et Loi d'Ohm (U = R × I)",
    title_it: "Schema del circuito elettrico e Legge di Ohm (U = R × I)",
    description_fr: "Calculer la tension aux bornes d'un résistor de 150 Ω traversé par un courant de 0.05 A.",
    description_it: "Calcolare la tensione ai capi di una resistenza da 150 Ω attraversata da una corrente di 0.05 A.",
    description: "Calcolo della tensione con Legge di Ohm",
    dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], // Tra 3 giorni
    estimatedMinutes: 20,
    completed: false,
    priority: "medium"
  },
  {
    id: "hw-4",
    subject: "Histoire-Géographie",
    subject_fr: "Histoire-Géographie",
    subject_it: "Storia & Geografia",
    title: "Lezione sull'Illuminismo e l'Enciclopedia",
    title_fr: "Leçon sur le Siècle des Lumières et l'Encyclopédie",
    title_it: "Lezione sull'Illuminismo e l'Enciclopedia",
    description_fr: "Apprendre les rôles de Voltaire, Rousseau et Diderot dans la contestation de la monarchie absolue au XVIIIe siècle.",
    description_it: "Studiare il ruolo di Voltaire, Rousseau e Diderot nella contestazione della monarchia assoluta nel XVIII secolo.",
    description: "Studio dell'Illuminismo francese",
    dueDate: new Date(Date.now() + 345600000).toISOString().split('T')[0],
    estimatedMinutes: 20,
    completed: false,
    priority: "low"
  },
  {
    id: "hw-5",
    subject: "Italien (LV2)",
    subject_fr: "Italien (LV2)",
    subject_it: "Italiano (LV2)",
    title: "Coniugazione al presente dei verbi regolari (-are, -ere, -ire)",
    title_fr: "Conjugaison au présent des verbes réguliers italiens (-are, -ere, -ire)",
    title_it: "Coniugazione al presente dei verbi regolari (-are, -ere, -ire)",
    description_fr: "Compléter les 10 phrases d'exercices sur le cahier et réviser les auxiliaires 'essere' et 'avere'.",
    description_it: "Completare le 10 frasi sul quaderno e ripassare i verbi ausiliari 'essere' e 'avere'.",
    description: "Esercizi verbi regolari italiani",
    dueDate: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    estimatedMinutes: 15,
    completed: true,
    priority: "low"
  }
];

// Helper functions for dynamic language resolution
export const getHomeworkDisplay = (item: HomeworkItem, lang: Language) => {
  return {
    title: lang === 'fr' ? (item.title_fr || item.title) : (item.title_it || item.title),
    description: lang === 'fr' ? (item.description_fr || item.description) : (item.description_it || item.description),
    subject: lang === 'fr' ? (item.subject_fr || item.subject) : (item.subject_it || item.subject)
  };
};

export const getUpdateDisplay = (item: SystemUpdate, lang: Language) => {
  return {
    description: lang === 'fr' ? (item.description_fr || item.description) : (item.description_it || item.description),
    cveDescription: lang === 'fr' ? (item.cveDescription_fr || item.cveDescription) : (item.cveDescription_it || item.cveDescription)
  };
};

export const getAppDisplay = (app: VerifiedApp, lang: Language) => {
  return {
    summary: lang === 'fr' ? (app.summary_fr || app.summary) : (app.summary_it || app.summary),
    description: lang === 'fr' ? (app.description_fr || app.description) : (app.description_it || app.description),
    pedagogicalUse: lang === 'fr' ? (app.pedagogicalUse_fr || app.pedagogicalUse) : (app.pedagogicalUse_it || app.pedagogicalUse)
  };
};

export const getTimetableDisplay = (slot: TimetableSlot, lang: Language) => {
  return {
    subject: lang === 'fr' ? (slot.subject_fr || slot.subject) : (slot.subject_it || slot.subject),
    room: lang === 'fr' ? (slot.room_fr || slot.room) : (slot.room_it || slot.room)
  };
};

export const frenchGrammarCards = [
  {
    title: "Accord du Participe Passé avec ÉTRE et AVOIR",
    itTitle: "Accordo del Participio Passato con ÊTRE e AVOIR",
    rule: "• Avec l'auxiliaire ÉTRE : on accorde TOUJOURS avec le sujet en genre et en nombre.\nEx : Elles sont arrivées (féminin pluriel -> -ées).\n• Avec l'auxiliaire AVOIR : on n'accorde JAMAIS avec le sujet ! On accorde uniquement si le C.O.D. est placé AVANT le verbe.\nEx : Les pommes que j'ai mangées (C.O.D. 'les pommes' placé avant -> -ées).",
    itExplanation: "In francese, con l'ausiliare ÊTRE si accorda sempre con il soggetto (come in italiano: 'Elle est venue'). Con AVOIR invece NON si accorda MAI con il soggetto, tranne se il complemento oggetto precede il verbo ('La lettera che ho scritta' -> 'La lettre que j'ai écrite')."
  },
  {
    title: "Imparfait vs Passé Simple dans le récit de 4ème",
    itTitle: "Imparfait vs Passé Simple nella narrazione (Programma 4ème)",
    rule: "• L'Imparfait s'utilise pour le décor, la description, les actions d'arrière-plan ou répétées ('Il pleuvait dehors, la bougie tremblait...').\n• Le Passé Simple s'utilise pour les actions soudaines, précises et délimitées dans le temps ('Tout à coup, un bruit retentit. Il ouvrit la porte.').",
    itExplanation: "Al collège in 4ème si studia il racconto fantastico e realistico del XIX secolo (Maupassant). L'Imparfait fa da sfondo (descrizione, atmosfera), mentre il Passé Simple fa avanzare l'azione con eventi improvvisi."
  },
  {
    title: "Les Homophones Grammaticaux indispensables",
    itTitle: "Gli Omofoni Grammaticali da non confondere",
    rule: "• a / à : 'a' = verbe avoir (remplaçable par 'avait'). 'à' = préposition avec accent.\n• et / est : 'est' = verbe être (remplaçable par 'était'). 'et' = conjonction ('e poi').\n• son / sont : 'sont' = verbe être pluriel ('étaient'). 'son' = son cartable (possessif).\n• ce / se : 'se' devant un verbe pronominal ('il se lève'). 'ce' démonstratif ('ce cahier').",
    itExplanation: "Trucco rapido per non sbagliare mai nei temi scritti: se puoi sostituire con il passato ('avait', 'était', 'étaient'), non ci va l'accento né la congiunzione!"
  }
];

export const italianFrenchVocab = [
  { it: "Il collegio (scuole medie)", fr: "Le collège", note: "Dura 4 anni in Francia (da 11 a 15 anni: 6e, 5e, 4e, 3e)" },
  { it: "La pagella / Il registro online", fr: "Pronote", note: "Piattaforma scolastica ufficiale francese per voti e compiti" },
  { it: "Il libretto scolastico di collegamento", fr: "Le carnet de correspondance", note: "Libretto cartaceo ufficiale obbligatorio per avvisi e uscite" },
  { it: "I compiti per casa", fr: "Les devoirs (cahier de textes)", note: "Assegnati sul diario e su Pronote" },
  { it: "L'orario scolastico (Settimana A/B)", fr: "L'emploi du temps (Semaine A / B)", note: "Alternanza bi-settimanale per i laboratori" },
  { it: "La biblioteca scolastica", fr: "Le CDI (Centre de Documentation)", note: "Spazio di lettura e ricerca guidata" },
  { it: "L'ora di studio libero a scuola", fr: "La permanence (ou 'la perm')", note: "Quando un docente è assente" },
  { it: "L'esame di terza media francese", fr: "Le Brevet (Diplôme National du Brevet)", note: "Esame di Stato al termine della 3ème (a 14-15 anni)" },
  { it: "La mensa scolastica", fr: "La cantine / La demi-pension", note: "Pausa pranzo tipica dalle 12h35 alle 14h00" },
  { it: "Il girasole", fr: "Le tournesol", note: "Il nome solare di questa applicazione!" }
];
