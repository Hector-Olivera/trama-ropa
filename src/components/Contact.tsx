import { useContent } from '../content/ContentProvider'
import { RichTitle } from './RichTitle'
import { useState } from 'react'

export function Contact() {
  const { content } = useContent()
  const { contact } = content
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const accessKey = import.meta.env.VITE_CONTACT_ACCESS_KEY

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending || sent) return
    setSending(true)
    setErr(null)

    try {
      const formData = new FormData(event.currentTarget)
      const payload = Object.fromEntries(formData.entries())
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        setName('')
        setEmail('')
        setMessage('')
        setErr(null)
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
      className="relative scroll-mt-20 overflow-hidden border-t border-brand-line py-16"
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

          <input type="hidden" name="access_key" value={accessKey} />
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

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-md bg-brand-cyan px-4 py-2.5 text-sm font-bold text-brand-black transition hover:bg-brand-pink hover:text-white disabled:opacity-50"
          >
            {sending ? 'Enviando...' : sent ? 'Enviado' : 'Enviar consulta'}
          </button>

          {sent && (
            <p role="alert" className="text-[11px] text-brand-cyan">
              ¡Gracias! Te vamos a responder a la brevedad.
            </p>
          )}
          {err && (
            <p role="alert" className="text-[11px] text-brand-pink">
              {err}
            </p>
          )}

          <p className="text-[11px] text-brand-muted">{contact.formNote}</p>
        </form>
      </div>
    </section>
  )
}
