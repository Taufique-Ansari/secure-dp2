'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIsomorphicLayoutEffect } from '@/hooks/useClient';

export function ShadowPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  // Only run on client
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;
    
    // Create shadow root
    if (!shadowRootRef.current) {
      shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
    }
    
    setMounted(true);
    
    return () => {
      setMounted(false);
    };
  }, []);

  return (
    <div ref={containerRef}>
      {mounted && shadowRootRef.current && createPortal(children, shadowRootRef.current)}
    </div>
  );
} 