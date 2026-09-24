import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Cpu, 
  Download, 
  Check, 
  Github, 
  Sparkles, 
  Compass, 
  FileText, 
  Calculator, 
  Code2, 
  Atom, 
  BrainCircuit, 
  Keyboard, 
  Palette, 
  Share2,
  Package,
  Layers,
  FolderGit2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VerifiedApp, StudentProfile, CurriculumPack, BridgeConnectionStatus, BridgeSystemInfo } from '../../types';
import { translations } from '../../i18n/translations';
import { getAppDisplay, curriculumPacksList } from '../../data/mockData';
import { soundFx } from '../../utils/audio';
import { getThemeConfig } from '../../utils/themeStyles';
import { systemBridge } from '../../services/systemBridge';

interface AppStoreTabProps {
  profile: StudentProfile;
  apps: VerifiedApp[];
  onInstallApp: (appId: string) => Promise<void>;
  installingAppId: string | null;
  onSelectCurriculumPack?: (packId: string) => void;
  onOpenBridgeModal?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Compass,
  FileText,
  Calculator,
  Code2,
  Atom,
  BrainCircuit,
  Keyboard,
  Palette,
  Share2,
  Sparkles
};

// Curated GitHub school projects catalog for discovery
const githubSchoolProjects = [
  {
    name: "maths-college-interactif",
    repo: "education-libre/maths-cycle-4",
    stars: 1240,
    license: "MIT / Open Access",
    desc_it: "Oltre 400 esercizi interattivi di matematica con soluzioni passo-passo per il ciclo 4 (4ème e 3ème). Funziona 100% offline.",
    desc_fr: "Plus de 400 exercices interactifs de maths corrigés pour le cycle 4 (4e et 3e). Fonctionne hors-ligne.",
    topics: ["mathématiques", "pythagore", "brevet"],
    offlineReady: true
  },
  {
    name: "anki-brevet-francais",
    repo: "open-pedagogy/anki-decks-france",
    stars: 890,
    license: "CC-BY-SA 4.0",
    desc_it: "Mazzo di flashcard preconfezionato per Anki con tutte le figure retoriche, tempi verbali e citazioni per le scuole medie.",
    desc_fr: "Paquet de cartes Anki pour réviser les figures de style, temps verbaux et repères historiques du collège.",
    topics: ["grammaire", "français", "mémorisation"],
    offlineReady: true
  },
  {
    name: "simulateur-physique-chimie",
    repo: "phet-open-source/simulations-college",
    stars: 3410,
    license: "GPLv3",
    desc_it: "Simulazioni interattive HTML5 di circuiti elettrici (legge di Ohm) e molecole per 4ème e 3ème.",
    desc_fr: "Simulateurs interactifs HTML5 de circuits électriques (loi d'Ohm) et de réactions chimiques pour le collège.",
    topics: ["physique", "chimie", "atomes"],
    offlineReady: true
  },
  {
    name: "algo-python-scratch",
    repo: "pedago-numerique/initiation-algo",
    stars: 620,
    license: "Apache 2.0",
    desc_it: "Progetti Scratch guidati per imparare a creare videogiochi educativi e preparare la prova di algoritmi del Brevet.",
    desc_fr: "Projets Scratch pas à pas pour créer des jeux éducatifs et réussir l'épreuve d'algorithmique du Brevet.",
    topics: ["scratch", "python", "technologie"],
    offlineReady: true
  }
];

