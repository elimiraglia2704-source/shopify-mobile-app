'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, CreditCard, Sparkles, Truck, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

// Type definitions for cart items and upsell
interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: { amount: string };
  img: string;
  qty: number;
}
interface UpsellInfo {
  product: any;
  message: string;
  icon: string;
}

export default function CartPage() {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [upsell, setUpsell] = useState<UpsellInfo | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('elisee:cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(parsed);
      }
    } catch {}
  }, []);

  // Recalculate total whenever cart changes
  useEffect(() => {
    let t = 0;
    cart.forEach(item => {
      t += parseFloat(item.price?.amount || '0') * item.qty;
    });
    setTotal(t);
    localStorage.setItem('elisee:cart', JSON.stringify(cart));

    // Predictive Upsell Logic
    if (cart.length > 0) {
      const missingForFreeShipping = 50 - t;
      const cartProductIds = new Set(cart.map(i => i.productId));
      const availableUpsells = MOCK_PRODUCTS.filter(p => !cartProductIds.has(p.id));
      
      if (availableUpsells.length > 0) {
        if (missingForFreeShipping > 0 && missingForFreeShipping <= 40) {
          const sorted = [...availableUpsells].sort((a, b) => parseFloat(a.variants?.edges[0]?.node?.price?.amount || '0') - parseFloat(b.variants?.edges[0]?.node?.price?.amount || '0'));
          const rec = sorted.find(p => parseFloat(p.variants?.edges[0]?.node?.price?.amount || '0') >= missingForFreeShipping) || sorted[0];
          setUpsell({
            product: rec,
            message: `Ti mancano solo €${missingForFreeShipping.toFixed(2)} per la spedizione gratuita!`,
            icon: 'truck'
          });
        } else {
          const rec = availableUpsells[Math.floor(Math.random() * availableUpsells.length)];
          setUpsell({
            product: rec,
            message: `Comprato dal ${Math.floor(Math.random() * 15 + 80)}% dei clienti insieme a questi articoli`,
            icon: 'sparkles'
          });
        }
      } else {
        setUpsell(null);
      }
    } else {
      setUpsell(null);
    }
  }, [cart]);

  const updateQty = (variantId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.variantId === variantId) {
          return { ...item, qty: item.qty + delta };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const handleCheckout = async () => {
    // Simulazione checkout
    alert("Reindirizzamento al checkout di Shopify...");
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: 'var(--bg2)', color: 'var(--text)' }}>
      <div 
        className="backdrop" 
        style={{ flex: 1, background: 'rgba(0,0,0,0.6)', cursor: 'pointer', display: 'none' }}
        onClick={() => router.back()}
      ></div>

      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '24px', fontWeight: 600 }}>Carrello</h3>
          <button 
            onClick={() => router.back()} 
            style={{ background: 'none', border: 'none', color: 'var(--text)', padding: '8px', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <ShoppingCart size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '24px' }} />
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '32px' }}>Il carrello è vuoto</p>
              <button 
                onClick={() => router.push('/explore')}
                style={{ background: 'var(--gold)', color: '#111', padding: '14px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', border: 'none', boxShadow: '0 4px 20px rgba(212,175,55,0.3)', cursor: 'pointer' }}
              >
                Inizia lo Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Cart items carousel with auto-scroll, snapping, and navigation arrows */}
          <div style={{ position: 'relative', padding: '0 40px' }}>
            {/* Left arrow */}
            <button onClick={() => carouselRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1,
              }}
            >
              <ChevronLeft size={20} color="white" />
            </button>
            {/* Right arrow */}
            <button onClick={() => carouselRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1,
              }}
            >
              <ChevronRight size={20} color="white" />
            </button>
            {/* Carousel container */}
            <div ref={carouselRef}
              style={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                gap: '16px',
                padding: '8px 0',
                scrollbarWidth: 'none',
              }}
            >
              {cart.map(item => (
                <div key={item.variantId}
                  style={{
                    flex: '0 0 auto',
                    scrollSnapAlign: 'center',
                    display: 'flex',
                    gap: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <Image src={item.img} alt={item.title} width={80} height={80} style={{ borderRadius: '8px' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.title}</h4>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{item.variantTitle !== 'Default Title' ? item.variantTitle : ''}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '15px', color: 'var(--gold)', fontWeight: 600 }}>€{parseFloat(item.price.amount).toFixed(2)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '20px' }}>
                        <button onClick={() => updateQty(item.variantId, -1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Minus size={14} /></button>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.variantId, 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

              {upsell && (
                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '16px', border: upsell.icon === 'truck' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: upsell.icon === 'truck' ? 'var(--gold)' : 'white', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
                    {upsell.icon === 'truck' ? <Truck size={18} /> : <Sparkles size={18} />}
                    <span dangerouslySetInnerHTML={{ __html: upsell.message }}></span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Image src={upsell.product.images?.edges[0]?.node?.url || ''} alt="" width={60} height={60} style={{ borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>{upsell.product.title}</p>
                      <p style={{ fontSize: '14px', color: 'var(--gold)' }}>€{parseFloat(upsell.product.variants?.edges[0]?.node?.price?.amount || '0').toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const variant = upsell.product.variants?.edges[0]?.node;
                        setCart([...cart, {
                          variantId: variant.id,
                          productId: upsell.product.id,
                          title: upsell.product.title,
                          variantTitle: variant.title,
                          price: variant.price,
                          img: upsell.product.images?.edges[0]?.node?.url,
                          qty: 1
                        }]);
                      }}
                      style={{ background: 'var(--gold)', color: 'black', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)' }}>Totale</span>
            <span style={{ fontSize: '24px', fontFamily: 'var(--font-d)', fontWeight: 700 }}>€{total.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: cart.length > 0 ? 'white' : 'rgba(255,255,255,0.1)', color: cart.length > 0 ? 'black' : 'rgba(255,255,255,0.4)', border: 'none', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: cart.length > 0 ? 'pointer' : 'not-allowed' }}
          >
            <CreditCard size={18} /> Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
