import { useState } from 'react'
import { DEFAULT_PASSWORD } from './useAuth'

type Props = {
  onSubmit: (password: string) => Promise<boolean>
  hasCustomPassword: boolean
}

export function Login({ onSubmit, hasCustomPassword }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const ok = await onSubmit(password)
    setBusy(false)
    if (!ok) {
      setError('Contraseña incorrecta.')
      setPassword('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-brand-line bg-brand-surface p-6"
      >
        <header>
          <h1 className="font-display text-xl uppercase tracking-tight">Panel de Trama</h1>
          <p className="mt-1 text-xs text-brand-muted">Ingresá para administrar el sitio.</p>
        </header>

        <div>
          <label
            htmlFor="admin-password"
            className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted"
          >
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-brand-line bg-brand-black px-3 py-2 text-sm text-brand-light outline-none focus:border-brand-cyan"
          />
        </div>

        {error && (
          <p role="alert" className="text-[11px] text-brand-pink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-brand-cyan px-4 py-2.5 text-sm font-bold text-brand-black transition hover:bg-brand-pink hover:text-white disabled:opacity-50"
        >
          {busy ? 'Entrando...' : 'Entrar'}
        </button>

        {!hasCustomPassword && (
          <p className="text-[11px] leading-snug text-brand-muted">
            Primera vez: la contraseña por defecto es{' '}
            <code className="rounded bg-brand-black px-1 py-0.5 text-brand-cyan">
              {DEFAULT_PASSWORD}
            </code>
            . Cambiala desde el panel apenas entres.
          </p>
        )}
      </form>
    </div>
  )
}
