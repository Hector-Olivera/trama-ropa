import { ImageListField } from '../ImageField'
import { RepeatableList } from '../RepeatableList'
import { SectionCard, TextAreaField, TextField } from '../fields'
import { RichTitleField } from '../RichTitleField'
import type { PanelProps } from './types'

export function HowItWorksPanel({ draft, update }: PanelProps) {
  const setHow = (patch: Partial<(typeof draft)['howItWorks']>) =>
    update((d) => ({ ...d, howItWorks: { ...d.howItWorks, ...patch } }))

  return (
    <div className="space-y-4">
      <SectionCard title="Encabezado" description="Textos de la sección cómo funciona.">
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

      <SectionCard title="Pasos" description="Los pasos numerados.">
        <RepeatableList
          items={draft.howItWorks.steps}
          onChange={(steps) => setHow({ steps })}
          create={() => ({ title: 'Nuevo paso', body: 'Descripción del paso.' })}
          label={(item) => item.title || 'Paso'}
          addLabel="Agregar paso"
          render={(item, updateItem) => (
            <>
              <TextField label="Título" value={item.title} onChange={(title) => updateItem({ title })} />
              <TextAreaField label="Texto" value={item.body} onChange={(body) => updateItem({ body })} />
            </>
          )}
        />
      </SectionCard>

      <SectionCard title="Beneficios" description="Las tres tarjetas con ícono.">
        <RepeatableList
          items={draft.howItWorks.features}
          onChange={(features) => setHow({ features })}
          create={() => ({ title: 'Nuevo beneficio', body: 'Descripción.' })}
          label={(item) => item.title || 'Beneficio'}
          addLabel="Agregar beneficio"
          render={(item, updateItem) => (
            <>
              <TextField label="Título" value={item.title} onChange={(title) => updateItem({ title })} />
              <TextAreaField label="Texto" value={item.body} onChange={(body) => updateItem({ body })} />
            </>
          )}
        />
      </SectionCard>

      <SectionCard title="Imágenes" description="Las fotos al pie de la sección.">
        <ImageListField
          label="Galería"
          images={draft.howItWorks.images}
          onChange={(images) => setHow({ images })}
        />
      </SectionCard>
    </div>
  )
}
