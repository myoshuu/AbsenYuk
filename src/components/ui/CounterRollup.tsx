"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useTransform, motion } from "framer-motion";

interface CounterRollupProps {
  target: number;
  duration?: number;
  className?: string;
  formatFn?: (n: number) => string;
}

export default function CounterRollup({
  target,
  duration = 1200,
  className = "",
  formatFn,
}: CounterRollupProps) {
  const [inView, setInView] = useState(false);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      motionVal.set(eased * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, target, duration, motionVal]);

  const display = useTransform(motionVal, (v) =>
    formatFn ? formatFn(Math.round(v)) : Math.round(v).toLocaleString("id-ID")
  );

  return (
    <motion.span className={className}>
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}
