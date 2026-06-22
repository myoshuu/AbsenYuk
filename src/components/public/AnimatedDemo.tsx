"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { title: "Buka Acara", desc: "Pilih acara yang ingin dihadiri", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
  { title: "Scan QR", desc: "Scan QR code yang dibagikan panitia", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" },
  { title: "Absensi Berhasil!", desc: "Kehadiran tercatat otomatis", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function AnimatedDemo() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-ink mb-4">
          Cara Kerja AbsenYuk
        </h2>
        <p className="text-ink-muted mb-16 max-w-md mx-auto">
          Tiga langkah mudah untuk absensi paperless
        </p>

        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === currentStep ? "bg-emerald w-8" : "bg-muted hover:bg-accent/20"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-bg-card rounded-2xl p-8 sm:p-12 shadow-card border border-border max-w-sm mx-auto">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                currentStep === 2 ? "bg-emerald/10" : "bg-muted"
              }`}>
                <svg className={`w-10 h-10 ${currentStep === 2 ? "text-emerald" : "text-ink"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={steps[currentStep].icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">{steps[currentStep].title}</h3>
              <p className="text-ink-muted">{steps[currentStep].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