export const AppStoreTab: React.FC<AppStoreTabProps> = ({
  profile,
  apps,
  onInstallApp,
  installingAppId,
  onSelectCurriculumPack,
  onOpenBridgeModal
}) => {
  const t = translations[profile.language];
  const isIt = profile.language === 'it';
  const theme = getThemeConfig(profile.theme);

  const [bridgeStatus, setBridgeStatus] = useState<BridgeConnectionStatus>(systemBridge.getStatus());
  const [bridgeInfo, setBridgeInfo] = useState<BridgeSystemInfo | null>(systemBridge.getSystemInfo());

  useEffect(() => {
    return systemBridge.subscribe((status, info) => {
      setBridgeStatus(status);
      setBridgeInfo(info);
    });
  }, []);

  // Sub-tabs: 'apps' | 'curriculum-packs' | 'github-discovery'
  const [subTab, setSubTab] = useState<'apps' | 'curriculum-packs' | 'github-discovery'>('apps');

  // Apps search & category
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // GitHub packs state
  const [packs, setPacks] = useState<CurriculumPack[]>(() => {
    const saved = localStorage.getItem('tournesol_installed_packs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return curriculumPacksList;
  });

  const [activePackId, setActivePackId] = useState<string>(profile.activePackId || 'pack-college-4eme');
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [isImportingPack, setIsImportingPack] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // GitHub Search
  const [githubQuery, setGithubQuery] = useState('');

  const categories = [
    { id: 'all', label: t.apps.filterAll },
    { id: 'math', label: t.apps.filterMath },
    { id: 'science', label: t.apps.filterScience },
    { id: 'languages', label: t.apps.filterLanguages },
    { id: 'writing', label: t.apps.filterWriting },
    { id: 'creativity', label: t.apps.filterCreativity },
    { id: 'utility', label: t.apps.filterUtility }
  ];

  const filteredApps = apps.filter((app) => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const appText = getAppDisplay(app, profile.language);

    const matchesSearch = 
      app.name.toLowerCase().includes(term) ||
      appText.summary.toLowerCase().includes(term) ||
      appText.pedagogicalUse.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  const handleInstall = async (app: VerifiedApp) => {
    soundFx.playClick();
    await onInstallApp(app.id);
    soundFx.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleActivatePack = (packId: string) => {
    soundFx.playSuccess();
    setActivePackId(packId);
    setPacks(prev => prev.map(p => ({ ...p, isInstalled: p.id === packId ? true : p.isInstalled })));
    localStorage.setItem('tournesol_installed_packs', JSON.stringify(packs));
    onSelectCurriculumPack?.(packId);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleImportGitHubPack = async () => {
    if (!customRepoUrl.trim()) return;
    setIsImportingPack(true);
    setImportMessage(null);
    soundFx.playClick();

    await new Promise(r => setTimeout(r, 1200));

    // Simulated successful pack import
    const newPack: CurriculumPack = {
      id: `pack-custom-${Date.now()}`,
      name: "Pacchetto Personalizzato GitHub",
      stage: profile.schoolStage || 'middle',
      gradeLevel: profile.gradeLevel,
      version: "1.0-gh",
      author: "Docente / Comunità GitHub",
      description_it: "Pacchetto didattico scaricato e verificato da repository GitHub. Schede e simulazioni salvate per uso offline.",
      description_fr: "Pack pédagogique synchronisé depuis GitHub. Sauvegardé en local pour accès hors-ligne.",
      isInstalled: true,
      lastUpdated: new Date().toISOString().slice(0, 10),
      topicsCount: 15,
      downloadUrl: customRepoUrl
    };

    setPacks(prev => [newPack, ...prev]);
    setActivePackId(newPack.id);
    setIsImportingPack(false);
    setImportMessage(isIt ? '✅ Pacchetto installato con successo! Funziona al 100% offline.' : '✅ Pack installé avec succès ! Disponible hors-ligne.');
    setCustomRepoUrl('');
    soundFx.playSuccess();
  };

  const filteredGitHubProjects = githubSchoolProjects.filter(p => {
    const q = githubQuery.toLowerCase();
    return p.name.includes(q) || p.desc_it.toLowerCase().includes(q) || p.topics.some(t => t.includes(q));
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Hub with Sub-navigation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className={`w-11 h-11 rounded-2xl ${theme.accentPrimary} flex items-center justify-center text-lg shadow-xs shrink-0`}>
              <FolderGit2 className={`w-6 h-6 ${theme.accentText}`} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {isIt ? 'Edu-Hub & Software per la Scuola' : 'Edu-Hub & Écosystème Scolaire'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isIt 
                  ? 'Software verificati leggeri, pacchetti scolastici GitHub e risorse open-source per lo studio'
                  : 'Logiciels certifiés, packs de niveau GitHub et ressources éducatives libres'}
              </p>
            </div>
          </div>

          {/* Sub-tabs segment switcher */}
          <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0 gap-1 w-full xl:w-auto">
            <button
              onClick={() => {
                setSubTab('apps');
                soundFx.playClick();
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                subTab === 'apps'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isIt ? 'Software Consigliati' : 'Logiciels Recommandés'}</span>
            </button>

            <button
              onClick={() => {
                setSubTab('curriculum-packs');
                soundFx.playClick();
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                subTab === 'curriculum-packs'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isIt ? 'Pacchetti Anno & Plugin' : 'Packs de Niveau & Plugins'}</span>
            </button>

            <button
              onClick={() => {
                setSubTab('github-discovery');
                soundFx.playClick();
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                subTab === 'github-discovery'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>{isIt ? 'Cerca Progetti GitHub' : 'Recherche Projets GitHub'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: APPS LIST */}
      {subTab === 'apps' && (
        <div className="space-y-6">
          {/* Search & Categories Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isIt ? 'Cerca tra software matematici, scientifici, lingue o videoscrittura...' : 'Rechercher un logiciel éducatif...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                />
              </div>

              {/* OS Command notice */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
                <Cpu className="w-3.5 h-3.5 text-slate-600" />
                <span>Ottimizzato per {profile.operatingSystem.toUpperCase()} (4GB RAM)</span>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    soundFx.playClick();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bridge Status Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            bridgeStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : bridgeStatus === 'simulated'
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <Radio className={`w-4 h-4 shrink-0 ${bridgeStatus !== 'disconnected' ? 'animate-pulse text-emerald-600' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <span className="font-bold block truncate sm:whitespace-normal">
                  {bridgeStatus === 'connected'
                    ? (isIt ? 'Connettore Locale Attivo: Software Rilevati in Tempo Reale' : 'Connecteur Actif : Logiciels Détectés en Temps Réel')
                    : bridgeStatus === 'simulated'
                    ? (isIt ? 'Simulazione Bridge Attiva: Rilevamento Software Demo' : 'Simulation Active : Détection de Logiciels Démo')
                    : (isIt ? 'Modalità Web Autonoma (Clicca per attivare installazione automatica)' : 'Mode Web Autonome (Activer le connecteur)')}
                </span>
                <span className="text-[11px] opacity-80 block">
                  {bridgeStatus !== 'disconnected' && bridgeInfo
                    ? (isIt ? `Rilevati ${bridgeInfo.installedPackages.length} software installati su ${profile.operatingSystem.toUpperCase()}` : `${bridgeInfo.installedPackages.length} logiciels détectés`)
                    : (isIt ? 'Installa il bridge per abilitare l\'installazione senza terminale.' : 'Activez le pont pour installer sans terminal.')}
                </span>
              </div>
            </div>

            {onOpenBridgeModal && (
              <button
                type="button"
                onClick={onOpenBridgeModal}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 text-xs shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-center"
              >
                {isIt ? 'Gestisci Bridge' : 'Gérer Bridge'}
              </button>
            )}
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => {
              const Icon = iconMap[app.iconName] || Sparkles;
              const appDisplay = getAppDisplay(app, profile.language);
              const isInstalled = app.isInstalled || (bridgeInfo?.installedPackages?.includes(app.id) ?? false);
              const isInstalling = installingAppId === app.id;
              const packageCmd = app.packageCommands?.[profile.operatingSystem] || `sudo apt install ${app.id}`;

              return (
                <div 
                  key={app.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-slate-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{app.name}</h3>
                            {isInstalled && (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 shrink-0">
                                <Check className="w-3.5 h-3.5" />
                                {isIt ? 'Installato' : 'Installé'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium truncate">
                            RAM: {app.ramUsageEstimate} · Dimensione: {app.debSize}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                        {app.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {appDisplay.summary}
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 font-medium">
                      <strong className="text-slate-900 font-bold">{isIt ? 'Uso scolastico: ' : 'Usage pédagogique : '}</strong>
                      {appDisplay.pedagogicalUse}
                    </div>

                    {/* Native command snippet */}
                    <div className="font-mono text-[11px] text-slate-500 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                      <span className="truncate">$ {packageCmd}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(packageCmd);
                          soundFx.playSuccess();
                        }}
                        title={isIt ? 'Copia comando nativo' : 'Copier'}
                        className="text-[10px] text-slate-600 hover:text-slate-900 font-bold shrink-0 ml-2 cursor-pointer"
                      >
                        {isIt ? 'Copia' : 'Copier'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      GPG Firmato
                    </span>

                    <button
                      onClick={() => handleInstall(app)}
                      disabled={isInstalling || isInstalled}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isInstalled
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : isInstalling
                          ? 'bg-slate-200 text-slate-600 animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      {isInstalled ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isIt ? 'Pronto' : 'Prêt'}</span>
                        </>
                      ) : isInstalling ? (
                        <span>{isIt ? 'Installazione...' : 'Installation...'}</span>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{isIt ? 'Installa' : 'Installer'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GITHUB CURRICULUM PACKS & PLUGINS */}
      {subTab === 'curriculum-packs' && (
        <div className="space-y-6">
          {/* Architecture explainer card */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{isIt ? 'Architettura Ibrida: Core Leggero + Pacchetti per Anno' : 'Architecture Hybride : Cœur Léger + Packs Annuels'}</span>
            </div>
            <h3 className="text-lg font-bold">
              {isIt ? 'L\'applicazione rimane snella: scarichi solo l\'anno scolastico che ti serve' : 'L\'application reste fluide : activez uniquement l\'année utile'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
              {isIt 
                ? 'Ogni pacchetto contiene tutte le nozioni, schede di grammatica, teoremi matematici, costanti scientifiche e metodi di studio dedicati. I dati vengono salvati in locale nel computer così da garantire l\'accesso offline senza cadere nella tentazione di Internet.'
                : 'Chaque pack regroupe les cours, fiches de grammaire, théorèmes, constantes et méthodes de travail. Téléchargé en local pour garantir le travail sans connexion internet.'}
            </p>
          </div>

          {/* Installed & Available Packs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packs.map((pack) => {
              const isActive = pack.id === activePackId;

              return (
                <div 
                  key={pack.id}
                  className={`bg-white rounded-3xl p-6 border transition-all space-y-4 ${
                    isActive 
                      ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{pack.name}</h4>
                        {isActive && (
                          <span className="text-[10px] font-black text-amber-900 bg-amber-300 px-2 py-0.5 rounded-md">
                            ATTIVO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {pack.author} · Ver. {pack.version} · {pack.topicsCount} argomenti
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                      {pack.gradeLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {isIt ? pack.description_it : pack.description_fr}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Aggiornato: {pack.lastUpdated}
                    </span>

                    <button
                      onClick={() => handleActivatePack(pack.id)}
                      disabled={isActive}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isIt ? 'In uso nello Studio' : 'Pack Actif'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{isIt ? 'Attiva questo Anno' : 'Activer ce Pack'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sync / Import from GitHub input */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-slate-800" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isIt ? 'Importa Pacchetto Personalizzato da GitHub' : 'Importer un Pack depuis GitHub'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {isIt ? 'Inserisci l\'URL di un file JSON raw creato da un genitore o professore' : 'Lien URL du pack JSON raw'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={customRepoUrl}
                onChange={(e) => setCustomRepoUrl(e.target.value)}
                placeholder="https://raw.githubusercontent.com/username/repo/main/custom-deck.json"
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50"
              />

              <button
                onClick={handleImportGitHubPack}
                disabled={isImportingPack || !customRepoUrl.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {isImportingPack ? (
                  <span>{isIt ? 'Download in corso...' : 'Téléchargement...'}</span>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{isIt ? 'Scarica & Salva Offline' : 'Télécharger'}</span>
                  </>
                )}
              </button>
            </div>

            {importMessage && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                {importMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GITHUB OPEN SOURCE SEARCH */}
      {subTab === 'github-discovery' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isIt ? 'Cerca progetti GitHub per la scuola (es: pythagore, brevet, flashcard, chimica)...' : 'Rechercher un projet GitHub éducatif...'}
                value={githubQuery}
                onChange={(e) => setGithubQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Suggeriti :</span>
              {['maths', 'anki', 'scratch', 'physique', 'brevet'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setGithubQuery(tag);
                    soundFx.playClick();
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGitHubProjects.map((project) => (
              <div 
                key={project.name}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-slate-900" />
                        <h4 className="text-sm font-bold text-slate-900 font-mono">{project.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{project.repo}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <span>★</span>
                      <span>{project.stars}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {isIt ? project.desc_it : project.desc_fr}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {project.topics.map(t => (
                      <span key={t} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-400">{project.license}</span>

                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Offline
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
