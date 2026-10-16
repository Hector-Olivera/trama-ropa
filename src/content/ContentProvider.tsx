import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_CONTENT } from './defaults'
import { loadContent, resetContent, saveContent } from './store'
import type { SiteContent } from './types'

type ContentContextValue = {
  content: SiteContent
  /** Persiste y aplica. Reemplaza el contenido entero (el dashboard manda el draft completo). */
  save: (next: SiteContent) => Promise<void>
  /** Vuelve a los defaults y borra lo guardado. */
  reset: () => Promise<void>
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; content: SiteContent }
  | { status: 'error' }

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    loadContent()
      .then((content) => {
        if (active) setState({ status: 'ready', content })
      })
      .catch((error: unknown) => {
        console.error('No se pudo cargar el contenido:', error)
        if (active) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [attempt])

  const save = useCallback(async (next: SiteContent) => {
    await saveContent(next)
    setState({ status: 'ready', content: next })
  }, [])

  const reset = useCallback(async () => {
    await resetContent()
    setState({ status: 'ready', content: DEFAULT_CONTENT })
  }, [])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }, [])

  const content = state.status === 'ready' ? state.content : DEFAULT_CONTENT
  const value = useMemo(() => ({ content, save, reset }), [content, save, reset])

  if (state.status === 'loading') return <ContentSplash />
  if (state.status === 'error') return <ContentError onRetry={retry} />

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentContextValue {
  const value = useContext(ContentContext)
  if (!value) throw new Error('useContent debe usarse dentro de <ContentProvider>.')
  return value
}

function ContentSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-cyan">Cargando...</p>
    </div>
  )
}

function ContentError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-brand-black px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-pink">
        No se pudo cargar el sitio
      </p>
      <p className="max-w-md text-xs text-brand-muted">
        Revisá tu conexión e intentá de nuevo.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded bg-brand-cyan px-4 py-2 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
      >
        Reintentar
      </button>
    </div>
  )
}
