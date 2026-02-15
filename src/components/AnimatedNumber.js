import React, { useEffect, useRef, useState } from 'react';

export default function AnimatedNumber({ value = 0, duration = 800, format = (n) => n }) {
  const [display, setDisplay] = useState(value);
  const startRef = useRef(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const from = fromRef.current || 0;
    const diff = value - from;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const next = from + diff * t;
      setDisplay(next);
      if (t < 1) requestAnimationFrame(step);
      else fromRef.current = value;
    };
    requestAnimationFrame(step);
    return () => { startRef.current = null; };
  }, [value, duration]);

  return <span>{format(display)}</span>;
}
