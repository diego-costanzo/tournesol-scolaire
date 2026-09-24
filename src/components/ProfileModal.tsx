import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  GraduationCap, 
  Palette, 
  Monitor, 
  Globe, 
  Check, 
  X,
  Volume2,
  Radio,
  BookOpen,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, ThemeVariant, OperatingSystem, Language, SchoolStage } from '../types';
import { themes } from '../utils/themeStyles';
import { soundFx } from '../utils/audio';
import { allSchoolGrades, schoolStagesList, getRecommendedGradeForAge } from '../data/schoolGrades';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updated: Partial<StudentProfile>) => void;
  onOpenBridgeModal?: () => void;
  isFirstLaunch?: boolean;
}

const avatarOptions = ['🌻', '🚀', '🦊', '🔬', '⚽', '🎨', '📚', '⭐', '🦁', '🐬'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onOpenBridgeModal,
  isFirstLaunch = false
}) => {
  const isIt = profile.language === 'it';

  const [name, setName] = useState(profile.name || (isIt ? 'Studente' : 'Élève'));
  const [age, setAge] = useState<number>(profile.age || 13);
  const [schoolName, setSchoolName] = useState(profile.schoolName || 'Collège');
  const [selectedStage, setSelectedStage] = useState<SchoolStage>(profile.schoolStage || 'middle');
  const [gradeLevel, setGradeLevel] = useState(profile.gradeLevel || '4ème');
  const [activePackId, setActivePackId] = useState(profile.activePackId || 'pack-college-4eme');
  const [avatar, setAvatar] = useState(profile.avatar || '🌻');
  const [theme, setTheme] = useState<ThemeVariant>(profile.theme || 'amber');
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>(profile.operatingSystem || 'debian');
  const [language, setLanguage] = useState<Language>(profile.language || 'it');

  if (!isOpen) return null;

  // Age based grade recommendation helper
  const handleAgeChange = (newAge: number) => {
    setAge(newAge);
    const recommended = getRecommendedGradeForAge(newAge);
    setSelectedStage(recommended.stage);
    setGradeLevel(recommended.frenchName);
    setActivePackId(recommended.defaultPackId);
  };

  const handleSelectGrade = (gradeId: string) => {
    const found = allSchoolGrades.find(g => g.id === gradeId);
    if (found) {
      setGradeLevel(found.frenchName);
      setSelectedStage(found.stage);
      setActivePackId(found.defaultPackId);
      soundFx.playClick();
    }
  };

  const handleSave = () => {
    soundFx.playSuccess();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    onSaveProfile({
      name: name.trim() || 'Studente',
      age,
      schoolName: schoolName.trim() || 'Collège Victor Hugo',
      schoolStage: selectedStage,
      gradeLevel,
      activePackId,
      avatar,
      theme,
      operatingSystem,
      language,
      firstTimeSetupDone: true
    });
    onClose();
  };

  const filteredGrades = allSchoolGrades.filter(g => g.stage === selectedStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl shadow-xs">
              {avatar}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isFirstLaunch 
                  ? (isIt ? 'Configurazione Iniziale Tournesol' : 'Bienvenue sur Tournesol !') 
                  : (isIt ? 'Profilo Studente & Classe' : 'Profil de l\'Élève')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isIt 
                  ? 'Personalizza nome, grado scolastico (Elementari, Medie, Superiori) e sistema' 
                  : 'Personnalisez le nom, le niveau scolaire (Primaire, Collège, Lycée) et le thème'}
              </p>
            </div>
          </div>
          {!isFirstLaunch && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. Nome & Avatar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isIt ? '1. Nome dello Studente' : '1. Prénom & Nom de l\'élève'}
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {isIt ? 'Usato per saluti, diario e appunti' : 'Visible sur le cahier'}
              </span>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isIt ? 'Es: Marco, Sofia, Luca...' : 'Ex: Camille, Thomas, Lucas...'}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>

            {/* Avatar chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-slate-500 font-medium mr-1">Avatar:</span>
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setAvatar(emoji);
                    soundFx.playClick();
                  }}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition cursor-pointer ${
                    avatar === emoji
                      ? 'bg-amber-100 border-2 border-amber-500 scale-110 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 border border-transparent'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Ciclo Scolastico & Classe (Elementari, Medie, Superiori) */}
          <div className="space-y-4 p-4.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-700" />
                <span>{isIt ? '2. Percorso Scolastico & Classe' : '2. Niveau Scolaire & Classe'}</span>
              </label>
              <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                {age} {isIt ? 'anni' : 'ans'}
              </span>
            </div>

            {/* Stage Selector (Elementari / Medie / Superiori) */}
            <div className="grid grid-cols-3 gap-2">
              {schoolStagesList.map((st) => {
                const isSelected = selectedStage === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedStage(st.id);
                      soundFx.playClick();
                      const firstInStage = allSchoolGrades.find(g => g.stage === st.id);
                      if (firstInStage) {
                        setGradeLevel(firstInStage.frenchName);
                        setActivePackId(firstInStage.defaultPackId);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{st.icon}</span>
                    <span className="text-xs font-bold leading-tight">
                      {isIt ? st.name_it.split(' (')[0] : st.name_fr.split(' /')[0]}
                    </span>
                    <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {st.ageRange}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slider Età */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{isIt ? 'Regola età per suggerire la classe:' : 'Âge de l\'élève :'}</span>
                <span className="font-bold text-slate-800">{age} {isIt ? 'anni' : 'ans'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400">6</span>
                <input
                  type="range"
                  min={6}
                  max={18}
                  value={age}
                  onChange={(e) => handleAgeChange(parseInt(e.target.value))}
                  className="flex-1 accent-slate-900 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-400">18</span>
              </div>
            </div>

            {/* Grades list for selected stage */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-600 block">
                {isIt ? 'Seleziona la classe corrispondente:' : 'Classe spécifique :'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredGrades.map((g) => {
                  const isSelected = gradeLevel.includes(g.frenchName) || g.frenchName.includes(gradeLevel);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectGrade(g.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-white ring-2 ring-slate-900/10 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {g.frenchName}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {isIt ? g.italianName : g.cycleDescription_fr}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* School Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {isIt ? 'Nome dell\'istituto scolastico:' : 'Nom de l\'établissement :'}
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Collège Victor Hugo"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* 3. Palette Tono su Tono (Unisex) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-slate-700" />
                <span>{isIt ? '3. Colore & Palette Tono su Tono' : '3. Thème & Couleurs Ton sur Ton'}</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {isIt ? 'Chiari e scuri coordinati' : 'Harmonie de contrastes'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(themes).map((tConfig) => {
                const isSelected = theme === tConfig.id;
                return (
                  <button
                    key={tConfig.id}
                    type="button"
                    onClick={() => {
                      setTheme(tConfig.id);
                      soundFx.playClick();
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{tConfig.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {isIt ? tConfig.name_it : tConfig.name_fr}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                        {tConfig.toneDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sistema Operativo & Local Bridge */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-slate-700" />
                <span>{isIt ? '4. Sistema Operativo' : '4. Système d\'Exploitation'}</span>
              </label>
              {onOpenBridgeModal && (
                <button
                  type="button"
                  onClick={onOpenBridgeModal}
                  className="text-[11px] font-bold text-slate-800 hover:underline flex items-center gap-1"
                >
                  <Radio className="w-3 h-3 text-emerald-600" />
                  <span>{isIt ? 'Configura Connettore Bridge' : 'Connecteur Système'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'debian', label: 'Debian / KDE', icon: '🌀' },
                { id: 'fedora', label: 'Fedora', icon: '🎩' },
                { id: 'arch', label: 'Arch Linux', icon: '🏹' },
                { id: 'macos', label: 'macOS Air', icon: '🍎' }
              ].map((os) => (
                <button
                  key={os.id}
                  type="button"
                  onClick={() => {
                    setOperatingSystem(os.id as OperatingSystem);
                    soundFx.playClick();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    operatingSystem === os.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{os.icon}</span>
                  <span className="truncate">{os.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Lingua dell'interfaccia */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{isIt ? 'Lingua del Portale' : 'Langue du Portail'}</span>
            </span>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setLanguage('it');
                  soundFx.playClick();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === 'it' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                🇮🇹 Italiano
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('fr');
                  soundFx.playClick();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === 'fr' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                🇫🇷 Français
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            {isIt ? 'Modificabile in qualsiasi momento' : 'Modifiable à tout moment'}
          </div>

          <div className="flex items-center gap-2">
            {!isFirstLaunch && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                {isIt ? 'Annulla' : 'Annuler'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isIt ? 'Salva e Inizia Studio' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
