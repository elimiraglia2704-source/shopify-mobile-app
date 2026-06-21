'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  QrCode, 
  Heart, 
  Settings, 
  Mail, 
  Award, 
  Target, 
  History, 
  ChevronRight, 
  LogOut, 
  Check, 
  ArrowRight, 
  User, 
  Trash2, 
  Volume2, 
  Bell, 
  Fingerprint 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AuthModal from '@/components/AuthModal';
import { createPortal } from 'react-dom';

// ─── Interfacce e Tipi ────────────────────────────────────────────────────────
type DrawerType = 
  | 'none' 
  | 'edit-profile' 
  | 'orders' 
  | 'pass' 
  | 'favorites' 
  | 'setup' 
  | 'inbox' 
  | 'vip' 
  | 'bet-history';

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  images?: {
    edges?: {
      node?: {
        url: string;
      };
    }[];
  };
}

interface MockOrder {
  id: string;
  item: string;
  size: string;
  price: string;
  status: string;
  date: string;
  color: string;
}

interface MockMessage {
  id: number;
  title: string;
  desc: string;
  date: string;
  read: boolean;
}

interface MockBet {
  id: string;
  match: string;
  prediction: string;
  points: string;
  payout: string;
  status: string;
  color: string;
}

// ─── Componente Principale ───────────────────────────────────────────────────
export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Dati Profilo
  const [profileName, setProfileName] = useState('Enea Miraglia');
  const [profileEmail, setProfileEmail] = useState('enea.miraglia@example.com');
  const [profileAvatar, setProfileAvatar] = useState('/enea.png');

  // Gestione Drawer
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>('none');

  // Preferiti
  const [favIds, setFavIds] = useState<string[]>([]);
  const [favProducts, setFavProducts] = useState<ShopifyProduct[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  // Setup Impostazioni
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    faceId: false,
    language: 'Italiano',
    currency: 'EUR'
  });

  // Funzione per il caricamento dei preferiti da Shopify
  const fetchFavoriteProducts = async (idsToFetch: string[]) => {
    if (idsToFetch.length === 0) {
      setFavProducts([]);
      return;
    }
    setFavLoading(true);
    try {
      const gql = `
        query getProductsByIds($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      `;
      const res = await fetch('/api/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: gql, variables: { ids: idsToFetch } })
      });
      const data = await res.json();
      const items = (data.data?.nodes?.filter(Boolean) || []) as ShopifyProduct[];
      setFavProducts(items);
    } catch (err) {
      console.error("Errore nel recupero dei preferiti da Shopify:", err);
    } finally {
      setFavLoading(false);
    }
  };

  // Caricamento dati da localStorage all'avvio (asincrono per evitare warnings ESLint)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      
      const loggedOut = localStorage.getItem('elisee:logged_out') === 'true';
      setIsLoggedIn(!loggedOut);
      
      const savedName = localStorage.getItem('elisee:profile_name');
      const savedEmail = localStorage.getItem('elisee:profile_email');
      const savedAvatar = localStorage.getItem('elisee:profile_avatar');
      
      if (savedName) setProfileName(savedName);
      if (savedEmail) setProfileEmail(savedEmail);
      if (savedAvatar) setProfileAvatar(savedAvatar);

      // Carica preferiti
      try {
        const savedFavs = localStorage.getItem('elisee:favorites');
        if (savedFavs) {
          setFavIds(JSON.parse(savedFavs));
        }
      } catch {}

      // Carica impostazioni
      try {
        const savedSettings = localStorage.getItem('elisee:settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Fetch dei preferiti quando si apre il drawer relativo
  useEffect(() => {
    if (activeDrawer === 'favorites') {
      const timer = setTimeout(() => {
        fetchFavoriteProducts(favIds);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeDrawer, favIds]);

  const removeFavorite = (productId: string) => {
    const updated = favIds.filter(id => id !== productId);
    setFavIds(updated);
    localStorage.setItem('elisee:favorites', JSON.stringify(updated));
    setFavProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('elisee:profile_name', profileName);
    localStorage.setItem('elisee:profile_email', profileEmail);
    localStorage.setItem('elisee:profile_avatar', profileAvatar);
    
    // Aggiorna anche il nome memorizzato in locale
    localStorage.setItem('elisee_saved_email', profileEmail);
    setActiveDrawer('none');
  };

  const handleToggleSetting = (key: 'notifications' | 'sounds' | 'faceId') => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem('elisee:settings', JSON.stringify(updated));
  };

  const handleSelectSetting = (key: 'language' | 'currency', value: string) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('elisee:settings', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('customerAccessToken');
    localStorage.setItem('elisee:logged_out', 'true');
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    setActiveDrawer('none');
  };

  const handleAuthClose = () => {
    setIsAuthModalOpen(false);
    const token = localStorage.getItem('customerAccessToken');
    if (token) {
      localStorage.removeItem('elisee:logged_out');
      setIsLoggedIn(true);
      
      const savedEmail = localStorage.getItem('elisee_saved_email');
      if (savedEmail) {
        setProfileEmail(savedEmail);
        const namePart = savedEmail.split('@')[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setProfileName(formattedName);
        localStorage.setItem('elisee:profile_name', formattedName);
        localStorage.setItem('elisee:profile_email', savedEmail);
      }
    }
  };

  if (!isMounted) {
    return <div style={{ minHeight: '100vh', background: 'transparent' }} />;
  }

  // ─── Vista Non Loggato ──────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div style={{
        padding: '60px 24px',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '24px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <User size={36} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            Accedi al Profilo
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', maxWidth: '280px' }}>
            Accedi al tuo account Elisee per visualizzare i tuoi ordini, i vantaggi VIP, i preferiti ed altro.
          </p>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            width: '100%',
            maxWidth: '240px',
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--gold), #f39c12)',
            color: 'black',
            fontWeight: 700,
            fontSize: '15px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(212,175,55,0.3)'
          }}
        >
          Accedi o Registrati
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthClose} />
      </div>
    );
  }

  const mockOrders: MockOrder[] = [
    { id: '#2841', item: 'Cover Foggia Home s.s. 25/26', size: 'iPhone 15 Pro', price: '€25.00', status: 'In Transito', date: 'In consegna oggi', color: 'var(--gold)' },
    { id: '#2798', item: 'Cover Inter Third 25/26 resistente MagSafe®', size: 'iPhone 15 Pro', price: '€25.00', status: 'Consegnato', date: '14 Giugno 2026', color: '#4caf50' },
    { id: '#2602', item: 'Cover Milan Away s.s. 25/26', size: 'iPhone 14', price: '€25.00', status: 'Consegnato', date: '30 Maggio 2026', color: '#4caf50' }
  ];

  const mockMessages: MockMessage[] = [
    { id: 1, title: '🎁 Regalo di Benvenuto sbloccato!', desc: 'Hai ricevuto 150 Punti Stile gratuiti per L\'Angolo Ludopatico. Usali subito per fare i tuoi primi pronostici!', date: '20/06/2026', read: false },
    { id: 2, title: '📦 Spedizione Affidata al Corriere', desc: 'Ottime notizie! Il tuo ordine #2841 (Cover Foggia Home) è in consegna per la giornata di oggi tramite corriere espresso DHL.', date: 'Oggi', read: false },
    { id: 3, title: '⚽ Pronostici Aperti per la Giornata 38', desc: 'Le giocate della settimana sono attive. Effettua il tuo inserimento ed indovina i 7 match per vincere il jackpot punti stile.', date: 'Ieri', read: true }
  ];

  const mockBets: MockBet[] = [
    { id: '#SCH-982', match: 'Napoli vs Inter', prediction: 'Inter Vincente (2)', points: '50 EP', payout: '125 EP', status: 'In Corso', color: 'var(--gold)' },
    { id: '#SCH-940', match: 'Real Madrid vs Barcelona', prediction: 'Real Madrid Vincente (1)', points: '30 EP', payout: '57 EP', status: 'Vinta', color: '#4caf50' },
    { id: '#SCH-912', match: 'Juventus vs Milan', prediction: 'Pareggio (X)', points: '20 EP', payout: '0 EP', status: 'Persa', color: '#ff4d4d' }
  ];

  return (
    <div className="profile-body" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '120px' }}>
      
      {/* Header: Avatar & Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '10px' }}>
        <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '16px' }}>
          <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--purple))', opacity: 0.7, filter: 'blur(6px)' }}></div>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg2), var(--bg))', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, overflow: 'hidden' }}>
            <Image src={profileAvatar} alt={profileName} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <h2 id="profile-name-display" style={{ fontFamily: 'var(--font-d)', fontSize: '28px', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>{profileName}</h2>
        <button 
          id="go-edit-profile-btn" 
          onClick={() => setActiveDrawer('edit-profile')}
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-sub)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '8px 20px', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s', backdropFilter: 'blur(5px)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', cursor: 'pointer' }}
        >
          Modifica profilo
        </button>
      </div>

      {/* Grid Quick Actions */}
      <div style={{ background: 'rgba(20, 10, 30, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '20px 12px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          
          <div id="btn-profile-orders" onClick={() => setActiveDrawer('orders')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(155,89,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.25)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <Package style={{ width: '22px', height: '22px', color: 'var(--purple-light)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>Ordini</span>
          </div>
          
          <div id="btn-profile-pass" onClick={() => setActiveDrawer('pass')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(155,89,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.25)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <QrCode style={{ width: '22px', height: '22px', color: 'var(--purple-light)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>Pass</span>
          </div>

          <div id="btn-profile-wishlist" onClick={() => setActiveDrawer('favorites')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(155,89,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.25)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <Heart style={{ width: '22px', height: '22px', color: 'var(--purple-light)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>Preferiti</span>
          </div>

          <div id="profile-settings-btn" onClick={() => setActiveDrawer('setup')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(155,89,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.25)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <Settings style={{ width: '22px', height: '22px', color: 'var(--purple-light)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>Setup</span>
          </div>

        </div>
      </div>

      {/* List Menus */}
      <div style={{ background: 'rgba(20, 10, 30, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '6px 18px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        
        {/* Posta in arrivo */}
        <div id="btn-profile-inbox" onClick={() => setActiveDrawer('inbox')} style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
              <Mail style={{ width: '18px', height: '18px', color: 'var(--text)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px', color: 'var(--text)' }}>Posta in arrivo</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Visualizza i tuoi messaggi</p>
            </div>
          </div>
          <ChevronRight style={{ color: 'rgba(255,255,255,0.2)', width: '20px' }} />
        </div>
        
        {/* VIP Benefits */}
        <div id="btn-profile-vip" onClick={() => setActiveDrawer('vip')} style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(212,175,55,0.1)' }}>
              <Award style={{ width: '18px', height: '18px', color: 'var(--gold)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px', color: 'var(--text)' }}>Vantaggi VIP Elisee</h3>
              <p style={{ fontSize: '12px', color: 'var(--gold-light)' }}>1.250 Punti Stile sbloccati</p>
            </div>
          </div>
          <ChevronRight style={{ color: 'rgba(255,255,255,0.2)', width: '20px' }} />
        </div>

        {/* L'Angolo Ludopatico */}
        <Link href="/betting" style={{ display: 'block', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div id="btn-profile-betting" style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target style={{ width: '18px', height: '18px', color: '#ff3b30' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px', color: 'var(--text)' }}>L&apos;angolo ludopatico</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Indovina 7 partite e vinci</p>
              </div>
            </div>
            <ChevronRight style={{ color: 'rgba(255,255,255,0.2)', width: '20px' }} />
          </div>
        </Link>

        {/* Storico Scommesse */}
        <div id="btn-profile-bet-history" onClick={() => setActiveDrawer('bet-history')} style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History style={{ width: '18px', height: '18px', color: '#4caf50' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px', color: 'var(--text)' }}>Storico Scommesse</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Le tue schedine passate</p>
            </div>
          </div>
          <ChevronRight style={{ color: 'rgba(255,255,255,0.2)', width: '20px' }} />
        </div>

        {/* Log Out */}
        <div id="btn-profile-logout" onClick={() => setShowLogoutConfirm(true)} style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut style={{ width: '18px', height: '18px', color: '#ff4d4d' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px', color: '#ff4d4d' }}>Log Out</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Esci dal tuo account</p>
            </div>
          </div>
          <ChevronRight style={{ color: 'rgba(255,77,77,0.2)', width: '20px' }} />
        </div>

      </div>

      {/* ─── DRAWERS ─────────────────────────────────────────────────────────── */}
      
      {/* 1. Modifica Profilo Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'edit-profile'} 
        onClose={() => setActiveDrawer('none')} 
        title="Modifica Profilo"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gold)' }}>
              <Image src={profileAvatar} alt="Preview" fill style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['/enea.png', 'avatar2'].map((av) => {
                const isSelected = profileAvatar === av || (av === 'avatar2' && profileAvatar !== '/enea.png');
                const avSrc = av === '/enea.png' ? '/enea.png' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                return (
                  <button 
                    type="button"
                    key={av} 
                    onClick={() => setProfileAvatar(avSrc)}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.2)', 
                      padding: 0, 
                      cursor: 'pointer',
                      background: 'none',
                      position: 'relative'
                    }}
                  >
                    <Image src={avSrc} alt="Avatar option" fill style={{ objectFit: 'cover' }} />
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Nome Visualizzato</label>
            <input 
              type="text" 
              value={profileName} 
              onChange={(e) => setProfileName(e.target.value)} 
              required
              style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Indirizzo Email</label>
            <input 
              type="email" 
              value={profileEmail} 
              onChange={(e) => setProfileEmail(e.target.value)} 
              required
              style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--gold), #f39c12)', 
              color: 'black', 
              fontWeight: 700, 
              fontSize: '15px', 
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(212,175,55,0.2)',
              marginTop: '10px'
            }}
          >
            Salva Modifiche
          </button>
        </form>
      </ProfileDrawer>

      {/* 2. Ordini Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'orders'} 
        onClose={() => setActiveDrawer('none')} 
        title="I Miei Ordini"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mockOrders.map((ord) => (
            <div 
              key={ord.id}
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '16px', 
                padding: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Ordine {ord.id}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '10px', background: `${ord.color}15`, color: ord.color, border: `1px solid ${ord.color}30` }}>
                  {ord.status}
                </span>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{ord.item}</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Dispositivo: {ord.size}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{ord.date}</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{ord.price}</span>
              </div>
            </div>
          ))}
        </div>
      </ProfileDrawer>

      {/* 3. Pass Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'pass'} 
        onClose={() => setActiveDrawer('none')} 
        title="VIP Loyalty Pass"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {/* Card */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, #1b0230 0%, #06000b 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(212,175,55,0.25)',
            padding: '24px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Glow decorativo */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.1, filter: 'blur(50px)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>Elisee Club</span>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'white', marginTop: '4px', fontFamily: 'var(--font-d)' }}>VIP LOYALTY CARD</h4>
              </div>
              <span style={{ fontSize: '24px' }}>👑</span>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Titolare</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: '2px' }}>{profileName}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Livello Pass</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)', marginTop: '2px' }}>Elite Gold</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>ID Cliente</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginTop: '2px' }}>#ELS-99824</div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div style={{ 
            width: '100%', 
            background: 'white', 
            borderRadius: '16px', 
            padding: '24px 16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', height: '60px', width: '240px', gap: '3px', background: 'white', alignItems: 'center', justifyContent: 'center' }}>
              {[2, 1, 3, 1, 4, 1, 2, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 2, 1].map((w, idx) => (
                <div key={idx} style={{ width: `${w}px`, height: '100%', background: 'black' }} />
              ))}
            </div>
            <span style={{ color: '#000', fontSize: '11px', fontWeight: 700, marginTop: '10px', letterSpacing: '4px' }}>*ELS99824*</span>
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '0 20px', lineHeight: '1.6' }}>
            Mostra questo codice a barre alla cassa o scansionalo per raccogliere punti e ricevere sconti immediati.
          </p>
        </div>
      </ProfileDrawer>

      {/* 4. Preferiti Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'favorites'} 
        onClose={() => setActiveDrawer('none')} 
        title="I Miei Preferiti"
      >
        {favLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
            <span style={{ color: 'var(--gold)', fontSize: '14px' }}>Caricamento preferiti...</span>
          </div>
        ) : favProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Heart size={36} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
              Non hai ancora aggiunto prodotti alla lista dei preferiti.
            </p>
            <Link href="/shop" onClick={() => setActiveDrawer('none')} style={{ display: 'inline-block', textDecoration: 'none' }}>
              <button style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Esplora lo Shop
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favProducts.map((p) => {
              const image = p.images?.edges?.[0]?.node?.url || '/cover.png';
              const price = p.priceRange?.minVariantPrice ? `€${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)}` : 'N/D';
              
              return (
                <div 
                  key={p.id}
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '16px', 
                    padding: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
                    <Image src={image} alt={p.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, paddingRight: '36px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.title}
                    </h4>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>{price}</span>
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <button 
                      onClick={() => removeFavorite(p.id)}
                      style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link href={`/product/${p.id.split('/').pop()}`} onClick={() => setActiveDrawer('none')} style={{ color: 'white', display: 'flex' }}>
                      <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '6px' }}>
                        <ArrowRight size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ProfileDrawer>

      {/* 5. Setup Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'setup'} 
        onClose={() => setActiveDrawer('none')} 
        title="Setup & Impostazioni"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={18} color="rgba(255,255,255,0.6)" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Notifiche Push</h4>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Avvisi su ordini e promozioni</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleSetting('notifications')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.notifications ? 'var(--purple-light)' : 'rgba(255,255,255,0.15)', padding: 0 }}
              >
                <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: settings.notifications ? 'var(--purple)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: settings.notifications ? '23px' : '3px', transition: 'left 0.2s' }} />
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 size={18} color="rgba(255,255,255,0.6)" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Effetti Sonori</h4>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Feedback audio di navigazione</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleSetting('sounds')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.sounds ? 'var(--purple-light)' : 'rgba(255,255,255,0.15)', padding: 0 }}
              >
                <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: settings.sounds ? 'var(--purple)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: settings.sounds ? '23px' : '3px', transition: 'left 0.2s' }} />
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Fingerprint size={18} color="rgba(255,255,255,0.6)" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Sblocco FaceID</h4>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Accesso rapido con biometria</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleSetting('faceId')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings.faceId ? 'var(--purple-light)' : 'rgba(255,255,255,0.15)', padding: 0 }}
              >
                <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: settings.faceId ? 'var(--purple)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: settings.faceId ? '23px' : '3px', transition: 'left 0.2s' }} />
                </div>
              </button>
            </div>

          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', margin: 0 }} />

          {/* Selector options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: 600 }}>Lingua Applicazione</span>
              <select 
                value={settings.language} 
                onChange={(e) => handleSelectSetting('language', e.target.value)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
              >
                <option value="Italiano" style={{ background: '#0a0010' }}>Italiano</option>
                <option value="English" style={{ background: '#0a0010' }}>English</option>
                <option value="Español" style={{ background: '#0a0010' }}>Español</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: 600 }}>Valuta Preferita</span>
              <select 
                value={settings.currency} 
                onChange={(e) => handleSelectSetting('currency', e.target.value)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
              >
                <option value="EUR" style={{ background: '#0a0010' }}>EUR (€)</option>
                <option value="USD" style={{ background: '#0a0010' }}>USD ($)</option>
                <option value="GBP" style={{ background: '#0a0010' }}>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
      </ProfileDrawer>

      {/* 6. Posta in Arrivo Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'inbox'} 
        onClose={() => setActiveDrawer('none')} 
        title="Posta in Arrivo"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mockMessages.map((msg) => (
            <div 
              key={msg.id}
              style={{ 
                background: msg.read ? 'rgba(255,255,255,0.02)' : 'rgba(155,89,208,0.04)', 
                border: msg.read ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(155,89,208,0.15)', 
                borderRadius: '16px', 
                padding: '16px', 
                position: 'relative'
              }}
            >
              {!msg.read && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple-light)' }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', paddingRight: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: msg.read ? 'white' : 'var(--purple-light)' }}>{msg.title}</h4>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '8px' }}>{msg.desc}</p>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{msg.date}</span>
            </div>
          ))}
        </div>
      </ProfileDrawer>

      {/* 7. Vantaggi VIP Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'vip'} 
        onClose={() => setActiveDrawer('none')} 
        title="Club VIP Elisee"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Progress Section */}
          <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Livello Attuale</span>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold)' }}>ELITE GOLD MEMBER</h4>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>1.250 <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>pt</span></div>
            </div>
            
            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: '62.5%', height: '100%', background: 'linear-gradient(90deg, var(--gold), #f39c12)', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              <span>Livello Gold</span>
              <span>750 punti al livello Platinum</span>
            </div>
          </div>

          {/* Benefits list */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '4px' }}>
              Vantaggi Sbloccati
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { title: 'Spedizione Standard Gratuita', desc: 'Nessun costo di spedizione su tutti i prodotti.', active: true },
                { title: 'Accesso all\'Angolo Ludopatico', desc: 'Gioca le tue schedine per vincere punti fedeltà.', active: true },
                { title: 'Regalo Compleanno Esclusivo', desc: 'Bonus stile in omaggio il giorno del tuo compleanno.', active: true },
                { title: 'Assistenza WhatsApp H24', desc: 'Servizio clienti dedicato su canale WhatsApp prioritario.', active: false, level: 'Platinum' },
                { title: 'Anteprime ed Edizioni Limitate', desc: 'Acquista le nuove collezioni 48h prima degli altri.', active: false, level: 'Platinum' }
              ].map((ben, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.04)', 
                    borderRadius: '16px', 
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: ben.active ? 1 : 0.4
                  }}
                >
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: ben.active ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${ben.active ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: ben.active ? '#4caf50' : 'rgba(255,255,255,0.3)',
                    flexShrink: 0
                  }}>
                    {ben.active ? <Check size={12} /> : <span style={{ fontSize: '10px', fontWeight: 800 }}>P</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{ben.title}</h5>
                      {!ben.active && (
                        <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)', padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase' }}>
                          {ben.level}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{ben.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProfileDrawer>

      {/* 8. Storico Scommesse Drawer */}
      <ProfileDrawer 
        isOpen={activeDrawer === 'bet-history'} 
        onClose={() => setActiveDrawer('none')} 
        title="Storico Scommesse"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mockBets.map((bet) => (
            <div 
              key={bet.id}
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '16px', 
                padding: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Schedina {bet.id}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '10px', background: `${bet.color}15`, color: bet.color, border: `1px solid ${bet.color}30` }}>
                  {bet.status}
                </span>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{bet.match}</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Pronostico: <span style={{ color: 'white', fontWeight: 600 }}>{bet.prediction}</span></p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '2px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>Giocati: <span style={{ color: 'white', fontWeight: 600 }}>{bet.points}</span></span>
                </div>
                {bet.status === 'Vinta' && (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#4caf50' }}>Vincita: +{bet.payout}</span>
                )}
                {bet.status === 'Persa' && (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff4d4d' }}>{bet.payout}</span>
                )}
                {bet.status === 'In Corso' && (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>Potenziale: {bet.payout}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ProfileDrawer>

      {/* Modal di Conferma Log Out */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 20000,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: 'linear-gradient(180deg, #180524 0%, #0a0010 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255,77,77,0.1)',
              border: '1px solid rgba(255,77,77,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <LogOut size={24} style={{ color: '#ff4d4d' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'white', fontFamily: 'var(--font-d)' }}>Conferma Log Out</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '24px' }}>
              Sei sicuro di voler effettuare il logout dal tuo account? Dovrai inserire nuovamente i dati per accedere.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff4d4d, #ff8000)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Componente Sub-Drawer Condiviso ─────────────────────────────────────────
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function ProfileDrawer({ isOpen, onClose, title, children }: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  const drawerContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '80vh',
          background: 'linear-gradient(180deg, #140320 0%, #06000a 100%)',
          borderRadius: '24px 24px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Handle Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
          <div style={{ width: '42px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.18)' }} />
        </div>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-d)' }}>{title}</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              border: 'none', 
              color: 'white', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );

  if (mounted) {
    const el = document.getElementById('drawer-root');
    if (el) return createPortal(drawerContent, el);
  }
  return drawerContent;
}
