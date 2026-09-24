import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Terminal, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Monitor,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SystemUpdate, StudentProfile, OperatingSystem, BridgeConnectionStatus } from '../../types';
import { translations } from '../../i18n/translations';
import { soundFx } from '../../utils/audio';
import { getThemeConfig } from '../../utils/themeStyles';
import { systemBridge } from '../../services/systemBridge';

interface UpdatesTabProps {
  profile: StudentProfile;
  updates: SystemUpdate[];
  onApplyUpdates: (mode: 'security' | 'all') => Promise<void>;
  onCheckUpdates: () => Promise<void>;
  isChecking: boolean;
  isUpdating: boolean;
  updateProgress: number;
  terminalLogs: string[];
  onChangeOS?: (os: OperatingSystem) => void;
  onOpenBridgeModal?: () => void;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  profile,
  updates,
  onApplyUpdates,
  onCheckUpdates,
  isChecking,
  isUpdating,
  updateProgress,
  terminalLogs,
  onChangeOS,
  onOpenBridgeModal
}) => {
  const t = translations[profile.language];
  const isIt = profile.language === 'it';
  const theme = getThemeConfig(profile.theme);

  const [activeOS, setActiveOS] = useState<OperatingSystem>(profile.operatingSystem || 'debian');
  const [showTerminal, setShowTerminal] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeConnectionStatus>(systemBridge.getStatus());

  useEffect(() => {
    return systemBridge.subscribe((status) => {
      setBridgeStatus(status);
    });
  }, []);

  const handleOSSelect = (newOS: OperatingSystem) => {
    setActiveOS(newOS);
    onChangeOS?.(newOS);
    soundFx.playClick();
  };

  const osCommands: Record<OperatingSystem, { update: string; upgrade: string; clean: string; desc: string }> = {
    debian: {
      update: 'sudo apt update',
      upgrade: 'sudo apt upgrade -y',
      clean: 'sudo apt autoremove --purge -y',
      desc: 'Debian 12 / Ubuntu / Linux Mint / Raspberry Pi OS (APT Package Manager)'
    },
    fedora: {
      update: 'sudo dnf check-update',
      upgrade: 'sudo dnf upgrade -y',
      clean: 'sudo dnf autoremove -y',
      desc: 'Fedora Workstation / RHEL / AlmaLinux (DNF Package Manager)'
    },
    arch: {
      update: 'sudo pacman -Sy',
      upgrade: 'sudo pacman -Syu --noconfirm',
      clean: 'sudo pacman -Sc --noconfirm',
      desc: 'Arch Linux / Manjaro / EndeavourOS (Pacman Package Manager)'
    },
    macos: {
      update: 'brew update',
      upgrade: 'brew upgrade',
      clean: 'brew cleanup',
      desc: 'macOS (Homebrew Package Manager su MacBook Air 2014)'
    }
  };

  const fullTerminalCommand = `${osCommands[activeOS].update} && ${osCommands[activeOS].upgrade}`;

  const copyTerminalCommand = () => {
    navigator.clipboard.writeText(fullTerminalCommand);
    soundFx.playSuccess();
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const securityUpdates = updates.filter(u => u.severity === 'critical-security');
  const hasUpdates = updates.length > 0;
  const hasCritical = securityUpdates.length > 0;

  const handleUpdate = async (mode: 'security' | 'all') => {
    soundFx.playClick();
    await onApplyUpdates(mode);
    soundFx.playSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. OS & Distribution Selector Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Monitor className="w-5 h-5 text-slate-700 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {isIt ? 'Sistema Operativo del Computer' : 'Système d\'Exploitation Actif'}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                {osCommands[activeOS].desc}
              </p>
            </div>
          </div>

          {/* OS Switcher Buttons & Bridge Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto sm:justify-end shrink-0">
            {/* 2 rows on smartphone (grid-cols-2), horizontal on tablet/desktop (sm:flex) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
              {[
                { id: 'debian', label: 'Debian / Ubuntu', icon: '🌀' },
                { id: 'fedora', label: 'Fedora', icon: '🎩' },
                { id: 'arch', label: 'Arch', icon: '🏹' },
                { id: 'macos', label: 'macOS (Brew)', icon: '🍎' }
              ].map((os) => {
                const isSelected = activeOS === os.id;
                return (
                  <button
                    key={os.id}
                    onClick={() => handleOSSelect(os.id as OperatingSystem)}
                    className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{os.icon}</span>
                    <span className="truncate">{os.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bridge button centered on smartphone, right-aligned on tablet/desktop */}
            {onOpenBridgeModal && (
              <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={onOpenBridgeModal}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border shrink-0 whitespace-nowrap ${
                    bridgeStatus === 'connected'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : bridgeStatus === 'simulated'
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isIt ? 'Connettore Bridge' : 'Connecteur Bridge'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Copy command box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1 w-full sm:w-auto">
            <span className="text-emerald-600 font-bold shrink-0">$</span>
            <span className="text-slate-800 font-semibold truncate select-all">{fullTerminalCommand}</span>
          </div>

          <button
            onClick={copyTerminalCommand}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 text-xs shadow-2xs transition cursor-pointer shrink-0 whitespace-nowrap"
          >
            {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCommand ? (isIt ? 'Copiato!' : 'Copié !') : (isIt ? 'Copia per il Terminale' : 'Copier la commande')}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Status Card */}
      <div className={`p-4 sm:p-5 md:p-6 rounded-3xl border transition-all ${
        hasCritical 
          ? 'bg-amber-50/70 border-amber-300 shadow-xs'
          : hasUpdates
          ? 'bg-slate-50 border-slate-200 shadow-xs'
          : 'bg-emerald-50/60 border-emerald-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
          <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1 w-full">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
              hasCritical 
                ? 'bg-amber-500 text-white shadow-xs'
                : hasUpdates
                ? `${theme.accentPrimary} ${theme.accentText} shadow-xs`
                : 'bg-emerald-600 text-white shadow-xs'
            }`}>
              {hasCritical ? (
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : hasUpdates ? (
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-medium flex-wrap">
                <span className="font-bold text-slate-700">{activeOS.toUpperCase()}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className={`font-bold ${hasCritical ? 'text-amber-700' : hasUpdates ? 'text-slate-700' : 'text-emerald-700'}`}>
                  {hasCritical ? t.updates.criticalBadge : hasUpdates ? t.updates.standardBadge : (isIt ? 'Stato Protetto' : 'État Sécurisé')}
                </span>
                <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                <span className="text-slate-500 hidden sm:inline">ZRAM Ottimizzata</span>
              </div>

              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {hasCritical 
                  ? t.updates.hasUpdates 
                  : hasUpdates 
                  ? t.updates.hasUpdates 
                  : t.updates.allUpToDate}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">
                {hasCritical 
                  ? t.updates.criticalDesc 
                  : hasUpdates 
                  ? t.updates.standardDesc 
                  : t.updates.allUpToDateDesc}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-start lg:justify-end flex-wrap pt-2 lg:pt-0 border-t border-slate-200/50 lg:border-t-0">
            <button
              type="button"
              onClick={onCheckUpdates}
              disabled={isChecking || isUpdating}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? (isIt ? 'Controllo...' : 'Vérification...') : t.updates.btnCheck}</span>
            </button>

            {hasCritical && (
              <button
                type="button"
                onClick={() => handleUpdate('security')}
                disabled={isUpdating || isChecking}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {t.updates.btnUpdateSecurity}
              </button>
            )}

            {hasUpdates && (
              <button
                type="button"
                onClick={() => handleUpdate('all')}
                disabled={isUpdating || isChecking}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {t.updates.btnUpdateAll}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar during update */}
        {isUpdating && (
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{isIt ? 'Installazione aggiornamenti di sicurezza in corso...' : 'Installation des paquets sécurisés...'}</span>
              <span>{updateProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 transition-all duration-300 rounded-full"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Package Updates List */}
      {hasUpdates && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isIt ? 'Pacchetti di Sistema Disponibili' : 'Paquets Disponibles'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {updates.length} {isIt ? 'aggiornamenti verificati' : 'mises à jour'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {updates.map((update) => (
              <div key={update.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-slate-900 font-mono">{update.packageName}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono">{update.currentVersion} ➔ {update.newVersion}</span>
                    {update.cveId && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {update.cveId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {isIt ? update.description_it || update.description : update.description_fr || update.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0">
                  <span className="font-mono">{update.size}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-bold">Verificato</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Terminal Logs Collapsible */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800">
              {isIt ? 'Registro Operazioni Terminale (Dettagli Tecnici)' : 'Console & Journaux Système'}
            </span>
          </div>
          {showTerminal ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showTerminal && (
          <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs border-t border-slate-800 max-h-60 overflow-y-auto space-y-1">
            {terminalLogs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
