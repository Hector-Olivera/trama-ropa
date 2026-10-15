import { CheckboxField, TextField } from './fields'
import type { RichTitle } from '../content/types'

/** Editor de un titulo de seccion (parte normal + parte resaltada + opcional). */
export function RichTitleField({
  label,
  value,
  onChange,
}: {
  label: string
  value: RichTitle
  onChange: (value: RichTitle) => void
}) {
  const patch = (partial: Partial<RichTitle>) => onChange({ ...value, ...partial })

  return (
    <div className="space-y-2 rounded border border-brand-line bg-brand-black/40 p-3">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <TextField label="Antes" value={value.before} onChange={(v) => patch({ before: v })} />
      <TextField
        label="Resaltado (en degradé)"
        value={value.highlight}
        onChange={(v) => patch({ highlight: v })}
      />
      <TextField
        label="Después (opcional)"
        value={value.after ?? ''}
        onChange={(v) => patch({ after: v || undefined })}
      />
      <CheckboxField
        label="Salto de línea antes del resaltado"
        checked={value.breakBefore ?? false}
        onChange={(checked) => patch({ breakBefore: checked || undefined })}
      />
    </div>
  )
}
