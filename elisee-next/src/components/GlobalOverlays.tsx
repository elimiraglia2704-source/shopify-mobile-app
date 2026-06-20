'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import AIStylist from './AIStylist';
import AuthModal from './AuthModal';

export default function GlobalOverlays() {
  const [isAIOpen, setIsAIOpen]     = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [newSW, setNewSW]           = useState<ServiceWorker | null>(null);

  // Espone openAuthModal globalmente per altri componenti
  useEffect(() => {
    (window as { openAuthModal?: () => void }).openAuthModal = () => setIsAuthOpen(true);
    return () => {
      delete (window as { openAuthModal?: () => void }).openAuthModal;
    };
  }, []);

  // Rileva quando c'è una nuova versione del Service Worker disponibile
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Controlla subito se c'è già un waiting SW (aggiornamento pendente)
      if (reg.waiting) {
        setNewSW(reg.waiting);
        setShowUpdate(true);
      }

      // Ascolta futuri aggiornamenti
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setNewSW(installing);
            setShowUpdate(true);
          }
        });
      });
    });

    // Ricarica la pagina dopo che il nuovo SW prende il controllo
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (newSW) {
      newSW.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    setShowUpdate(false);
  };

  return (
    <>
      {/* ── Banner aggiornamento disponibile ── */}
      {showUpdate && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'linear-gradient(135deg, #d4af37, #f39c12)',
            color: '#000',
            padding: '12px 20px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(212,175,55,0.5)',
            fontSize: '14px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <RefreshCw size={18} />
          <span>Nuova versione disponibile!</span>
          <button
            onClick={handleUpdate}
            style={{
              background: 'rgba(0,0,0,0.15)',
              border: '1px solid rgba(0,0,0,0.2)',
              color: '#000',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Aggiorna
          </button>
          <button
            onClick={() => setShowUpdate(false)}
            style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Pulsante AI Stylist ── */}
      <button
        onClick={() => setIsAIOpen(true)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, var(--gold), #f39c12)',
          color: 'black',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(212,175,55,0.4)',
          zIndex: 9000,
          cursor: 'pointer',
        }}
      >
        <Sparkles size={24} />
      </button>

      <AIStylist isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
