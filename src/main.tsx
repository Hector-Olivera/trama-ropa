import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ContentProvider } from './content/ContentProvider'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('No se encontró el nodo #root.')

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ContentProvider>
          <App />
        </ContentProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
