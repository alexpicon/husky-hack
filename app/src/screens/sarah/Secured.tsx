import type { ReactNode } from 'react'
import { Building2, Check, Phone as PhoneIcon, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { ReportRow } from '../../report/ReportRow'
import { money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { afterPause, sarah } from './facts'
import { SarahsPhone } from './Thread'

function Done({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-safe text-white">
        <Check size={14} strokeWidth={3} aria-hidden />
      </span>
      <span className="text-[16px] leading-snug">{children}</span>
    </li>
  )
}

/** Sarah's phone after the account is locked. */
export function Secured() {
  const { paused } = sarah
  return (
    <div className="flex flex-col items-center">
      <SarahsPhone at={afterPause(2)} caption={false}>
        <div className="flex flex-col gap-2 px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="overflow-hidden rounded-3xl ring-1 ring-line"
          >
            <div className="bg-linear-to-br from-teal-50 to-safe-soft px-5 pt-5 pb-4">
              <span className="grid size-11 place-items-center rounded-2xl bg-white text-safe shadow-sm ring-1 ring-teal-200">
                <ShieldCheck size={24} aria-hidden />
              </span>
              <h2 className="mt-3 font-display text-[30px] leading-none tracking-tight">
                Your account is safe
              </h2>
            </div>
            <ul className="flex flex-col gap-3 px-5 py-4">
              <Done>
                We stopped the {money(paused.amount)} payment before it was sent.{' '}
                <Source ids={paused.id} />
              </Done>
              <Done>Online access is locked. No one can sign in.</Done>
              <Done>Nothing left your account.</Done>
            </ul>
            <div className="border-t border-line bg-slate-50/70 px-5 py-4">
              <div className="text-[14px] font-semibold text-ink-2">To get back in</div>
              <div className="mt-2 flex flex-col gap-2 text-[16px]">
                <span className="flex items-center gap-2.5">
                  <PhoneIcon size={18} className="text-ink-3" aria-hidden />
                  Call the number on your card
                </span>
                <span className="flex items-center gap-2.5">
                  <Building2 size={18} className="text-ink-3" aria-hidden />
                  Or visit any Sound branch
                </span>
              </div>
            </div>
          </motion.div>
          <ReportRow />
        </div>
      </SarahsPhone>
    </div>
  )
}
