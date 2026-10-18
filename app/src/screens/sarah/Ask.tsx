import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { afterPause } from './facts'
import { released, replyActions, type SarahAnswer } from './reply'
import { useSarahReply } from './replyState'
import { SarahReplySync } from './replyStore'
import { Bubble } from './SoundChrome'
import { AskMessages, SarahsPhone, ScrollToLatest } from './Thread'
import { YesReplies } from './YesThread'

const reply =
  'flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[17px] font-semibold transition active:scale-[0.98] disabled:cursor-default'

/** "Was this you?" on the real Sarah's phone. Her email and phone changed, so hers is the full stop. */
export function Ask() {
  const { next } = useStory()
  const { reply: r, update } = useSarahReply()
  const answered = r.answer !== null
  const say = (answer: SarahAnswer) => update((c) => replyActions.answer(c, answer))
  const chosen = (answer: SarahAnswer) => (r.answer === answer ? <Check size={18} aria-hidden /> : null)
  // A locked answer stays readable; the one she did not tap fades.
  const faded = (answer: SarahAnswer) => (answered && r.answer !== answer ? 'opacity-40' : '')
  return (
    <SarahsPhone at={afterPause(1)}>
      <SarahReplySync />
      <div className="flex flex-col gap-2 px-4 pt-4">
        <AskMessages />
        {r.answer === 'yes' && <YesReplies released={released(r)} />}
        {r.answer === 'no' && <Bubble from="me">No, it wasn't me</Bubble>}
        {answered && <ScrollToLatest after={350} />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="sticky bottom-0 mt-auto flex flex-col gap-2 bg-white px-4 pt-3 pb-5"
      >
        <button
          type="button"
          onClick={() => say('yes')}
          disabled={answered}
          aria-pressed={r.answer === 'yes'}
          className={`${reply} bg-white text-ink ring-1 ring-line ring-inset enabled:hover:bg-slate-50 ${faded('yes')}`}
        >
          {chosen('yes')}
          Yes, it was me
        </button>
        <button
          type="button"
          onClick={() => {
            say('no')
            next()
          }}
          disabled={answered}
          aria-pressed={r.answer === 'no'}
          className={`${reply} bg-ink text-white shadow-float enabled:hover:bg-slate-800 ${faded('no')}`}
        >
          {chosen('no')}
          No, it wasn't me
        </button>
      </motion.div>
    </SarahsPhone>
  )
}
