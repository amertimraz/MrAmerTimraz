import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function useScrollReveal(amount = 0.15) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });
  return { ref, isInView };
}
