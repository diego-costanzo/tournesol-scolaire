import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  ShieldCheck, 
  Package, 
  CalendarDays, 
  CheckSquare, 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  ArrowLeftRight,
  Radio,
  Maximize2,
  Minimize2,
  Calculator
} from 'lucide-react';
import { Language, ThemeVariant, StudentProfile, BridgeConnectionStatus } from '../types';
import { translations } from '../i18n/translations';
import { soundFx } from '../utils/audio';
import { getThemeConfig } from '../utils/themeStyles';
import { systemBridge } from '../services/systemBridge';
import { PWAInstallButton } from './common/PWAInstallButton';
import { useFullscreen } from '../hooks/useFullscreen';

interface HeaderProps {
  profile: StudentProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeVariant) => void;
  toggleSound: () => void;
  hasCriticalUpdates: boolean;
  pendingHomeworkCount: number;
  onOpenProfile: () => void;
  onOpenBridgeModal?: () => void;
  onOpenDesktopWindowModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  setLanguage,
  toggleSound,
  hasCriticalUpdates,
  pendingHomeworkCount,
  onOpenProfile,
  onOpenBridgeModal,
  onOpenDesktopWindowModal
}) => {
  const t = translations[profile.language];
  const isIt = profile.language === 'it';
  const theme = getThemeConfig(profile.theme);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeConnectionStatus>(systemBridge.getStatus());
  const { isFullscreen, toggleFullscreen, isSupported: isFullscreenSupported } = useFullscreen();

  useEffect(() => {
    return systemBridge.subscribe((status) => {
      setBridgeStatus(status);
    });
  }, []);

  const handleTabChange = (tabId: string) => {
    soundFx.playClick();
    setActiveTab(tabId);
  };

  const firstName = profile.name.trim().split(' ')[0] || (isIt ? 'Studente' : 'Élève');

  // Complete list of all application tabs - visible directly without hiding in submenus
  const allNavItems = [
    {
      id: 'homework',
      label: isIt ? 'Diario' : 'Cahier',
      shortLabel: isIt ? 'Diario' : 'Cahier',
      icon: CheckSquare,
      badge: pendingHomeworkCount > 0 ? `${pendingHomeworkCount}` : undefined
    },
    {
      id: 'timetable',
      label: isIt ? 'Orario' : 'Emploi du temps',
      shortLabel: isIt ? 'Orario' : 'Emploi',
      icon: CalendarDays,
      sublabel: `Sett. ${profile.currentWeek}`
    },
    {
      id: 'moyenne',
      label: isIt ? 'Voti (Media)' : 'Notes (Moyenne)',
      shortLabel: isIt ? 'Voti' : 'Notes',
      icon: Calculator
    },
    {
      id: 'study',
      label: isIt ? 'Studio & Formule' : 'Outils & Révision',
      shortLabel: isIt ? 'Studio' : 'Outils',
      icon: Sparkles
    },
    {
      id: 'apps',
      label: isIt ? 'Programmi Scolastici' : 'Logiciels Éducatifs',
      shortLabel: isIt ? 'Programmi' : 'Logiciels',
      icon: Package
    },
    {
      id: 'updates',
      label: isIt ? 'Sicurezza & Sistema' : 'Sécurité & Système',
      shortLabel: isIt ? 'Sicurezza' : 'Sécurité',
      icon: ShieldCheck,
      badge: hasCriticalUpdates ? '!' : undefined
    },
    {
      id: 'transfer',
      label: isIt ? 'Sincronizza' : 'Synchroniser',
      shortLabel: isIt ? 'Sincro' : 'Sync',
      icon: ArrowLeftRight
    },
    {
      id: 'settings',
      label: t.nav.settings,
      shortLabel: isIt ? 'Impost.' : 'Paramètres',
      icon: Settings
    }
  ];

  return (
    <header className={`sticky top-0 z-30 ${theme.headerBg} backdrop-blur-md border-b ${theme.headerBorder} shadow-2xs transition-colors duration-200 w-full`}>
      {/* Top Single Unified Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 h-14 flex items-center justify-between gap-1.5 md:gap-2 lg:gap-4 w-full">
        {/* Brand & Student Identity */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${theme.accentPrimary} flex items-center justify-center text-base sm:text-lg shadow-xs shrink-0`}>
            <Sun className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.accentText}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className={`text-sm sm:text-base font-extrabold tracking-tight ${theme.headingText}`}>
                Tournesol
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 hidden sm:inline">
                {profile.gradeLevel}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5 hidden 2xl:block truncate max-w-[130px]">
              {isIt ? `Ciao, ${firstName}!` : `Bonjour, ${firstName} !`}
            </p>
          </div>
        </div>

        {/* Desktop & Tablet Main Navigation Bar - All tabs directly clickable */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink min-w-0">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] lg:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? `${theme.accentSoft} ${theme.headingText} shadow-xs border ${theme.cardBorderSubtle}`
                    : `text-slate-500 hover:${theme.headingText} hover:bg-white/60`
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? theme.headingText : 'text-slate-500'
                }`} />
                
                {isActive && (
                  <span>{item.shortLabel}</span>
                )}

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black leading-none ${
                    item.id === 'updates' ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Sound, Fullscreen, Bilingual toggle, Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto md:ml-0">
          {/* Bridge Subtle Indicator (if modal provided) */}
          {onOpenBridgeModal && (
            <button
              type="button"
              onClick={onOpenBridgeModal}
              title={
                bridgeStatus === 'connected'
                  ? (isIt ? 'Bridge PC Attivo' : 'Bridge Connecté')
                  : (isIt ? 'Stato connettore PC' : 'État connecteur PC')
              }
              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1 ${
                bridgeStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${bridgeStatus === 'connected' ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden 2xl:inline text-[11px] font-bold">
                {bridgeStatus === 'connected' ? 'PC Connesso' : 'Bridge'}
              </span>
            </button>
          )}

          {/* Fullscreen Button - available on sm and above */}
          {isFullscreenSupported && (
            <button
              type="button"
              onClick={() => {
                toggleFullscreen();
                soundFx.playClick();
              }}
              title={isFullscreen ? (isIt ? 'Esci da schermo intero (F11)' : 'Quitter plein écran (F11)') : (isIt ? 'Schermo intero (F11)' : 'Plein écran (F11)')}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer hidden sm:flex items-center justify-center"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              toggleSound();
              soundFx.playClick();
            }}
            title={profile.soundEffects ? (isIt ? 'Disattiva suoni' : 'Désactiver sons') : (isIt ? 'Attiva suoni' : 'Activer sons')}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center"
          >
            {profile.soundEffects ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 opacity-40" />}
          </button>

          {/* Clean Language Switcher (IT / FR) - always visible, never squeezed */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold shrink-0 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                if (profile.language !== 'it') {
                  setLanguage('it');
                  soundFx.playSuccess();
                }
              }}
              className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
                isIt ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              IT
            </button>
            <button
              type="button"
              onClick={() => {
                if (profile.language !== 'fr') {
                  setLanguage('fr');
                  soundFx.playSuccess();
                }
              }}
              className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
                !isIt ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              FR
            </button>
          </div>

          {/* Profile Avatar Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            title={isIt ? 'Modifica profilo e classe' : 'Modifier profil'}
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
          >
            <span className="text-base leading-none">{profile.avatar || '🌻'}</span>
            <span className="text-xs font-bold text-slate-800 hidden xl:inline max-w-[80px] truncate">{firstName}</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Track (< md) */}
      <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xs px-2 py-1.5 flex items-center justify-start sm:justify-around gap-1 overflow-x-auto scrollbar-none w-full">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer shrink-0 min-w-[50px] ${
                isActive
                  ? 'bg-amber-100/90 text-amber-950 font-black'
                  : 'text-slate-500 hover:text-slate-900 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-slate-500'}`} />
                {item.badge && (
                  <span className={`absolute -top-1 -right-2 text-[9px] px-1 rounded-full font-black leading-none ${
                    item.id === 'updates' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
