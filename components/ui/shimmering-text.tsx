"use client"

import { motion } from "framer-motion"

interface ShimmeringTextProps {
  text: string
  className?: string
}

export function ShimmeringText({ text, className }: ShimmeringTextProps) {
  return (
    <motion.span
      className={className}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {text}
    </motion.span>
  )
}
