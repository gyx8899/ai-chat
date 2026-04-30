import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          '--normal-bg': 'hsl(var(--card))',
          '--normal-text': 'hsl(var(--card-foreground))',
          '--normal-border': 'hsl(var(--border))',
          '--success-bg': 'hsl(var(--card))',
          '--success-text': 'oklch(0.62 0.18 var(--brand-h))',
          '--success-border': 'oklch(0.62 0.18 var(--brand-h) / 0.4)',
          '--error-bg': 'hsl(var(--card))',
          '--error-text': 'hsl(var(--destructive))',
          '--error-border': 'hsl(var(--destructive) / 0.4)',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[var(--normal-bg)] group-[.toaster]:text-[var(--normal-text)] group-[.toaster]:border group-[.toaster]:border-[var(--normal-border)] group-[.toaster]:shadow-[0_8px_28px_-8px_oklch(0.62_0.18_var(--brand-h)/0.25)] group-[.toaster]:backdrop-blur-md group-[.toaster]:rounded-md',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-sm',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-sm',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
