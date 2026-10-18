import { motion } from 'motion/react'
import { MessageCircle, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { MAX_TEXT } from '../skipper/verify'
import { Button, Eyebrow } from '../ui/primitives'
import { hearPanel, PANEL_TAPS, type Heard, type PanelTap, type Source } from './classify'
import { HEARD, HOW, NO_MATCH, NOT_QUITE, postLine, READING, SOURCE_LINE, TYPE_HINT } from './copy'
import { clipQuote, resultFor } from './results'
import { TapPicker } from './TapPicker'
import { postToWall, type Posted } from './wallClient'

type Phase =
  | { at: 'write' }
  | { at: 'asking' }
  | { at: 'heard'; heard: Heard }
  | { at: 'pick'; chosen: string[]; heard: string[]; note: string }
  | { at: 'done'; taps: PanelTap[]; result: string; post: 'sending' | Posted }

type Props = {
  /** The wall to post to; without one, the result stays on this page. */
  code: string | null
  /** How Skipper hears, as the page's privacy line says. */
  mode: Source
  judge?: string
  /** Shown under the result, such as the way to the drill. */
  after?: ReactNode
  onPosted?: () => void
}

// Typing here must not reach the story's arrow and number keys on the same page.
const keepKeys = (e: KeyboardEvent) => e.stopPropagation()

/** Her own private Skipper: she types, Skipper suggests taps, she confirms, and code names the result. */
export function SkipperEntry({ code, mode, judge, after, onPosted }: Props) {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>({ at: 'write' })
  const ticket = useRef(0)
  const lead = useRef<HTMLParagraphElement>(null)
  const area = useRef<HTMLTextAreaElement>(null)

  // Each step unmounts the button she pressed, so focus moves to the new block's first line,
  // which a screen reader then reads. Never on load, so a phone's keyboard stays down.
  useEffect(() => {
    if (phase.at !== 'write') lead.current?.focus()
  }, [phase.at])

  const send = async (mine: number, result: string) => {
    if (!code) return
    const post = await postToWall(code, { quote: clipQuote(text), result, ...(judge ? { judge } : {}) })
    if (ticket.current !== mine) return
    setPhase((p) => (p.at === 'done' ? { ...p, post } : p))
    if (post.ok) onPosted?.()
  }

  const finish = (taps: PanelTap[]) => {
    const mine = ++ticket.current
    const result = resultFor(taps)
    setPhase({ at: 'done', taps, result, post: code ? 'sending' : { ok: false, reason: 'offline' } })
    void send(mine, result)
  }

  const ask = async () => {
    const mine = ++ticket.current
    setPhase({ at: 'asking' })
    const heard = await hearPanel(text, mode).catch((): Heard => ({ taps: [], source: mode }))
    if (ticket.current !== mine) return
    setPhase(heard.taps.length ? { at: 'heard', heard } : { at: 'pick', chosen: [], heard: [], note: NO_MATCH })
  }

  const pick = (note: string, heard: string[] = []) => {
    ticket.current++
    setPhase({ at: 'pick', chosen: [], heard, note })
  }

  const restart = () => {
    ticket.current++
    setText('')
    setPhase({ at: 'write' })
    area.current?.focus()
  }

  const editing = phase.at === 'write' || phase.at === 'asking'

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-2">{TYPE_HINT}</span>
        <textarea
          ref={area}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
          onKeyDown={keepKeys}
          readOnly={!editing}
          maxLength={MAX_TEXT}
          rows={4}
          autoComplete="off"
          placeholder="He said his lawyer…"
          className="w-full resize-none rounded-2xl bg-white px-3.5 py-3 text-[16px] leading-snug ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-brand read-only:bg-slate-50 read-only:text-ink-2"
        />
        <span className="num self-end text-[11px] text-ink-2">
          {text.length} / {MAX_TEXT}
        </span>
      </label>

      {phase.at === 'write' && (
        <Button size="lg" onClick={ask} disabled={!text.trim()} className="min-h-11 w-full">
          <MessageCircle size={18} aria-hidden /> Ask Skipper
        </Button>
      )}

      {phase.at === 'asking' && (
        <div className="flex flex-col gap-2" role="status">
          <p ref={lead} tabIndex={-1} className="text-[15px] text-ink-2">{READING}</p>
          <Button variant="secondary" size="lg" onClick={() => pick(NO_MATCH)} className="min-h-11 w-full">
            Tap what fits instead
          </Button>
        </div>
      )}

      {phase.at === 'heard' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <p ref={lead} tabIndex={-1} className="text-[17px] font-semibold">{HEARD}</p>
          <ul className="flex flex-col gap-2">
            {phase.heard.taps.map(({ tap, quote }) => (
              <li key={tap.id} className="rounded-2xl bg-brand-soft px-3.5 py-2.5 ring-2 ring-indigo-300">
                <div className="text-[15px] leading-tight font-semibold">{tap.label}</div>
                <div className="mt-0.5 text-sm text-ink-2">“{quote}”</div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-2">{SOURCE_LINE[phase.heard.source]}</p>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            <Button size="lg" onClick={() => finish(phase.heard.taps.map((t) => t.tap))} className="min-h-11">
              Yes, that's right
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => pick(NOT_QUITE, phase.heard.taps.map((t) => t.tap.id))}
              className="min-h-11"
            >
              Not quite
            </Button>
          </div>
        </motion.div>
      )}

      {phase.at === 'pick' && (
        <div className="flex flex-col gap-3">
          <p ref={lead} tabIndex={-1} className="text-[17px] font-semibold">{phase.note}</p>
          <TapPicker
            chosen={phase.chosen}
            heard={phase.heard}
            onToggle={(id) =>
              setPhase((p) =>
                p.at === 'pick'
                  ? { ...p, chosen: p.chosen.includes(id) ? p.chosen.filter((c) => c !== id) : [...p.chosen, id] }
                  : p,
              )
            }
          />
          <Button
            size="lg"
            onClick={() => finish(PANEL_TAPS.filter((t) => phase.chosen.includes(t.id)))}
            className="min-h-11 w-full"
          >
            Done
          </Button>
        </div>
      )}

      {phase.at === 'done' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line" role="status">
            <Eyebrow>Your result</Eyebrow>
            <p ref={lead} tabIndex={-1} className="mt-1 font-display text-[26px] leading-tight">{phase.result}</p>
            {phase.taps.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {phase.taps.map((t) => (
                  <li key={t.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink-2">
                    {t.label}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-sm text-ink-2">{HOW}</p>
            {code && <p className="mt-2 text-sm font-semibold">{postLine(phase.post)}</p>}
          </div>
          {code && phase.post !== 'sending' && !phase.post.ok && phase.post.reason !== 'full' && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                // This button hides while it sends, so focus waits on the result it is sending.
                lead.current?.focus()
                finish(phase.taps)
              }}
              className="min-h-11 w-full"
            >
              Try sending again
            </Button>
          )}
          {after}
          <Button variant="ghost" size="lg" onClick={restart} className="min-h-11 w-full">
            <RotateCcw size={16} aria-hidden /> Try another
          </Button>
        </motion.div>
      )}
    </div>
  )
}
