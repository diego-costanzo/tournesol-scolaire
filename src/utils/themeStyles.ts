import { ThemeVariant } from '../types';

export interface ThemeConfig {
  id: ThemeVariant;
  name_it: string;
  name_fr: string;
  icon: string;
  // Tone description
  toneDesc: string;
  // Canvas background (60%)
  pageBg: string;
  // Card surface (30%)
  cardBg: string;
  cardBorder: string;
  cardBorderSubtle: string;
  // Accent & Interactive (10%)
  accentPrimary: string;
  accentHover: string;
  accentText: string;
  accentSoft: string;
  accentBorder: string;
  // Text contrast
  headingText: string;
  bodyText: string;
  mutedText: string;
  // Header & Subbar
  headerBg: string;
  subHeaderBg: string;
  headerBorder: string;
  // Active nav indicator
  navActiveBg: string;
  navActiveText: string;
  navInactiveText: string;
  navHoverBg: string;
}

export const themes: Record<string, ThemeConfig> = {
  amber: {
    id: 'amber',
    name_it: 'Ambra Solare (Originale)',
    name_fr: 'Ambre Solaire (Original)',
    icon: '🌻',
    toneDesc: 'Tonalità calde dorate su sfondi crema ad alto contrasto',
    pageBg: 'bg-[#FFFDF4]',
    cardBg: 'bg-white',
    cardBorder: 'border-amber-200',
    cardBorderSubtle: 'border-amber-100',
    accentPrimary: 'bg-amber-400',
    accentHover: 'hover:bg-amber-300',
    accentText: 'text-amber-950',
    accentSoft: 'bg-amber-50',
    accentBorder: 'border-amber-300',
    headingText: 'text-amber-950',
    bodyText: 'text-slate-800',
    mutedText: 'text-amber-900/70',
    headerBg: 'bg-amber-50/95',
    subHeaderBg: 'bg-amber-100/80',
    headerBorder: 'border-amber-200',
    navActiveBg: 'bg-amber-400 shadow-xs ring-1 ring-amber-500/40',
    navActiveText: 'text-amber-950',
    navInactiveText: 'text-amber-900/80',
    navHoverBg: 'hover:bg-amber-100/80'
  },
  blue: {
    id: 'blue',
    name_it: 'Blu Oceano & Notte Spaziale',
    name_fr: 'Bleu Océan & Nuit Spatiale',
    icon: '🌊',
    toneDesc: 'Tonalità blu cobalto e cielo con testi blu notte profondo',
    pageBg: 'bg-[#F4F9FF]',
    cardBg: 'bg-white',
    cardBorder: 'border-sky-200',
    cardBorderSubtle: 'border-sky-100',
    accentPrimary: 'bg-sky-500',
    accentHover: 'hover:bg-sky-400',
    accentText: 'text-white',
    accentSoft: 'bg-sky-50',
    accentBorder: 'border-sky-300',
    headingText: 'text-sky-950',
    bodyText: 'text-slate-800',
    mutedText: 'text-sky-900/70',
    headerBg: 'bg-sky-50/95',
    subHeaderBg: 'bg-sky-100/80',
    headerBorder: 'border-sky-200',
    navActiveBg: 'bg-sky-500 shadow-xs ring-1 ring-sky-600/40',
    navActiveText: 'text-white',
    navInactiveText: 'text-sky-900/80',
    navHoverBg: 'hover:bg-sky-100/80'
  },
  purple: {
    id: 'purple',
    name_it: 'Viola Ametista & Galassia',
    name_fr: 'Violet Améthyste & Galaxie',
    icon: '🔮',
    toneDesc: 'Tonalità lilla e ametista con testi prugna scuro',
    pageBg: 'bg-[#FAF6FF]',
    cardBg: 'bg-white',
    cardBorder: 'border-purple-200',
    cardBorderSubtle: 'border-purple-100',
    accentPrimary: 'bg-purple-500',
    accentHover: 'hover:bg-purple-400',
    accentText: 'text-white',
    accentSoft: 'bg-purple-50',
    accentBorder: 'border-purple-300',
    headingText: 'text-purple-950',
    bodyText: 'text-slate-800',
    mutedText: 'text-purple-900/70',
    headerBg: 'bg-purple-50/95',
    subHeaderBg: 'bg-purple-100/80',
    headerBorder: 'border-purple-200',
    navActiveBg: 'bg-purple-500 shadow-xs ring-1 ring-purple-600/40',
    navActiveText: 'text-white',
    navInactiveText: 'text-purple-900/80',
    navHoverBg: 'hover:bg-purple-100/80'
  },
  orange: {
    id: 'orange',
    name_it: 'Arancio Mandarino & Energia',
    name_fr: 'Orange Mandarine & Énergie',
    icon: '🍊',
    toneDesc: 'Tonalità mandarino e pesca con testi terracotta profondo',
    pageBg: 'bg-[#FFF8F3]',
    cardBg: 'bg-white',
    cardBorder: 'border-orange-200',
    cardBorderSubtle: 'border-orange-100',
    accentPrimary: 'bg-orange-500',
    accentHover: 'hover:bg-orange-400',
    accentText: 'text-white',
    accentSoft: 'bg-orange-50',
    accentBorder: 'border-orange-300',
    headingText: 'text-orange-950',
    bodyText: 'text-slate-800',
    mutedText: 'text-orange-900/70',
    headerBg: 'bg-orange-50/95',
    subHeaderBg: 'bg-orange-100/80',
    headerBorder: 'border-orange-200',
    navActiveBg: 'bg-orange-500 shadow-xs ring-1 ring-orange-600/40',
    navActiveText: 'text-white',
    navInactiveText: 'text-orange-900/80',
    navHoverBg: 'hover:bg-orange-100/80'
  },
  green: {
    id: 'green',
    name_it: 'Verde Menta & Foresta',
    name_fr: 'Vert Menthe & Forêt',
    icon: '🍃',
    toneDesc: 'Tonalità salvia e smeraldo rilassante per la vista',
    pageBg: 'bg-[#F4FAF6]',
    cardBg: 'bg-white',
    cardBorder: 'border-emerald-200',
    cardBorderSubtle: 'border-emerald-100',
    accentPrimary: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-500',
    accentText: 'text-white',
    accentSoft: 'bg-emerald-50',
    accentBorder: 'border-emerald-300',
    headingText: 'text-emerald-950',
    bodyText: 'text-slate-800',
    mutedText: 'text-emerald-900/70',
    headerBg: 'bg-emerald-50/95',
    subHeaderBg: 'bg-emerald-100/80',
    headerBorder: 'border-emerald-200',
    navActiveBg: 'bg-emerald-600 shadow-xs ring-1 ring-emerald-700/40',
    navActiveText: 'text-white',
    navInactiveText: 'text-emerald-900/80',
    navHoverBg: 'hover:bg-emerald-100/80'
  }
};

export const getThemeConfig = (theme: ThemeVariant): ThemeConfig => {
  // Map legacy names if present
  if (theme === 'sunflower' || theme === 'honey' || theme === 'lemon') return themes.amber;
  if (theme === 'night') return themes.blue;
  return themes[theme] || themes.amber;
};
