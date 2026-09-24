import React, { useState } from 'react';
import { Compass, CheckCircle2, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface ThalesAndIdentitiesProps {
  language: 'it' | 'fr';
}

export const ThalesAndIdentities: React.FC<ThalesAndIdentitiesProps> = ({ language }) => {
  const isIt = language === 'it';

  // ==========================================
  // THALÈS THEOREM STATE
  // Configuration: Triangle ABC with (MN) // (BC)
  // AM / AB = AN / AC = MN / BC
  // ==========================================
  const [thalesAM, setThalesAM] = useState('3');
  const [thalesAB, setThalesAB] = useState('9');
  const [thalesAN, setThalesAN] = useState('4');
  const [thalesBC, setThalesBC] = useState('12');

  const am = parseFloat(thalesAM) || 0;
  const ab = parseFloat(thalesAB) || 0;
  const an = parseFloat(thalesAN) || 0;
  const bc = parseFloat(thalesBC) || 0;

  // Compute AC and MN
  const ratio = ab > 0 ? am / ab : 0;
  const computedAC = ratio > 0 && an > 0 ? Math.round((an / ratio) * 100) / 100 : null;
  const computedMN = ratio > 0 && bc > 0 ? Math.round((bc * ratio) * 100) / 100 : null;

  // ==========================================
  // IDENTITÉS REMARQUABLES STATE
  // 1: (a + b)² = a² + 2ab + b²
  // 2: (a - b)² = a² - 2ab + b²
  // 3: (a + b)(a - b) = a² - b²
  // ==========================================
  const [idType, setIdType] = useState<'plus' | 'minus' | 'diff'>('plus');
  const [varA, setVarA] = useState('x');
  const [numB, setNumB] = useState('4');

  const bVal = parseFloat(numB) || 0;
  const bSq = bVal * bVal;
  const twoB = 2 * bVal;

  let expandedFormula = '';
  let stepByStep = '';

  if (idType === 'plus') {
    expandedFormula = `${varA}² + ${twoB}${varA} + ${bSq}`;
    stepByStep = `(${varA} + ${bVal})² = ${varA}² + 2 × ${varA} × ${bVal} + ${bVal}² = ${expandedFormula}`;
  } else if (idType === 'minus') {
    expandedFormula = `${varA}² - ${twoB}${varA} + ${bSq}`;
    stepByStep = `(${varA} - ${bVal})² = ${varA}² - 2 × ${varA} × ${bVal} + ${bVal}² = ${expandedFormula}`;
  } else {
    expandedFormula = `${varA}² - ${bSq}`;
    stepByStep = `(${varA} + ${bVal})(${varA} - ${bVal}) = ${varA}² - ${bVal}² = ${expandedFormula}`;
  }

  return (
    <div className="space-y-6">
      {/* 1. Théorème de Thalès */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Geometria • 4ème / 3ème / Brevet' : 'Géométrie • Cycle 4 (4e/3e) & Brevet'}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-600" />
              <span>{isIt ? 'Teorema di Talete (Théorème de Thalès)' : 'Théorème de Thalès & Réciproque'}</span>
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
            {isIt ? 'Rapporti di Proporzionalità' : 'AM/AB = AN/AC = MN/BC'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isIt 
            ? 'In un triangolo ABC, con M sul lato [AB], N sul lato [AC], e le rette (MN) e (BC) parallele : le lunghezze dei due triangoli AMN e ABC sono proporzionali.' 
            : 'Dans le triangle ABC, si M ∈ [AB], N ∈ [AC] et les droites (MN) // (BC), alors les triangles AMN et ABC sont semblables.'}
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">AM (cm)</label>
            <input
              type="number"
              step="0.1"
              value={thalesAM}
              onChange={(e) => setThalesAM(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-sm font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">AB (cm)</label>
            <input
              type="number"
              step="0.1"
              value={thalesAB}
              onChange={(e) => setThalesAB(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-sm font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">AN (cm)</label>
            <input
              type="number"
              step="0.1"
              value={thalesAN}
              onChange={(e) => setThalesAN(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-sm font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">BC (cm)</label>
            <input
              type="number"
              step="0.1"
              value={thalesBC}
              onChange={(e) => setThalesBC(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-sm font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Results with official French step-by-step drafting */}
        <div className="bg-slate-900 text-amber-200 p-4 rounded-2xl space-y-2 font-mono text-xs">
          <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            {isIt ? '✍️ Redazione Tipo per la Verifica :' : '✍️ Rédaction Type Exigée au Contrôle :'}
          </div>
          <p className="text-slate-300">
            {isIt 
              ? 'Nel triangolo ABC :' 
              : 'Dans le triangle ABC :'}
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-200 pl-1 text-[11px]">
            <li>{isIt ? 'M appartiene a [AB] e N appartiene a [AC]' : 'M ∈ [AB] et N ∈ [AC]'}</li>
            <li>{isIt ? 'Le rette (MN) e (BC) sono parallele' : 'Les droites (MN) et (BC) sont parallèles'}</li>
          </ul>
          <p className="text-slate-300">
            {isIt 
              ? 'Per il Teorema di Talete :' 
              : 'D\'après le théorème de Thalès :'}
          </p>
          <div className="bg-slate-800 p-2.5 rounded-xl text-amber-300 font-bold">
            AM / AB = AN / AC = MN / BC
          </div>
          <div className="text-emerald-400 font-bold pt-1 space-y-1">
            {computedAC !== null && (
              <div>👉 AC = (AB × AN) / AM = ({ab} × {an}) / {am} = <strong>{computedAC} cm</strong></div>
            )}
            {computedMN !== null && (
              <div>👉 MN = (BC × AM) / AB = ({bc} × {am}) / {ab} = <strong>{computedMN} cm</strong></div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Identités Remarquables */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Algebra • 3ème & Lycée' : 'Algèbre • 3ème & Seconde (Lycée)'}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>{isIt ? 'Prodotti Notevoli (Identités Remarquables)' : 'Identités Remarquables (Développement)'}</span>
            </h3>
          </div>

          {/* Type Selector */}
          <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
            {[
              { id: 'plus', label: '(a + b)²' },
              { id: 'minus', label: '(a - b)²' },
              { id: 'diff', label: '(a+b)(a-b)' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setIdType(item.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  idType === item.id 
                    ? 'bg-amber-400 text-amber-950 shadow-xs' 
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom interactive inputs */}
        <div className="flex items-center gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Variable a :</span>
            <input
              type="text"
              value={varA}
              maxLength={2}
              onChange={(e) => setVarA(e.target.value || 'x')}
              className="w-16 px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-xs font-bold text-center"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Nombre b :</span>
            <input
              type="number"
              value={numB}
              onChange={(e) => setNumB(e.target.value)}
              className="w-20 px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-xs font-bold text-center"
            />
          </div>
        </div>

        {/* Live Expansion Card */}
        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 space-y-1.5">
          <div className="text-[11px] font-bold text-amber-900 uppercase">
            {isIt ? 'Sviluppo Passo-Passo :' : 'Développement Étape par Étape :'}
          </div>
          <div className="font-mono text-sm font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-amber-200">
            {stepByStep}
          </div>
          <div className="text-xs text-amber-950 font-bold flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isIt ? 'Forma sviluppata e ridotta :' : 'Forme développée et réduite :'} <strong>{expandedFormula}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
