import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HeartHandshake, MessageCircle, PauseCircle, Phone, PhoneCall } from 'lucide-react'
import { useStory } from '../../story/engine'
import { Tablet } from '../../ui/devices'
import { dollars, lindaFacts } from './facts'
import { TabletHeader } from './parts'
import { STORY_TAPS, TAP_OPTIONS, useTaps } from './taps'

type Reply = 'calling' | 'staff' | null

const replies: Record<Exclude<Reply, null>, string> = {
  calling: 'Take your time. Your wire stays paused while you call.',
  staff: 'Someone from our team is on the way. You can still send it.',
}

export function MatchResult() {
  const f = lindaFacts()
  const { next } = useStory()
  const tapped = useTaps()
  const [reply, setReply] = useState<Reply>(null)
  const shown = TAP_OPTIONS.filter((o) => (tapped.length ? tapped : STORY_TAPS).includes(o.id))
  const matches = shown.some((o) => o.scamSignal)

  return (
    <Tablet caption="Branch tablet - Linda chose to share her taps with staff">
      <div className="flex min-h-full flex-col gap-3 p-6">
        <TabletHeader
          right={
            <>
              <PauseCircle size={16} className="text-warn" aria-hidden />
              Your wire is paused · <span className="num font-mono">{dollars(f.wire.amount)}</span>
            </>
          }
        />

        <ul className="flex flex-wrap items-center gap-1.5" aria-label="What you tapped">
          <li className="mr-1 text-sm font-medium text-ink-3">You tapped</li>
          {shown.map((o) => (
            <li
              key={o.id}
              className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-ink-2"
            >
              <o.icon size={14} aria-hidden />
              {o.short}
            </li>
          ))}
        </ul>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-[30px] leading-[1.1] text-ink">
            {matches
              ? `What you tapped matches how the “${f.scamName}” works.`
              : 'Nothing you tapped matches a scam we know.'}
          </h2>
          <p className="mt-1.5 text-[17px] text-ink-2">
            {matches
              ? "Real lawyers don't ask families to keep bail a secret."
              : 'One quick check before it goes, just in case.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3 rounded-2xl bg-brand-soft px-4 py-3.5 ring-1 ring-indigo-200 ring-inset"
        >
          <Phone size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <p className="text-[17px] leading-snug text-ink">
            <strong>
              Before you send, call {matches ? 'your grandson' : 'them'} on the number YOU have
              saved,
            </strong>{' '}
            not a number someone gave you today.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setReply('calling')}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
          >
            <PhoneCall size={18} aria-hidden /> Call from my own phone
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-ink ring-1 ring-slate-300 transition ring-inset hover:bg-slate-50 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-base font-semibold">
              <HeartHandshake size={18} className="text-brand" aria-hidden />
              Ask my trusted person to call me
            </span>
            <span className="text-xs text-ink-3">Optional</span>
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={reply ?? 'autonomy'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-base font-semibold ${reply ? 'text-safe' : 'text-ink'}`}
              aria-live="polite"
            >
              {reply ? replies[reply] : "It's your money and your decision."}
            </motion.p>
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setReply('staff')}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[15px] font-semibold text-ink-2 underline decoration-slate-300 underline-offset-4 transition hover:bg-slate-100"
          >
            <MessageCircle size={16} aria-hidden />
            I still want to send - talk to staff
          </button>
        </div>
      </div>
    </Tablet>
  )
}
