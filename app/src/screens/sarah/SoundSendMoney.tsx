import { ArrowUpRight, UserPlus } from 'lucide-react'
import { useStory } from '../../story/engine'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { SOUND, SoundAppScreen, SoundButton, SoundCard, SoundRow } from '../../ui/soundApp'
import { sarah } from './facts'

const muted = { color: SOUND.muted }

/** Sound's P2P "Pay Anyone" screen, with the scammer signed in as Sarah. */
export function SoundSendMoney() {
  const { next } = useStory()
  const { paused, recipientAdded } = sarah
  return (
    <Phone
      time={clock(paused.at)}
      statusBar="navy"
      caption="Sarah's account, but it's the scammer holding the phone"
    >
      <SoundAppScreen title="Pay Anyone" tab="move" back>
        <div className="flex flex-col gap-3">
          <SoundCard className="flex items-center gap-3.5">
            <UserPlus size={38} strokeWidth={1.5} style={{ color: SOUND.navy }} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold tracking-wide uppercase" style={muted}>
                To
              </div>
              <div className="text-[17px] leading-tight font-bold">New recipient</div>
              <div className="font-mono text-[13px]" style={muted}>
                {paused.recipientId}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[13px]" style={muted}>
                Added
              </span>
              <span className="num text-[15px] font-semibold">{clock(recipientAdded.at)}</span>
              <Source ids={recipientAdded.id} />
            </div>
          </SoundCard>

          <SoundCard className="pb-1.5">
            <div className="text-center">
              <div className="text-[12px] font-bold tracking-wide uppercase" style={muted}>
                Amount
              </div>
              <div className="num mt-1 text-[38px] leading-none font-semibold tracking-tight">
                {money(paused.amount)}
              </div>
              <div className="mt-1">
                <Source ids={paused.id} />
              </div>
            </div>
            <div className="mt-2 border-t border-black/[0.07]">
              <SoundRow label="Send with" value={paused.rail} />
              <SoundRow
                label="Payment"
                value={<span className="font-mono text-[14px]">{paused.paymentId}</span>}
              />
              <SoundRow label="Channel" value={paused.channel} />
            </div>
          </SoundCard>

          <p className="px-1 text-[14px] leading-snug" style={muted}>
            {paused.rail} payments can't be pulled back once they're sent.
          </p>

          <SoundButton onClick={next}>
            Send {money(paused.amount)}
            <ArrowUpRight size={18} aria-hidden />
          </SoundButton>
        </div>
      </SoundAppScreen>
    </Phone>
  )
}
