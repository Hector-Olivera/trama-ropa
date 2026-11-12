import { useEffect, useId, useRef } from 'react'

type Props = {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteToast({ title, description, onConfirm, onCancel }: Props) {
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const cancelCallback = useRef(onCancel)

  useEffect(() => {
    cancelCallback.current = onCancel
  })

  useEffect(() => {
    cancelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancelCallback.current()
        return
      }
      event.stopPropagation()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  return (
    <div
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-brand-cyan/70 bg-brand-black/95 px-4 py-3 shadow-lg"
    >
      <p id={titleId} className="text-sm font-bold text-brand-cyan">
        {title}
      </p>
      <p id={descriptionId} className="mt-1 text-xs text-brand-muted">
        {description}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="rounded border border-brand-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted transition hover:border-brand-cyan hover:text-brand-cyan"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded border border-brand-pink/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-pink transition hover:bg-brand-pink/15"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
