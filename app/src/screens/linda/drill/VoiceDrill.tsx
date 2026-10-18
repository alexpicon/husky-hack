import { useState, type ReactNode } from 'react'
import { useLook } from '../../../ui/look'
import { DRILL_ROUNDS, type DrillPair } from './clips'
import { drillActions, updateDrill, useDrill } from './drillState'
import { DrillEnding } from './DrillEnding'
import { DrillRound } from './DrillRound'
import { DrillStart } from './DrillStart'
import { useDrillPairs } from './useDrillPairs'
import { isOver, newGame, nextRound, type Game } from './voiceGame'

type Props = {
  /** A page of its own, such as the panel's phone page: no story, no trusted contact, ends with "Back". */
  standalone?: boolean
  /** The pairs to play. By default, the bundled recordings, loaded when the drill opens. */
  pairs?: DrillPair[]
  rounds?: number
  /** Standalone only: what "Back" and "Not now" do. By default, the browser's back. */
  onBack?: () => void
}

type Phase = 'start' | 'declined' | 'drill' | 'end'

function Drill({ standalone = false, pairs, rounds = DRILL_ROUNDS, onBack }: Props) {
  const look = useLook()
  const sound = !standalone && look === 'sound'
  const available = useDrillPairs(pairs)
  const [phase, setPhase] = useState<Phase>('start')
  // Her answers and score live only here, on this screen; the shared status never holds them.
  const [game, setGame] = useState<Game | null>(null)
  const back = onBack ?? (() => window.history.back())

  const finish = () => {
    setPhase('end')
    if (!standalone) updateDrill(drillActions.complete)
  }
  const start = () => {
    if (!Array.isArray(available)) return
    const first = newGame(available, rounds)
    setGame(first)
    if (isOver(first)) finish()
    else setPhase('drill')
  }
  const change = (step: (g: Game) => Game) => setGame((g) => (g ? step(g) : g))
  const next = () => {
    if (!game) return
    const after = nextRound(game)
    setGame(after)
    if (isOver(after)) finish()
  }

  let body: ReactNode
  if (phase === 'drill' && game?.round) {
    body = <DrillRound key={game.round.position} sound={sound} game={game} change={change} onNext={next} />
  } else if (phase === 'end') {
    const score = game?.score ?? { correct: 0, total: 0 }
    body = <DrillEnding sound={sound} score={score} standalone={standalone} onBack={back} />
  } else {
    body = (
      <DrillStart
        sound={sound}
        pairs={available}
        declined={phase === 'declined'}
        onStart={start}
        onNotNow={standalone ? back : () => setPhase('declined')}
      />
    )
  }
  const frame = standalone ? 'mx-auto w-full max-w-[440px] px-4 py-5' : ''
  return (
    <section className={`flex flex-col gap-3 ${frame}`} aria-label="Real or AI? A scam drill">
      {body}
    </section>
  )
}

/**
 * "Real or AI?": an opt-in drill that plays pairs of recordings, one real and one AI, and asks
 * which is AI. It plays voices and never analyzes anyone's. In Linda's story it starts over with
 * each demo run, and finishing it is the only thing it shares.
 */
export function VoiceDrill(props: Props) {
  const { run } = useDrill()
  return <Drill key={props.standalone ? 'standalone' : run} {...props} />
}
