import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function StudioPage() {
  return (
    <div className="profile-body" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '100px' }}>
      
      {/* Header Studio */}
      <div style={{ marginTop: '10px' }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '28px', fontWeight: 700, marginBottom: '8px', lineHeight: '1.2' }}>
          Studio <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '26px' }}>Elisee Graphics</span>
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
        <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '22px', fontWeight: 600 }}>
          Agente <span style={{ fontFamily: 'var(--font-tech)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '20px' }}>Elisee</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5, marginBottom: '8px' }}>
          Chiedimi un preventivo per i tuoi progetti visivi. Genererò idee, moodboard e pacchetti su misura per te.
        </p>
      </div>

      {/* Portfolio */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', fontFamily: 'var(--font-d)' }}>Ultimi Lavori (Portfolio)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card 1 */}
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
            <Image src="/banner-antica-panetteria-del-corso.png" alt="Antica Panetteria" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.4' }}>
                Collaborazione <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--gold)', letterSpacing: '0.5px' }}>Elisee Graphic</span> con Antica Panetteria del Corso
              </h4>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
            <Image src="/banner-pranziamo.png" alt="PranziAmo" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.4' }}>
                Collaborazione <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--gold)', letterSpacing: '0.5px' }}>Elisee Graphic</span> con PranziAmo
              </h4>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
            <Image src="/banner-garofalo-barberia.png" alt="Barberia Garofalo" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.4' }}>
                Collaborazione <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--gold)', letterSpacing: '0.5px' }}>Elisee Graphic</span> con Barberia Garofalo
              </h4>
            </div>
          </div>

          {/* Card 4 */}
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
            <Image src="/banner-antincendio-sicurezza.jpg" alt="Antincendio & Sicurezza" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.4' }}>
                Collaborazione <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--gold)', letterSpacing: '0.5px' }}>Elisee Graphic</span> con Antincendio & Sicurezza
              </h4>
            </div>
          </div>

          {/* Card 5 */}
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
            <Image src="/shop-cat-scarpe.jpg" alt="Marcos Lab" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.4' }}>
                Collaborazione <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--gold)', letterSpacing: '0.5px' }}>Elisee Graphic</span> con Marcos Lab
              </h4>
            </div>
          </div>

          {/* Card 6 */}
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0a' }}>
            <Image src="/banner-nervos-beer.jpg" alt="Nervös Beer" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.4' }}>
                Collaborazione <span style={{ fontFamily: 'var(--font-tech)', color: 'var(--gold)', letterSpacing: '0.5px' }}>Elisee Graphic</span> con Nervös Beer
              </h4>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
