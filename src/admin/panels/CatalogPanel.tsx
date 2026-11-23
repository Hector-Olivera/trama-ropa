import { useState } from 'react'
import { FilterChip } from '../../components/FilterChip'
import type { CatalogItem } from '../../content/types'
import { ImageField } from '../ImageField'
import { RepeatableList } from '../RepeatableList'
import { SectionCard, SelectField, TextField } from '../fields'
import { RichTitleField } from '../RichTitleField'
import { useSection } from './useSection'
import type { PanelProps } from './types'

const ALL = 'todos'

export function CatalogPanel({ draft, update }: PanelProps) {
  const groups = draft.catalog.groups
  const [activeGroup, setActiveGroup] = useState(ALL)

  const setCatalog = useSection(update, 'catalog')

  const groupOptions = groups.map((group) => ({ value: group.id, label: group.label }))
  const visibleCount =
    activeGroup === ALL
      ? draft.catalog.items.length
      : draft.catalog.items.filter((item) => item.group === activeGroup).length

  const createItem = (): CatalogItem => ({
    id: crypto.randomUUID(),
    group: activeGroup === ALL ? (groups[0]?.id ?? '') : activeGroup,
    label: 'Nueva prenda',
    src: '',
  })

  const addItem = () => setCatalog({ items: [...draft.catalog.items, createItem()] })
  const isItemHidden = (item: CatalogItem) =>
    activeGroup !== ALL && item.group !== activeGroup

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <SectionCard
        title="Encabezado"
        description="Textos de la sección catálogo."
        className="xl:col-span-4"
      >
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
        className="xl:col-span-8"
      >
        <RepeatableList
          items={groups}
          onChange={(next) => setCatalog({ groups: next })}
          create={() => ({ id: `grupo-${groups.length + 1}`, label: 'Nueva categoría' })}
          label={(item) => item.label || 'Categoría'}
          addLabel="Agregar categoría"
          itemsClassName="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
          itemClassName="p-2.5"
          render={(item, updateItem) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <TextField label="Nombre" value={item.label} onChange={(label) => updateItem({ label })} />
              <TextField label="Id" value={item.id} onChange={(id) => updateItem({ id })} />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title="Prendas"
        description="Las fotos del catálogo. Agregá, quitá y reordená."
        className="xl:col-span-12"
        actions={
          <>
            <FilterChip active={activeGroup === ALL} onClick={() => setActiveGroup(ALL)}>
              Todas
            </FilterChip>
            {groups.map((group) => (
              <FilterChip
                key={group.id}
                active={activeGroup === group.id}
                onClick={() => setActiveGroup(group.id)}
              >
                {group.label}
              </FilterChip>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="shrink-0 rounded border border-dashed border-brand-line px-3 py-1.5 text-[11px] font-semibold text-brand-muted transition hover:border-brand-cyan hover:text-brand-cyan"
            >
              + Agregar prenda
            </button>
          </>
        }
      >
        {visibleCount === 0 && (
          <p className="text-[11px] text-brand-muted">No hay prendas en esta categoría.</p>
        )}
        <RepeatableList
          items={draft.catalog.items}
          onChange={(items) => setCatalog({ items })}
          create={createItem}
          label={(item) => item.label || 'Prenda'}
          addLabel="Agregar prenda"
          itemsClassName="grid gap-2 sm:grid-cols-2 xl:grid-cols-5"
          itemClassName="p-2.5"
          isItemHidden={isItemHidden}
          showAddButton={false}
          render={(item, updateItem) => (
            <>
              <ImageField
                label="Imagen"
                value={item.src}
                previewClassName="h-16 w-12"
                onChange={(src) => updateItem({ src })}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Nombre"
                  value={item.label}
                  onChange={(label) => updateItem({ label })}
                />
                <SelectField
                  label="Categoría"
                  value={item.group}
                  onChange={(group) => updateItem({ group })}
                  options={groupOptions}
                />
              </div>
            </>
          )}
        />
      </SectionCard>
    </div>
  )
}
