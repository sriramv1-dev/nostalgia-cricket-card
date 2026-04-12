'use client'

import React from 'react'

interface CardWrapperProps {
  children: React.ReactNode
  scale?: number
  className?: string
}

/**
 * CardWrapper handles the scaling of the 750x1050px card to a smaller footprint.
 * Default scale is 0.32, which results in a 240x336px footprint.
 */
export const CardWrapper: React.FC<CardWrapperProps> = ({ 
  children, 
  scale = 0.32,
  className = ''
}) => {
  // Original dimensions
  const baseWidth = 750
  const baseHeight = 1050

  // Scaled dimensions
  const scaledWidth = baseWidth * scale
  const scaledHeight = baseHeight * scale

  return (
    <div 
      className={`relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-xl border-2 border-[#d1c9b8] flex-shrink-0 ${className}`}
      style={{ 
        width: `${scaledWidth}px`, 
        height: `${scaledHeight}px`,
      }}
    >
      <div 
        style={{ 
          width: `${baseWidth}px`, 
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  )
}
