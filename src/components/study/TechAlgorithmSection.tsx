import React, { useState } from 'react';
import { Cpu, Terminal, Play, Code2, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { algorithmCurriculum } from '../../data/schoolCurriculum';
import { soundFx } from '../../utils/audio';

interface TechAlgorithmSectionProps {
  language: 'it' | 'fr';
}

export const TechAlgorithmSection: React.FC<TechAlgorithmSectionProps> = ({ language }) => {
  const isIt = language === 'it';

  // Interactive Mini Runner for Scratch/Python logic
  const [testScore, setTestScore] = useState<number>(12);
  const [repeatCount, setRepeatCount] = useState<number>(4);

  return (
    <div className="space-y-6">
      {/* 1. Header & Scratch to Python Bridge */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
            {isIt ? 'Tecnologia & Informatica • Esame Brevet' : 'Technologie & Informatique • Épreuve Brevet'}
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-600" />
            <span>{isIt ? 'Algoritmi e Programmazione (Scratch & Python)' : 'Algorithmique : Blocs Scratch & Syntaxe Python'}</span>
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {isIt 
              ? 'All\'esame del Brevet francese, una parte fondamentale di Matematica e Tecnologia riguarda la comprensione di script a blocchi Scratch e la logica degli algoritmi.' 
              : 'Au Brevet, l\'exercice d\'algorithmique teste la capacité à suivre pas à pas un script Scratch, prévoir la position d\'un lutin ou traduire une condition.'}
          </p>
        </div>

        {/* The 4 core algorithmic blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {algorithmCurriculum.map((item, idx) => (
            <div key={idx} className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  {isIt ? item.itConcept : item.concept}
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md">
                  Brevet
                </span>
              </div>

              {/* Scratch Block UI */}
              <div className="bg-amber-500 text-white p-2.5 rounded-xl font-mono text-xs font-bold shadow-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <span>🧩 Scratch : {item.scratchBlock}</span>
              </div>

              {/* Python Syntax */}
              <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-xs font-semibold whitespace-pre">
                # Python 🐍{'\n'}{item.pythonSyntax}
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                {isIt ? item.explanation_it : item.explanation_fr}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Simulator */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
            {isIt ? 'Simulatore Interattivo' : 'Simulateur d\'Exécution Pas à Pas'}
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-600" />
            <span>{isIt ? 'Testa la condizione Se... Allora... Altrimenti' : 'Testez la Condition Si ... Alors ... Sinon'}</span>
          </h3>
        </div>

        <div className="flex items-center gap-4 bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Valeur de la variable [score] :</span>
            <input
              type="number"
              value={testScore}
              onChange={(e) => setTestScore(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-sm font-bold text-center"
            />
          </div>
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs space-y-2">
          <div className="text-amber-400 font-bold"># Script analysé par l'ordinateur :</div>
          <div className="text-slate-300">
            score = {testScore}
            <br />
            if score &gt;= 10:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;message = "{isIt ? 'Promosso! Continua così ✅' : 'Validé ! Félicitations ✅'}"
            <br />
            else:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;message = "{isIt ? 'Non sufficiente, ripassa la lezione ⚠️' : 'Insuffisant, revoir la fiche ⚠️'}"
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Résultat console ➔ {testScore >= 10 ? (isIt ? 'Promosso! Continua così ✅' : 'Validé ! Félicitations ✅') : (isIt ? 'Non sufficiente, ripassa la lezione ⚠️' : 'Insuffisant, revoir la fiche ⚠️')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
