import type { ReactNode } from 'react'

/**
 * Campos de formulario reutilizables del panel. Todos controlados: reciben
 * `value` y llaman `onChange`, sin estado interno, para que el draft mande.
 */

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-brand-line bg-brand-surface p-4">
      <header className="mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-cyan">{title}</h3>
        {description && <p className="mt-1 text-[11px] text-brand-muted">{description}</p>}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

const inputClass =
  'w-full rounded border border-brand-line bg-brand-black px-2.5 py-1.5 text-sm text-brand-light outline-none placeholder:text-brand-muted/60 focus:border-brand-cyan'

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'url' | 'email'
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      {hint && <span className="mt-1 block text-[10px] text-brand-muted">{hint}</span>}
    </label>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} resize-none`}
      />
    </label>
  )
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-brand-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-brand-cyan"
      />
      {label}
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
