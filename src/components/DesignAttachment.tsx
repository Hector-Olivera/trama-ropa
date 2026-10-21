import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { uploadDesign } from '../lib/designUpload'

export type Attachment = { url: string; previewUrl: string }

export type AttachmentStatus = 'idle' | 'rendering' | 'uploading' | 'ready' | 'error'

export type DesignAttachmentValue = {
  status: AttachmentStatus
  attachment: Attachment | null
  error: string | null
  /** Renderiza el diseño (la provee el editor) y lo deja subido con su enlace. */
  attach: (render: () => Promise<Blob>) => Promise<void>
  clear: () => void
}

/** Exportado para que los tests puedan inyectar un estado listo sin subir a Supabase. */
export const DesignAttachmentContext = createContext<DesignAttachmentValue | null>(null)

export function DesignAttachmentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AttachmentStatus>('idle')
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  const clear = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setAttachment(null)
    setError(null)
    setStatus('idle')
  }, [])

  const attach = useCallback(async (render: () => Promise<Blob>) => {
    setStatus('rendering')
    setError(null)
    try {
      const blob = await render()
      setStatus('uploading')
      const url = await uploadDesign(blob)

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      const previewUrl = URL.createObjectURL(blob)
      previewUrlRef.current = previewUrl

      setAttachment({ url, previewUrl })
      setStatus('ready')
    } catch (cause) {
      console.error('No se pudo adjuntar el diseño:', cause)
      setAttachment(null)
      setError('No se pudo preparar el diseño para el mail. Probá de nuevo.')
      setStatus('error')
    }
  }, [])

  const value = useMemo(
    () => ({ status, attachment, error, attach, clear }),
    [status, attachment, error, attach, clear],
  )

  return <DesignAttachmentContext.Provider value={value}>{children}</DesignAttachmentContext.Provider>
}

export function useDesignAttachment(): DesignAttachmentValue {
  const value = useContext(DesignAttachmentContext)
  if (!value) throw new Error('useDesignAttachment debe usarse dentro de <DesignAttachmentProvider>.')
  return value
}
