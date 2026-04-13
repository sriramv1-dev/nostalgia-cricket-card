'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { DynamicCharacter, CharacterColors } from './DynamicCharacter'

interface BrandCardProps {
  colors?: CharacterColors
  characterSrc?: string
  showDebug?: boolean
  width?: number
  height?: number
  thresholds?: {
    padsY?: number
    shoesY?: number
    glovesX?: number
    batX?: number
    hasBat?: boolean
  }
}

/**
 * BrandCard is the "Brand Side" (Back) of the cricket card.
 * Dimensions: 750x1050px
 */
export const BrandCard: React.FC<BrandCardProps> = ({
  colors = {
    cap: '#3b82f6',
    capAccent: '#fbbf24',
    gloves: '#3b82f6',
    pads: '#3b82f6',
    shoes: '#3b82f6',
    bat: '#fbbf24'
  },
  characterSrc = '/images/card/pull-shot.png',
  showDebug = false,
  width = 500,
  height = 425,
  thresholds
}) => {
  return (
    <div className="relative w-[750px] h-[1050px] overflow-hidden bg-white select-none">
      {/* 1. Base Texture */}
      <div 
        className="absolute inset-0 opacity-[0.15] bg-retro-grain pointer-events-none"
      />

      {/* 2. Style Accents: Concentric Ring Accents */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] border-[2px] border-slate-100 rounded-full" />
        <div className="absolute w-[800px] h-[800px] border-[1px] border-slate-50 rounded-full" />
      </div>

      {/* 3. Main Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
        
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-[500px] h-[150px] mb-8"
        >
          <Image 
            src="/images/card/logo-no-bg.png" 
            alt="Big Nostalgia" 
            fill
            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
            priority
          />
        </motion.div>

        <DynamicCharacter 
          src={characterSrc}
          colors={colors}
          thresholds={thresholds}
          showDebugBackground={showDebug}
          width={width}
          height={height}
          className="drop-shadow-[0_30px_50px_rgba(0,0,0,0.15)]"
        />

        {/* Tagline / Sub-branding */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 text-center"
        >
          <p className="font-supermercado text-5xl text-slate-800 font-bold">
            Limited Edition
          </p>
          <div className="w-24 h-1 bg-slate-200 mx-auto mt-4 rounded-full" />
        </motion.div>
      </div>

      {/* 4. Border Frame */}
      <div className="absolute inset-0 border-[16px] border-slate-50/50 pointer-events-none" />
      <div className="absolute inset-[16px] border-[1px] border-slate-100 pointer-events-none rounded-[2px]" />
    </div>
  )
}
