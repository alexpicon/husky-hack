import { useState } from 'react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { yesReleases, yesReply } from '../staff/takeoverStages'
import { afterPause } from './facts'
import { Bubble } from './SoundChrome'
import { AskMessages, NeverACode, SarahsPhone, ScrollToLatest } from './Thread'

const reply =
  'flex h-12 w-full items-center justify-center rounded-2xl text-[17px] font-semibold transition active:scale-[0.98]'

/** "Was this you?" on the real Sarah's phone. Her email and phone changed, so hers is the full stop. */
export function Ask() {
  const { next } = useStory()
  const [saidYes, setSaidYes] = useState(false)
  return (
    <SarahsPhone at={afterPause(1)}>
      <div className="flex flex-col gap-2 px-4 pt-4">
        <AskMessages />
        {saidYes && (
          <>
            <Bubble from="me">Yes, it was me</Bubble>
            <Bubble delay={0.3}>{yesReply(yesReleases(true))}</Bubble>
            <ScrollToLatest after={350} />
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-white px-4 pt-3 pb-5"
      >
        <NeverACode />
        <button
          type="button"
          onClick={() => setSaidYes(true)}
          disabled={saidYes}
          className={`${reply} bg-white text-ink ring-1 ring-line ring-inset hover:bg-slate-50 disabled:opacity-50`}
        >
          Yes, it was me
        </button>
        <button
          type="button"
          onClick={next}
          className={`${reply} bg-ink text-white shadow-float hover:bg-slate-800`}
        >
          No, it wasn't me
        </button>
      </motion.div>
    </SarahsPhone>
  )
}
