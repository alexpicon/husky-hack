import { Bot, Pause, Play, UserRound, VolumeX } from 'lucide-react'
import { SOUND } from '../../../ui/soundApp'
import { letter, NOT_ADDED } from './copy'
import { Panel } from './parts'
import { mutedText, type Skin } from './skin'
import type { Clip, Side } from './voiceGame'

type Props = Skin & {
  side: Side
  clip: Clip
  transcript?: string
  heard: boolean
  playing: boolean
  missing: boolean
  /** True once the answer is out: the card then says which voice this was. */
  revealed: boolean
  credit?: string
  audioRef: (el: HTMLAudioElement | null) => void
  onToggle: () => void
  onPlay: () => void
  onStop: () => void
  onMissing: () => void
}

function Reveal({ clip, credit, sound }: Skin & { clip: Clip; credit?: string }) {
  const ai = clip.label === 'synthetic'
  const Icon = ai ? Bot : UserRound
  const tone = ai ? 'bg-warn-soft text-warn ring-amber-200' : 'bg-slate-100 text-ink-2 ring-slate-200'
  const muted = mutedText({ sound })
  return (
    <div className="mt-2.5 flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[13px] font-semibold ring-1 ring-inset ${tone}`}>
        <Icon size={14} aria-hidden />
        {ai ? 'AI voice: synthetic' : 'Real voice'}
      </span>
      {ai && credit && (
        <p className={`text-[12px] leading-snug ${muted.className}`} style={muted.style}>
          {credit}
        </p>
      )}
    </div>
  )
}

/** One recording: a play button at least 44 px tall, its words, and after the answer, what it was. */
export function ClipCard(p: Props) {
  const muted = mutedText(p)
  const name = `Recording ${letter(p.side)}`
  const status = p.missing ? NOT_ADDED : p.playing ? 'Playing' : p.heard ? 'Played' : 'Not played yet'
  const Icon = p.missing ? VolumeX : p.playing ? Pause : Play
  const fill = p.sound ? SOUND.action : 'var(--color-ink)'
  return (
    <Panel sound={p.sound} className="py-3">
      <audio
        ref={p.audioRef}
        src={p.clip.src}
        preload="auto"
        onPlay={p.onPlay}
        onPause={p.onStop}
        onEnded={p.onStop}
        onError={p.onMissing}
      />
      <button
        type="button"
        onClick={p.onToggle}
        disabled={p.missing}
        aria-label={`${p.playing ? 'Pause' : 'Play'} ${name}`}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl text-left transition active:scale-[0.99] disabled:cursor-not-allowed"
      >
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full text-white"
          style={{ background: p.missing ? '#9ca3af' : fill }}
        >
          <Icon size={20} aria-hidden />
        </span>
        <span className="text-[17px] font-semibold">{name}</span>
        <span className={`ml-auto text-[13px] ${muted.className}`} style={muted.style}>
          {status}
        </span>
      </button>
      {p.transcript && (
        <p className={`mt-2 text-[15px] leading-snug ${muted.className}`} style={muted.style}>
          <span className="sr-only">Words: </span>"{p.transcript}"
        </p>
      )}
      {p.revealed && <Reveal clip={p.clip} credit={p.credit} sound={p.sound} />}
    </Panel>
  )
}
