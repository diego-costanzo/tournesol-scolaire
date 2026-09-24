import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  Check, 
  Copy, 
  RefreshCw, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Radio, 
  Sparkles,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { systemBridge } from '../services/systemBridge';
import { BridgeConnectionStatus, BridgeSystemInfo, OperatingSystem } from '../types';
import { soundFx } from '../utils/audio';

interface BridgeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OperatingSystem;
  language: 'it' | 'fr';
}

export const BridgeStatusModal: React.FC<BridgeStatusModalProps> = ({
  isOpen,
  onClose,
  os,
  language
}) => {
  const isIt = language === 'it';
  const [status, setStatus] = useState<BridgeConnectionStatus>(systemBridge.getStatus());
  const [info, setInfo] = useState<BridgeSystemInfo | null>(systemBridge.getSystemInfo());
  const [copied, setCopied] = useState(false);
  const [isProbing, setIsProbing] = useState(false);

  useEffect(() => {
    return systemBridge.subscribe((newStatus, newInfo) => {
      setStatus(newStatus);
      setInfo(newInfo);
    });
  }, []);

  if (!isOpen) return null;

  const handleCopyCommand = () => {
    const cmd = systemBridge.getActivationCommand(os);
    navigator.clipboard.writeText(cmd);
    soundFx.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProbe = async () => {
    soundFx.playClick();
    setIsProbing(true);
    await systemBridge.probeBridge();
    setIsProbing(false);
  };

  const handleToggleSimulation = () => {
    soundFx.playClick();
    const nextSim = status !== 'simulated';
    systemBridge.setSimulated(nextSim);
  };

  const isConnected = status === 'connected' || status === 'simulated';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {isIt ? 'Connettore di Sistema (Local Bridge)' : 'Connecteur Système (Local Bridge)'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isConnected 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {status === 'connected' ? (isIt ? 'Attivo' : 'Actif') : status === 'simulated' ? (isIt ? 'Simulato' : 'Simulé') : (isIt ? 'Web Sandbox' : 'Hors-ligne')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isIt 
                  ? 'Permette a Tournesol di leggere RAM, software e aggiornamenti senza terminale' 
                  : 'Permet à Tournesol de vérifier RAM, logiciels et paquets sans terminal'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Banner */}
          {isConnected ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-emerald-950 text-sm">
                  {status === 'connected' 
                    ? (isIt ? 'Bridge Connesso al Sistema Operativo' : 'Connecteur Connecté au Système')
                    : (isIt ? 'Modalità Simulazione Attiva per Anteprima' : 'Mode Simulation Actif pour Démonstration')}
                </h4>
                <p className="text-emerald-800/90 mt-0.5">
                  {isIt 
                    ? 'L\'app può controllare automaticamente la memoria RAM, verificare se GeoGebra è installato e gestire la sicurezza con 1 clic.'
                    : 'L\'application peut vérifier la RAM réelle, détecter GeoGebra et appliquer la sécurité en 1 clic.'}
                </p>

                {info && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-200/60">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">{isIt ? 'Memoria RAM' : 'Mémoire RAM'}</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {(info.ram.usedMb / 1024).toFixed(1)} GB / {(info.ram.totalMb / 1024).toFixed(1)} GB
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">ZRAM Swap</span>
                      <span className="font-bold text-emerald-700 text-xs">
                        {info.ram.zramActive ? (isIt ? 'Attiva (7 GB effettivi)' : 'Actif (7 Go)') : 'Disattivata'}
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block">{isIt ? 'Ambiente Desktop' : 'Bureau'}</span>
                      <span className="font-bold text-slate-800 text-xs truncate block">
                        {info.desktopEnvironment || 'KDE Plasma'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-amber-950 text-sm">
                  {isIt ? 'Modalità Web Autonoma (Nessun Bridge Rilevato)' : 'Mode Web Autonome (Aucun connecteur détecté)'}
                </h4>
                <p className="text-amber-900/90 mt-0.5">
                  {isIt
                    ? 'Tournesol funziona al 100% per compiti, orario e studio. Per abilitare il controllo automatico dei software con un clic senza terminale, avvia il connettore con il comando qui sotto.'
                    : 'Tournesol fonctionne pour les devoirs et l\'emploi du temps. Pour activer l\'installation automatique sans terminal, démarrez le connecteur.'}
                </p>
              </div>
            </div>
          )}

          {/* How It Works Explanation */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>{isIt ? 'Come funziona e perché è sicuro al 100%' : 'Comment ça fonctionne & Sécurité'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <strong className="block text-slate-900 mb-0.5">{isIt ? '🔒 Solo 127.0.0.1' : '🔒 Local uniquement'}</strong>
                <span>{isIt ? 'Inaccessibile da Internet, ascolta solo le richieste locali del computer.' : 'Inaccessible depuis Internet, écoute uniquement en local.'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <strong className="block text-slate-900 mb-0.5">{isIt ? '🪶 6 MB di RAM' : '🪶 6 Mo de RAM'}</strong>
                <span>{isIt ? 'Usa Python standard già presente nel sistema. Non consuma risorse.' : 'Utilise le Python standard du système sans gaspillage.'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <strong className="block text-slate-900 mb-0.5">{isIt ? '🛡️ PolicyKit Grafico' : '🛡️ PolicyKit Graphique'}</strong>
                <span>{isIt ? 'Le autorizzazioni usano la normale finestra di sistema di Debian/KDE.' : 'Les autorisations utilisent la boîte de dialogue native.'}</span>
              </div>
            </div>
          </div>

          {/* Activation Command (One-Liner) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>{isIt ? 'Comando di attivazione rapida (Una sola volta nella vita del PC)' : 'Commande d\'activation unique'}</span>
              </label>
              <span className="text-[11px] text-slate-500 font-semibold uppercase">{os}</span>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-950 text-slate-200 text-[11px] font-mono rounded-xl overflow-x-auto border border-slate-800 select-all">
                {systemBridge.getActivationCommand(os)}
              </pre>
              <button
                type="button"
                onClick={handleCopyCommand}
                className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isIt ? 'Copiato!' : 'Copié !') : (isIt ? 'Copia Comando' : 'Copier')}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {isIt 
                ? 'Incolla questo comando nel Terminale. Lo script si avvierà in background all\'accensione del PC.'
                : 'Collez cette ligne dans le Terminal. Le démon s\'exécutera silencieusement en tâche de fond.'}
            </p>
          </div>

          {/* Action Buttons: Test Probe & Toggle Simulation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleToggleSimulation}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                status === 'simulated'
                  ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {status === 'simulated'
                  ? (isIt ? 'Disattiva Simulazione Bridge' : 'Désactiver la Simulation')
                  : (isIt ? 'Simula Connessione Bridge (Demo)' : 'Simuler la Connexion (Démo)')}
              </span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleProbe}
                disabled={isProbing}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                <span>{isProbing ? (isIt ? 'Verifica...' : 'Test...') : (isIt ? 'Testa Connessione Locale' : 'Tester la Connexion')}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                {isIt ? 'Chiudi' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
