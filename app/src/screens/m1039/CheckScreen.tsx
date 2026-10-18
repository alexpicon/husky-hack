import { Building2, Clock, MessageSquareText } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { LOST_PHONE, lostPhone, noAnswerInApp } from './answers'
import { useM1039Answer } from './answerState'
import { CheckSound } from './CheckSound'
import { facts } from './facts'

/** `phoneLost` starts after "I lost that phone", for a still frame or a render test. */
export function CheckScreen({ phoneLost = false }: { phoneLost?: boolean }) {
  return useLook() === 'sound' ? <CheckSound phoneLost={phoneLost} /> : <ConceptCheckScreen phoneLost={phoneLost} />
}

function ConceptCheckScreen({ phoneLost }: { phoneLost: boolean }) {
  const { next } = useStory()
  const { answer, give } = useM1039Answer()
  const lost = phoneLost || answer === 'lost-phone'
  const { payment } = facts
  return (
    <div className="flex min-h-full flex-col bg-linear-to-b from-brand-soft via-white to-white px-5 pt-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[36px] leading-[1.05] tracking-tight text-ink">
          One quick check
        </h2>
        <motion.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-float ring-1 ring-indigo-100"
        >
          <MessageSquareText size={22} />
        </motion.span>
      </div>
      <p className="mt-2 text-[17px] leading-snug text-ink-2">
        This payment needs a quick yes before{' '}
        <span className="num font-semibold text-ink">{money(payment.amount)}</span> goes. If you
        started it, check your messages from Sound.
      </p>

      <motion.dl
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5 divide-y divide-line rounded-2xl bg-white ring-1 ring-line"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-[15px] text-ink-2">Payment</dt>
          <dd className="num text-[18px] font-semibold text-ink">{money(payment.amount)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-[15px] text-ink-2">Status</dt>
          <dd className="rounded-full bg-brand-soft px-2.5 py-1 text-[13px] font-semibold text-brand ring-1 ring-indigo-100">
            Waiting for your yes
          </dd>
        </div>
      </motion.dl>

      {lost ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-line"
          role="status"
        >
          <Building2 size={22} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <div className="min-w-0">
            <div className="text-[16px] font-semibold text-ink">{lostPhone.title}</div>
            <p className="mt-0.5 text-[15px] leading-snug text-ink-2">{lostPhone.body}</p>
          </div>
        </motion.div>
      ) : (
        <>
          <button
            type="button"
            onClick={next}
            className="mt-5 flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink text-[17px] font-semibold text-white shadow-float transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <MessageSquareText size={19} />
            Check your messages
          </button>
          {answer === null && (
            <button
              type="button"
              onClick={() => give('lost-phone')}
              className="mt-2.5 h-12 w-full shrink-0 rounded-2xl bg-white text-[16px] font-semibold text-ink ring-1 ring-line ring-inset transition hover:bg-slate-50 active:scale-[0.98]"
            >
              {LOST_PHONE}
            </button>
          )}
        </>
      )}

      <p className="mt-4 flex gap-2 text-[16px] leading-snug text-ink-3">
        <Clock size={16} className="mt-1 shrink-0" aria-hidden />
        {noAnswerInApp}
      </p>
    </div>
  )
}
