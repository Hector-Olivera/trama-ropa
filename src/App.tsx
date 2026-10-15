import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotFound } from './components/NotFound'
import { Landing } from './Landing'

// El panel de admin no lo necesita nadie que visite el sitio: va en su chunk.
const AdminApp = lazy(() =>
  import('./admin/AdminApp').then((module) => ({ default: module.AdminApp })),
)

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-xs text-brand-muted">Cargando panel...</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/admin/*"
        element={
          <ErrorBoundary>
            <Suspense fallback={<AdminFallback />}>
              <AdminApp />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
