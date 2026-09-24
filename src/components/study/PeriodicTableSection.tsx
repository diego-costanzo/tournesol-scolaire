import React, { useState } from 'react';
import { Atom, Search, FlaskConical, Flame, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { periodicTableTopElements, PeriodicElement } from '../../data/schoolCurriculum';
import { soundFx } from '../../utils/audio';

interface PeriodicTableSectionProps {
  language: 'it' | 'fr';
}

export const PeriodicTableSection: React.FC<PeriodicTableSectionProps> = ({ language }) => {
  const isIt = language === 'it';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeElement, setActiveElement] = useState<PeriodicElement>(periodicTableTopElements[0]);

  // Filter elements
  const filteredElements = periodicTableTopElements.filter((el) => {
    const matchQuery = 
      el.symbol.toLowerCase().includes(search.toLowerCase()) ||
      el.name_fr.toLowerCase().includes(search.toLowerCase()) ||
      el.name_it.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || el.category === selectedCategory;
    return matchQuery && matchCategory;
  });

  // pH Scale Slider state
  const [phValue, setPhValue] = useState<number>(7);

  const getPhDetails = (ph: number) => {
    if (ph < 7) {
      return {
        nature_fr: 'Solution Acide (Présence majoritaire d\'ions H⁺)',
        nature_it: 'Soluzione Acida (Presenza di ioni H⁺)',
        color: 'bg-red-500 text-white',
        border: 'border-red-400',
        examples_fr: ph <= 2 ? 'Acide chlorhydrique, suc gastrique, citron (pH ~ 2)' : 'Vinaigre, soda, tomates (pH ~ 3-4)',
        examples_it: ph <= 2 ? 'Succo gastrico, acido cloridrico, limone (pH ~ 2)' : 'Aceto, bibite gassate, pomodoro (pH ~ 3-4)',
        danger_fr: ph <= 2 ? '⚠️ Très corrosif ! Port de gants et lunettes obligatoire.' : 'Légèrement corrosif.'
      };
    } else if (ph === 7) {
      return {
        nature_fr: 'Solution Neutre (Équilibre parfait ions H⁺ et HO⁻)',
        nature_it: 'Soluzione Neutra (Equilibrio ioni H⁺ e HO⁻)',
        color: 'bg-emerald-500 text-white',
        border: 'border-emerald-400',
        examples_fr: 'Eau pure distillée, larmes (pH = 7.0)',
        examples_it: 'Acqua pura distillata, lacrime (pH = 7.0)',
        danger_fr: 'Inoffensif pour la peau et l\'organisme.'
      };
    } else {
      return {
        nature_fr: 'Solution Basique / Alcaline (Présence d\'ions HO⁻)',
        nature_it: 'Soluzione Basica / Alcalina (Presenza di ioni HO⁻)',
        color: 'bg-blue-600 text-white',
        border: 'border-blue-400',
        examples_fr: ph >= 12 ? 'Eau de Javel, déboucheur de canalisation (soude, pH ~ 13-14)' : 'Savon, dentifrice, bicarbonate (pH ~ 8-10)',
        examples_it: ph >= 12 ? 'Candeggina, soda caustica per tubature (pH ~ 13-14)' : 'Sapone, dentifricio, bicarbonato (pH ~ 8-10)',
        danger_fr: ph >= 12 ? '⚠️ Très caustique ! Brûlures chimiques, lunettes requises.' : 'Doux au toucher, faiblement irritant.'
      };
    }
  };

  const currentPh = getPhDetails(phValue);

  return (
    <div className="space-y-6">
      {/* 1. Tableau Périodique Interactif */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Chimica Fondamentale • Dal Collège al Lycée' : 'Chimie Fondamentale • Collège & Lycée'}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Atom className="w-5 h-5 text-amber-600" />
              <span>{isIt ? 'Tavola Periodica dei Primi Elementi' : 'Tableau Périodique des Éléments'}</span>
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isIt ? 'Cerca elemento (H, O, C...)' : 'Chercher (H, O, Carbone...)'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Elements Grid and Active Element Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Left 2 Cols: Element Grid */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
              {[
                { id: 'all', label: isIt ? 'Tutti' : 'Tous' },
                { id: 'non-metal', label: isIt ? 'Non metalli' : 'Non-métaux' },
                { id: 'noble-gas', label: isIt ? 'Gas nobili' : 'Gaz nobles' },
                { id: 'alkali', label: isIt ? 'Alcalini' : 'Alcalins' },
                { id: 'transition-metal', label: isIt ? 'Metalli' : 'Métaux' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedCategory === c.id
                      ? 'bg-amber-500 text-white font-black shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {filteredElements.map((el) => {
                const isSelected = activeElement.symbol === el.symbol;
                return (
                  <button
                    key={el.z}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveElement(el);
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-400 text-amber-950 shadow-md scale-105 font-black'
                        : 'border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-900'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 self-start">Z={el.z}</span>
                    <span className="text-xl font-black">{el.symbol}</span>
                    <span className="text-[10px] font-bold truncate max-w-full">
                      {isIt ? el.name_it : el.name_fr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Col: Active Element Detail Card */}
          <div className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-300 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-md">
                {isIt ? 'Scheda Elemento' : 'Carte d\'Identité Atomique'}
              </span>
              <span className="text-xs font-mono font-black text-amber-950">
                Z = {activeElement.z}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-amber-500 flex flex-col items-center justify-center text-amber-950 shadow-sm shrink-0">
                <span className="text-2xl font-black font-mono">{activeElement.symbol}</span>
                <span className="text-[9px] font-bold">{activeElement.mass} u</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  {isIt ? activeElement.name_it : activeElement.name_fr}
                </h4>
                <p className="text-xs text-amber-800 font-bold capitalize">
                  {activeElement.category}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span className="font-bold text-slate-700 block text-[11px]">
                  {isIt ? 'Configurazione Elettronica :' : 'Couches Électroniques :'}
                </span>
                <span className="font-mono font-bold text-amber-950">{activeElement.electrons}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                <span className="font-bold text-slate-700 block text-[11px]">
                  {isIt ? 'Ruolo & Utilità nel Mondo Reale :' : 'Rôle & Utilité au Quotidien :'}
                </span>
                <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">
                  {isIt ? activeElement.description_it : activeElement.description_fr}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Échelle de pH Interactive */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Scienze • Soluzioni Acquose' : 'Physique-Chimie • Solutions Aqueuses'}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              <span>{isIt ? 'Scala del pH : Acidi, Neutri e Basi' : 'Échelle de pH (Acides & Bases)'}</span>
            </h3>
          </div>

          <span className="text-xs font-bold text-slate-600">
            {isIt ? 'Sposta il cursore per testare le sostanze' : 'Glissez le curseur pour explorer'}
          </span>
        </div>

        {/* pH Slider */}
        <div className="space-y-3 bg-amber-50/50 p-5 rounded-2xl border border-amber-200">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-red-600">0 (Très Acide)</span>
            <span className="text-emerald-700">7 (Neutre • Eau)</span>
            <span className="text-blue-700">14 (Très Basique)</span>
          </div>

          <input
            type="range"
            min="0"
            max="14"
            step="1"
            value={phValue}
            onChange={(e) => setPhValue(parseInt(e.target.value))}
            className="w-full h-3 bg-linear-to-r from-red-500 via-emerald-400 to-blue-600 rounded-lg appearance-none cursor-pointer"
          />

          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-xl font-mono text-base font-black bg-slate-900 text-amber-300">
              pH = {phValue}
            </span>
          </div>
        </div>

        {/* Live Result Details */}
        <div className={`p-4 rounded-2xl border-2 ${currentPh.border} bg-white space-y-2`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${currentPh.color}`}>
              {isIt ? currentPh.nature_it : currentPh.nature_fr}
            </span>
          </div>

          <p className="text-xs font-bold text-slate-800">
            <strong>{isIt ? 'Esempi reali : ' : 'Exemples concrets : '}</strong>
            {isIt ? currentPh.examples_it : currentPh.examples_fr}
          </p>

          <p className="text-xs text-slate-600">
            <strong>{isIt ? 'Sicurezza & Regole : ' : 'Sécurité au labo : '}</strong>
            {currentPh.danger_fr}
          </p>
        </div>
      </div>

      {/* 3. Principe de Lavoisier & Équations Chimiques */}
      <div className="bg-amber-100/60 rounded-3xl p-6 border-2 border-amber-300 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-700" />
          <h4 className="text-base font-extrabold text-amber-950">
            {isIt ? 'Legge di Lavoisier & Bilanciamento Chimico' : 'Loi de Lavoisier & Équilibration de Réaction'}
          </h4>
        </div>
        <blockquote className="italic text-xs font-bold text-amber-900 border-l-4 border-amber-500 pl-3">
          « Rien ne se perd, rien ne se crée, tout se transforme. » — Antoine de Lavoisier
        </blockquote>
        <p className="text-xs text-slate-700 leading-relaxed">
          {isIt 
            ? 'Durante una reazione chimica, il numero di atomi di ciascun tipo deve essere IDENTICO prima e dopo la freccia ! La massa dei reagenti è sempre uguale alla massa dei prodotti.' 
            : 'Au cours d\'une réaction chimique, le nombre d\'atomes de chaque élément se conserve. La masse des réactifs consommés est rigoureusement égale à la masse des produits formés.'}
        </p>
        <div className="bg-white p-3 rounded-xl border border-amber-300 font-mono text-xs font-bold text-amber-950 space-y-1">
          <div className="text-slate-500 text-[11px]">{isIt ? 'Esempio classico : Combustione del metano' : 'Exemple classique : Combustion du méthane'}</div>
          <div className="text-sm text-emerald-800">CH₄ + 2 O₂ ➔ CO₂ + 2 H₂O</div>
          <div className="text-[11px] text-slate-600 font-normal">
            1 atome C, 4 atomes H, 4 atomes O de chaque côté = Parfaitement équilibré ! ✅
          </div>
        </div>
      </div>
    </div>
  );
};
