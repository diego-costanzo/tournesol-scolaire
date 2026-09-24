import React, { useState } from 'react';
import { GradeItem, StudentProfile } from '../../types';
import { Plus, Trash2, Calculator, AlertCircle, Save } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { getThemeConfig } from '../../utils/themeStyles';

interface MoyenneTabProps {
  profile: StudentProfile;
  grades: GradeItem[];
  onAddGrade: (grade: Omit<GradeItem, 'id'>) => void;
  onDeleteGrade: (id: string) => void;
}

export const MoyenneTab: React.FC<MoyenneTabProps> = ({
  profile,
  grades,
  onAddGrade,
  onDeleteGrade
}) => {
  const isIt = profile.language === 'it';
  const theme = getThemeConfig(profile.theme);
  
  const [newSubject, setNewSubject] = useState('');
  const [newValue, setNewValue] = useState<string>('');
  const [newOutOf, setNewOutOf] = useState<string>('20');
  const [newCoeff, setNewCoeff] = useState<string>('1');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newValue || !newOutOf || !newCoeff) return;
    
    const val = parseFloat(newValue);
    const max = parseFloat(newOutOf);
    const coeff = parseFloat(newCoeff);
    
    if (isNaN(val) || isNaN(max) || isNaN(coeff)) return;
    
    onAddGrade({
      subject: newSubject,
      subject_it: newSubject,
      subject_fr: newSubject,
      value: val,
      outOf: max,
      coefficient: coeff,
      date: new Date().toISOString().split('T')[0]
    });
    
    setNewSubject('');
    setNewValue('');
    soundFx.playSuccess();
  };

  // Calcolo della media generale
  const calculateMoyenne = () => {
    if (grades.length === 0) return null;
    let totalScore = 0;
    let totalCoeff = 0;
    
    grades.forEach(g => {
      // Normalizziamo il voto in base a 20 (standard francese)
      const normalizedScore = (g.value / g.outOf) * 20;
      totalScore += normalizedScore * g.coefficient;
      totalCoeff += g.coefficient;
    });
    
    if (totalCoeff === 0) return 0;
    return (totalScore / totalCoeff).toFixed(2);
  };

  const currentMoyenne = calculateMoyenne();
  
  // Calcolo media per materia
  const subjectsMap = new Map<string, { totalScore: number, totalCoeff: number }>();
  grades.forEach(g => {
    const subj = g.subject;
    const normalizedScore = (g.value / g.outOf) * 20;
    const current = subjectsMap.get(subj) || { totalScore: 0, totalCoeff: 0 };
    subjectsMap.set(subj, {
      totalScore: current.totalScore + (normalizedScore * g.coefficient),
      totalCoeff: current.totalCoeff + g.coefficient
    });
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-2xl ${theme.accentSoft} flex items-center justify-center ${theme.headingText} shadow-sm`}>
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">
            {isIt ? 'Voti e Media (Moyenne)' : 'Notes et Moyenne'}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {isIt ? 'Calcola la tua media su base 20' : 'Calcule ta moyenne générale sur 20'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & General Average */}
        <div className="lg:col-span-1 space-y-6">
          {/* Moyenne Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm text-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              {isIt ? 'Media Generale' : 'Moyenne Générale'}
            </h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-6xl font-black ${
                currentMoyenne === null ? 'text-slate-300' 
                : parseFloat(currentMoyenne) >= 10 ? 'text-emerald-600' 
                : 'text-rose-600'
              }`}>
                {currentMoyenne ?? '--'}
              </span>
              <span className="text-2xl font-bold text-slate-400">/20</span>
            </div>
            {currentMoyenne !== null && (
              <p className={`mt-3 text-sm font-bold ${parseFloat(currentMoyenne) >= 10 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {parseFloat(currentMoyenne) >= 14 ? (isIt ? 'Ottimo lavoro! 🌟' : 'Excellent travail ! 🌟') :
                 parseFloat(currentMoyenne) >= 10 ? (isIt ? 'Sulla buona strada! 👍' : 'Sur la bonne voie ! 👍') :
                 (isIt ? 'Non mollare, puoi farcela! 💪' : 'Ne lâche rien, tu peux le faire ! 💪')}
              </p>
            )}
          </div>

          {/* Add Grade Form */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className={`w-4 h-4 ${theme.headingText}`} />
              {isIt ? 'Aggiungi un voto' : 'Ajouter une note'}
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {isIt ? 'Materia' : 'Matière'}
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder={isIt ? 'es. Matematica' : 'ex. Mathématiques'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 font-medium"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isIt ? 'Voto' : 'Note'}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="15.5"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isIt ? 'Su (Totale)' : 'Sur'}
                  </label>
                  <input
                    type="number"
                    value={newOutOf}
                    onChange={e => setNewOutOf(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  {isIt ? 'Coefficiente (Peso)' : 'Coefficient'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newCoeff}
                  onChange={e => setNewCoeff(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl ${theme.accentPrimary} ${theme.accentHover} text-white font-bold transition flex items-center justify-center gap-2 shadow-sm`}
              >
                <Save className="w-4 h-4" />
                {isIt ? 'Salva Voto' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Grades List & Subject Averages */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">
                {isIt ? 'Le tue Valutazioni' : 'Tes Évaluations'}
              </h3>
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                {grades.length} {isIt ? 'voti' : 'notes'}
              </span>
            </div>
            
            <div className="p-5">
              {grades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-600 mb-1">
                    {isIt ? 'Nessun voto inserito' : 'Aucune note'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isIt ? 'Usa il modulo per aggiungere il tuo primo voto' : 'Utilise le formulaire pour ajouter ta première note'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grades.map(grade => (
                    <div key={grade.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black ${
                          (grade.value / grade.outOf) * 20 >= 10 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          <span className="text-lg leading-none">{grade.value}</span>
                          <span className="text-[9px] opacity-60 leading-none mt-0.5">/{grade.outOf}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{grade.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              Coeff. {grade.coefficient}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(grade.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          onDeleteGrade(grade.id);
                          soundFx.playPop();
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                        title={isIt ? 'Elimina' : 'Supprimer'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
