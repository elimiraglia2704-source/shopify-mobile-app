'use client';

import { useState } from 'react';
import HomeProductsClient from './HomeProductsClient';

interface Product {
  id: string;
  title: string;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  images?: {
    edges?: {
      node: {
        url: string;
      };
    }[];
  };
}

interface HomeClientWrapperProps {
  initialProducts: Product[];
  initialCollections: unknown[];
}

export default function HomeClientWrapper({ initialProducts }: HomeClientWrapperProps) {
  const [profileName] = useState(() => {
    try {
      const savedName = typeof window !== 'undefined' ? localStorage.getItem('elisee:profile_name') : null;
      return savedName ? savedName.split(' ')[0] : 'Enea';
    } catch {
      return 'Enea';
    }
  });

  const [greeting] = useState(() => {
    try {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 14) {
        return 'Buongiorno';
      }
      return 'Buonasera';
    } catch {
      return 'Buonasera';
    }
  });

  return (
    <>
      <div style={{ padding: '24px 16px 8px', marginTop: '10px' }}>
        <h1 id="hero-title" style={{ fontFamily: 'var(--font-d)', fontSize: '32px', marginBottom: '16px', fontWeight: 600 }}>
          {greeting}, {profileName}
        </h1>
      </div>

      <HomeProductsClient 
        products={initialProducts} 
        title="Ultimi arrivi"
      />

      <div style={{ height: '100px' }}></div>
    </>
  );
}
