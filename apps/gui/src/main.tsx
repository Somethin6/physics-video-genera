import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import EnhancedErrorBoundary from './components/ErrorBoundary'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // In production, report to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // reportError(event.reason)
  }
})

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // In production, report to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // reportError(event.error)
  }
})

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <EnhancedErrorBoundary>
      <App />
    </EnhancedErrorBoundary>
   </ErrorBoundary>
)
