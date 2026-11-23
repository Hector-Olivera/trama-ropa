import { RepeatableList } from '../RepeatableList'
import { SectionCard, TextField } from '../fields'
import { newId } from '../../lib/id'
import { useSection } from './useSection'
import type { PanelProps } from './types'

export function FooterPanel({ draft, update }: PanelProps) {
  const setFooter = useSection(update, 'footer')

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <SectionCard
        title="Pie de página"
        description="Frase y links del pie."
        className="xl:col-span-12"
        contentClassName="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
      >
        <TextField
          label="Frase"
          value={draft.footer.tagline}
          onChange={(tagline) => setFooter({ tagline })}
        />
        <RepeatableList
          items={draft.footer.links}
          onChange={(links) => setFooter({ links })}
          create={() => ({ id: newId(), href: '#', label: 'Nuevo link' })}
          label={(item) => item.label || 'Link'}
          addLabel="Agregar link"
          itemsClassName="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
          itemClassName="p-2.5"
          render={(item, updateItem) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <TextField label="Texto" value={item.label} onChange={(label) => updateItem({ label })} />
              <TextField label="Destino" value={item.href} onChange={(href) => updateItem({ href })} />
            </div>
          )}
        />
      </SectionCard>
    </div>
  )
}
