import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { uploadDesign } from '../lib/designUpload'

export type Attachment = { url: string; previewUrl: string }

export type AttachmentStatus = 'idle' | 'rendering' | 'uploading' | 'ready' | 'error'

export type DesignAttachmentValue = {
  attachments: Attachment[]
  status: AttachmentStatus
  error: string | null
  attach: (render: () => Promise<Blob>) => Promise<void>
  clear: () => void
  remove: (index: number) => void
  count: number
}

export const DesignAttachmentContext = createContext<DesignAttachmentValue | null>(null)

export function DesignAttachmentProvider({ children }: { children: ReactNode }) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [status, setStatus] = useState<AttachmentStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const previewUrlRef = useRef<string[]>([])

  const remove = useCallback((index: number) => {
    setAttachments((current) => {
      const next = [...current]
      const [removed] = next.splice(index, 1)
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl)
        const refIndex = previewUrlRef.current.indexOf(removed.previewUrl)
        if (refIndex >= 0) previewUrlRef.current.splice(refIndex, 1)
      }
      if (next.length === 0) {
        setStatus('idle')
      }
      return next
    })
    setError(null)
  }, [])

  const clear = useCallback(() => {
    for (const url of previewUrlRef.current) {
      URL.revokeObjectURL(url)
    }
    previewUrlRef.current = []
    setAttachments([])
    setError(null)
    setStatus('idle')
  }, [])

  const attach = useCallback(async (render: () => Promise<Blob>) => {
    setStatus((current) => (current === 'idle' ? 'rendering' : current))
    setError(null)
    try {
      const blob = await render()
      setStatus('uploading')
      const url = await uploadDesign(blob)

      const previewUrl = URL.createObjectURL(blob)
      previewUrlRef.current.push(previewUrl)

      setAttachments((current) => {
        if (current.length >= 2) return current
        return [...current, { url, previewUrl }]
      })
      setStatus('ready')
    } catch (cause) {
      console.error('No se pudo adjuntar el diseño:', cause)
      setError('No se pudo preparar el diseño para el mail. Probá de nuevo.')
      setStatus('error')
    }
  }, [])

  const value = useMemo(
    () => ({
      attachments,
      status,
      error,
      attach,
      clear,
      remove,
      count: attachments.length,
    }),
    [attachments, status, error, attach, clear, remove],
  )

  return <DesignAttachmentContext.Provider value={value}>{children}</DesignAttachmentContext.Provider>
}

export function useDesignAttachment(): DesignAttachmentValue {
  const value = useContext(DesignAttachmentContext)
  if (!value) throw new Error('useDesignAttachment debe usarse dentro de <DesignAttachmentProvider>.')
  return value
}
