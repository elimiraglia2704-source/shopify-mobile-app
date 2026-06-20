'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AIStylist from './AIStylist';
import AuthModal from './AuthModal';

export default function GlobalOverlays() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // We expose a global function so other parts of the app can trigger the Auth Modal if needed
  useEffect(() => {
    (window as any).openAuthModal = () => setIsAuthOpen(true);
    return () => {
      delete (window as any).openAuthModal;
    };
  }, []);

  return (
    <>
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
          cursor: 'pointer'
        }}
      >
        <Sparkles size={24} />
      </button>

      <AIStylist isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
