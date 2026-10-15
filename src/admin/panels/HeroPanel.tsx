import { ImageListField } from '../ImageField'
import { RepeatableList } from '../RepeatableList'
import { CheckboxField, SectionCard, TextAreaField, TextField } from '../fields'
import type { PanelProps } from './types'

export function HeroPanel({ draft, update }: PanelProps) {
  const setHero = (patch: Partial<(typeof draft)['hero']>) =>
    update((d) => ({ ...d, hero: { ...d.hero, ...patch } }))

  return (
    <div className="space-y-4">
      <SectionCard title="Texto del inicio" description="Lo primero que se ve al entrar.">
        <TextField
          label="Antetítulo"
          value={draft.hero.eyebrow}
          onChange={(eyebrow) => setHero({ eyebrow })}
        />
        <TextAreaField
          label="Subtítulo"
          value={draft.hero.subtitle}
          onChange={(subtitle) => setHero({ subtitle })}
        />
      </SectionCard>

      <SectionCard
        title="Título"
        description="Una entrada por línea. Marcá las que van resaltadas en cyan."
      >
        <RepeatableList<{ text: string; highlight?: boolean }>
          items={draft.hero.titleLines}
          onChange={(titleLines) => setHero({ titleLines })}
          create={() => ({ text: 'Nueva línea' })}
          label={(item) => item.text || 'Línea'}
          addLabel="Agregar línea"
          render={(item, updateItem) => (
            <>
              <TextField label="Texto" value={item.text} onChange={(text) => updateItem({ text })} />
              <CheckboxField
                label="Resaltar esta línea"
                checked={item.highlight ?? false}
                onChange={(highlight) => updateItem({ highlight: highlight || undefined })}
              />
            </>
          )}
        />
      </SectionCard>

      <SectionCard title="Botones" description="Los dos llamados a la acción del inicio.">
        <TextField
          label="Botón principal"
          value={draft.hero.primary.label}
          onChange={(label) => setHero({ primary: { ...draft.hero.primary, label } })}
        />
        <TextField
          label="Destino del principal"
          value={draft.hero.primary.href}
          onChange={(href) => setHero({ primary: { ...draft.hero.primary, href } })}
        />
        <TextField
          label="Botón secundario"
          value={draft.hero.secondary.label}
          onChange={(label) => setHero({ secondary: { ...draft.hero.secondary, label } })}
        />
        <TextField
          label="Destino del secundario"
          value={draft.hero.secondary.href}
          onChange={(href) => setHero({ secondary: { ...draft.hero.secondary, href } })}
        />
      </SectionCard>

      <SectionCard title="Estadísticas" description="Los tres números bajo los botones.">
        <RepeatableList
          items={draft.hero.stats}
          onChange={(stats) => setHero({ stats })}
          create={() => ({ value: '0', label: 'Nueva' })}
          label={(item) => `${item.value} · ${item.label}`}
          addLabel="Agregar estadística"
          render={(item, updateItem) => (
            <>
              <TextField label="Valor" value={item.value} onChange={(value) => updateItem({ value })} />
              <TextField label="Etiqueta" value={item.label} onChange={(label) => updateItem({ label })} />
            </>
          )}
        />
      </SectionCard>

      <SectionCard title="Imágenes" description="Las 4 fotos que acompañan al slogan.">
        <ImageListField
          label="Galería del inicio"
          images={draft.hero.images}
          onChange={(images) => setHero({ images })}
        />
      </SectionCard>
    </div>
  )
}
