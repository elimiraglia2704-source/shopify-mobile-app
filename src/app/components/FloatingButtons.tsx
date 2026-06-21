'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AIStylist from '@/components/AIStylist';
import { usePathname } from 'next/navigation';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function FloatingButtons() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const pathname = usePathname();
  
  const isCart = pathname === '/cart';

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/elisee_._shop?igsh=YWVhNm0zdnQydGNk', '_blank');
  };

  const aiBottom = isCart 
    ? 'calc(282px + env(safe-area-inset-bottom, 0px))' 
    : 'calc(162px + env(safe-area-inset-bottom, 0px))';
    
  const igBottom = isCart 
    ? 'calc(224px + env(safe-area-inset-bottom, 0px))' 
    : 'calc(104px + env(safe-area-inset-bottom, 0px))';

  return (
    <>
      {/* AI Assistant Floating Button (Yellow) */}
      <button
        onClick={() => setIsAiOpen(true)}
        style={{
          position: 'absolute',
          bottom: aiBottom,
          right: '16px',
          width: '50px',
          height: '50px',
          background: 'var(--gold)',
          color: '#000',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          boxShadow: '0 4px 16px rgba(212,175,55,0.4)',
          cursor: 'pointer',
          transition: 'transform 0.2s, bottom 0.3s ease',
        }}
        className="floating-btn-ai hover:scale-105 active:scale-95"
      >
        <Sparkles size={24} />
      </button>

      {/* Instagram Floating Button (Brand Gradient) */}
      <button
        onClick={handleInstagramClick}
        style={{
          position: 'absolute',
          bottom: igBottom,
          right: '16px',
          width: '50px',
          height: '50px',
          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          color: '#fff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          boxShadow: '0 4px 16px rgba(220,39,67,0.4)',
          cursor: 'pointer',
          transition: 'transform 0.2s, bottom 0.3s ease',
        }}
        className="floating-btn-ig hover:scale-105 active:scale-95"
      >
        <InstagramIcon />
      </button>

      {/* AI Stylist Drawer */}
      <AIStylist isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
}
