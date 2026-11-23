import { SectionCard, TextAreaField, TextField } from '../fields'
import { RichTitleField } from '../RichTitleField'
import { useSection, useSectionField } from './useSection'
import type { PanelProps } from './types'

export function ContactPanel({ draft, update }: PanelProps) {
  const setContact = useSection(update, 'contact')
  const setWhatsapp = useSectionField(update, 'contact', 'whatsapp')
  const setEmail = useSectionField(update, 'contact', 'email')

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <SectionCard
        title="Encabezado"
        description="Textos de la sección de contacto."
        className="xl:col-span-6"
      >
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
          rows={2}
        />
      </SectionCard>

      <SectionCard
        title="Formulario"
        description="Título y nota al pie del formulario."
        className="xl:col-span-6"
      >
        <TextField
          label="Título del formulario"
          value={draft.contact.formTitle}
          onChange={(formTitle) => setContact({ formTitle })}
        />
        <TextAreaField
          label="Nota al pie"
          value={draft.contact.formNote}
          onChange={(formNote) => setContact({ formNote })}
          rows={2}
        />
      </SectionCard>

      <SectionCard
        title="WhatsApp"
        description="Botón y número."
        className="xl:col-span-6"
        contentClassName="grid gap-3 xl:grid-cols-3"
      >
        <TextField
          label="Etiqueta"
          value={draft.contact.whatsapp.label}
          onChange={(label) => setWhatsapp({ label })}
        />
        <TextField
          label="Número visible"
          value={draft.contact.whatsapp.display}
          onChange={(display) => setWhatsapp({ display })}
        />
        <TextField
          label="Link"
          value={draft.contact.whatsapp.href}
          onChange={(href) => setWhatsapp({ href })}
          hint="Ej: https://wa.me/5491123456789"
        />
      </SectionCard>

      <SectionCard
        title="Email"
        description="Botón y dirección."
        className="xl:col-span-6"
        contentClassName="grid gap-3 xl:grid-cols-3"
      >
        <TextField
          label="Etiqueta"
          value={draft.contact.email.label}
          onChange={(label) => setEmail({ label })}
        />
        <TextField
          label="Dirección visible"
          value={draft.contact.email.value}
          onChange={(value) => setEmail({ value })}
        />
        <TextField
          label="Link"
          value={draft.contact.email.href}
          onChange={(href) => setEmail({ href })}
          hint="Ej: mailto:hola@tramaropa.com.ar"
        />
      </SectionCard>
    </div>
  )
}
