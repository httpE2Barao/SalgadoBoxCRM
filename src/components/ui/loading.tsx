import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'bars'
  className?: string
  text?: string
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  className, 
  text 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-primary rounded-full animate-bounce',
              sizeClasses[size],
              i === 0 ? 'animation-delay-0' : i === 1 ? 'animation-delay-150' : 'animation-delay-300'
            )}
            style={{
              animationDelay: `${i * 150}ms`
            }}
          />
        ))}
        {text && (
          <span className={cn('ml-2 text-muted-foreground', textClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-primary rounded-sm animate-pulse',
              sizeClasses[size],
              'w-2'
            )}
            style={{
              animationDelay: `${i * 100}ms`,
              height: `${parseInt(sizeClasses[size].split(' ')[1]) * (0.5 + Math.random() * 0.5)}px`
            }}
          />
        ))}
        {text && (
          <span className={cn('ml-2 text-muted-foreground', textClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <span className={cn('ml-2 text-muted-foreground', textClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

// Loading overlay component
interface LoadingOverlayProps extends LoadingProps {
  overlay?: boolean
}

export function LoadingOverlay({ overlay = true, ...props }: LoadingOverlayProps) {
  if (!overlay) {
    return <Loading {...props} />
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg">
        <Loading {...props} />
      </div>
    </div>
  )
}

// Page loading component
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loading size="xl" text="Carregando..." />
        <p className="text-muted-foreground">Por favor, aguarde...</p>
      </div>
    </div>
  )
}