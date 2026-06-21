'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trophy, CheckCircle, AlertCircle, Tv, Bell, BellOff } from 'lucide-react';

interface Match {
  id: string;
  home: string;
  away: string;
  info: string;
  startTime: string;
  status?: 'scheduled' | 'live' | 'finished';
  label?: string;
  homeScore?: number;
  awayScore?: number;
  elapsedMins?: number;
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

// ── World Cup 2026 Group Standings ────────────────────────────────────────────
interface TeamRow {
  name: string; flag: string;
  g: number; v: number; p: number; s: number;
  gf: number; gs: number; pts: number;
}
interface Group { name: string; teams: TeamRow[]; }

const WORLD_CUP_GROUPS: Group[] = [
  { name: 'Girone A', teams: [
    { name: 'Spagna',       flag: '🇪🇸', g:2,v:1,p:1,s:0,gf:3,gs:2,pts:4 },
    { name: 'Arabia Saudita',flag:'🇸🇦', g:2,v:1,p:1,s:0,gf:3,gs:3,pts:4 },
    { name: 'Svizzera',     flag: '🇨🇭', g:2,v:1,p:0,s:1,gf:2,gs:2,pts:3 },
    { name: "C. d'Avorio",  flag: '🇨🇮', g:2,v:0,p:0,s:2,gf:1,gs:2,pts:0 },
  ]},
  { name: 'Girone B', teams: [
    { name: 'Belgio',       flag: '🇧🇪', g:2,v:1,p:1,s:0,gf:4,gs:3,pts:4 },
    { name: 'Iran',         flag: '🇮🇷', g:2,v:1,p:1,s:0,gf:3,gs:3,pts:4 },
    { name: 'Marocco',      flag: '🇲🇦', g:2,v:1,p:0,s:1,gf:2,gs:2,pts:3 },
    { name: 'Canada',       flag: '🇨🇦', g:2,v:0,p:0,s:2,gf:1,gs:2,pts:0 },
  ]},
  { name: 'Girone C', teams: [
    { name: 'Uruguay',      flag: '🇺🇾', g:2,v:1,p:1,s:0,gf:3,gs:2,pts:4 },
    { name: 'Capo Verde',   flag: '🇨🇻', g:2,v:1,p:1,s:0,gf:2,gs:2,pts:4 },
    { name: 'Giappone',     flag: '🇯🇵', g:2,v:1,p:0,s:1,gf:3,gs:3,pts:3 },
    { name: 'Camerun',      flag: '🇨🇲', g:2,v:0,p:0,s:2,gf:0,gs:1,pts:0 },
  ]},
  { name: 'Girone D', teams: [
    { name: 'Egitto',       flag: '🇪🇬', g:2,v:1,p:1,s:0,gf:3,gs:2,pts:4 },
    { name: 'Nuova Zelanda',flag: '🇳🇿', g:2,v:1,p:1,s:0,gf:2,gs:2,pts:4 },
    { name: 'Corea del Sud',flag: '🇰🇷', g:2,v:1,p:0,s:1,gf:2,gs:2,pts:3 },
    { name: 'Qatar',        flag: '🇶🇦', g:2,v:0,p:0,s:2,gf:0,gs:1,pts:0 },
  ]},
  { name: 'Girone E', teams: [
    { name: 'Argentina',    flag: '🇦🇷', g:2,v:2,p:0,s:0,gf:5,gs:1,pts:6 },
    { name: 'Austria',      flag: '🇦🇹', g:2,v:1,p:0,s:1,gf:3,gs:3,pts:3 },
    { name: 'Messico',      flag: '🇲🇽', g:2,v:0,p:1,s:1,gf:2,gs:4,pts:1 },
    { name: 'Ecuador',      flag: '🇪🇨', g:2,v:0,p:1,s:1,gf:1,gs:3,pts:1 },
  ]},
  { name: 'Girone F', teams: [
    { name: 'Francia',      flag: '🇫🇷', g:2,v:2,p:0,s:0,gf:6,gs:1,pts:6 },
    { name: 'Iraq',         flag: '🇮🇶', g:2,v:1,p:0,s:1,gf:2,gs:3,pts:3 },
    { name: 'Algeria',      flag: '🇩🇿', g:2,v:0,p:1,s:1,gf:2,gs:4,pts:1 },
    { name: 'Bolivia',      flag: '🇧🇴', g:2,v:0,p:1,s:1,gf:1,gs:3,pts:1 },
  ]},
  { name: 'Girone G', teams: [
    { name: 'Germania',     flag: '🇩🇪', g:2,v:2,p:0,s:0,gf:5,gs:1,pts:6 },
    { name: 'Norvegia',     flag: '🇳🇴', g:2,v:1,p:0,s:1,gf:3,gs:3,pts:3 },
    { name: 'Senegal',      flag: '🇸🇳', g:2,v:0,p:1,s:1,gf:2,gs:4,pts:1 },
    { name: 'Polonia',      flag: '🇵🇱', g:2,v:0,p:1,s:1,gf:1,gs:3,pts:1 },
  ]},
  { name: 'Girone H', teams: [
    { name: 'Brasile',      flag: '🇧🇷', g:2,v:2,p:0,s:0,gf:6,gs:0,pts:6 },
    { name: 'Portogallo',   flag: '🇵🇹', g:2,v:1,p:0,s:1,gf:3,gs:3,pts:3 },
    { name: 'Cile',         flag: '🇨🇱', g:2,v:0,p:1,s:1,gf:2,gs:4,pts:1 },
    { name: 'Croazia',      flag: '🇭🇷', g:2,v:0,p:1,s:1,gf:1,gs:5,pts:1 },
  ]},
  { name: 'Girone I', teams: [
    { name: 'Inghilterra',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', g:2,v:1,p:1,s:0,gf:4,gs:3,pts:4 },
    { name: 'USA',          flag: '🇺🇸', g:2,v:1,p:1,s:0,gf:3,gs:2,pts:4 },
    { name: 'Turchia',      flag: '🇹🇷', g:2,v:1,p:0,s:1,gf:2,gs:2,pts:3 },
    { name: 'Serbia',       flag: '🇷🇸', g:2,v:0,p:0,s:2,gf:0,gs:2,pts:0 },
  ]},
  { name: 'Girone J', teams: [
    { name: 'Italia',       flag: '🇮🇹', g:2,v:2,p:0,s:0,gf:4,gs:0,pts:6 },
    { name: 'Australia',    flag: '🇦🇺', g:2,v:1,p:0,s:1,gf:2,gs:2,pts:3 },
    { name: 'Tunisia',      flag: '🇹🇳', g:2,v:0,p:1,s:1,gf:1,gs:2,pts:1 },
    { name: 'Ucraina',      flag: '🇺🇦', g:2,v:0,p:1,s:1,gf:1,gs:4,pts:1 },
  ]},
  { name: 'Girone K', teams: [
    { name: 'Paesi Bassi',  flag: '🇳🇱', g:2,v:2,p:0,s:0,gf:5,gs:1,pts:6 },
    { name: 'Danimarca',    flag: '🇩🇰', g:2,v:1,p:0,s:1,gf:3,gs:3,pts:3 },
    { name: 'Ghana',        flag: '🇬🇭', g:2,v:0,p:1,s:1,gf:2,gs:4,pts:1 },
    { name: 'Costa Rica',   flag: '🇨🇷', g:2,v:0,p:1,s:1,gf:1,gs:3,pts:1 },
  ]},
  { name: 'Girone L', teams: [
    { name: 'Portogallo',   flag: '🇵🇹', g:2,v:2,p:0,s:0,gf:7,gs:1,pts:6 },
    { name: 'Scozia',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', g:2,v:1,p:0,s:1,gf:3,gs:3,pts:3 },
    { name: 'Colombia',     flag: '🇨🇴', g:2,v:0,p:1,s:1,gf:2,gs:4,pts:1 },
    { name: 'Venezuela',    flag: '🇻🇪', g:2,v:0,p:1,s:1,gf:1,gs:5,pts:1 },
  ]},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function getLiveScore(matchId: string, matches: Match[]) {
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return { status: 'scheduled' as const, label: 'Non Iniziata', homeScore: 0, awayScore: 0, elapsedMins: 0 };
  }
  return {
    status: match.status || 'scheduled',
    label: match.label || 'Non Iniziata',
    homeScore: match.homeScore !== undefined ? match.homeScore : 0,
    awayScore: match.awayScore !== undefined ? match.awayScore : 0,
    elapsedMins: match.elapsedMins || 0
  };
}

// ── Notification helpers ──────────────────────────────────────────────────────
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function sendMatchNotification(title: string, body: string, tag: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      tag,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  } catch { /* silently ignore */ }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BettingPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<{ [matchId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [now, setNow] = useState(new Date());
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [bettedMatchIds, setBettedMatchIds] = useState<string[]>([]);

  // Track previous live state for each match to detect events
  const prevStateRef = useRef<Record<string, { homeScore: number; awayScore: number; status: string; label: string }>>({});

  // Clock tick every 10s
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Load bet history to know which matches user bet on
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('elisee_bet_history') || '[]');
    if (history.length > 0 && history[0].matchIds) {
      setBettedMatchIds(history[0].matchIds);
    }
    const notifPref = localStorage.getItem('elisee_match_notif') === 'true';
    setNotificationsOn(notifPref);
  }, []);

  // Live notification watcher — fires when match events change for betted matches
  useEffect(() => {
    if (!notificationsOn || bettedMatchIds.length === 0 || matches.length === 0) return;

    matches
      .filter(m => bettedMatchIds.includes(m.id))
      .forEach(m => {
        const info = getLiveScore(m.id, matches);
        const prev = prevStateRef.current[m.id];
        const matchLabel = `${m.home} - ${m.away}`;

        if (!prev) {
          // First tick — just record state
          prevStateRef.current[m.id] = { homeScore: info.homeScore, awayScore: info.awayScore, status: info.status, label: info.label };
          return;
        }

        // Kick-off
        if (prev.status === 'scheduled' && info.status === 'live') {
          sendMatchNotification('⚽ Fischio d\'inizio!', `${matchLabel} è iniziata — buona fortuna!`, `kickoff_${m.id}`);
        }

        // Goal scored
        if (info.status === 'live' && (info.homeScore > prev.homeScore)) {
          sendMatchNotification('🥅 GOL!', `${m.home} segna! ${info.homeScore}-${info.awayScore} (${info.label})`, `goal_home_${m.id}_${info.homeScore}`);
        }
        if (info.status === 'live' && (info.awayScore > prev.awayScore)) {
          sendMatchNotification('🥅 GOL!', `${m.away} segna! ${info.homeScore}-${info.awayScore} (${info.label})`, `goal_away_${m.id}_${info.awayScore}`);
        }

        // Half time
        if (prev.label !== 'HT' && info.label === 'HT') {
          sendMatchNotification('⏸ Fine 1° Tempo', `${matchLabel} — ${info.homeScore}-${info.awayScore} all\'intervallo`, `ht_${m.id}`);
        }

        // Full time
        if (prev.status === 'live' && info.status === 'finished') {
          sendMatchNotification('🏁 Partita Finita!', `${matchLabel} — Risultato Finale: ${info.homeScore}-${info.awayScore}`, `ft_${m.id}`);
        }

        prevStateRef.current[m.id] = { homeScore: info.homeScore, awayScore: info.awayScore, status: info.status, label: info.label };
      });
  }, [now, matches, notificationsOn, bettedMatchIds]);

  // Fetch matches and standings with polling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sports/matches');
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || FALLBACK_MATCHES);
        } else {
          setMatches(FALLBACK_MATCHES);
        }
      } catch {
        setMatches(FALLBACK_MATCHES);
      }

      try {
        const res = await fetch('/api/sports/standings');
        if (res.ok) {
          const data = await res.json();
          if (data.groups && data.groups.length > 0) {
            setGroups(data.groups);
          }
        }
      } catch (err) {
        console.error("Errore fetch standings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (matchId: string, value: string) => {
    const uppercaseVal = value.toUpperCase().replace(/[^1X2]/g, '');
    setPredictions(prev => ({ ...prev, [matchId]: uppercaseVal }));
    setErrorMsg('');
  };

  // Only require predictions for non-live, non-finished matches
  const bettableMatches = matches.filter(m => {
    const state = getLiveScore(m.id, matches);
    return state.status === 'scheduled';
  });

  const isFormValid = bettableMatches.length > 0 &&
    bettableMatches.every(m => predictions[m.id] && predictions[m.id].trim() !== '');

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrorMsg('Devi compilare tutti i pronostici disponibili!');
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

        // Save bet to history including match IDs for notifications
        const newBet = {
          id: 'bet_' + Date.now(),
          date: new Date().toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: 'in_corso',
          matchIds: bettableMatches.map(m => m.id),
          predictions: bettableMatches.map(m => predictions[m.id]),
          matches: bettableMatches.map(m => `${m.home} - ${m.away} (${m.info})`),
        };
        const existingHistory = JSON.parse(localStorage.getItem('elisee_bet_history') || '[]');
        localStorage.setItem('elisee_bet_history', JSON.stringify([newBet, ...existingHistory]));
        setBettedMatchIds(bettableMatches.map(m => m.id));

        // Ask for notification permission
        const granted = await requestNotificationPermission();
        if (granted) {
          setNotificationsOn(true);
          localStorage.setItem('elisee_match_notif', 'true');
          sendMatchNotification(
            '🎯 Schedina Inviata!',
            `Segui i tuoi ${bettableMatches.length} match in tempo reale. Ti avviseremo per ogni evento!`,
            'bet_submitted'
          );
        }

        setTimeout(() => {
          setPredictions({});
          setSuccess(false);
        }, 3000);
      } else {
        setErrorMsg("Errore durante l'invio. Riprova più tardi.");
      }
    } catch {
      setErrorMsg('Errore di rete. Riprova più tardi.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleNotifications = async () => {
    if (notificationsOn) {
      setNotificationsOn(false);
      localStorage.setItem('elisee_match_notif', 'false');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsOn(true);
        localStorage.setItem('elisee_match_notif', 'true');
      }
    }
  };

  const displayGroups = groups.length > 0 ? groups : WORLD_CUP_GROUPS;

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '120px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
        <Link href="/profile" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Profilo
        </Link>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-d)', margin: '0 auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          L&apos;angolo ludopatico
        </h2>
        {/* Notification toggle */}
        <button
          onClick={toggleNotifications}
          title={notificationsOn ? 'Disattiva notifiche' : 'Attiva notifiche match'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: notificationsOn ? 'var(--gold)' : 'rgba(255,255,255,0.3)', padding: '4px', marginLeft: 'auto' }}
        >
          {notificationsOn ? <Bell size={18} /> : <BellOff size={18} />}
        </button>
      </div>

      <div style={{ padding: '24px 16px' }}>

        {/* Header Info */}
        <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
          <Trophy style={{ width: '48px', height: '48px', color: 'var(--gold)', margin: '0 auto 12px' }} />
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

        {/* ── CLASSIFICHE MONDIALI 2026 ── */}
        {!loading && (
          <div style={{ marginBottom: '28px' }}>
            {/* Header classifica */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏆</span> Classifiche Gironi
              </h4>
              <a
                href="https://www.diretta.it/calcio/mondo/coppa-del-mondo/classifiche/SbLsX4y7/classifiche-live/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold)', background: 'rgba(212,175,55,0.08)', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)', textDecoration: 'none' }}
              >
                Diretta.it →
              </a>
            </div>

            {/* Horizontal scroll container */}
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '10px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}>
              {displayGroups.map((group: Group) => (
                <div
                  key={group.name}
                  style={{
                    minWidth: '220px',
                    flexShrink: 0,
                    scrollSnapAlign: 'start',
                    background: 'rgba(20, 10, 30, 0.55)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '18px',
                    border: '1px solid rgba(212,175,55,0.25)',
                    boxShadow: '0 0 16px rgba(212,175,55,0.12), 0 8px 24px rgba(0,0,0,0.4)',
                    padding: '14px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Group name */}
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', textAlign: 'center' }}>
                    {group.name}
                  </div>

                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 22px 22px 22px 22px', gap: '2px', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                    <span>Squadra</span>
                    <span style={{ textAlign: 'center' }}>PG</span>
                    <span style={{ textAlign: 'center' }}>V</span>
                    <span style={{ textAlign: 'center' }}>S</span>
                    <span style={{ textAlign: 'center' }}>Pt</span>
                  </div>

                  {/* Rows */}
                  {group.teams.map((team: TeamRow, i: number) => (
                    <div
                      key={team.name}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 22px 22px 22px 22px',
                        gap: '2px',
                        alignItems: 'center',
                        padding: '5px 0',
                        borderBottom: i < group.teams.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: i < 2 ? 'rgba(212,175,55,0.04)' : 'transparent',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{team.flag}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: i < 2 ? 'white' : 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {team.name}
                        </span>
                      </div>
                      <span style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{team.g}</span>
                      <span style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{team.v}</span>
                      <span style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{team.s}</span>
                      <span style={{ textAlign: 'center', fontSize: '12px', fontWeight: 800, color: i < 2 ? 'var(--gold)' : 'rgba(255,255,255,0.5)' }}>{team.pts}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RISULTATI LIVE DIRETTA.IT ── */}
        {!loading && (
          <div style={{
            background: 'rgba(20, 10, 30, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 20px rgba(155,89,208,0.15), 0 10px 30px rgba(0,0,0,0.4)',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '28px',
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
                style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gold)', background: 'rgba(212,175,55,0.08)', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)', textDecoration: 'none' }}
              >
                Vedi Tutto
              </a>
            </div>

            {(() => {
              const liveOrFinished = matches.filter(m => {
                const state = getLiveScore(m.id, matches);
                return state.status === 'live' || state.status === 'finished';
              });

              if (liveOrFinished.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '16px 8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    Nessuna partita in corso. I risultati live appariranno qui all&apos;inizio dei match.
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {liveOrFinished.map(m => {
                    const info = getLiveScore(m.id, matches);
                    return (
                      <div
                        key={m.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '16px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '40%' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '20%' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '2px' }}>{info.homeScore} - {info.awayScore}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', width: '40%' }}>
                          {info.status === 'live' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b30', animation: 'pulse 1.5s infinite', display: 'block' }} />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase' }}>Live</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Finita</span>
                          )}
                          <span style={{ fontSize: '11px', color: info.status === 'live' ? 'var(--gold)' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{info.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── PARTITE SCOMMESSE ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
            <Loader2 className="animate-spin" size={24} style={{ color: 'var(--gold)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {matches
              .filter(match => {
                const liveInfo = getLiveScore(match.id, matches);
                return liveInfo.status !== 'finished';
              })
              .map((match, index) => {
              const liveInfo = getLiveScore(match.id, matches);
              const isLive = liveInfo.status === 'live';
              const isFinished = liveInfo.status === 'finished';
              const isLocked = isLive || isFinished;
              const matchDate = new Date(match.startTime);
              const dateStr = matchDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ', ' + matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
              const { p1, pX, p2 } = getMatchStats(match.id);

              // Glow color based on status
              const glowColor = isLive
                ? 'rgba(255,59,48,0.35)'
                : isFinished
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(212,175,55,0.25)';
              const borderColor = isLive
                ? 'rgba(255,59,48,0.5)'
                : isFinished
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(212,175,55,0.3)';

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
                    background: isLocked ? 'rgba(255,255,255,0.015)' : 'rgba(20,10,30,0.5)',
                    border: `1px solid ${borderColor}`,
                    boxShadow: `0 0 18px ${glowColor}, 0 6px 20px rgba(0,0,0,0.35)`,
                    borderRadius: '20px',
                    padding: '16px',
                    opacity: isFinished ? 0.6 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* LIVE overlay badge */}
                  {isLive && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255,59,48,0.15)',
                      border: '1px solid rgba(255,59,48,0.4)',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      zIndex: 2,
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3b30', animation: 'pulse 1.5s infinite', display: 'block', flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#ff3b30' }}>LIVE · {liveInfo.homeScore}-{liveInfo.awayScore} ({liveInfo.label})</span>
                    </div>
                  )}
                  {isFinished && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      zIndex: 2,
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>FT · {liveInfo.homeScore}-{liveInfo.awayScore}</span>
                    </div>
                  )}

                  {/* Left: match details */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {index + 1}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: isLocked ? 'rgba(255,255,255,0.5)' : 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {match.home} - {match.away}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{dateStr}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {match.info}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                      <span>Voti utenti:</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span><strong style={{ color: 'var(--gold)' }}>1</strong>: {p1}%</span>
                        <span><strong style={{ color: 'rgba(255,255,255,0.6)' }}>X</strong>: {pX}%</span>
                        <span><strong style={{ color: 'var(--purple-light)' }}>2</strong>: {p2}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginTop: '4px', width: '100%' }}>
                      <div style={{ width: `${p1}%`, background: 'var(--gold)', transition: 'width 0.3s' }} />
                      <div style={{ width: `${pX}%`, background: 'rgba(255,255,255,0.25)', transition: 'width 0.3s' }} />
                      <div style={{ width: `${p2}%`, background: 'var(--purple-light)', transition: 'width 0.3s' }} />
                    </div>
                  </div>

                  {/* Right: input or lock */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {isLocked ? (
                      <div style={{ width: '54px', height: '38px', background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '18px', opacity: 0.4 }}>🔒</span>
                      </div>
                    ) : (
                      <>
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
                            fontFamily: 'inherit',
                          }}
                        />
                      </>
                    )}
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

        {/* Notification banner */}
        {bettedMatchIds.length > 0 && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {notificationsOn ? <Bell size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> : <BellOff size={16} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />}
              <span style={{ fontSize: '12px', color: notificationsOn ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
                {notificationsOn ? 'Riceverai notifiche per gol, HT e fine partita' : 'Attiva le notifiche per seguire i tuoi match'}
              </span>
            </div>
            <button
              onClick={toggleNotifications}
              style={{ background: notificationsOn ? 'rgba(255,59,48,0.15)' : 'rgba(212,175,55,0.15)', border: `1px solid ${notificationsOn ? 'rgba(255,59,48,0.3)' : 'rgba(212,175,55,0.3)'}`, color: notificationsOn ? '#ff6b6b' : 'var(--gold)', borderRadius: '10px', padding: '5px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {notificationsOn ? 'Disattiva' : 'Attiva'}
            </button>
          </div>
        )}

        {/* Submit button */}
        {bettableMatches.length > 0 && (
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
              transition: 'all 0.2s',
            }}
          >
            {submitting ? (
              <><Loader2 className="animate-spin" size={18} /><span>Invio in corso...</span></>
            ) : success ? (
              <><CheckCircle size={18} /><span>Schedina Confermata! 🍀</span></>
            ) : (
              <span>Conferma Scommessa</span>
            )}
          </button>
        )}

        {bettableMatches.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            <p>Tutte le partite di questa giornata sono già in corso o terminate.</p>
            <p style={{ marginTop: '8px', fontSize: '12px' }}>Controlla domani per i nuovi match!</p>
          </div>
        )}

      </div>
    </div>
  );
}
