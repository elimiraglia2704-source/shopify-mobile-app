'use client';

import { useState, useEffect } from 'react';
import { Fingerprint, Lock } from 'lucide-react';

export default function AppInitializer() {
  const [isLocked, setIsLocked] = useState(false);
  const [hasFaceId, setHasFaceId] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleBiometricUnlock = async () => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      alert("Questo browser o dispositivo non supporta l'autenticazione biometrica.");
      return;
    }

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000
        }
      });

      if (assertion) {
        // Se l'utente era disconnesso ma ha abilitato il FaceID, lo connettiamo automaticamente
        const savedToken = localStorage.getItem('elisee:saved_token');
        if (savedToken) {
          localStorage.setItem('customerAccessToken', savedToken);
          localStorage.removeItem('elisee:logged_out');
        }
        
        sessionStorage.setItem('elisee:unlocked', 'true');
        setIsLocked(false);
      }
    } catch (err) {
      console.error("Errore durante l'autenticazione biometrica:", err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);

      // ─── 2. Controllo Stato Sblocco Biometrico ──────────────────────────────
      try {
        const savedSettings = localStorage.getItem('elisee:settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.faceId === true) {
            setHasFaceId(true);
            const isSessionUnlocked = sessionStorage.getItem('elisee:unlocked') === 'true';
            if (!isSessionUnlocked) {
              setIsLocked(true);
            }
          }
        }
      } catch (err) {
        console.error("Errore lettura impostazioni biometriche:", err);
      }
    }, 0);

    // ─── 1. Inizializzazione Tema ───────────────────────────────────────────
    const savedTheme = localStorage.getItem('elisee:theme');
    if (savedTheme === 'damask') {
      document.body.classList.add('theme-damask');
    } else {
      document.body.classList.remove('theme-damask');
    }
  }, []);

  // Avvia automaticamente il prompt biometrico all'avvio se bloccato
  useEffect(() => {
    if (isLocked && hasFaceId) {
      // Piccolo ritardo per consentire il rendering iniziale dell'overlay
      const timer = setTimeout(() => {
        handleBiometricUnlock();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLocked, hasFaceId]);

  if (!mounted) return null;
  if (!isLocked) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999999,
      background: 'rgba(10, 2, 2, 0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'var(--font-b)'
    }}>
      {/* Glow decorativo */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', maxWidth: '320px' }}>
        
        {/* Pulsante Icona */}
        <div 
          onClick={handleBiometricUnlock}
          style={{
            width: '86px',
            height: '86px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(211,84,0,0.06) 100%)',
            border: '2px solid rgba(212,175,55,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4), 0 0 15px rgba(212,175,55,0.15)',
            position: 'relative'
          }}
        >
          <Fingerprint size={42} style={{ color: 'var(--gold)', animation: 'pulse 2s infinite' }} />
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#1a0404',
            border: '1px solid rgba(212,175,55,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold)'
          }}>
            <Lock size={12} />
          </div>
        </div>

        {/* Testo */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-tech)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Elisee Secure
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: '1.6'
          }}>
            L&apos;applicazione è bloccata. Utilizza il riconoscimento facciale o l&apos;impronta per sbloccare l&apos;accesso.
          </p>
        </div>

        {/* Bottone sblocco */}
        <button
          onClick={handleBiometricUnlock}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--gold), #d35400)',
            color: 'black',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(212,175,55,0.25)',
            letterSpacing: '0.5px'
          }}
        >
          Sblocca con Biometria
        </button>

      </div>
    </div>
  );
}
