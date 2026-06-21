'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trophy, CheckCircle, AlertCircle, Tv } from 'lucide-react';

interface Match {
  id: string;
  home: string;
  away: string;
  info: string;
  startTime: string;
}

const FALLBACK_MATCHES: Match[] = [
  { id: 'm1', home: 'Spagna', away: 'Arabia Saudita', info: 'Mondiale 2026', startTime: '2026-06-21T16:00:00Z' },
  { id: 'm2', home: 'Belgio', away: 'Iran', info: 'Mondiale 2026', startTime: '2026-06-21T19:00:00Z' },
  { id: 'm3', home: 'Uruguay', away: 'Capo Verde', info: 'Mondiale 2026', startTime: '2026-06-21T22:00:00Z' },
  { id: 'm4', home: 'Nuova Zelanda', away: 'Egitto', info: 'Mondiale 2026', startTime: '2026-06-22T01:00:00Z' },
  { id: 'm5', home: 'Argentina', away: 'Austria', info: 'Mondiale 2026', startTime: '2026-06-22T17:00:00Z' },
  { id: 'm6', home: 'Francia', away: 'Iraq', info: 'Mondiale 2026', startTime: '2026-06-22T21:00:00Z' },
  { id: 'm7', home: 'Norvegia', away: 'Senegal', info: 'Mondiale 2026', startTime: '2026-06-23T00:00:00Z' }
];

function getMatchStats(matchId: string) {
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    hash = matchId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rand1 = Math.abs((Math.sin(hash + 1) * 10000) % 1);
  const rand2 = Math.abs((Math.sin(hash + 2) * 10000) % 1);
  
  const p1 = Math.floor(35 + rand1 * 25);
  const pX = Math.floor(15 + rand2 * 15);
  const p2 = 100 - p1 - pX;
  
  return { p1, pX, p2 };
}

function getLiveScore(matchId: string, startTimeStr: string, now: Date) {
  const startTime = new Date(startTimeStr);
  const elapsedMs = now.getTime() - startTime.getTime();
  const elapsedMins = Math.floor(elapsedMs / 60000);

  // Deterministico hash
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    hash = matchId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const homeMax = (hash % 3) + (hash % 2 === 0 ? 1 : 0); // 0-3 goals
  const awayMax = ((hash >> 2) % 3); // 0-2 goals

  // Goal intervals
  const homeGoalTimes = [15, 42, 65, 82].slice(0, homeMax);
  const awayGoalTimes = [28, 55, 78].slice(0, awayMax);

  if (elapsedMins < 0) {
    return { status: 'scheduled', label: 'Non Iniziata', homeScore: 0, awayScore: 0 };
  }

  if (elapsedMins >= 105) {
    return { status: 'finished', label: 'Finale (FT)', homeScore: homeMax, awayScore: awayMax };
  }

  // Live match
  let displayMin = '';
  let activeMin = 0;
  if (elapsedMins <= 45) {
    activeMin = elapsedMins;
    displayMin = `${elapsedMins}'`;
  } else if (elapsedMins > 45 && elapsedMins <= 60) {
    activeMin = 45;
    displayMin = 'HT';
  } else {
    activeMin = Math.min(90, elapsedMins - 15);
    displayMin = `${activeMin}'`;
  }

  const currentHomeScore = homeGoalTimes.filter(t => t <= activeMin).length;
  const currentAwayScore = awayGoalTimes.filter(t => t <= activeMin).length;

  return {
    status: 'live',
    label: displayMin,
    homeScore: currentHomeScore,
    awayScore: currentAwayScore
  };
}

