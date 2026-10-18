import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LindaCaseProvider } from './screens/linda/LindaCaseProvider'
import { RunProvider } from './shell/run'
import { SkipperShare } from './skipper/SkipperShare'
import { LookProvider } from './ui/look'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LookProvider>
        <RunProvider>
          <LindaCaseProvider>
            <App />
            <SkipperShare />
          </LindaCaseProvider>
        </RunProvider>
      </LookProvider>
    </MotionConfig>
  </StrictMode>,
)
