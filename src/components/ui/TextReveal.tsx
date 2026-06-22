"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}

export default function TextReveal({
  children,
  className,
  delay = 0,
  stagger = 0.03
}: TextRevealProps) {
  if (typeof children === "string") {
    const characters = children.split("");

    return (
      <motion.span
        className={className}
        initial="hidden"
        animate="visible"
        style={{ display: "inline-flex", overflow: "hidden" }}
      >
        {characters.map((char, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: delay + i * stagger,
                  duration: 0.3
                }
              }
            }}
            style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
