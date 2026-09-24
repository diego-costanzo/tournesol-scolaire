import React, { useState } from 'react';
import { 
  X, 
  AppWindow, 
  Maximize2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Laptop, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useFullscreen } from '../../hooks/useFullscreen';
import { soundFx } from '../../utils/audio';

interface DesktopWindowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'it' | 'fr';
  currentUrl?: string;
}

export const DesktopWindowGuideModal: React.FC<DesktopWindowGuideModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
}) => {
  const isIt = language === 'it';
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedDesktopFile, setCopiedDesktopFile] = useState(false);

  if (!isOpen) return null;

  // Linux command to launch browser in pure standalone app window
  const appWindowCommand = `chromium --app="${currentUrl}" --class="TournesolOS" || google-chrome --app="${currentUrl}"`;

  // Linux .desktop file content
  const desktopFileContent = `[Desktop Entry]
Version=1.0
Name=Tournesol Edu-Hub
Comment=Diario e Portale di Studio senza distrazioni
Exec=chromium --app=${currentUrl} --class=TournesolOS
Icon=${currentUrl}/icon.svg
Terminal=false
Type=Application
Categories=Education;Office;`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(appWindowCommand);
    setCopiedCommand(true);
    soundFx.playClick();
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleCopyDesktopFile = () => {
    const bashScript = `cat << 'EOF' > ~/.local/share/applications/tournesol.desktop\n${desktopFileContent}\nEOF\nchmod +x ~/.local/share/applications/tournesol.desktop`;
    navigator.clipboard.writeText(bashScript);
    setCopiedDesktopFile(true);
    soundFx.playClick();
    setTimeout(() => setCopiedDesktopFile(false), 2000);
  };

  const handlePWAInstall = async () => {
    soundFx.playClick();
    const ok = await install();
    if (ok) {
      soundFx.playSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <AppWindow className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isIt ? 'Apri come Vera Applicazione di Sistema' : 'Ouvrir en Application Dédiée'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isIt 
                  ? 'Senza barra degli indirizzi, senza frecce, senza schede del browser: pulita e senza distrazioni'
                  : 'Sans barre d\'adresse, sans onglets ni boutons de navigation pour une concentration totale'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Notice */}
        {isInstalled && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {isIt 
                ? 'Tournesol è già in esecuzione in modalità Finestra Standalone!' 
                : 'Tournesol fonctionne déjà en mode Fenêtre Dédiée Standalone !'}
            </span>
          </div>
        )}

        {/* Method 1: PWA Native Installation */}
        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-slate-900">
                {isIt ? 'Installazione PWA con 1 Clic (Consigliata)' : 'Installation PWA en 1 Clic (Recommandé)'}
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {isIt ? 'Zero Terminale' : 'Sans Terminal'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isIt 
              ? 'Il browser (Chrome, Chromium, Edge, Brave) supporta lo standard PWA: trasformando la pagina in una vera finestra nativa con la sua icona sulla barra delle applicazioni del PC.'
              : 'Votre navigateur prend en charge les PWA : l\'application s\'ouvre dans sa propre fenêtre isolée, avec icône dédiée sur le bureau.'}
          </p>

          {isInstallable ? (
            <button
              onClick={handlePWAInstall}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isIt ? 'Installa Subito Tournesol come Finestra Dedicata' : 'Installer Tournesol comme Fenêtre Dédiée'}</span>
            </button>
          ) : (
            <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-amber-200/80 space-y-1">
              <p className="font-bold text-slate-800">
                {isIt ? '👉 Come installarla dal browser in uso:' : '👉 Comment l\'installer depuis votre navigateur :'}
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-600 text-[11px]">
                <li>{isIt ? 'Guarda in alto a destra nella barra degli indirizzi del browser' : 'Regardez en haut à droite de la barre d\'adresse'}</li>
                <li>{isIt ? 'Clicca sull\'icona "Installa Tournesol" (o menù ⋮ > "Installa...")' : 'Cliquez sur l\'icône "Installer Tournesol"'}</li>
                <li>{isIt ? 'Si aprirà istantaneamente una finestra ad-hoc senza elementi del browser!' : 'L\'application s\'ouvrira immédiatement dans sa propre fenêtre !'}</li>
              </ol>
            </div>
          )}
        </div>

        {/* Method 2: Launch with --app flag (Linux Desktop / Kiosk) */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-slate-900">
                {isIt ? 'Lanciatore Desktop Linux (.desktop ad-hoc)' : 'Lanceur Bureau Linux (.desktop dédié)'}
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Linux / Debian / Fedora
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isIt 
              ? 'Puoi creare un lanciatore ufficiale per il menu delle applicazioni o il desktop dello studente. Cliccando sull\'icona, il browser si avvia in modalità finestra dedicata (--app), nascondendo completamente barre e URL.'
              : 'Créez une entrée officielle dans le menu des applications pour lancer Tournesol en mode fenêtre applicative sans barre d\'adresse.'}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>{isIt ? 'Comando di avvio rapido:' : 'Commande de lancement :'}</span>
              <button
                onClick={handleCopyCommand}
                className="text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand ? (isIt ? 'Copiato!' : 'Copié !') : (isIt ? 'Copia comando' : 'Copier')}</span>
              </button>
            </div>
            <div className="bg-slate-900 text-amber-300 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              <code>{appWindowCommand}</code>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleCopyDesktopFile}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedDesktopFile ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Layers className="w-3.5 h-3.5 text-slate-600" />}
              <span>
                {copiedDesktopFile 
                  ? (isIt ? 'Script di creazione lanciatore copiato negli appunti!' : 'Script de création copié !') 
                  : (isIt ? 'Copia Script per creare l\'icona nel Menù Applicazioni del PC' : 'Copier script pour créer l\'icône dans le Menu Applications')}
              </span>
            </button>
          </div>
        </div>

        {/* Method 3: In-App Fullscreen Toggle */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                {isIt ? 'Modalità Studio a Schermo Intero (F11)' : 'Plein Écran Immersion (F11)'}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {isIt 
                  ? 'Nasconde immediatamente qualsiasi barra del sistema operativo durante i compiti' 
                  : 'Masque toutes les barres pour une immersion d\'étude immédiate'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              toggleFullscreen();
              soundFx.playClick();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            {isFullscreen 
              ? (isIt ? 'Esci da Schermo Intero' : 'Quitter Plein Écran') 
              : (isIt ? 'Attiva Schermo Intero' : 'Activer Plein Écran')}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            {isIt ? 'Chiudi' : 'Fermer'}
          </button>
        </div>

      </div>
    </div>
  );
};
