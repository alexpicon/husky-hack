import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, Eyebrow } from '../ui/primitives'
import { findMember, members, randomMember, stepMember } from './memberReplay'
import { ReplayAnswer } from './ReplayAnswer'
import { ReplaySaw } from './ReplaySaw'

/** A judge names any kit member; the rules replay that member's events beside the answer key. */
export function NameAnyMember({ initial = members[0] }: { initial?: string }) {
  const [member, setMember] = useState(initial)
  const [text, setText] = useState(initial)
  const [missing, setMissing] = useState('')
  const go = (m: string) => {
    setMember(m)
    setText(m)
    setMissing('')
  }
  const type = (value: string) => {
    setText(value)
    const found = findMember(value)
    if (found) {
      setMember(found)
      setMissing('')
    }
  }
  return (
    <Card className="p-7">
      <Eyebrow>Name any member · replayed live from HuskyHack_Synthetic_Events_v2.csv</Eyebrow>
      <h3 className="mt-2 font-display text-2xl">Name any member</h3>
      <p className="mt-1 text-sm text-ink-2">
        Pick any of the <span className="num">{members.length}</span> members in the kit and watch the
        rules replay their events, apart from what really happened.
      </p>
      <p className="mt-1 text-xs font-medium text-warn">
        Tested on the same <span className="num">{members.length}</span> members the rules were designed
        against.
      </p>
      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const found = findMember(text)
          if (found) go(found)
          else setMissing(text.trim())
        }}
      >
        <input
          value={text}
          onChange={(e) => type(e.target.value)}
          list="kit-members"
          placeholder="M1039"
          aria-label="Member ID"
          className="w-32 rounded-xl bg-slate-50 px-3 py-2 font-mono text-sm uppercase ring-1 ring-line outline-none focus:ring-brand"
        />
        <datalist id="kit-members">
          {members.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <button
          type="submit"
          className="h-9 rounded-xl bg-ink px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Replay
        </button>
        <Button variant="secondary" onClick={() => go(stepMember(member, -1))}>
          <ChevronLeft size={16} aria-hidden /> Previous
        </Button>
        <Button variant="secondary" onClick={() => go(stepMember(member, 1))}>
          Next <ChevronRight size={16} aria-hidden />
        </Button>
        <Button variant="secondary" onClick={() => go(randomMember(member))}>
          <Shuffle size={16} aria-hidden /> Random
        </Button>
      </form>
      {missing && (
        <p role="alert" className="mt-2 text-sm text-danger">
          No member “{missing}” in the kit. Try {members[0]} to {members.at(-1)}.
        </p>
      )}
      <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <ReplaySaw member={member} />
        <ReplayAnswer member={member} />
      </div>
    </Card>
  )
}
