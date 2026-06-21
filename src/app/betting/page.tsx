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

  const glassStyle: React.CSSProperties = {
    background: 'rgba(20, 10, 30, 0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '24px',
    padding: '20px 16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    marginBottom: '20px'
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', padding: '24px 16px 100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      
      {/* Header Visuale */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '180px', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        marginBottom: '24px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', 
        border: '1px solid rgba(255, 255, 255, 0.1)' 
      }}>
        <Image 
          src="/pattern.jpg" 
          alt="L'Angolo Ludopatico" 
          fill 
          style={{ objectFit: 'cover', opacity: 0.25 }} 
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, rgba(10, 0, 16, 0.95), transparent)' 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '16px', 
          left: '16px', 
          right: '16px', 
          display: 'flex', 
          alignItems: 'end', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
              L&apos;Angolo Ludopatico
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
              Pronostica e Vinci Punti Stile
            </p>
          </div>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Trophy className="text-[#ffd700]" size={22} />
          </div>
        </div>
      </div>

      {/* Selezione Partita */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '4px' }}>
          Seleziona Evento
        </h3>
        <div style={{ position: 'relative' }}>
          <select 
            style={{ 
              width: '100%', 
              background: 'rgba(20, 10, 30, 0.65)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: 'white', 
              borderRadius: '16px', 
              padding: '16px', 
              fontSize: '15px',
              fontWeight: 500, 
              appearance: 'none', 
              outline: 'none' 
            }}
            value={selectedMatch}
            onChange={(e) => {
              setSelectedMatch(Number(e.target.value));
              setPrediction(null);
            }}
          >
            {MOCK_MATCHES.map(m => (
              <option key={m.id} value={m.id} style={{ background: '#0f0020' }}>{m.home} vs {m.away}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quote */}
      <div style={glassStyle}>
        <h3 style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', marginBottom: '16px', fontFamily: 'var(--font-d)' }}>
          {currentMatch?.home} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>vs</span> {currentMatch?.away}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['1', 'X', '2'] as const).map(sign => {
            const isSelected = prediction === sign;
            return (
              <button
                key={sign}
                onClick={() => setPrediction(sign)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 8px',
                  borderRadius: '16px',
                  border: isSelected ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected ? 'linear-gradient(135deg, var(--gold), #b8860b)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#000' : '#fff',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 15px rgba(212,175,55,0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 900, marginBottom: '2px', color: isSelected ? '#000' : 'var(--gold)' }}>{sign}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: isSelected ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.5)' }}>{currentMatch?.odds[sign].toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Puntata */}
      <div style={glassStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Puntata Elisee Points
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)', fontWeight: 700, fontSize: '14px' }}>
            <Coins size={14} /> 150 <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, fontSize: '11px', marginLeft: '2px' }}>Disponibili</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input 
            type="range" 
            min="10" 
            max="150" 
            step="10" 
            value={points} 
            onChange={(e) => setPoints(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--gold)', cursor: 'pointer' }}
          />
          <div style={{ 
            width: '60px', 
            textAlign: 'center', 
            background: 'rgba(0,0,0,0.4)', 
            padding: '8px 0', 
            borderRadius: '12px', 
            fontWeight: 700, 
            color: 'white', 
            border: '1px solid rgba(255,255,255,0.06)' 
          }}>{points}</div>
        </div>
      </div>

      {/* Recap & Button */}
      <div style={{
        ...glassStyle,
        background: 'linear-gradient(135deg, rgba(20, 10, 30, 0.6), rgba(10, 0, 16, 0.8))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Vincita Potenziale</p>
          <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={18} />
            {prediction ? potentialWin : 0} <span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: '2px' }}>EP</span>
          </div>
        </div>
        <button 
          disabled={!prediction || loading}
          onClick={handleBet}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '16px', 
            fontWeight: 700, 
            fontSize: '14px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            border: 'none',
            background: prediction && !loading ? 'white' : 'rgba(255,255,255,0.08)', 
            color: prediction && !loading ? 'black' : 'rgba(255,255,255,0.3)', 
            cursor: prediction && !loading ? 'pointer' : 'not-allowed',
            boxShadow: prediction && !loading ? '0 4px 15px rgba(255,255,255,0.15)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Piazzando...' : 'GIOCA'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
