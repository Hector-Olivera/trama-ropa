import { useRef, useState } from 'react'
import { isSupportedImageType, prepareLogoFile } from '../../lib/images'
import { putLogoBlob } from '../../lib/storage'

type Props = {
  onAdd: (input: { src: string; naturalWidth: number; naturalHeight: number }) => Promise<void> | void
}

export function LogoUploader({ onAdd }: Props) {
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setBusy(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        if (!isSupportedImageType(file)) {
          throw new Error(`"${file.name}" no es un formato válido. Usá PNG, JPG o WEBP.`)
        }
        const { blob, width, height } = await prepareLogoFile(file)
        // El src que viaja a la capa es la clave persistente, no una object URL.
        await onAdd({ src: await putLogoBlob(blob), naturalWidth: width, naturalHeight: height })
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo subir el archivo.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void handleFiles(event.dataTransfer.files)
        }}
        disabled={busy}
        title="PNG con fondo transparente da el mejor resultado"
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2.5 text-xs font-semibold text-brand-light transition ${
          dragging
            ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
            : 'border-brand-line hover:border-brand-cyan hover:text-brand-cyan'
        } ${busy ? 'cursor-wait opacity-60' : ''}`}
      >
        <span aria-hidden="true">+</span>
        <span>{busy ? 'Procesando...' : 'Subir logo'}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={(event) => void handleFiles(event.target.files)}
        className="hidden"
      />

      {error && (
        <p role="alert" className="mt-2 text-[11px] leading-snug text-brand-pink">
          {error}
        </p>
      )}
    </div>
  )
}