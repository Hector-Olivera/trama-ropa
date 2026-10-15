import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-pink">
        Algo salió mal
      </p>
      <p className="max-w-md text-xs text-brand-muted">
        Esta parte de la página no se pudo cargar. Probá recargar; si persiste, avisanos.
      </p>
      <pre className="max-w-full overflow-auto rounded border border-brand-line bg-brand-surface px-3 py-2 text-left text-[11px] text-brand-muted">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded bg-brand-cyan px-4 py-2 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
      >
        Recargar
      </button>
    </div>
  )
}
