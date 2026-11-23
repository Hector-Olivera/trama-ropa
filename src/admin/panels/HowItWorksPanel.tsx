import { ImageListField } from '../ImageField'
import { RepeatableList } from '../RepeatableList'
import { SectionCard, TextAreaField, TextField } from '../fields'
import { RichTitleField } from '../RichTitleField'
import { newId } from '../../lib/id'
import { useSection } from './useSection'
import type { PanelProps } from './types'

export function HowItWorksPanel({ draft, update }: PanelProps) {
  const setHow = useSection(update, 'howItWorks')

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <SectionCard
        title="Encabezado"
        description="Textos de la sección cómo funciona."
        className="xl:col-span-4"
      >
        <TextField
          label="Antetítulo"
          value={draft.howItWorks.eyebrow}
          onChange={(eyebrow) => setHow({ eyebrow })}
        />
        <RichTitleField
          label="Título"
          value={draft.howItWorks.title}
          onChange={(title) => setHow({ title })}
        />
      </SectionCard>

      <SectionCard
        title="Imágenes"
        description="Las fotos al pie de la sección."
        className="xl:col-span-8"
      >
        <ImageListField
          label="Galería"
          images={draft.howItWorks.images}
          onChange={(images) => setHow({ images })}
          gridClassName="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        />
      </SectionCard>

      <SectionCard
        title="Pasos"
        description="Los pasos numerados."
        className="xl:col-span-6"
      >
        <RepeatableList
          items={draft.howItWorks.steps}
          onChange={(steps) => setHow({ steps })}
          create={() => ({ id: newId(), title: 'Nuevo paso', body: 'Descripción del paso.' })}
          label={(item) => item.title || 'Paso'}
          addLabel="Agregar paso"
          itemClassName="p-2.5"
          render={(item, updateItem) => (
            <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <TextField label="Título" value={item.title} onChange={(title) => updateItem({ title })} />
              <TextAreaField
                label="Texto"
                value={item.body}
                onChange={(body) => updateItem({ body })}
                rows={2}
              />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title="Beneficios"
        description="Las tres tarjetas con ícono."
        className="xl:col-span-6"
      >
        <RepeatableList
          items={draft.howItWorks.features}
          onChange={(features) => setHow({ features })}
          create={() => ({ id: newId(), title: 'Nuevo beneficio', body: 'Descripción.' })}
          label={(item) => item.title || 'Beneficio'}
          addLabel="Agregar beneficio"
          itemClassName="p-2.5"
          render={(item, updateItem) => (
            <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <TextField label="Título" value={item.title} onChange={(title) => updateItem({ title })} />
              <TextAreaField
                label="Texto"
                value={item.body}
                onChange={(body) => updateItem({ body })}
                rows={2}
              />
            </div>
          )}
        />
      </SectionCard>
    </div>
  )
}
