import { ImageField } from '../ImageField'
import { RepeatableList } from '../RepeatableList'
import { SectionCard, TextAreaField, TextField } from '../fields'
import { RichTitleField } from '../RichTitleField'
import { useSection } from './useSection'
import type { PanelProps } from './types'

export function EditorPanel({ draft, update }: PanelProps) {
  const setEditor = useSection(update, 'editor')

  return (
    <div className="space-y-4">
      <SectionCard title="Textos del editor" description="Encabezado de la sección de personalización.">
        <TextField
          label="Antetítulo"
          value={draft.editor.eyebrow}
          onChange={(eyebrow) => setEditor({ eyebrow })}
        />
        <RichTitleField
          label="Título"
          value={draft.editor.title}
          onChange={(title) => setEditor({ title })}
        />
        <TextAreaField
          label="Subtítulo"
          value={draft.editor.subtitle}
          onChange={(subtitle) => setEditor({ subtitle })}
        />
      </SectionCard>

      <SectionCard
        title="Prendas base"
        description="Las imágenes sobre las que el visitante estampa. Subí un PNG; el tamaño se calcula solo."
      >
        <RepeatableList
          items={draft.editor.products}
          onChange={(products) => setEditor({ products })}
          create={() => ({
            id: crypto.randomUUID(),
            slug: 'nueva-prenda',
            label: 'Nueva prenda',
            src: '',
            width: 1024,
            height: 1024,
          })}
          label={(item) => item.label || 'Prenda'}
          addLabel="Agregar prenda"
          render={(item, updateItem) => (
            <>
              <ImageField
                label="Imagen (PNG)"
                value={item.src}
                previewClassName="h-24 w-20"
                onChange={(src) => updateItem({ src })}
                onUploaded={({ src, width, height }) => updateItem({ src, width, height })}
              />
              <TextField
                label="Nombre"
                value={item.label}
                onChange={(label) => updateItem({ label })}
              />
              <TextField
                label="Slug (para el archivo exportado)"
                value={item.slug}
                onChange={(slug) => updateItem({ slug })}
                hint="Solo minúsculas, números y guiones."
              />
              <p className="text-[10px] text-brand-muted">
                Tamaño: {item.width} × {item.height} px
              </p>
            </>
          )}
        />
      </SectionCard>
    </div>
  )
}
