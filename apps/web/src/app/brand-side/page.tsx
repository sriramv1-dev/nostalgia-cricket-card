'use client'

import React, { useState } from 'react'
import { BrandCard } from '@/components/card/BrandCard'
import { CardWrapper } from '@/components/card/CardWrapper'
import { CharacterColors } from '@/components/card/DynamicCharacter'

export default function TestCardPage() {
  const [colors, setColors] = useState<CharacterColors>({
    cap: '#1e40af',    // India Blue
    gloves: '#1e40af',
    pads: '#1e40af',
    bat: '#fbbf24',    // Gold
    capAccent: '#fbbf24', // Yellow
  })

  const updateColor = (part: keyof CharacterColors, color: string) => {
    setColors(prev => ({ ...prev, [part]: color }))
  }

  const PRESETS = [
    { label: 'India Team', cap: '#1e3a8a', gloves: '#1e3a8a', pads: '#1e3a8a', bat: '#fbbf24', capAccent: '#ef4444' },
    { label: 'Neon Strike', cap: '#f43f5e', gloves: '#10b981', pads: '#f59e0b', bat: '#8b5cf6', capAccent: '#ffffff' },
    { label: 'Classic Z', cap: '#18181b', gloves: '#18181b', pads: '#18181b', bat: '#ffffff', capAccent: '#3b82f6' },
    { label: 'Solar Flare', cap: '#ea580c', gloves: '#ea580c', pads: '#ea580c', bat: '#fde047', capAccent: '#fde047' },
  ]

  return (
    <main className="min-h-screen bg-[#0d0d0d] flex flex-row items-center justify-center p-12 gap-16">
      
      {/* 1. Main Preview (Centered Card) */}
      <section className="flex flex-col items-center gap-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-2 tracking-[0.2em] font-bold">BRAND CARD</h1>
          <p className="text-zinc-600 uppercase text-xs tracking-[0.4em]">Multi-Part Character Design</p>
        </div>

        <CardWrapper scale={0.6}>
          <BrandCard colors={colors} />
        </CardWrapper>
        
        <span className="text-zinc-700 text-[10px] font-mono tracking-widest uppercase mt-8 border border-zinc-800 px-4 py-1 rounded-full">
          750 x 1050 px (Scaled View)
        </span>
      </section>

      {/* 2. Control Panel (Outside of Card) */}
      <section className="w-80 flex flex-col gap-8 bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800/50 backdrop-blur-xl shadow-2xl">
        <div className="space-y-1">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest font-display">Customizer</h2>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Independent Part Control</p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Blue Parts Group */}
          <div className="space-y-4">
            <h3 className="text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em] border-b border-zinc-800 pb-2">Equipment</h3>
            
            <div className="flex items-center justify-between group">
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors">Cap Primary</span>
              <input 
                type="color" 
                value={colors.cap}
                onInput={(e) => updateColor('cap', (e.target as HTMLInputElement).value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
              />
            </div>

            <div className="flex items-center justify-between group">
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors">Gloves</span>
              <input 
                type="color" 
                value={colors.gloves}
                onInput={(e) => updateColor('gloves', (e.target as HTMLInputElement).value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
              />
            </div>

            <div className="flex items-center justify-between group">
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors">Pads / Shoes</span>
              <input 
                type="color" 
                value={colors.pads}
                onInput={(e) => updateColor('pads', (e.target as HTMLInputElement).value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
              />
            </div>
          </div>

          {/* Yellow Parts Group */}
          <div className="space-y-4 pt-4">
            <h3 className="text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em] border-b border-zinc-800 pb-2">Accents</h3>

            <div className="flex items-center justify-between group">
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors">Cap Accent</span>
              <input 
                type="color" 
                value={colors.capAccent}
                onInput={(e) => updateColor('capAccent', (e.target as HTMLInputElement).value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
              />
            </div>

            <div className="flex items-center justify-between group">
              <span className="text-zinc-100 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Bat</span>
              <input 
                type="color" 
                value={colors.bat}
                onInput={(e) => updateColor('bat', (e.target as HTMLInputElement).value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <h3 className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-4">Style Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setColors({ cap: p.cap, gloves: p.gloves, pads: p.pads, bat: p.bat, capAccent: p.capAccent })}
                className="px-3 py-2 text-[9px] uppercase tracking-tighter font-bold rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all transform hover:scale-[1.02]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
