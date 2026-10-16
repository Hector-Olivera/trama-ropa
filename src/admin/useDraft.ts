import { useCallback, useMemo, useState } from 'react'
import { useContent } from '../content/ContentProvider'
import { DEFAULT_CONTENT } from '../content/defaults'
import { cleanupMedia } from '../content/store'
import type { SiteContent } from '../content/types'

/**
 * Trabaja sobre una copia (draft) del contenido. Los cambios no se persisten
 * hasta `commit()`. `dirty` indica si hay cambios sin guardar.
 */
export function useDraft() {
  const { content, save, reset } = useContent()
  const [draft, setDraft] = useState<SiteContent>(content)

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(content),
    [draft, content],
  )

  const update = useCallback((mutate: (current: SiteContent) => SiteContent) => {
    setDraft((current) => mutate(current))
  }, [])

  const commit = useCallback(async () => {
    await save(draft)
    void cleanupMedia()
  }, [save, draft])

  const discard = useCallback(() => {
    setDraft(content)
    void cleanupMedia()
  }, [content])

  const resetAll = useCallback(async () => {
    await reset()
    setDraft(DEFAULT_CONTENT)
    void cleanupMedia()
  }, [reset])

  return { draft, dirty, update, commit, discard, resetAll }
}
