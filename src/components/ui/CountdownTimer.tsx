"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function FlipCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-accent text-white rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-x-0 top-1/2 h-px bg-ink/20" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-bold"
          >
            {value.toString().padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-xs sm:text-sm text-ink-muted mt-2">{label}</span>
    </div>
  );
}

export default function CountdownTimer({ targetDate, className, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    function calculate() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setIsComplete(true);
        onComplete?.();
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return (
      <div className={cn("text-center py-4", className)}>
        <span className="text-2xl font-bold text-emerald">Event Dimulai!</span>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 sm:gap-4", className)}>
      <FlipCard value={timeLeft.days} label="Hari" />
      <FlipCard value={timeLeft.hours} label="Jam" />
      <FlipCard value={timeLeft.minutes} label="Menit" />
      <FlipCard value={timeLeft.seconds} label="Detik" />
    </div>
  );
}
