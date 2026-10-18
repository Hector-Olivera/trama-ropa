import { Link } from 'react-router-dom'

type Props = {
  to: string
}

export function AdminNotFound({ to }: Props) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-5xl uppercase tracking-tight text-brand-pink">404</p>
      <h2 className="text-base font-bold text-brand-light">Ese panel no existe</h2>
      <p className="max-w-sm text-xs text-brand-muted">
        El enlace puede estar roto o la dirección mal escrita.
      </p>
      <Link
        to={to}
        className="rounded bg-brand-cyan px-4 py-2 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
      >
        Ir al panel
      </Link>
    </div>
  )
}
