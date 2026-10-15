import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEFAULT_CONTENT } from './defaults'
import { loadContent, resetContent, saveContent } from './store'
import type { SiteContent } from './types'

type ContentContextValue = {
  content: SiteContent
  /** Persiste y aplica. Reemplaza el contenido entero (el dashboard manda el draft completo). */
  save: (next: SiteContent) => void
  /** Vuelve a los defaults y borra lo guardado. */
  reset: () => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: React.ReactNode }) {
  // Lazy init: el contenido se lee sincronicamente del localStorage en el
  // primer render, asi no hay flash de defaults ni estado de carga.
  const [content, setContent] = useState<SiteContent>(() => loadContent())

  const save = useCallback((next: SiteContent) => {
    saveContent(next)
    setContent(next)
  }, [])

  const reset = useCallback(() => {
    resetContent()
    setContent(DEFAULT_CONTENT)
  }, [])

  const value = useMemo(() => ({ content, save, reset }), [content, save, reset])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentContextValue {
  const value = useContext(ContentContext)
  if (!value) throw new Error('useContent debe usarse dentro de <ContentProvider>.')
  return value
}
