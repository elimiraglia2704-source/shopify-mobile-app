'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ArrowLeft, Loader, Eye, EyeOff, Sparkles } from 'lucide-react';

// ─── Tipi ────────────────────────────────────────────────────────────────────
type ViewState =
  | 'none'
  | 'login'
  | 'signup'
  | 'spid-gateway'
  | 'spid-credentials'
  | 'spid-loading'
  | 'admin-login';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: ViewState;
}

// ─── Costanti Shopify ─────────────────────────────────────────────────────────
const SHOP_DOMAIN = 'eliseebrand.myshopify.com';
const SHOP_TOKEN  = 'fd3d51862812c1f0c530dc83ac3f6685';

async function shopifyMutation(query: string, variables: Record<string, unknown>) {
  const res = await fetch(`https://${SHOP_DOMAIN}/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOP_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

// ─── Sub-componenti (FUORI dal componente principale per evitare re-create) ──
// Stili condivisi (non possono dipendere da state, quindi sono costanti)
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
};

function OverlayWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-end',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #12001f 0%, #0a0010 100%)',
          borderRadius: '24px 24px 0 0',
          padding: '8px 24px 40px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SheetHandle() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 20px' }}>
      <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  const isSuccess = message.startsWith('✓');
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '10px',
      background: isSuccess ? 'rgba(76,175,80,0.15)' : 'rgba(255,59,48,0.15)',
      border: `1px solid ${isSuccess ? 'rgba(76,175,80,0.3)' : 'rgba(255,59,48,0.3)'}`,
      color: isSuccess ? '#4caf50' : '#ff6b6b',
      fontSize: '13px',
      marginBottom: '20px',
    }}>
      {message}
    </div>
  );
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
    >
      <X size={18} />
    </button>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView]                 = useState<ViewState>(initialView);
  const [spidProvider, setSpidProvider] = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [mounted, setMounted]           = useState(false);

  const [loginEmail, setLoginEmail]     = useState('');
  const [loginPass, setLoginPass]       = useState('');
  const [signupName, setSignupName]     = useState('');
  const [signupEmail, setSignupEmail]   = useState('');
  const [signupPass, setSignupPass]     = useState('');
  const [adminUser, setAdminUser]       = useState('');
  const [adminPass, setAdminPass]       = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  const clearError = () => setError('');

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #d4af37, #f39c12)',
    color: '#000',
    fontWeight: 700,
    fontSize: '15px',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };
  const btnSecondary: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500,
    fontSize: '14px',
    border: '1px solid rgba(255,255,255,0.12)',
    cursor: 'pointer',
  };

  // ── Login Shopify ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginEmail || !loginPass) { setError('Compila tutti i campi'); return; }
    setLoading(true); clearError();
    try {
      const data = await shopifyMutation(
        `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
          customerAccessTokenCreate(input: $input) {
            customerAccessToken { accessToken expiresAt }
            customerUserErrors { message }
          }
        }`,
        { input: { email: loginEmail, password: loginPass } }
      );
      const result = data?.data?.customerAccessTokenCreate;
      const token  = result?.customerAccessToken?.accessToken;
      if (token) {
        localStorage.setItem('customerAccessToken', token);
        localStorage.setItem('elisee_last_login', Date.now().toString());
        localStorage.setItem('elisee_saved_email', loginEmail);
        onClose();
      } else {
        const msg = result?.customerUserErrors?.[0]?.message ?? 'Credenziali non valide';
        setError(String(msg).includes('Unidentified') ? 'Email non trovata o password errata' : String(msg));
      }
    } catch {
      setError('Errore di rete. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // ── Signup Shopify ────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPass) { setError('Compila tutti i campi'); return; }
    if (signupPass.length < 8) { setError('La password deve avere almeno 8 caratteri'); return; }
    setLoading(true); clearError();
    const parts     = signupName.trim().split(' ');
    const firstName = parts[0];
    const lastName  = parts.length > 1 ? parts.slice(1).join(' ') : '';
    try {
      const data = await shopifyMutation(
        `mutation customerCreate($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer { id email }
            customerUserErrors { message }
          }
        }`,
        { input: { firstName, lastName, email: signupEmail, password: signupPass } }
      );
      const result = data?.data?.customerCreate;
      if (result?.customer?.id) {
        setLoginEmail(signupEmail);
        setLoginPass(signupPass);
        setView('login');
        setError('✓ Account creato! Effettua il login per entrare.');
      } else {
        const msg = result?.customerUserErrors?.[0]?.message ?? "Impossibile creare l'account";
        setError(String(msg).includes('already') ? 'Email già registrata' : String(msg));
      }
    } catch {
      setError('Errore di rete. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // ── Login Admin ───────────────────────────────────────────────────────────
  const handleAdminLogin = async () => {
    setLoading(true); clearError();
    try {
      const res  = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        onClose();
      } else {
        setError(data.error ?? 'Credenziali errate');
      }
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  // (CloseBtn è definito fuori per evitare re-create during render)

  const renderContent = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // VISTA: LOGIN
    // ═══════════════════════════════════════════════════════════════════════════
    if (view === 'login') {
      return (
        <OverlayWrapper onClose={onClose}>
          <SheetHandle />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'white', marginBottom: '4px', fontFamily: 'var(--font-d)' }}>Bentornato</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Accedi al tuo account Elisee</p>
            </div>
            <CloseBtn onClose={onClose} />
          </div>

          {error && <ErrorBanner message={error} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input
              type="email" placeholder="Email" value={loginEmail}
              onChange={(e) => { setLoginEmail(e.target.value); clearError(); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} placeholder="Password" value={loginPass}
                onChange={(e) => { setLoginPass(e.target.value); clearError(); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{ ...inputStyle, paddingRight: '48px' }}
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={btnPrimary} onClick={handleLogin} disabled={loading}>
              {loading && <Loader size={18} className="spin" />}
              {loading ? 'Accesso...' : 'Accedi'}
            </button>
            <button
              style={{ ...btnSecondary, color: 'var(--gold)', borderColor: 'rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => setView('spid-gateway')}
            >
              <Sparkles size={16} /> Accedi con SPID
            </button>
            <button style={btnSecondary} onClick={() => { setError(''); setView('signup'); }}>
              Non hai un account? <strong>Registrati</strong>
            </button>
          </div>
        </OverlayWrapper>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VISTA: SIGNUP
    // ═══════════════════════════════════════════════════════════════════════════
    if (view === 'signup') {
      return (
        <OverlayWrapper onClose={onClose}>
          <SheetHandle />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'white', marginBottom: '4px', fontFamily: 'var(--font-d)' }}>Crea Account</h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Unisciti alla community Elisee</p>
            </div>
            <CloseBtn onClose={onClose} />
          </div>

          {error && <ErrorBanner message={error} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input type="text" placeholder="Nome completo" value={signupName} onChange={(e) => { setSignupName(e.target.value); clearError(); }} style={inputStyle} />
            <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => { setSignupEmail(e.target.value); clearError(); }} style={inputStyle} />
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} placeholder="Password (min. 8 caratteri)" value={signupPass}
                onChange={(e) => { setSignupPass(e.target.value); clearError(); }}
                style={{ ...inputStyle, paddingRight: '48px' }}
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={btnPrimary} onClick={handleSignup} disabled={loading}>
              {loading && <Loader size={18} className="spin" />}
              {loading ? 'Registrazione...' : 'Crea Account'}
            </button>
            <button style={btnSecondary} onClick={() => { setError(''); setView('login'); }}>
              Hai già un account? <strong>Accedi</strong>
            </button>
          </div>
        </OverlayWrapper>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VISTA: SPID
    // ═══════════════════════════════════════════════════════════════════════════
    if (view === 'spid-gateway' || view === 'spid-credentials' || view === 'spid-loading') {
      return (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 10000, display: 'flex', flexDirection: 'column', overflowY: 'auto', pointerEvents: 'auto' }}>
          <div style={{ background: '#0066cc', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}><ArrowLeft size={22} /></button>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
              {view === 'spid-gateway' ? 'Scegli il tuo Provider SPID' : view === 'spid-credentials' ? `Accedi con ${spidProvider}` : 'Autenticazione in corso'}
            </span>
            <button onClick={onClose} style={{ marginLeft: 'auto', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>

          {view === 'spid-gateway' && (
            <div style={{ padding: '24px', display: 'grid', gap: '12px', flex: 1, background: '#f9fafb' }}>
              {[
                { name: 'Poste ID', color: '#004d99' },
                { name: 'Aruba ID', color: '#ff6600' },
                { name: 'InfoCert ID', color: '#00a651' },
                { name: 'Sielte ID', color: '#0099cc' },
              ].map((p) => (
                <button key={p.name} onClick={() => { setSpidProvider(p.name); setView('spid-credentials'); }}
                  style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 700, color: p.color, fontSize: '16px' }}>{p.name}</span>
                  <ChevronRight style={{ color: '#9ca3af' }} />
                </button>
              ))}
            </div>
          )}

          {view === 'spid-credentials' && (
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Nome Utente SPID" style={{ padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              <input type="password" placeholder="Password" style={{ padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              <button onClick={() => { setView('spid-loading'); setTimeout(onClose, 2000); }}
                style={{ background: '#0066cc', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
                Entra con SPID
              </button>
            </div>
          )}

          {view === 'spid-loading' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
              <Loader size={48} style={{ color: '#0066cc', marginBottom: '20px' }} className="spin" />
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Autenticazione in corso</h2>
              <p style={{ color: '#6b7280' }}>Verifica credenziali...</p>
            </div>
          )}
        </div>
      );
    }

    if (view === 'admin-login') {
      return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'auto' }}>
          <div style={{ background: '#1a1a2e', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '24px', marginBottom: '24px', color: 'white' }}>Accesso Direzione</h2>
            {error && <ErrorBanner message={error} />}
            <input type="text" placeholder="Username" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} style={{ ...inputStyle, marginBottom: '12px' }} />
            <input type="password" placeholder="Password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} style={{ ...inputStyle, marginBottom: '24px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}>Annulla</button>
              <button onClick={handleAdminLogin} disabled={loading} style={{ flex: 1, padding: '14px', background: 'var(--gold)', border: 'none', color: 'black', fontWeight: 700, borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Accesso...' : 'Accedi'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const modalContent = renderContent();
  if (!modalContent) return null;

  if (mounted) {
    const el = document.getElementById('drawer-root');
    if (el) return createPortal(modalContent, el);
  }
  return modalContent;
}
