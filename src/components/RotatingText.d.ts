import { ComponentType } from 'react';

export interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  initial?: object;
  animate?: object;
  exit?: object;
  animatePresenceMode?: 'wait' | 'sync' | 'popLayout';
  animatePresenceInitial?: boolean;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  transition?: object;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  // Allow any extra DOM/motion props passed through (...rest)
  [key: string]: unknown;
}

declare const RotatingText: ComponentType<RotatingTextProps>;
export default RotatingText;
