'use client';

import { useState } from 'react';
import { X, ChevronRight, ArrowLeft, Loader, Info } from 'lucide-react';
import Image from 'next/image';

type ViewState = 'none' | 'login' | 'signup' | 'spid-gateway' | 'spid-credentials' | 'spid-loading' | 'admin-login';

export default function AuthModal({ 
  isOpen, 
  onClose,
  initialView = 'login' 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialView?: ViewState;
}) {
  const [view, setView] = useState<ViewState>(initialView);
  const [spidProvider, setSpidProvider] = useState('');
  
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
      
      {/* SPID Gateway View */}
      {(view === 'spid-gateway' || view === 'spid-credentials' || view === 'spid-loading') && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 10000, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ background: '#0066cc', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,102,204,0.3)' }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Scegli il tuo Provider</span>
            <button onClick={onClose} style={{ marginLeft: 'auto', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
          </div>

          {view === 'spid-gateway' && (
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px', overflowY: 'auto', flex: 1, background: '#f9fafb' }}>
              {['Poste ID', 'Aruba ID', 'InfoCert ID', 'Sielte ID'].map(p => (
                <button key={p} onClick={() => { setSpidProvider(p); setView('spid-credentials'); }} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 'bold', color: p.includes('Poste') ? '#004d99' : p.includes('Aruba') ? '#ff6600' : '#00a651', fontSize: '16px' }}>{p}</span>
                  <ChevronRight style={{ color: '#9ca3af' }} />
                </button>
              ))}
            </div>
          )}

          {view === 'spid-credentials' && (
            <div style={{ padding: '24px', background: '#fff', boxSizing: 'border-box' }}>
              <button onClick={() => setView('spid-gateway')} style={{ background: 'none', border: 'none', color: '#0066cc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px', cursor: 'pointer' }}>
                <ArrowLeft size={18} /> Indietro
              </button>
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>Accedi con {spidProvider}</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px', fontWeight: 500 }}>Nome Utente SPID</label>
                <input type="text" placeholder="Inserisci il tuo nome utente" style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px', fontWeight: 500 }}>Password</label>
                <input type="password" placeholder="Inserisci la tua password" style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              </div>
              
              <button onClick={() => { setView('spid-loading'); setTimeout(onClose, 2000); }} style={{ width: '100%', background: '#0066cc', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Entra con SPID</button>
              
              <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
                <hr style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
                <span style={{ padding: '0 12px', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>OPPURE</span>
                <hr style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
              </div>

              <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #d1d5db', borderRadius: '8px', background: '#f9fafb' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Accesso rapido da Smartphone</h4>
                <button onClick={() => { setView('spid-loading'); setTimeout(onClose, 2000); }} style={{ width: '100%', padding: '14px', background: '#0066cc', color: 'white', fontWeight: 'bold', borderRadius: '8px', border: 'none' }}>Apri App Provider</button>
              </div>
            </div>
          )}

          {view === 'spid-loading' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
              <Loader className="spin" size={48} color="#0066cc" style={{ marginBottom: '20px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Autenticazione in corso</h2>
              <p style={{ color: '#6b7280' }}>Verifica credenziali in corso...</p>
            </div>
          )}
        </div>
      )}

      {/* Admin Login View */}
      {view === 'admin-login' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#1a1a2e', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '24px', marginBottom: '24px', color: 'white' }}>Accesso Direzione</h2>
            <input type="text" placeholder="Username" style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <input type="password" placeholder="Password" style={{ width: '100%', padding: '14px', marginBottom: '24px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Annulla</button>
              <button onClick={onClose} style={{ flex: 1, padding: '14px', background: 'var(--gold)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer' }}>Accedi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
