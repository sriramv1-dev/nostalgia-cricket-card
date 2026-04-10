'use client'

import React, { useEffect, useRef } from 'react'
import { motion, MotionProps } from 'framer-motion'

/**
 * Interface representing the colors for each customizable part of the mascot.
 */
export interface CharacterColors {
  /** Main color for the cap body. */
  cap: string
  /** Color for the gloves. */
  gloves: string
  /** Color for the leg pads and feet. */
  pads: string
  /** Color for the bat body. */
  bat: string
  /** Color for the underside/accent of the cap. */
  capAccent: string
  /** Optional separate color for shoes, falling back to pads if not provided. */
  shoes?: string
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
}

/**
 * DynamicCharacter: A React component that performs real-time pixel manipulation.
 * 
 * CORE STRATEGY: 
 * 1. PURE PIXEL ACCESS: Uses HTML5 Canvas `getImageData` and `putImageData`.
 * 2. SHADE PRESERVATION (HSL Mapping): Instead of simple tints, it maps the user's 
 *    target HUE and SATURATION onto the original pixel, but preserves the original 
 *    LIGHTNESS (L) value. This ensures shading, shadows, and highlights are kept.
 * 3. SPATIAL MASKING (2D Logic): Since the PNG is a single layer, it uses X/Y 
 *    coordinates to differentiate between parts that share the same color space
 *    (e.g., distinguishing the Yellow Bat from the Yellow Cap Brim).
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
      gloves: rgbToHsl(hexToRgb(parts.gloves)),
      pads: rgbToHsl(hexToRgb(parts.pads)),
      bat: rgbToHsl(hexToRgb(parts.bat)),
      capAccent: rgbToHsl(hexToRgb(parts.capAccent)),
      shoes: rgbToHsl(hexToRgb(parts.shoes || parts.pads)),
    }

    const originalData = originalImageDataRef.current.data
    // Create work array from pristine original to prevent additive math errors
    const newImageData = new ImageData(
      new Uint8ClampedArray(originalData),
      originalImageDataRef.current.width,
      originalImageDataRef.current.height
    )
    const data = newImageData.data
    const canvasWidth = originalImageDataRef.current.width
    const canvasHeight = originalImageDataRef.current.height

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Skip fully transparent pixels (Optimization)
      if (a === 0) continue

      /**
       * PART DETECTION FILTERS
       * We use thresholds to detect "Blue" vs "Yellow" areas in the original PNG.
       */
      const isBlue = b > r + 20 && b > g + 20
      const isYellow = r > 150 && g > 150 && b < 100

      if (isBlue || isYellow) {
        // Spatial Coordinates for refined mapping
        const pixelIndex = i / 4
        const px = pixelIndex % canvasWidth
        const py = Math.floor(pixelIndex / canvasWidth)
        const relX = px / canvasWidth
        const relY = py / canvasHeight

        let target = targetHSLs.cap

        /**
         * 2D SPATIAL MAPPING LOGIC
         * Differentiates components based on their region in the sprite.
         */
        if (isBlue) {
          if (relY > 0.65) {
            target = targetHSLs.pads   // Legs/Shoes region
          } else if (relX > 0.6 && relY > 0.35) {
            target = targetHSLs.gloves // Right side hands region
          } else {
            target = targetHSLs.cap    // Top head region
          }
        } else if (isYellow) {
          if (relX > 0.65) {
            target = targetHSLs.bat    // Right side bat object
          } else {
            target = targetHSLs.capAccent // Brim of the cap region
          }
        }

        if (target) {
          // HSL Mapping: Lock Hue and Saturation, keep original Lightness
          const originalHsl = rgbToHsl({ r, g, b })
          const finalRgb = hslToRgb(target.h, target.s, originalHsl.l)
          
          data[i] = finalRgb.r
          data[i + 1] = finalRgb.g
          data[i + 2] = finalRgb.b
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
