import { clock } from '../../ui/format'
import { useM1039Answer } from './answerState'
import { facts } from './facts'
import { HonestCard } from './HonestCard'
import { MemberPhone } from './MemberPhone'
import { NotSentScreen } from './NotSentScreen'
import { kept, shownAnswer } from './outcomes'
import { ReleasedScreen } from './ReleasedScreen'

/** The last step on M1039's phone: released after a Yes, kept after any other answer. */
export function Outcome() {
  const answer = shownAnswer(useM1039Answer().answer)
  const time = clock(facts.tapAt)
  if (answer === 'yes') {
    return (
      <div className="flex flex-col items-center gap-5">
        <MemberPhone time={time} caption="Sound app: payment sent for processing">
          <ReleasedScreen />
        </MemberPhone>
        <HonestCard />
      </div>
    )
  }
  return (
    <MemberPhone time={time} caption={kept[answer].phone}>
      <NotSentScreen answer={answer} />
    </MemberPhone>
  )
}
