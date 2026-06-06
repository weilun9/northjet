'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** ms delay before this block animates in (ignored when `stagger`). */
  delay?: number;
  /** When true, children animate in one-by-one instead of the block as a whole. */
  stagger?: boolean;
}

/**
 * Reveals content with a fade + rise the first time it scrolls into view.
 * Uses IntersectionObserver; honours prefers-reduced-motion via CSS.
 */
export default function Reveal({ children, className = '', delay = 0, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = stagger ? 'reveal-stagger' : 'reveal';
  return (
    <div
      ref={ref}
      className={`${base} ${visible ? 'is-visible' : ''} ${className}`}
      style={stagger ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
