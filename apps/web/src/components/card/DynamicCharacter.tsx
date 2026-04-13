'use client'

import React, { useEffect, useRef } from 'react'
import { motion, MotionProps } from 'framer-motion'

/**
 * Interface representing the colors for each customizable part of the mascot.
 */
export interface CharacterColors {
  /** Main color for the cap body. */
  cap: string
  /** Color for the underside/accent of the cap. */
  capAccent: string
  /** Color for the gloves. */
  gloves: string
  /** Color for the leg pads. */
  pads: string
  /** Color for the shoes. */
  shoes: string
  /** Color for the bat. */
  bat?: string
  /** Color for the ball. */
  ball?: string
  /** Color for the wickets. */
  wickets?: string
}

interface DynamicCharacterProps {
  /** Path to the single-layer PNG character asset. */
  src: string
  /** Accessibility label for the character. */
  alt?: string
  /** Visual width in pixels. */
  width?: number
  /** Visual height in pixels. */
  height?: number
  /** Object containing all target hex colors. */
  colors: CharacterColors
  /** Optional additional CSS classes. */
  className?: string
  /** Custom motion properties for floating/hover animations. */
  motionProps?: MotionProps
  /** If true, shows a white background for debugging regions. */
  showDebugBackground?: boolean
  /** Optional spatial configuration for regional detection (X/Y thresholds). */
  thresholds?: {
    padsY?: number
    shoesY?: number
    glovesX?: number
    batX?: number
    hasBat?: boolean
  }
}

/**
 * DynamicCharacter: A React component that performs real-time pixel manipulation.
 */
export const DynamicCharacter: React.FC<DynamicCharacterProps> = ({
  src,
  alt = 'Character',
  width = 500,
  height = 500,
  colors,
  className = '',
  motionProps,
  showDebugBackground = false,
  thresholds = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageDataRef = useRef<ImageData | null>(null)
  const imageLoadedRef = useRef(false)

  // Default "Floating" animation for a premium feel
  const defaultMotion: MotionProps = {
    animate: { 
      y: [0, -15, 0],
      rotate: [0.5, -0.5, 0.5],
    },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  }

  const activeMotion = motionProps || defaultMotion

  // 1. Initial Load & Pixel Caching
  // We cache the original ImageData in a Ref to avoid quality loss over multiple edits.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      // Scale for High-DPI (Retina) displays
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      ctx.scale(dpr, dpr)
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      originalImageDataRef.current = imageData
      imageLoadedRef.current = true
      applyRecolor(colors)
    }
  }, [src, width, height])

  // 2. Responsive Updates
  // Triggered whenever any color changes. Optimized via requestAnimationFrame.
  useEffect(() => {
    if (imageLoadedRef.current) {
      const rafId = requestAnimationFrame(() => {
        applyRecolor(colors)
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [colors.cap, colors.gloves, colors.pads, colors.bat, colors.capAccent, colors.shoes])

  /**
   * Main logic for recoloring specific pixel regions.
   */
  const applyRecolor = (parts: CharacterColors) => {
    const canvas = canvasRef.current
    if (!canvas || !originalImageDataRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Convert hex targets to HSL objects once per component update
    const targetHSLs = {
      cap: rgbToHsl(hexToRgb(parts.cap)),
      capAccent: rgbToHsl(hexToRgb(parts.capAccent)),
      gloves: rgbToHsl(hexToRgb(parts.gloves)),
      pads: rgbToHsl(hexToRgb(parts.pads)),
      shoes: rgbToHsl(hexToRgb(parts.shoes)),
      bat: parts.bat ? rgbToHsl(hexToRgb(parts.bat)) : null,
      ball: parts.ball ? rgbToHsl(hexToRgb(parts.ball)) : null,
      wickets: parts.wickets ? rgbToHsl(hexToRgb(parts.wickets)) : null,
    }

    const originalData = originalImageDataRef.current.data
    const newImageData = new ImageData(
      new Uint8ClampedArray(originalData),
      originalImageDataRef.current.width,
      originalImageDataRef.current.height
    )
    const data = newImageData.data
    const canvasWidth = originalImageDataRef.current.width
    const canvasHeight = originalImageDataRef.current.height

    const padsY = thresholds.padsY ?? 0.62
    const shoesY = thresholds.shoesY ?? 0.82
    const glovesX = thresholds.glovesX ?? 0.6
    const batX = thresholds.batX ?? 0.65
    const hasBat = thresholds.hasBat ?? true

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
      if (a === 0) continue

      // Regional Sensing Logic (Original Style)
      const isBlue = b > r + 30 && b > g + 30
      const isYellow = r > 150 && g > 150 && b < 100
      const isRed = r > 180 && g < 100 && b < 100
      const isGreen = g > 180 && r < 100 && b < 100

      if (isBlue || isYellow || isRed || isGreen) {
        const pixelIndex = i / 4
        const px = pixelIndex % canvasWidth
        const py = Math.floor(pixelIndex / canvasWidth)
        const relX = px / canvasWidth
        const relY = py / canvasHeight

        let target = null

        if (isBlue) {
          if (relY > shoesY) target = targetHSLs.shoes
          else if (relY > padsY) target = targetHSLs.pads
          else if (relX > glovesX && relY > 0.35) target = targetHSLs.gloves
          else target = targetHSLs.cap
        } else if (isYellow) {
          if (hasBat && relX > batX) target = targetHSLs.bat
          else target = targetHSLs.capAccent
        } else if (isRed) {
          target = targetHSLs.ball
        } else if (isGreen) {
          target = targetHSLs.wickets
        }

        if (target) {
          if (showDebugBackground) {
            // Visual Debug Overlays
            if (isBlue) {
              if (relY > shoesY) { data[i]=255; data[i+1]=255; data[i+2]=255; }
              else if (relY > padsY) { data[i]=0; data[i+1]=255; data[i+2]=0; }
              else if (relX > glovesX) { data[i]=255; data[i+1]=0; data[i+2]=0; }
              else { data[i]=0; data[i+1]=0; data[i+2]=255; }
            } else if (isYellow) {
              if (hasBat && relX > batX) { data[i]=255; data[i+1]=255; data[i+2]=0; }
              else { data[i]=0; data[i+1]=255; data[i+2]=255; }
            } else if (isRed) {
              data[i]=255; data[i+1]=105; data[i+2]=180;
            } else if (isGreen) {
              data[i]=139; data[i+1]=69; data[i+2]=19;
            }
          } else {
            const originalHsl = rgbToHsl({ r, g, b })
            const finalRgb = hslToRgb(target.h, target.s, originalHsl.l)
            data[i] = finalRgb.r
            data[i+1] = finalRgb.g
            data[i+2] = finalRgb.b
          }
        }
      }
    }

    ctx.putImageData(newImageData, 0, 0)
  }

  return (
    <motion.div className={`relative ${className}`} style={{ width, height }} {...activeMotion}>
      <canvas 
        ref={canvasRef} 
        aria-label={alt} 
        className={`w-full h-full object-contain pointer-events-none ${showDebugBackground ? 'bg-white rounded-xl' : ''}`} 
      />
    </motion.div>
  )
}

// --- COLOR MATH UTILITIES ---

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 }
}

function rgbToHsl({ r, g, b }: { r: number, g: number, b: number }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
