import { SectionCard, TextAreaField, TextField } from '../fields'
import { RichTitleField } from '../RichTitleField'
import type { PanelProps } from './types'

export function ContactPanel({ draft, update }: PanelProps) {
  const setContact = (patch: Partial<(typeof draft)['contact']>) =>
    update((d) => ({ ...d, contact: { ...d.contact, ...patch } }))

  return (
    <div className="space-y-4">
      <SectionCard title="Encabezado" description="Textos de la sección de contacto.">
        <TextField
          label="Antetítulo"
          value={draft.contact.eyebrow}
          onChange={(eyebrow) => setContact({ eyebrow })}
        />
        <RichTitleField
          label="Título"
          value={draft.contact.title}
          onChange={(title) => setContact({ title })}
        />
        <TextAreaField
          label="Texto"
          value={draft.contact.body}
          onChange={(body) => setContact({ body })}
        />
      </SectionCard>

      <SectionCard title="WhatsApp" description="Botón y número.">
        <TextField
          label="Etiqueta"
          value={draft.contact.whatsapp.label}
          onChange={(label) => setContact({ whatsapp: { ...draft.contact.whatsapp, label } })}
        />
        <TextField
          label="Número visible"
          value={draft.contact.whatsapp.display}
          onChange={(display) => setContact({ whatsapp: { ...draft.contact.whatsapp, display } })}
        />
        <TextField
          label="Link"
          value={draft.contact.whatsapp.href}
          onChange={(href) => setContact({ whatsapp: { ...draft.contact.whatsapp, href } })}
          hint="Ej: https://wa.me/5491123456789"
        />
      </SectionCard>

      <SectionCard title="Email" description="Botón y dirección.">
        <TextField
          label="Etiqueta"
          value={draft.contact.email.label}
          onChange={(label) => setContact({ email: { ...draft.contact.email, label } })}
        />
        <TextField
          label="Dirección visible"
          value={draft.contact.email.value}
          onChange={(value) => setContact({ email: { ...draft.contact.email, value } })}
        />
        <TextField
          label="Link"
          value={draft.contact.email.href}
          onChange={(href) => setContact({ email: { ...draft.contact.email, href } })}
          hint="Ej: mailto:hola@tramaropa.com.ar"
        />
      </SectionCard>

      <SectionCard title="Formulario" description="Título y nota al pie del formulario.">
        <TextField
          label="Título del formulario"
          value={draft.contact.formTitle}
          onChange={(formTitle) => setContact({ formTitle })}
        />
        <TextAreaField
          label="Nota al pie"
          value={draft.contact.formNote}
          onChange={(formNote) => setContact({ formNote })}
        />
      </SectionCard>
    </div>
  )
}
