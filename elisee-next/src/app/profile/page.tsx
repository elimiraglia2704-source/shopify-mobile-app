import { Package, QrCode, Heart, Settings, Mail, Award, Target, History, Users, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="profile-body" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
      
      {/* Header: Avatar & Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '10px' }}>
        {/* Avatar con anello gradiente e glow */}
        <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '16px' }}>
          <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--purple))', opacity: 0.7, filter: 'blur(6px)' }}></div>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg2), var(--bg))', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, overflow: 'hidden' }}>
            {/* The avatar shown in screenshot */}
            <span id="profile-avatar-display" style={{ fontWeight: 700, fontSize: '36px', color: 'var(--text)', fontFamily: 'var(--font-d)', textShadow: 'none' }}>E</span>
          </div>
        </div>
        <h2 id="profile-name-display" style={{ fontFamily: 'var(--font-d)', fontSize: '28px', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>Enea Miraglia</h2>
        <button id="go-edit-profile-btn" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-sub)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '8px 20px', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s', backdropFilter: 'blur(5px)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          Modifica profilo
        </button>
      </div>

      {/* Glassmorphic Grid for Quick Actions */}
      <div style={{ background: 'rgba(20, 10, 30, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '20px 12px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          
          <div id="btn-profile-orders" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(155,89,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.25)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <Package style={{ width: '22px', height: '22px', color: 'var(--purple-light)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>Ordini</span>
          </div>
          
          <div id="btn-profile-pass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: 0.4, pointerEvents: 'none' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <QrCode style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Pass</span>
              <span style={{ fontSize: '8px', fontStyle: 'italic', color: 'var(--text-muted)' }}>In arrivo</span>
            </div>
          </div>

          <div id="btn-profile-wishlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(155,89,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.25)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <Heart style={{ width: '22px', height: '22px', color: 'var(--purple-light)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>Preferiti</span>
          </div>

          <div id="profile-settings-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: 'rgba(155,89,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(155,89,208,0.25)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
              <Settings style={{ width: '22px', height: '22px', color: 'var(--purple-light)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)' }}>Setup</span>
          </div>

        </div>
      </div>

      {/* Glassmorphic List Menus */}
      <div style={{ background: 'rgba(20, 10, 30, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '6px 18px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        
        <div id="btn-profile-inbox" style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
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
        
        <div id="btn-profile-vip" style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
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

        <Link href="/betting" style={{ display: 'block', textDecoration: 'none' }}>
          <div id="btn-profile-betting" style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target style={{ width: '18px', height: '18px', color: '#ff3b30' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px', color: 'var(--text)' }}>L'angolo ludopatico</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Indovina 7 partite e vinci</p>
              </div>
            </div>
            <ChevronRight style={{ color: 'rgba(255,255,255,0.2)', width: '20px' }} />
          </div>
        </Link>

        <div id="btn-profile-bet-history" style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
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

      </div>

    </div>
  );
}
