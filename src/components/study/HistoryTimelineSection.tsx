import React, { useState } from 'react';
import { History, Calendar, Search, MapPin, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { historyTimelineEvents, TimelineEvent } from '../../data/schoolCurriculum';
import { soundFx } from '../../utils/audio';

interface HistoryTimelineSectionProps {
  language: 'it' | 'fr';
}

export const HistoryTimelineSection: React.FC<HistoryTimelineSectionProps> = ({ language }) => {
  const isIt = language === 'it';

  const [search, setSearch] = useState('');
  const [filterCycle, setFilterCycle] = useState<'all' | 'Repère Brevet' | 'Collège'>('all');

  const filteredEvents = historyTimelineEvents.filter((ev) => {
    const matchCycle = filterCycle === 'all' || ev.cycle === filterCycle;
    const matchSearch =
      ev.year.toLowerCase().includes(search.toLowerCase()) ||
      ev.title_fr.toLowerCase().includes(search.toLowerCase()) ||
      ev.title_it.toLowerCase().includes(search.toLowerCase()) ||
      ev.keyFigure.toLowerCase().includes(search.toLowerCase());
    return matchCycle && matchSearch;
  });

  // French regions quick memo
  const frenchRegions = [
    { name: 'Île-de-France', pref: 'Paris', feature: 'Capitale, pôle économique mondial, 12 millions d\'habitants' },
    { name: 'Auvergne-Rhône-Alpes', pref: 'Lyon', feature: 'Alpes, Mont-Blanc, industrie pharmaceutique et chimique' },
    { name: 'Nouvelle-Aquitaine', pref: 'Bordeaux', feature: 'Plus grande région en superficie, vignobles, océan Atlantique' },
    { name: 'Occitanie', pref: 'Toulouse', feature: 'Aéronautique (Airbus), Pyrénées, côte méditerranéenne' },
    { name: 'Hauts-de-France', pref: 'Lille', feature: 'Proximité Belgique/Londres, ancienne région minière et textile' },
    { name: 'Provence-Alpes-Côte d\'Azur (PACA)', pref: 'Marseille', feature: 'Grand port méditerranéen, tourisme international' },
    { name: 'Grand Est', pref: 'Strasbourg', feature: 'Siège du Parlement Européen, frontière Allemagne/Luxembourg' },
    { name: 'Bretagne', pref: 'Rennes', feature: 'Péninsule maritime, agriculture, pêche, identité celte' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Frise Chronologique Interactive */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md">
              {isIt ? 'Storia & Cittadinanza • Tutti i Cicli' : 'Histoire & Repères Majeurs • Collège & Brevet'}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              <span>{isIt ? 'Linea del Tempo Ufficiale (Frise Chronologique)' : 'Frise Chronologique des Repères Brevet'}</span>
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isIt ? 'Cerca data, evento o personaggio...' : 'Chercher date, roi, bataille...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: isIt ? 'Tutti gli Eventi' : 'Tous les repères' },
            { id: 'Repère Brevet', label: isIt ? '⭐ Obbligatori al Brevet' : '⭐ Repères Brevet (Essentiels)' },
            { id: 'Collège', label: isIt ? '🏰 Antichità & Medioevo' : '🏰 Antiquité & Ancien Régime' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setFilterCycle(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                filterCycle === tab.id
                  ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-500'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chronological Vertical Cards */}
        <div className="space-y-3 pt-2">
          {filteredEvents.map((ev, idx) => (
            <div
              key={idx}
              className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 hover:border-amber-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-mono font-black text-xs shrink-0 shadow-xs border border-amber-500">
                  {ev.year}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition">
                      {isIt ? ev.title_it : ev.title_fr}
                    </h4>
                    {ev.cycle === 'Repère Brevet' && (
                      <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.2 rounded-full">
                        Brevet
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isIt ? ev.summary_it : ev.summary_fr}
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-amber-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isIt ? 'Personaggio chiave' : 'Figure Clé'}
                </span>
                <span className="text-xs font-black text-amber-950">
                  {ev.keyFigure}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Géographie : Régions de France & Métropoles */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
            {isIt ? 'Geografia della Francia' : 'Géographie • Les Métropoles & Régions'}
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span>{isIt ? 'Le Grandi Regioni & Prefetture di Francia' : 'Les Régions et Métropoles Françaises'}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {frenchRegions.map((reg, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">{reg.name}</span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  Préfecture : {reg.pref}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                {reg.feature}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
