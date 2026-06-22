"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

export function useCountUp(target: number, duration = 800, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (startOnView && !inView) return;
    if (started.current) return;
    started.current = true;

    if (target === 0) { setCount(0); return; }

    const startTime = performance.now();
    const startVal = 0;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startVal + (target - startVal) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [target, duration, startOnView, inView]);

  return { count, ref };
}

export default function CountUp({
  target,
  duration = 800,
  className = "",
  suffix = "",
}: {
  target: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const { count, ref } = useCountUp(target, duration);
  return <span ref={ref} className={className}>{count}{suffix}</span>;
}
