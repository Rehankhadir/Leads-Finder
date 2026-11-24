import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      {...props}
    />
  )
}

export { Badge }
