import { useUIStore } from '@/store/uiStore'

/* ── Aurora Blob (左上光斑) ─────────────────────────────── */
function AuroraBlobTopLeft() {
  return (
    <div
      className="animate-drift absolute"
      style={{
        top: '-40%',
        left: '-10%',
        width: '70%',
        height: '80%',
        background: `conic-gradient(
          from 120deg,
          oklch(0.72 0.22 var(--brand-h) / 0.18),
          oklch(0.6 0.2 260 / 0.14),
          oklch(0.7 0.18 180 / 0.16),
          transparent 60%
        )`,
        filter: 'blur(80px)',
      }}
    />
  )
}

/* ── Aurora Blob (右下光斑) ─────────────────────────────── */
function AuroraBlobBottomRight() {
  return (
    <div
      className="animate-drift-reverse absolute"
      style={{
        bottom: '-30%',
        right: '-15%',
        width: '60%',
        height: '70%',
        background: `conic-gradient(
          from 280deg,
          oklch(0.7 0.2 var(--brand-h) / 0.12),
          oklch(0.65 0.18 300 / 0.1),
          transparent 70%
        )`,
        filter: 'blur(90px)',
      }}
    />
  )
}

/* ── Grid Texture (网格纹理) ─────────────────────────────── */
function GridTexture() {
  return (
    <div
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage: `
          linear-gradient(to right, var(--border-2) 1px, transparent 1px),
          linear-gradient(to bottom, var(--border-2) 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)',
      }}
    />
  )
}

/* ── Top Vignette (顶部压暗过渡) ─────────────────────────── */
function TopVignette() {
  return (
    <div
      className="absolute inset-x-0 top-0 h-[40vh]"
      style={{
        background: 'linear-gradient(to bottom, var(--bg-subtle) 0%, transparent 100%)',
      }}
    />
  )
}

/* ── BackgroundLayer ─────────────────────────────────────── */
export function BackgroundLayer() {
  const bgDecor = useUIStore(s => s.bgDecor)

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {bgDecor && (
        <>
          <AuroraBlobTopLeft />
          <AuroraBlobBottomRight />
          <GridTexture />
          <TopVignette />
        </>
      )}
    </div>
  )
}
