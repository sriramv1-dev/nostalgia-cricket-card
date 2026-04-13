import React from 'react'

interface MobileContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * MobileContainer enforces a maximum width (md) and centers content.
 * Used for pages designed with a mobile-first app experience.
 */
export const MobileContainer: React.FC<MobileContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`max-w-md mx-auto min-h-screen relative ${className}`}>
      {children}
    </div>
  )
}
