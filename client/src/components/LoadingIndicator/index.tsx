export function LoadingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2" aria-label="loading">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
          style={{
            background: 'var(--primary-oklch)',
            boxShadow: '0 0 6px oklch(0.62 0.18 var(--brand-h) / 0.6)',
            animationDelay: `${i * 200}ms`,
          }}
        />
      ))}
    </div>
  )
}
