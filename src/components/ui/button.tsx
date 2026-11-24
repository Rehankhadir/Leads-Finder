import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glass'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/25',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/25',
      outline: 'border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/30',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      gradient: 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30',
      glass: 'glass border border-white/20 text-foreground hover:bg-white/10',
    }
    const sizes: Record<string, string> = {
      default: 'h-10 px-4 py-2 rounded-xl text-sm',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-12 rounded-xl px-6 text-sm',
      icon: 'h-10 w-10 rounded-xl',
      xl: 'h-14 rounded-2xl px-8 text-base font-semibold',
    }
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
