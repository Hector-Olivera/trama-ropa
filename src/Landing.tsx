import { lazy, Suspense } from 'react'
import { Catalog } from './components/Catalog'
import { Contact } from './components/Contact'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Nav } from './components/Nav'

// Konva pesa ~360 kB. Va en su propio chunk para que la landing no lo pague.
const EditorSection = lazy(() =>
  import('./components/editor/EditorSection').then((module) => ({ default: module.EditorSection })),
)

function EditorFallback() {
  return (
    <section id="editor" className="scroll-mt-20 border-t border-brand-line px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-cyan">
        Preparando el editor
      </p>
      <p className="mt-2 text-xs text-brand-muted">Cargando el motor de edición...</p>
    </section>
  )
}

export function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ErrorBoundary fallback={<EditorFallback />}>
          <Suspense fallback={<EditorFallback />}>
            <EditorSection />
          </Suspense>
        </ErrorBoundary>
        <Catalog />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
