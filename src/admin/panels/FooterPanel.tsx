import { RepeatableList } from '../RepeatableList'
import { SectionCard, TextField } from '../fields'
import type { PanelProps } from './types'

export function FooterPanel({ draft, update }: PanelProps) {
  const setFooter = (patch: Partial<(typeof draft)['footer']>) =>
    update((d) => ({ ...d, footer: { ...d.footer, ...patch } }))

  return (
    <div className="space-y-4">
      <SectionCard title="Pie de página" description="Frase y links del pie.">
        <TextField
          label="Frase"
          value={draft.footer.tagline}
          onChange={(tagline) => setFooter({ tagline })}
        />
        <RepeatableList
          items={draft.footer.links}
          onChange={(links) => setFooter({ links })}
          create={() => ({ href: '#', label: 'Nuevo link' })}
          label={(item) => item.label || 'Link'}
          addLabel="Agregar link"
          render={(item, updateItem) => (
            <>
              <TextField label="Texto" value={item.label} onChange={(label) => updateItem({ label })} />
              <TextField label="Destino" value={item.href} onChange={(href) => updateItem({ href })} />
            </>
          )}
        />
      </SectionCard>
    </div>
  )
}