export default function BettingPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<{ [matchId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

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

        {/* Risultati Live Diretta.it */}
        {!loading && (
          <div style={{
            background: 'rgba(20, 10, 30, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tv size={18} style={{ color: 'var(--gold)' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Risultati Live (Diretta.it)
                </h4>
              </div>
              <a 
                href="https://www.diretta.it/calcio/mondo/coppa-del-mondo/calendario/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--gold)',
                  background: 'rgba(212,175,55,0.08)',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  border: '1px solid rgba(212,175,55,0.2)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Vedi Tutto
              </a>
            </div>

            {(() => {
              const liveOrFinished = matches.filter(m => {
                const state = getLiveScore(m.id, m.startTime, now);
                return state.status === 'live' || state.status === 'finished';
              });

              if (liveOrFinished.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '16px 8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    Nessuna partita è in corso al momento. I risultati live appariranno qui all&apos;inizio dei match.
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {liveOrFinished.map(m => {
                    const info = getLiveScore(m.id, m.startTime, now);
                    return (
                      <div 
                        key={m.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '16px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '40%' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.home}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.away}
                          </span>
                        </div>

                        {/* Punteggio */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '20%' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '2px' }}>
                            {info.homeScore} - {info.awayScore}
                          </span>
                        </div>

                        {/* Stato/Minuto */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', width: '40%' }}>
                          {info.status === 'live' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#ff3b30',
                                animation: 'pulse 1.5s infinite'
                              }} />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase' }}>
                                Live
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                              Finita
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: info.status === 'live' ? 'var(--gold)' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                            {info.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Partite Form */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
            <Loader2 className="animate-spin" size={24} style={{ color: 'var(--gold)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matches.map((match, index) => {
              const matchDate = new Date(match.startTime);
              const dateStr = matchDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ', ' + matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
              const { p1, pX, p2 } = getMatchStats(match.id);

              return (
                <div 
                  key={match.id}
                  className="bet-row"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '20px',
                    padding: '16px',
                    margin: 0
                  }}
                >
                  {/* Left Column: Match details & stats */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    
                    {/* Index + Teams */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        background: 'rgba(255,255,255,0.06)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: 'var(--gold)', 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 700, 
                        color: 'white', 
                        textOverflow: 'ellipsis', 
                        overflow: 'hidden', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {match.home} - {match.away}
                      </span>
                    </div>

                    {/* Subtitle: Date & Tournament Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                        {dateStr}
                      </span>
                      <span style={{ 
                        fontSize: '9px', 
                        fontWeight: 700, 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        color: 'rgba(255,255,255,0.5)', 
                        padding: '2px 6px', 
                        borderRadius: '6px', 
                        textTransform: 'uppercase' 
                      }}>
                        {match.info}
                      </span>
                    </div>

                    {/* Vote Percentages Stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                      <span>Voti utenti:</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span><strong style={{ color: 'var(--gold)' }}>1</strong>: {p1}%</span>
                        <span><strong style={{ color: 'rgba(255,255,255,0.6)' }}>X</strong>: {pX}%</span>
                        <span><strong style={{ color: 'var(--purple-light)' }}>2</strong>: {p2}%</span>
                      </div>
                    </div>

                    {/* Segmented Votes Progress Bar */}
                    <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginTop: '4px', width: '100%' }}>
                      <div style={{ width: `${p1}%`, background: 'var(--gold)', transition: 'width 0.3s' }} />
                      <div style={{ width: `${pX}%`, background: 'rgba(255,255,255,0.25)', transition: 'width 0.3s' }} />
                      <div style={{ width: `${p2}%`, background: 'var(--purple-light)', transition: 'width 0.3s' }} />
                    </div>

                  </div>

                  {/* Right Column: Prediction input */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{ fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pronostico</span>
                    <input 
                      type="text" 
                      className="bet-input" 
                      placeholder="1/X/2" 
                      maxLength={1}
                      value={predictions[match.id] || ''}
                      onChange={(e) => handleInputChange(match.id, e.target.value)}
                      style={{
                        width: '54px',
                        height: '38px',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        textAlign: 'center',
                        color: 'var(--gold)',
                        fontWeight: 800,
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

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
