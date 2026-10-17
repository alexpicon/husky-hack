import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LookProvider } from './ui/look'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LookProvider>
      <App />
    </LookProvider>
  </StrictMode>,
)
