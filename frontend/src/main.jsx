import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

/**
 * Punto de entrada principal de la aplicación React.
 * Renderiza el componente raíz `App` dentro del modo estricto de React.
 */
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
