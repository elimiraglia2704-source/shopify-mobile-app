'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Share2, Heart, ShoppingBag } from 'lucide-react';

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}

interface ShopifyProduct {
  id: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: ProductVariant }[] };
}

interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: { amount: string };
  img: string;
  qty: number;
}

export default function ProductClientView({ product }: { product: ShopifyProduct }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = product.images as any;
  const imageUrl = images?.edges?.[0]?.node?.url || images?.[0]?.url || '';
  const basePrice = parseFloat(product.priceRange?.minVariantPrice?.amount || '0').toFixed(2);

  // States
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    return product.variants.edges[0]?.node;
  });
  const [isFav, setIsFav] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('elisee:favorites');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.includes(product.id);
        }
      } catch {}
    }
    return false;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle Toast timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleFavorite = () => {
    try {
      const saved = localStorage.getItem('elisee:favorites');
      let currentFavs: string[] = saved ? JSON.parse(saved) : [];
      
      if (isFav) {
        currentFavs = currentFavs.filter(id => id !== product.id);
        setIsFav(false);
        showToast('Rimosso dai preferiti');
      } else {
        currentFavs.push(product.id);
        setIsFav(true);
        showToast('Aggiunto ai preferiti ❤️');
      }
      localStorage.setItem('elisee:favorites', JSON.stringify(currentFavs));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          url: shareUrl,
        });
      } catch {
        // ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copiato negli appunti! 🔗');
      } catch {
        showToast('Impossibile copiare il link');
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    try {
      const savedCart = localStorage.getItem('elisee:cart');
      const cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const existingIndex = cart.findIndex((item: CartItem) => item.variantId === selectedVariant.id);
      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({
          variantId: selectedVariant.id,
          productId: product.id,
          title: product.title,
          variantTitle: selectedVariant.title,
          price: { amount: selectedVariant.price.amount },
          img: imageUrl,
          qty: 1
        });
      }

      localStorage.setItem('elisee:cart', JSON.stringify(cart));
      showToast('Aggiunto al carrello! 🛍️');
    } catch {
      showToast('Errore durante l\'aggiunta al carrello');
    }
  };

  const displayedPrice = selectedVariant
    ? parseFloat(selectedVariant.price.amount).toFixed(2)
    : basePrice;

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '96px', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 10, 30, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.3)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '20px',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header fisso */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          background: 'linear-gradient(to bottom, rgba(10,0,16,0.85) 0%, transparent 100%)',
        }}
      >
        <Link
          href="/shop"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ArrowLeft size={20} />
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleShare}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={toggleFavorite}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFav ? '#e53e3e' : 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Heart size={18} fill={isFav ? '#e53e3e' : 'none'} color={isFav ? '#e53e3e' : 'white'} />
          </button>
        </div>
      </div>

      {/* Immagine principale */}
      <div className="relative w-full aspect-square -mt-16 z-0" style={{ background: '#1a1a1a' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#333' }} />
        )}
      </div>

      {/* Dettagli prodotto */}
      <div
        className="p-4 -mt-6 relative z-10 rounded-t-3xl"
        style={{ background: 'rgba(10, 0, 16, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', marginTop: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', lineHeight: 1.3, paddingRight: '16px' }}>
            {product.title}
          </h1>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--gold)',
              whiteSpace: 'nowrap',
            }}
          >
            € {displayedPrice}
          </div>
        </div>

        <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {product.vendor}
        </p>

        {/* Selezione variante */}
        {product.variants.edges.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
              Seleziona Modello
            </h3>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px' }}>
              {product.variants.edges.map((v) => {
                const isSelected = selectedVariant?.id === v.node.id;
                return (
                  <button
                    key={v.node.id}
                    onClick={() => setSelectedVariant(v.node)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      border: isSelected ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
                      background: isSelected ? 'white' : '#1a1a1a',
                      color: isSelected ? 'black' : '#d1d5db',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {v.node.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Descrizione */}
        <div style={{ marginBottom: '120px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            Descrizione
          </h3>
          <div
            style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{
              __html: product.descriptionHtml || 'Nessuna descrizione disponibile.',
            }}
          />
        </div>
      </div>

      {/* Pulsante "Aggiungi al carrello" fisso */}
      <div
        style={{
          position: 'fixed',
          bottom: '64px',
          left: 0,
          right: 0,
          padding: '16px',
          background: 'linear-gradient(to top, rgba(10, 0, 16, 0.95) 50%, transparent 100%)',
          zIndex: 40,
        }}
      >
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%',
            height: '56px',
            background: 'white',
            color: 'black',
            fontWeight: 700,
            fontSize: '16px',
            borderRadius: '16px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,255,255,0.15)',
          }}
        >
          <ShoppingBag size={22} />
          Aggiungi al Carrello
        </button>
      </div>
    </div>
  );
}
