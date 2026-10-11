import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// No StrictMode - causes canvas effects to run twice per react-dev.md
createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>
)
