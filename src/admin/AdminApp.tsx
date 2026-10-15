import { useState } from 'react'
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useOutletContext,
} from 'react-router-dom'
import { Login } from './Login'
import { AdminNotFound } from './AdminNotFound'
import { useAuth } from './useAuth'
import { useDraft } from './useDraft'
import { BrandNavPanel } from './panels/BrandNavPanel'
import { CatalogPanel } from './panels/CatalogPanel'
import { ContactPanel } from './panels/ContactPanel'
import { EditorPanel } from './panels/EditorPanel'
import { FooterPanel } from './panels/FooterPanel'
import { HeroPanel } from './panels/HeroPanel'
import { HowItWorksPanel } from './panels/HowItWorksPanel'
import type { PanelProps } from './panels/types'
import { SectionBoundary } from '../components/SectionBoundary'

type PanelEntry = {
  slug: string
  label: string
  Panel: (props: PanelProps) => React.ReactElement
}

const PANELS: PanelEntry[] = [
  { slug: 'marca', label: 'Marca y menú', Panel: BrandNavPanel },
  { slug: 'inicio', label: 'Inicio', Panel: HeroPanel },
  { slug: 'editor', label: 'Editor', Panel: EditorPanel },
  { slug: 'catalogo', label: 'Catálogo', Panel: CatalogPanel },
  { slug: 'como-funciona', label: 'Cómo funciona', Panel: HowItWorksPanel },
  { slug: 'contacto', label: 'Contacto', Panel: ContactPanel },
  { slug: 'pie', label: 'Pie', Panel: FooterPanel },
]

const DEFAULT_SLUG = PANELS[0].slug

type DashboardContext = PanelProps & {
  onChangePassword: (current: string, next: string) => Promise<boolean>
  onLogout: () => void
  resetAll: () => void
}

export function AdminApp() {
  const { isAuthed, login, logout, changePassword, hasCustomPassword } = useAuth()

  if (!isAuthed) {
    return <Login onSubmit={login} hasCustomPassword={hasCustomPassword} />
  }

  return (
    <Routes>
      <Route
        element={<Dashboard onLogout={logout} onChangePassword={changePassword} />}
      >
        <Route index element={<Navigate to={DEFAULT_SLUG} replace />} />
        {PANELS.map((entry) => (
          <Route
            key={entry.slug}
            path={entry.slug}
            element={<PanelRoute Panel={entry.Panel} />}
          />
        ))}
        <Route path="seguridad" element={<SecurityPanel />} />
        <Route
          path="*"
          element={<AdminNotFound to={`/admin/${DEFAULT_SLUG}`} />}
        />
      </Route>
    </Routes>
  )
}

function PanelRoute({ Panel }: { Panel: (props: PanelProps) => React.ReactElement }) {
  const { draft, update } = useOutletContext<DashboardContext>()
  return <Panel draft={draft} update={update} />
}

function Dashboard({
  onLogout,
  onChangePassword,
}: {
  onLogout: () => void
  onChangePassword: (current: string, next: string) => Promise<boolean>
}) {
  const { draft, dirty, update, commit, discard, resetAll } = useDraft()
  const [saved, setSaved] = useState(false)
  const location = useLocation()

  const handleSave = () => {
    commit()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const handleDiscard = () => {
    if (dirty && !window.confirm('¿Descartar los cambios sin guardar?')) return
    discard()
  }

  const handleLogout = () => {
    if (dirty && !window.confirm('Tenés cambios sin guardar. ¿Salir igual?')) return
    onLogout()
  }

  const context: DashboardContext = { draft, update, onChangePassword, onLogout: handleLogout, resetAll }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-brand-line bg-brand-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <h1 className="mr-2 text-sm font-bold uppercase tracking-widest text-brand-cyan">
            Panel Trama
          </h1>
          <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[10px] text-brand-muted">
            {dirty ? 'Cambios sin guardar' : saved ? 'Guardado' : 'Sin cambios'}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="rounded border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-muted transition hover:border-brand-cyan hover:text-brand-cyan"
            >
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!dirty}
              className="rounded border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-muted transition hover:text-brand-light disabled:opacity-40"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="rounded bg-brand-cyan px-3 py-1.5 text-[11px] font-bold text-brand-black transition hover:bg-brand-pink hover:text-white disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {PANELS.map((entry) => (
            <NavLink
              key={entry.slug}
              to={`/admin/${entry.slug}`}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-t px-3 py-1.5 text-[11px] font-semibold transition ${
                  isActive ? 'bg-brand-surface text-brand-cyan' : 'text-brand-muted hover:text-brand-light'
                }`
              }
            >
              {entry.label}
            </NavLink>
          ))}
          <NavLink
            to="/admin/seguridad"
            className={({ isActive }) =>
              `ml-auto whitespace-nowrap rounded-t px-3 py-1.5 text-[11px] font-semibold transition ${
                isActive ? 'bg-brand-surface text-brand-cyan' : 'text-brand-muted hover:text-brand-light'
              }`
            }
          >
            Seguridad
          </NavLink>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <SectionBoundary key={location.pathname}>
          <Outlet context={context} />
        </SectionBoundary>
      </main>
    </div>
  )
}

function SecurityPanel() {
  const { onChangePassword, onLogout, resetAll } = useOutletContext<DashboardContext>()

  const handleReset = () => {
    if (
      !window.confirm('¿Restaurar TODO el contenido a los valores originales? No se puede deshacer.')
    )
      return
    resetAll()
  }

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-lg border border-brand-line bg-brand-surface p-4">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
          Seguridad
        </h2>
        <ChangePasswordForm onChangePassword={onChangePassword} onLogout={onLogout} />
      </section>

      <section className="space-y-3 rounded-lg border border-brand-line bg-brand-surface p-4">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
          Contenido
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] font-semibold text-brand-muted transition hover:text-brand-pink"
        >
          Restaurar todo el contenido original
        </button>
      </section>
    </div>
  )
}

function ChangePasswordForm({
  onChangePassword,
  onLogout,
}: {
  onChangePassword: (current: string, next: string) => Promise<boolean>
  onLogout: () => void
}) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (next.length < 4) {
      setMessage({ ok: false, text: 'La nueva contraseña debe tener al menos 4 caracteres.' })
      return
    }
    if (next !== confirm) {
      setMessage({ ok: false, text: 'Las contraseñas no coinciden.' })
      return
    }
    const ok = await onChangePassword(current, next)
    if (!ok) {
      setMessage({ ok: false, text: 'La contraseña actual es incorrecta.' })
      return
    }
    setCurrent('')
    setNext('')
    setConfirm('')
    setMessage({ ok: true, text: 'Contraseña actualizada.' })
  }

  const inputClass =
    'w-full rounded border border-brand-line bg-brand-black px-2.5 py-1.5 text-sm text-brand-light outline-none focus:border-brand-cyan'

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="password"
          placeholder="Contraseña actual"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Repetir nueva"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={inputClass}
        />
      </div>
      {message && (
        <p
          role="alert"
          className={`text-[11px] ${message.ok ? 'text-brand-cyan' : 'text-brand-pink'}`}
        >
          {message.text}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded border border-brand-line px-3 py-1.5 text-[11px] font-semibold text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan"
        >
          Cambiar contraseña
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded border border-brand-line px-3 py-1.5 text-[11px] font-semibold text-brand-muted transition hover:border-brand-pink hover:text-brand-pink"
        >
          Cerrar sesión
        </button>
      </div>
    </form>
  )
}
