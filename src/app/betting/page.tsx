'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trophy, Coins, CheckCircle, AlertCircle } from 'lucide-react';

interface Match {
  id: string;
  home: string;
  away: string;
  info: string;
  startTime: string;
}

const FALLBACK_MATCHES: Match[] = [
  { id: 'm5', home: 'Olanda', away: 'Svezia', info: 'Mondiale 2026', startTime: '2026-06-20T17:00:00Z' },
  { id: 'm6', home: 'Germania', away: "Costa d'Avorio", info: 'Mondiale 2026', startTime: '2026-06-20T20:00:00Z' },
  { id: 'm7', home: 'Ecuador', away: 'Curacao', info: 'Mondiale 2026', startTime: '2026-06-21T00:00:00Z' },
  { id: 'm9', home: 'Spagna', away: 'Galles', info: 'Mondiale 2026', startTime: '2026-06-21T18:00:00Z' },
  { id: 'm14', home: 'Francia', away: 'Irlanda', info: 'Mondiale 2026', startTime: '2026-06-21T21:00:00Z' },
  { id: 'm10', home: 'Italia', away: 'Croazia', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
  { id: 'm13', home: 'Argentina', away: 'Messico', info: 'Mondiale 2026', startTime: '2026-06-22T20:00:00Z' }
];

export default function BettingPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<{ [matchId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch delle partite
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/sports/matches');
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || FALLBACK_MATCHES);
        } else {
          setMatches(FALLBACK_MATCHES);
        }
      } catch (err) {
        console.error("Failed to load matches, using fallback:", err);
        setMatches(FALLBACK_MATCHES);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleInputChange = (matchId: string, value: string) => {
    const uppercaseVal = value.toUpperCase().replace(/[^1X2]/g, '');
    setPredictions(prev => ({
      ...prev,
      [matchId]: uppercaseVal
    }));
    setErrorMsg('');
  };

  const isFormValid = matches.length > 0 && matches.every(m => predictions[m.id] && predictions[m.id].trim() !== '');

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrorMsg('Devi compilare tutti e 7 i pronostici!');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const email = localStorage.getItem('elisee:profile_email') || 'enea.miraglia@example.com';
      const res = await fetch('/api/sports/submit-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, bets: predictions })
      });

      if (res.ok) {
        setSuccess(true);
        
        // Registra scommessa nel localStorage per lo storico nel profilo
        const newBet = {
          id: 'bet_' + Date.now(),
          date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: 'in_corso',
          predictions: matches.map(m => predictions[m.id]),
          matches: matches.map(m => `${m.home} - ${m.away} (${m.info})`)
        };

        const existingHistory = JSON.parse(localStorage.getItem('elisee_bet_history') || '[]');
        localStorage.setItem('elisee_bet_history', JSON.stringify([newBet, ...existingHistory]));

        // Reset dei pronostici dopo 3 secondi
        setTimeout(() => {
          setPredictions({});
          setSuccess(false);
        }, 3000);
      } else {
        setErrorMsg('Errore durante l\'invio. Riprova più tardi.');
      }
    } catch (err) {
      console.error("Error submitting bet:", err);
      setErrorMsg('Errore di rete. Riprova più tardi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '120px' }}>
      
      {/* Header stile Screenshot */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative'
      }}>
        <Link 
          href="/profile" 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'rgba(255,255,255,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> Profilo
        </Link>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 700, 
          color: 'white', 
          fontFamily: 'var(--font-d)', 
          margin: '0 auto',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          L&apos;angolo ludopatico
        </h2>
      </div>

      <div style={{ padding: '24px 16px' }}>
        
        {/* Header Info */}
        <div style={{ textAlign: 'center', marginBottom: '28px', marginTop: '10px' }}>
          <Trophy style={{ width: '48px', height: '48px', color: 'var(--gold)', marginBottom: '12px', margin: '0 auto' }} />
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-d)', fontWeight: 700, color: 'white', marginBottom: '8px', marginTop: '10px' }}>
            Mettiti alla prova
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.5', maxWidth: '300px', margin: '0 auto' }}>
            Inserisci il pronostico (es. 1, X, 2) per queste 7 partite di cartello.
            Se fai en plein, ricevi un <strong>Buono Sconto</strong> da consumare entro 30 giorni sugli articoli tra 1€ e 35€!
          </p>
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,59,48,0.06)', borderRadius: '12px', border: '1px solid rgba(255,59,48,0.15)' }}>
            <p style={{ color: '#ff6b6b', fontSize: '11px', fontWeight: 600, margin: 0 }}>
              Ricorda: auguriamo a tutti buon divertimento senza eccedere troppo nell&apos;azzardo.
            </p>
          </div>
        </div>

        {/* Partite Form */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
            <Loader2 className="animate-spin" size={24} style={{ color: 'var(--gold)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {matches.map((match, index) => {
              const matchDate = new Date(match.startTime);
              const dateStr = matchDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ', ' + matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={match.id}
                  className="bet-row"
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>
                      {index + 1}. {match.home} - {match.away} ({match.info})
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {dateStr}
                    </span>
                  </div>
                  <input 
                    type="text" 
                    className="bet-input" 
                    placeholder="1/X/2" 
                    maxLength={1}
                    value={predictions[match.id] || ''}
                    onChange={(e) => handleInputChange(match.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', fontSize: '13px', justifyContent: 'center', marginTop: '16px' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bottone Invia */}
        <button 
          onClick={handleSubmit}
          disabled={!isFormValid || submitting || success}
          style={{ 
            width: '100%', 
            marginTop: '24px', 
            padding: '16px', 
            borderRadius: '14px', 
            fontWeight: 700, 
            background: success ? '#4caf50' : 'var(--gold)', 
            color: success ? 'white' : '#000', 
            border: 'none', 
            fontSize: '16px', 
            boxShadow: success ? '0 4px 15px rgba(76,175,80,0.3)' : '0 4px 15px rgba(212,175,55,0.3)',
            cursor: (!isFormValid || submitting || success) ? 'not-allowed' : 'pointer',
            opacity: (!isFormValid && !success) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Invio in corso...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle size={18} />
              <span>Schedina Confermata! 🍀</span>
            </>
          ) : (
            <span>Conferma Scommessa</span>
          )}
        </button>

      </div>
    </div>
  );
}
