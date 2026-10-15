import { useContent } from '../content/ContentProvider'
import { RichTitle } from './RichTitle'

export function Contact() {
  const { content } = useContent()
  const { contact } = content

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

            <a
              href={contact.email.href}
              className="flex items-center gap-3 rounded-lg border border-brand-line bg-brand-surface p-4 transition hover:border-brand-cyan"
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
          </div>
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-3 rounded-lg border border-brand-line bg-brand-surface p-5"
        >
          <h3 className="text-sm font-bold uppercase tracking-wide">{contact.formTitle}</h3>

          <Field label="Nombre" id="nombre" type="text" placeholder="Tu nombre" />
          <Field label="Email" id="email" type="email" placeholder="tu@email.com" />
          <Field
            label="¿Qué necesitás?"
            id="mensaje"
            type="textarea"
            placeholder="20 remeras negras con el logo del club..."
          />

          <button
            type="submit"
            className="w-full rounded-md bg-brand-cyan px-4 py-2.5 text-sm font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
          >
            Enviar consulta
          </button>

          <p className="text-[11px] text-brand-muted">{contact.formNote}</p>
        </form>
      </div>
    </section>
  )
}

function Field({
  label,
  id,
  type,
  placeholder,
}: {
  label: string
  id: string
  type: 'text' | 'email' | 'textarea'
  placeholder: string
}) {
  const shared =
    'w-full rounded border border-brand-line bg-brand-black px-3 py-2 text-sm text-brand-light outline-none placeholder:text-brand-muted/60 focus:border-brand-cyan'

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted"
      >
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea id={id} rows={4} placeholder={placeholder} className={`${shared} resize-none`} />
      ) : (
        <input id={id} type={type} placeholder={placeholder} className={shared} />
      )}
    </div>
  )
}
