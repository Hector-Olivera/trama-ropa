import { useRef, useState } from 'react'
import { MediaImage } from '../content/MediaImage'
import { uploadMedia } from '../content/store'
import type { MediaRef } from '../content/types'
import { isSupportedImageType, prepareLogoFile } from '../lib/images'

type UploadInfo = { src: MediaRef; width: number; height: number }

type Props = {
  label: string
  value: MediaRef
  onChange: (src: MediaRef) => void
  onRemove?: () => void
  /** Si se pasa, en vez de onChange se entrega tambien el tamaño natural (prendas). */
  onUploaded?: (info: UploadInfo) => void
  /** Relacion de aspecto del preview, ej. "3/4". */
  previewClassName?: string
}

export function ImageField({
  label,
  value,
  onChange,
  onRemove,
  onUploaded,
  previewClassName = 'h-24 w-24',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      if (!isSupportedImageType(file)) {
        throw new Error(`"${file.name}" no es válido. Usá PNG, JPG o WEBP.`)
      }
      const { blob, width, height } = await prepareLogoFile(file)
      const src = await uploadMedia(blob)
      if (onUploaded) onUploaded({ src, width, height })
      else onChange(src)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo subir la imagen.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>

      <div className="flex items-start gap-3">
        <div
          className={`${previewClassName} shrink-0 overflow-hidden rounded border border-brand-line bg-brand-black/60`}
        >
          {value ? (
            <MediaImage src={value} alt={label} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-brand-muted">
              sin imagen
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan disabled:opacity-50"
          >
            {busy ? 'Subiendo...' : value ? 'Reemplazar' : 'Subir'}
          </button>
          {value && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-muted transition hover:border-brand-pink hover:text-brand-pink"
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        className="hidden"
      />

      {error && (
        <p role="alert" className="mt-1.5 text-[11px] text-brand-pink">
          {error}
        </p>
      )}
    </div>
  )
}

/** Lista de imagenes (hero, como funciona) con agregar / quitar / reordenar. */
export function ImageListField({
  label,
  images,
  onChange,
  addLabel = 'Agregar imagen',
}: {
  label: string
  images: MediaRef[]
  onChange: (images: MediaRef[]) => void
  addLabel?: string
}) {
  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    const next = [...images]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>

      <div className="grid gap-2 sm:grid-cols-2">
        {images.map((src, index) => (
          <div key={index} className="rounded border border-brand-line bg-brand-black/40 p-2">
            <ImageField
              label={`Imagen ${index + 1}`}
              value={src}
              previewClassName="h-20 w-20"
              onChange={(next) => onChange(images.map((value, i) => (i === index ? next : value)))}
              onRemove={() => onChange(images.filter((_, i) => i !== index))}
            />
            <div className="mt-2 flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded border border-brand-line px-2 py-0.5 text-[10px] text-brand-muted transition hover:text-brand-light disabled:opacity-30"
              >
                ↑ Subir
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
                className="rounded border border-brand-line px-2 py-0.5 text-[10px] text-brand-muted transition hover:text-brand-light disabled:opacity-30"
              >
                ↓ Bajar
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...images, ''])}
        className="mt-2 w-full rounded border border-dashed border-brand-line px-3 py-2 text-[11px] font-semibold text-brand-muted transition hover:border-brand-cyan hover:text-brand-cyan"
      >
        + {addLabel}
      </button>
    </div>
  )
}
