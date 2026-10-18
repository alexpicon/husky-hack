import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LindaCaseProvider } from './screens/linda/LindaCaseProvider'
import { RunProvider } from './shell/run'
import { LookProvider } from './ui/look'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LookProvider>
        <RunProvider>
          <LindaCaseProvider>
            <App />
          </LindaCaseProvider>
        </RunProvider>
      </LookProvider>
    </MotionConfig>
  </StrictMode>,
)
