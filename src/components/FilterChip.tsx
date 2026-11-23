import type { ReactNode } from 'react'

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
          : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
      }`}
    >
      {children}
    </button>
  )
}
