import { CheckCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { clock } from '../../ui/format'
import { afterPause } from './facts'
import { Bubble } from './SoundChrome'
import { AskMessages, NeverACode, SarahsPhone, ScrollToLatest } from './Thread'
import { CallLine, YesReplies } from './YesThread'

/**
 * Sarah's "No" is in, and Sound tells her what happens next. If she tapped Yes, the "No" came on
 * the specialist's callback to this number.
 */
export function NotMe({ saidYes = false }: { saidYes?: boolean }) {
  const at = afterPause(1)
  return (
    <SarahsPhone at={at}>
      <div className="flex flex-col gap-2 px-4 pt-4">
        <AskMessages instant />
        {saidYes ? (
          <>
            <YesReplies released={false} instant />
            <CallLine />
            <Bubble delay={0.2}>Thank you for talking with us. You told our specialist it wasn't you.</Bubble>
          </>
        ) : (
          <>
            <Bubble from="me" delay={0.05}>
              No, it wasn't me
            </Bubble>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1 self-end pr-1 text-[11px] text-ink-3"
            >
              <CheckCheck size={13} aria-hidden /> Received {clock(at)}
            </motion.span>
          </>
        )}
        <Bubble delay={0.6}>{saidYes ? "We're" : "Thank you. We're"} keeping the payment stopped.</Bubble>
        <Bubble delay={1.0}>
          A specialist is locking online access to your account now, so no one else can sign in.
        </Bubble>
        <Bubble delay={1.4}>
          When you're ready, call the number on your card. We'll help you get back in.
        </Bubble>
      </div>
      <div className="mt-auto px-4 pt-5 pb-6">
        <NeverACode />
      </div>
      <ScrollToLatest />
    </SarahsPhone>
  )
}
