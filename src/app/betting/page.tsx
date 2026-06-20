'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trophy, ArrowRight, Coins } from 'lucide-react';

const MOCK_MATCHES = [
  { id: 1, home: "Napoli", away: "Inter", odds: { "1": 2.80, "X": 3.10, "2": 2.50 } },
  { id: 2, home: "Juventus", away: "Milan", odds: { "1": 2.10, "X": 3.20, "2": 3.40 } },
  { id: 3, home: "Real Madrid", away: "Barcelona", odds: { "1": 1.90, "X": 3.50, "2": 3.80 } },
];

export default function BettingPage() {
  const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0].id);
  const [prediction, setPrediction] = useState<'1'|'X'|'2'|null>(null);
  const [points, setPoints] = useState(10);
  const [loading, setLoading] = useState(false);

  const currentMatch = MOCK_MATCHES.find(m => m.id === selectedMatch);
  const multiplier = prediction ? currentMatch?.odds[prediction] || 1 : 1;
  const potentialWin = Math.floor(points * multiplier);

  const handleBet = () => {
    if (!prediction) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Scommessa piazzata con successo!');
    }, 1000);
  };

  return (
    <div className="bg-[#0f0f0f] min-h-screen pt-[60px] pb-24 px-4">
      {/* Header Visuale */}
      <div className="relative w-full h-[180px] rounded-3xl overflow-hidden mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10">
        <Image 
          src="/pattern.jpg" 
          alt="Club 1x2" 
          fill 
          style={{ objectFit: 'cover', opacity: 0.5 }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tight">CLUB 1X2</h1>
            <p className="text-gray-300 font-medium text-sm">Pronostica e Vinci Sconti</p>
          </div>
          <Trophy className="text-[#ffd700]" size={40} />
        </div>
      </div>

      {/* Selezione Partita */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Seleziona Evento</h3>
        <select 
          className="w-full bg-[#1a1a1a] border border-white/20 text-white rounded-xl p-4 font-medium appearance-none focus:outline-none focus:border-[#d4af37]"
          value={selectedMatch}
          onChange={(e) => {
            setSelectedMatch(Number(e.target.value));
            setPrediction(null);
          }}
        >
          {MOCK_MATCHES.map(m => (
            <option key={m.id} value={m.id}>{m.home} vs {m.away}</option>
          ))}
        </select>
      </div>

      {/* Quote */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/10 shadow-lg mb-6">
        <h3 className="text-center font-bold text-lg mb-4">{currentMatch?.home} <span className="text-gray-500 font-normal">vs</span> {currentMatch?.away}</h3>
        <div className="flex gap-2">
          {(['1', 'X', '2'] as const).map(sign => (
            <button
              key={sign}
              onClick={() => setPrediction(sign)}
              className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${prediction === sign ? 'bg-gradient-to-b from-[#d4af37] to-[#b8860b] border-[#ffd700] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-[#0f0f0f] border-white/10 text-white hover:bg-[#222]'}`}
            >
              <span className={`text-xl font-black mb-1 ${prediction === sign ? 'text-black' : 'text-[#d4af37]'}`}>{sign}</span>
              <span className={`text-sm font-medium ${prediction === sign ? 'text-black/80' : 'text-gray-400'}`}>{currentMatch?.odds[sign].toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Puntata */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/10 shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Puntata Elisee Points</h3>
          <div className="flex items-center gap-1 text-[#d4af37] font-bold">
            <Coins size={16} /> 150 <span className="text-gray-500 font-normal text-xs ml-1">Disponibili</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="10" 
            max="150" 
            step="10" 
            value={points} 
            onChange={(e) => setPoints(Number(e.target.value))}
            className="flex-1 accent-[#d4af37]"
          />
          <div className="w-16 text-center bg-[#0f0f0f] py-2 rounded-lg font-bold text-white border border-white/10">{points}</div>
        </div>
      </div>

      {/* Recap & Button */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-5 border border-white/10 shadow-lg mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm font-medium">Vincita Potenziale</p>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#ffd700] flex items-center gap-2">
            <Coins size={20} className="text-[#d4af37]" />
            {prediction ? potentialWin : 0} <span className="text-sm font-normal text-gray-500">EP</span>
          </div>
        </div>
        <button 
          disabled={!prediction || loading}
          onClick={handleBet}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${prediction && !loading ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
        >
          {loading ? 'Piazzando...' : 'GIOCA'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
