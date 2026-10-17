import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Step } from '../story/engine'
import { Button } from '../ui/primitives'

type Props = {
  steps: Step[]
  index: number
  onPrev: () => void
  onNext: () => void
  onGo: (i: number) => void
}

export function Narrator({ steps, index, onPrev, onNext, onGo }: Props) {
  const step = steps[index]
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
      <div className="min-w-[280px] flex-1">
        <div className="flex items-center gap-3 text-xs font-medium text-ink-3">
          <span className="num font-mono">
            {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-line">
            <Clock size={12} />
            <span className="num">{step.clock}</span>
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="mt-2 font-display text-[44px] leading-[1.05] tracking-tight">
              {step.title}
            </h1>
            <p className="mt-2 max-w-3xl text-[17px] text-ink-2">{step.caption}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3">
        <div className="flex gap-1.5" role="tablist" aria-label="Steps">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Step ${i + 1}: ${s.title}`}
              onClick={() => onGo(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-ink' : i < index ? 'w-4 bg-slate-400' : 'w-4 bg-slate-200'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onPrev} disabled={index === 0}>
            <ArrowLeft size={16} /> Back
          </Button>
          <Button onClick={onNext} disabled={index === steps.length - 1}>
            Next <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
