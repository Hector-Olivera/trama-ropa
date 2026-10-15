import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-5xl uppercase tracking-tight text-brand-cyan">404</p>
      <h1 className="text-lg font-bold text-brand-light">Esta página no existe</h1>
      <p className="max-w-sm text-xs text-brand-muted">
        El enlace puede estar roto o la dirección mal escrita.
      </p>
      <Link
        to="/"
        className="rounded bg-brand-cyan px-4 py-2 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
