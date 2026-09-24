import React, { useState } from 'react';
import { Download, AppWindow, Maximize2, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { soundFx } from '../../utils/audio';

interface PWAInstallButtonProps {
  language: 'it' | 'fr';
  onOpenGuideModal?: () => void;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language,
  onOpenGuideModal,
  variant = 'compact'
}) => {
  const isIt = language === 'it';
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone window, don't clutter the header unless user opens settings
  if (isInstalled) {
    return null;
  }

  // If beforeinstallprompt is ready: trigger native 1-click install
  if (isInstallable) {
    return (
      <button
        onClick={async () => {
          soundFx.playClick();
          const ok = await install();
          if (ok) soundFx.playSuccess();
        }}
        className={`rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border ${
          variant === 'compact'
            ? 'px-2.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
            : 'px-4 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
        }`}
        title={isIt ? 'Installa Tournesol come finestra applicativa senza browser' : 'Installer Tournesol en application dédiée'}
      >
        <AppWindow className="w-3.5 h-3.5" />
        <span>{isIt ? 'Apri in Finestra App' : 'Fenêtre Dédiée'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition flex items-center gap-1.5 cursor-pointer"
        >
          <AppWindow className="w-3.5 h-3.5" />
          <span>{isIt ? 'Aggiungi a Home' : 'Ajouter à l\'écran'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                {isIt ? 'Aggiungi ad Home su iPad / iPhone' : 'Ajouter sur iPad / iPhone'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isIt ? (
                  <>
                    1. Tocca il pulsante <strong>Condividi</strong> (icona quadrato con freccia) nella barra di Safari.<br />
                    2. Scorri verso il basso e tocca <strong>Aggiungi alla schermata Home</strong>.<br />
                    3. Tournesol si aprirà a schermo intero senza barre!
                  </>
                ) : (
                  <>
                    1. Touchez l'icône <strong>Partager</strong> dans Safari.<br />
                    2. Sélectionnez <strong>Sur l'écran d'accueil</strong>.<br />
                    3. L'application s'ouvrira en plein écran sans aucune barre !
                  </>
                )}
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                {isIt ? 'Chiudi' : 'Fermer'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback: If beforeinstallprompt hasn't fired yet (or Firefox/Safari desktop), provide guidance button
  return (
    <button
      onClick={() => {
        soundFx.playClick();
        onOpenGuideModal?.();
      }}
      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
      title={isIt ? 'Configura finestra applicativa dedicata' : 'Configurer le mode fenêtre dédiée'}
    >
      <AppWindow className="w-3.5 h-3.5 text-amber-700" />
      <span className="hidden sm:inline">{isIt ? 'Modalità Finestra App' : 'Mode Fenêtre'}</span>
    </button>
  );
};
