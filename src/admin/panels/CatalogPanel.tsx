import { ImageField } from '../ImageField'
import { RepeatableList } from '../RepeatableList'
import { SectionCard, SelectField, TextField } from '../fields'
import { RichTitleField } from '../RichTitleField'
import { useSection } from './useSection'
import type { PanelProps } from './types'

export function CatalogPanel({ draft, update }: PanelProps) {
  const groups = draft.catalog.groups

  const setCatalog = useSection(update, 'catalog')

  const groupOptions = groups.map((group) => ({ value: group.id, label: group.label }))

  return (
    <div className="space-y-4">
      <SectionCard title="Encabezado" description="Textos de la sección catálogo.">
        <TextField
          label="Antetítulo"
          value={draft.catalog.eyebrow}
          onChange={(eyebrow) => setCatalog({ eyebrow })}
        />
        <RichTitleField
          label="Título"
          value={draft.catalog.title}
          onChange={(title) => setCatalog({ title })}
        />
      </SectionCard>

      <SectionCard
        title="Categorías"
        description="Agrupan las prendas y arman los filtros. Si renombrás el id, revisá los items."
      >
        <RepeatableList
          items={groups}
          onChange={(next) => setCatalog({ groups: next })}
          create={() => ({ id: `grupo-${groups.length + 1}`, label: 'Nueva categoría' })}
          label={(item) => item.label || 'Categoría'}
          addLabel="Agregar categoría"
          render={(item, updateItem) => (
            <>
              <TextField label="Nombre" value={item.label} onChange={(label) => updateItem({ label })} />
              <TextField label="Id" value={item.id} onChange={(id) => updateItem({ id })} />
            </>
          )}
        />
      </SectionCard>

      <SectionCard title="Prendas" description="Las fotos del catálogo. Agregá, quitá y reordená.">
        <RepeatableList
          items={draft.catalog.items}
          onChange={(items) => setCatalog({ items })}
          create={() => ({
            id: crypto.randomUUID(),
            group: groups[0]?.id ?? '',
            label: 'Nueva prenda',
            src: '',
          })}
          label={(item) => item.label || 'Prenda'}
          addLabel="Agregar prenda"
          render={(item, updateItem) => (
            <>
              <ImageField
                label="Imagen"
                value={item.src}
                previewClassName="h-20 w-16"
                onChange={(src) => updateItem({ src })}
              />
              <TextField label="Nombre" value={item.label} onChange={(label) => updateItem({ label })} />
              <SelectField
                label="Categoría"
                value={item.group}
                onChange={(group) => updateItem({ group })}
                options={groupOptions}
              />
            </>
          )}
        />
      </SectionCard>
    </div>
  )
}
