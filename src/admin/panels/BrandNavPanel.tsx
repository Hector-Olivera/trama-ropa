import { ImageField } from '../ImageField'
import { RepeatableList } from '../RepeatableList'
import { SectionCard, TextField } from '../fields'
import type { PanelProps } from './types'

export function BrandNavPanel({ draft, update }: PanelProps) {
  const setBrand = (patch: Partial<(typeof draft)['brand']>) =>
    update((d) => ({ ...d, brand: { ...d.brand, ...patch } }))

  const setNav = (patch: Partial<(typeof draft)['nav']>) =>
    update((d) => ({ ...d, nav: { ...d.nav, ...patch } }))

  const preview = draft.brand.mark

  return (
    <div className="space-y-4">
      <SectionCard title="Marca" description="Nombre y logo de la barra superior y el pie.">
        <TextField
          label="Nombre"
          value={draft.brand.name}
          onChange={(name) => setBrand({ name })}
        />
        <ImageField
          label="Logo"
          value={preview}
          previewClassName="h-16 w-16"
          onChange={(mark) => setBrand({ mark })}
        />
      </SectionCard>

      <SectionCard title="Navegación" description="Links del menú superior.">
        <RepeatableList
          items={draft.nav.links}
          onChange={(links) => setNav({ links })}
          create={() => ({ href: '#', label: 'Nuevo link' })}
          label={(item) => item.label || 'Link'}
          addLabel="Agregar link"
          render={(item, updateItem) => (
            <>
              <TextField
                label="Texto"
                value={item.label}
                onChange={(label) => updateItem({ label })}
              />
              <TextField
                label="Destino"
                value={item.href}
                onChange={(href) => updateItem({ href })}
                hint="Ej: #editor, #catalogo o https://..."
              />
            </>
          )}
        />
      </SectionCard>

      <SectionCard title="Botón principal" description="El CTA destacado de la barra.">
        <TextField
          label="Texto"
          value={draft.nav.cta.label}
          onChange={(label) => setNav({ cta: { ...draft.nav.cta, label } })}
        />
        <TextField
          label="Destino"
          value={draft.nav.cta.href}
          onChange={(href) => setNav({ cta: { ...draft.nav.cta, href } })}
        />
      </SectionCard>
    </div>
  )
}
