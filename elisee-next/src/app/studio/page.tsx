import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function StudioPage() {
  return (
    <div className="profile-body" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '100px' }}>
      
      {/* Header Studio */}
      <div style={{ marginTop: '10px' }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Studio <span style={{ color: 'var(--gold)' }}>Elisee</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Il tuo partner creativo. Foto, Video, Brand Identity.
        </p>
      </div>

      {/* Agente Elisee Card */}
      <div style={{ 
        background: 'rgba(20, 10, 30, 0.45)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)', 
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '24px', 
        padding: '32px 24px', 
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ 
          width: '56px', height: '56px', 
          borderRadius: '50%', 
          background: 'var(--gold)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
          color: '#000'
        }}>
          <Sparkles size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '22px', fontWeight: 600 }}>Agente Elisee</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5, marginBottom: '8px' }}>
          Chiedimi un preventivo per i tuoi progetti visivi. Genererò idee, moodboard e pacchetti su misura per te.
        </p>
        <button className="btn-primary" style={{ width: '100%', background: '#9b59d0', color: '#fff', border: 'none', padding: '14px', fontSize: '14px', fontWeight: 600, borderRadius: '12px' }}>
          Crea Progetto con AI
        </button>
      </div>

      {/* Portfolio */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', fontFamily: 'var(--font-d)' }}>Ultimi Lavori (Portfolio)</h3>
        <div className="h-scrollable-cards" style={{ gap: '16px', paddingBottom: '16px' }}>
          
          {/* Card 1 */}
          <div style={{ position: 'relative', minWidth: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Image src="/cover.png" alt="Antica Panetteria" fill style={{ objectFit: 'cover', opacity: 0.6 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                Collaborazione Elisee Graphic con Antica Panetteria del Corso
              </h4>
              <p style={{ color: 'var(--gold)', fontSize: '11px', fontWeight: 500 }}>Visual Branding</p>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ position: 'relative', minWidth: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Image src="/ciabatte-esive.jpg" alt="PranziAmo" fill style={{ objectFit: 'cover', opacity: 0.6 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                Collaborazione Elisee Graphic con PranziAmo
              </h4>
              <p style={{ color: 'var(--gold)', fontSize: '11px', fontWeight: 500 }}>Sport Videography</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
