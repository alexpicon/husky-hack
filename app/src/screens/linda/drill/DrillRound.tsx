import { useEffect, useRef, useState } from 'react'
import { ArrowRight, SkipForward } from 'lucide-react'
import { ClipCard } from './ClipCard'
import { letter, prompt } from './copy'
import { Action } from './parts'
import { mutedText, titleText, type Skin } from './skin'
import {
  canGuess,
  clipOn,
  guess,
  markHeard,
  markMissing,
  result,
  roundDone,
  SIDES,
  skip,
  type Game,
  type Side,
} from './voiceGame'

type Props = Skin & {
  game: Game
  change: (step: (g: Game) => Game) => void
  onNext: () => void
}

const other = (side: Side): Side => (side === 'a' ? 'b' : 'a')

/** One pair: play both, pick the AI voice, see the answer. Only one recording plays at a time. */
export function DrillRound({ game, change, onNext, sound }: Props) {
  const round = game.round!
  const audio = useRef<Record<Side, HTMLAudioElement | null>>({ a: null, b: null })
  const [playing, setPlaying] = useState<Side | null>(null)
  const revealed = result(round) !== null
  const done = roundDone(round)
  const last = round.position >= game.rounds
  const title = titleText({ sound })
  const muted = mutedText({ sound })
  // The button she pressed is gone each time: a new pair remounts this round, and an answer
  // replaces the guess buttons. Focus follows to the pair's name, then to the answer.
  const heading = useRef<HTMLHeadingElement>(null)
  const status = useRef<HTMLParagraphElement>(null)
  useEffect(() => heading.current?.focus(), [])
  useEffect(() => {
    if (done) status.current?.focus()
  }, [done])

  const toggle = (side: Side) => {
    const el = audio.current[side]
    if (!el) return
    if (!el.paused) return el.pause()
    audio.current[other(side)]?.pause()
    el.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === 'NotSupportedError') change((g) => markMissing(g, side))
    })
  }
  const started = (side: Side) => {
    audio.current[other(side)]?.pause()
    setPlaying(side)
    change((g) => markHeard(g, side))
  }
  const stopped = (side: Side) => setPlaying((p) => (p === side ? null : p))

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        {round.pair.portrait && (
          <img src={round.pair.portrait} alt="" className="size-11 shrink-0 rounded-full object-cover" />
        )}
        <div className="min-w-0">
          <div
            className={`text-[13px] font-semibold tracking-wide uppercase ${muted.className}`}
            style={muted.style}
            aria-hidden
          >
            Pair {round.position} of {game.rounds}
          </div>
          <h2
            ref={heading}
            tabIndex={-1}
            className={`text-[19px] leading-tight font-bold ${title.className}`}
            style={title.style}
          >
            <span className="sr-only">Pair {round.position} of {game.rounds}: </span>
            {round.pair.label}
          </h2>
          {round.pair.about && (
            <p className={`text-[13px] leading-snug ${muted.className}`} style={muted.style}>
              {round.pair.about}
            </p>
          )}
        </div>
      </div>

      {SIDES.map((side) => (
        <ClipCard
          key={side}
          sound={sound}
          side={side}
          clip={clipOn(round, side)}
          transcript={round.pair.transcript}
          heard={round.heard.includes(side)}
          playing={playing === side}
          missing={round.missing.includes(side)}
          revealed={revealed}
          credit={round.pair.credit}
          audioRef={(el) => {
            audio.current[side] = el
          }}
          onToggle={() => toggle(side)}
          onPlay={() => started(side)}
          onStop={() => stopped(side)}
          onMissing={() => change((g) => markMissing(g, side))}
        />
      ))}

      <p ref={status} tabIndex={-1} className="text-[15px] leading-snug font-medium" role="status">
        {prompt(round)}
      </p>

      {done ? (
        <Action sound={sound} onClick={onNext}>
          {last ? 'See what to remember' : 'Next pair'} <ArrowRight size={18} aria-hidden />
        </Action>
      ) : (
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Which recording is AI?">
          {SIDES.map((side) => (
            <Action key={side} sound={sound} disabled={!canGuess(round)} onClick={() => change((g) => guess(g, side))}>
              {letter(side)} is AI
            </Action>
          ))}
        </div>
      )}

      {!done && round.missing.length > 0 && (
        <Action sound={sound} variant="secondary" onClick={() => change(skip)}>
          Skip this pair <SkipForward size={18} aria-hidden />
        </Action>
      )}
    </div>
  )
}
