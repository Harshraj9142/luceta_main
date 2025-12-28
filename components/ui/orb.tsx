"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface OrbProps {
  className?: string
  volumeMode?: "manual" | "auto"
  getInputVolume?: () => number
  getOutputVolume?: () => number
}

export function Orb({
  className,
  volumeMode = "auto",
  getInputVolume,
  getOutputVolume,
}: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
    }
    resize()
    window.addEventListener("resize", resize)

    let time = 0

    const animate = () => {
      time += 0.02

      const inputVol = getInputVolume?.() ?? 0
      const outputVol = getOutputVolume?.() ?? 0
      const volume = Math.max(inputVol, outputVol)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = Math.min(centerX, centerY) * 0.6
      const pulseRadius = baseRadius + volume * 40

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        pulseRadius
      )
      gradient.addColorStop(0, `rgba(21, 109, 149, ${0.8 + volume * 0.2})`)
      gradient.addColorStop(0.5, `rgba(30, 123, 168, ${0.6 + volume * 0.3})`)
      gradient.addColorStop(1, `rgba(37, 137, 189, ${0.1 + volume * 0.2})`)

      // Draw orb
      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Inner glow
      const innerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        baseRadius * 0.5
      )
      innerGradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 + volume * 0.4})`)
      innerGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.beginPath()
      ctx.arc(centerX, centerY, baseRadius * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = innerGradient
      ctx.fill()

      // Ripple effect when speaking
      if (volume > 0.1) {
        const rippleRadius = pulseRadius + Math.sin(time * 4) * 10
        ctx.beginPath()
        ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(21, 109, 149, ${volume * 0.5})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [getInputVolume, getOutputVolume])

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full", className)}
    />
  )
}
