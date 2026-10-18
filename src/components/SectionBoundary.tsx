import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

type Props = {
  children: ReactNode
  id?: string
}

export function SectionBoundary({ children, id }: Props) {
  return (
    <ErrorBoundary fallback={<SectionFallback id={id} />}>{children}</ErrorBoundary>
  )
}

function SectionFallback({ id }: { id?: string }) {
  return (
    <section id={id} className="border-b border-brand-line bg-brand-surface px-4 py-8 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-pink">
        Sección no disponible
      </p>
      <p className="mx-auto mt-1 max-w-md text-xs text-brand-muted">
        Esta parte de la página no se pudo cargar. Probá recargar; si persiste, avisanos.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 rounded border border-brand-line px-3 py-1.5 text-[11px] font-semibold text-brand-muted transition hover:border-brand-pink hover:text-brand-pink"
      >
        Recargar
      </button>
    </section>
  )
}
