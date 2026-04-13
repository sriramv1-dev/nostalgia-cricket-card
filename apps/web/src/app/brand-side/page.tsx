'use client'

import React, { useState } from 'react'
import { BrandCard } from '@/components/card/BrandCard'
import { CardWrapper } from '@/components/card/CardWrapper'
import { CharacterColors } from '@/components/card/DynamicCharacter'
import { POSE_REGISTRY, PoseConfig } from '@/constants/poses'

const DEFAULT_COLORS: CharacterColors = {
  cap: '#1e40af',    // India Blue
  capAccent: '#fbbf24', // Yellow
  gloves: '#1e40af',
  pads: '#1e40af',
  shoes: '#1e40af',
  bat: '#fbbf24',
}

export default function TestCardPage() {
  const [poseColors, setPoseColors] = useState<Record<string, CharacterColors>>(() => {
    const initial: Record<string, CharacterColors> = {}
    POSE_REGISTRY.forEach((pose) => {
      initial[pose.src] = { ...DEFAULT_COLORS }
    })
    return initial
  })

  const [selectedPose, setSelectedPose] = useState<PoseConfig>(POSE_REGISTRY[0])
  const currentColors = poseColors[selectedPose.src] || DEFAULT_COLORS

  const updateColor = (part: keyof CharacterColors, color: string) => {
    setPoseColors(prev => ({
      ...prev,
      [selectedPose.src]: {
        ...(prev[selectedPose.src] || DEFAULT_COLORS),
        [part]: color
      }
    }))
  }

  const PRESETS = [
    { label: 'India Team', cap: '#1e3a8a', gloves: '#1e3a8a', pads: '#1e3a8a', bat: '#fbbf24', capAccent: '#ef4444' },
    { label: 'Neon Strike', cap: '#f43f5e', gloves: '#10b981', pads: '#f59e0b', bat: '#8b5cf6', capAccent: '#ffffff' },
    { label: 'Classic Z', cap: '#18181b', gloves: '#18181b', pads: '#18181b', bat: '#ffffff', capAccent: '#3b82f6' },
    { label: 'Solar Flare', cap: '#ea580c', gloves: '#ea580c', pads: '#ea580c', bat: '#fde047', capAccent: '#fde047' },
  ]

  const [showDebug, setShowDebug] = useState(false)

  // Mapping of part keys to human-readable labels
  const PART_LABELS: Record<string, string> = {
    cap: 'Cap Body',
    capAccent: 'Cap Accent',
    gloves: 'Gloves',
    pads: 'Leg Pads',
    shoes: 'Shoes',
    bat: 'Cricket Bat',
    ball: 'Cricket Ball',
    wickets: 'Wickets'
  }

  // Pre-filter parts for Equipment (Blue/Specific) vs Accents (Yellow/Specific)
  const EQUIPMENT_PARTS = ['cap', 'gloves', 'pads', 'shoes', 'wickets']
  const ACCENT_PARTS = ['capAccent', 'bat', 'ball']

  const visibleEquipment = selectedPose.parts.filter(p => EQUIPMENT_PARTS.includes(p))
  const visibleAccents = selectedPose.parts.filter(p => ACCENT_PARTS.includes(p))

  return (
    <main className="min-h-screen bg-[#0d0d0d] flex flex-row items-center justify-center p-12 gap-16 overflow-x-auto">
      
      {/* 1. Main Preview (Centered Card) */}
      <section className="flex-shrink-0 flex flex-col items-center gap-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-2 tracking-[0.2em] font-bold uppercase">BRAND CARD</h1>
          <p className="text-zinc-600 uppercase text-xs tracking-[0.4em]">Multi-Part Character Design</p>
        </div>

        <CardWrapper scale={0.6}>
          <BrandCard 
            colors={currentColors} 
            characterSrc={selectedPose.src} 
            showDebug={showDebug}
            width={selectedPose.width}
            height={selectedPose.height}
            thresholds={{
              padsY: selectedPose.padsThresholdY,
              shoesY: selectedPose.shoesThresholdY,
              glovesX: selectedPose.glovesThresholdX,
              batX: selectedPose.batThresholdX,
              hasBat: selectedPose.parts.includes('bat')
            }}
          />
        </CardWrapper>

        <div className="flex items-center gap-4 mt-8">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              showDebug ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {showDebug ? 'Debug: ON' : 'Debug: OFF'}
          </button>
          <span className="text-zinc-700 text-[10px] font-mono tracking-widest uppercase border border-zinc-800 px-4 py-2 rounded-full">
            {selectedPose.width} x {selectedPose.height} px (Pose Size)
          </span>
        </div>
      </section>

      {/* 2. Control Panel (Outside of Card) */}
      <section className="flex-shrink-0 w-[450px] flex flex-col gap-8 bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800/50 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="space-y-1">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest font-display">Customizer</h2>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Part-Aware Independent Controls</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Pose Selection Group */}
          <div className="space-y-4">
            <h3 className="text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em] border-b border-zinc-800 pb-2">Character Pose</h3>
            <div className="grid grid-cols-2 gap-2">
              {POSE_REGISTRY.map((pose) => (
                <button
                  key={pose.src}
                  onClick={() => setSelectedPose(pose)}
                  className={`px-3 py-3 text-[10px] uppercase tracking-wider font-bold rounded-xl border transition-all flex items-center justify-between ${
                    selectedPose.src === pose.src 
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                      : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <span className="truncate mr-2">{pose.label}</span>
                  {selectedPose.src === pose.src && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Equipment Group */}
          <div className="space-y-4">
            <h3 className="text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em] border-b border-zinc-800 pb-2">Equipment</h3>
            
            {visibleEquipment.length > 0 ? visibleEquipment.map(part => (
              <div key={part} className="flex items-center justify-between group">
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors">
                  {PART_LABELS[part]}
                </span>
                <input 
                  type="color" 
                  value={(currentColors as any)[part] || '#3b82f6'}
                  onInput={(e) => updateColor(part as keyof CharacterColors, (e.target as HTMLInputElement).value)}
                  className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                />
              </div>
            )) : (
              <p className="text-[10px] text-zinc-700 italic">No Equipment detected</p>
            )}
          </div>

          {/* Dynamic Accents Group */}
          <div className="space-y-4 pt-4">
            <h3 className="text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em] border-b border-zinc-800 pb-2">Accents & Items</h3>

            {visibleAccents.length > 0 ? visibleAccents.map(part => (
              <div key={part} className="flex items-center justify-between group">
                <span className="text-zinc-100 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                  {PART_LABELS[part]}
                </span>
                <input 
                  type="color" 
                  value={(currentColors as any)[part] || '#fbbf24'}
                  onInput={(e) => updateColor(part as keyof CharacterColors, (e.target as HTMLInputElement).value)}
                  className={`w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden ${part === 'bat' || part === 'ball' ? 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' : ''}`}
                />
              </div>
            )) : (
              <p className="text-[10px] text-zinc-700 italic">No Accents detected</p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <h3 className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-4">Style Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPoseColors(prev => ({
                  ...prev,
                  [selectedPose.src]: { 
                    ...prev[selectedPose.src],
                    cap: p.cap, 
                    gloves: p.gloves, 
                    pads: p.pads, 
                    shoes: p.pads, // Default shoes to pads on preset
                    bat: p.bat, 
                    capAccent: p.capAccent 
                  }
                }))}
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
