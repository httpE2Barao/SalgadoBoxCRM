"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Square, CheckSquare } from 'lucide-react'

interface SelectableCardWrapperProps {
  children: ReactNode
  isSelected: boolean
  onToggle: () => void
  showSelection: boolean
  className?: string
}

export function SelectableCardWrapper({
  children,
  isSelected,
  onToggle,
  showSelection,
  className = ""
}: SelectableCardWrapperProps) {
  if (!showSelection) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative", className)}>
      {/* Selection Overlay */}
      <div 
        className={cn(
          "absolute inset-0 border-2 rounded-lg transition-all pointer-events-none",
          isSelected 
            ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
            : "border-transparent hover:border-muted-foreground/30"
        )}
      />
      
      {/* Selection Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-2 left-2 z-10 p-1 rounded transition-colors",
          "hover:bg-muted pointer-events-auto"
        )}
      >
        {isSelected ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      
      {/* Content */}
      <div className="pl-8">
        {children}
      </div>
    </div>
  )
}