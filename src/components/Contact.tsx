import { useContent } from '../content/ContentProvider'
import { CONTACT_ACCESS_KEY } from '../lib/env'
import { RichTitle } from './RichTitle'
import { useDesignAttachment } from './DesignAttachment'
import { useEffect, useRef, useState } from 'react'

const TOAST_DURATION = 4000

export function Contact() {
  const { content } = useContent()
  const { attachments, remove, clear, status: attachStatus, error: attachError } = useDesignAttachment()
  const { contact } = content
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState(false)
  const toastTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    if (!CONTACT_ACCESS_KEY) {
      setErr('El formulario no está configurado. Probá de nuevo o escribinos por WhatsApp.')
      return
    }
    setSending(true)
    setErr(null)
    setToast(false)
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current)
      toastTimer.current = null
    }

    try {
      const formData = new FormData(event.currentTarget)
      const payload = Object.fromEntries(formData.entries())
      if (attachments.length > 0) {
        const links = attachments
          .map((attachment, index) => `Mi diseño ${index + 1}: ${attachment.url}`)
          .join('\n')
        payload.message = `${String(payload.message ?? '')}\n\n${links}`
      }
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setName('')
        setEmail('')
        setMessage('')
        setErr(null)
        clear()
        setToast(true)
        toastTimer.current = window.setTimeout(() => {
          setToast(false)
          toastTimer.current = null
        }, TOAST_DURATION)
      } else {
        setErr(data.message || 'No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.')
      }
    } catch {
      setErr('No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.')
    } finally {
      setSending(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email.value)
    } catch {
      // Clipboard no disponible (permisos o contexto no seguro).
    }
  }

  return (
    <section
      id="contacto"
      className="relative scroll-mt-20 overflow-hidden border-t border-brand-line py-10 md:py-16"
    >
      <div className="trama-glow-pink -right-56 -bottom-40" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-cyan">
            {contact.eyebrow}
          </p>
          <h2 className="font-display text-3xl uppercase leading-tight tracking-tight sm:text-4xl">
            <RichTitle value={contact.title} />
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-muted">{contact.body}</p>

          <div className="mt-8 space-y-3">
            <a
              href={contact.whatsapp.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border border-brand-line bg-brand-surface p-4 transition hover:border-brand-cyan"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/15 text-brand-cyan">
                ✆
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide">
                  {contact.whatsapp.label}
                </span>
                <span className="block text-sm text-brand-muted">
                  {contact.whatsapp.display}
                </span>
              </span>
            </a>

            <div className="flex items-center gap-2 rounded-lg border border-brand-line bg-brand-surface p-4">
              <a
                href={contact.email.href}
                className="flex flex-1 items-center gap-3 transition hover:text-brand-cyan"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/15 text-brand-cyan">
                  @
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wide">
                    {contact.email.label}
                  </span>
                  <span className="block text-sm text-brand-muted">{contact.email.value}</span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="rounded border border-brand-line px-2 py-1 text-[10px] uppercase tracking-wider text-brand-muted transition hover:text-brand-cyan"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border border-brand-line bg-brand-surface p-5"
        >
          <h3 className="text-sm font-bold uppercase tracking-wide">{contact.formTitle}</h3>

          <input type="hidden" name="access_key" value={CONTACT_ACCESS_KEY} />
          <input type="hidden" name="subject" value="Consulta desde Trama" />
          <input type="hidden" name="from_name" value="Trama" />
          <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

          <div>
            <label
              htmlFor="nombre"
              className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted"
            >
              Nombre
            </label>
            <input
              id="nombre"
              name="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded border border-brand-line bg-brand-black px-3 py-2 text-sm text-brand-light outline-none placeholder:text-brand-muted/60 focus:border-brand-cyan"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded border border-brand-line bg-brand-black px-3 py-2 text-sm text-brand-light outline-none placeholder:text-brand-muted/60 focus:border-brand-cyan"
            />
          </div>

          <div>
            <label
              htmlFor="mensaje"
              className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted"
            >
              ¿Qué necesitás?
            </label>
            <textarea
              id="mensaje"
              name="message"
              required
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="20 remeras negras con el logo del club..."
              className="w-full resize-none rounded border border-brand-line bg-brand-black px-3 py-2 text-sm text-brand-light outline-none placeholder:text-brand-muted/60 focus:border-brand-cyan"
            />
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={attachment.url}
                  className="flex items-center gap-3 rounded border border-brand-line bg-brand-black/40 p-2"
                >
                  <img
                    src={attachment.previewUrl}
                    alt={`Vista previa del diseño ${index + 1}`}
                    className="h-11 w-11 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-brand-light">
                      Diseño adjunto {attachments.length > 1 ? index + 1 : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Quitar el diseño adjunto"
                    className="rounded border border-brand-line px-2 py-1 text-[10px] uppercase tracking-wider text-brand-muted transition hover:border-brand-pink hover:text-brand-pink"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-md bg-brand-cyan px-4 py-2.5 text-sm font-bold text-brand-black transition hover:bg-brand-pink hover:text-white disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Enviar consulta'}
          </button>

          {err && (
            <p role="alert" className="text-[11px] text-brand-pink">
              {err}
            </p>
          )}
          {attachStatus === 'error' && attachError && (
            <p role="alert" className="text-[11px] text-brand-pink">
              {attachError}
            </p>
          )}

          <p className="text-[11px] text-brand-muted">{contact.formNote}</p>
        </form>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-brand-cyan/70 bg-brand-black/95 px-4 py-3 shadow-lg sm:bottom-6"
        >
          <p className="text-sm font-bold text-brand-cyan">Mensaje Enviado</p>
          <p className="mt-1 text-xs text-brand-muted">Nos comunicaremos a la brevedad</p>
        </div>
      )}
    </section>
  )
}
