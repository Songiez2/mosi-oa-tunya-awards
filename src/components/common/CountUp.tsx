import React, { useEffect, useRef, useState } from 'react';

export function CountUp({ end, duration = 1200, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) return;
    const start = performance.now();
    ref.current = window.requestAnimationFrame(function tick(time) {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) ref.current = window.requestAnimationFrame(tick);
    });
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}
