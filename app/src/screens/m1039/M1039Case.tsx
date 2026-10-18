import { useMemo } from 'react'
import { StoryContext, useStory } from '../../story/engine'
import { TakeoverCase, type TakeoverStage } from '../staff/TakeoverCase'
import { useM1039Answer } from './answerState'
import { staffStage } from './outcomes'

/** M1039's case once the text is out: its stage follows the member's answer, `unanswered` until then. */
export function M1039Case({ unanswered }: { unanswered: TakeoverStage }) {
  const story = useStory()
  const { answer, locked, lock } = useM1039Answer()
  const stage = staffStage(answer, locked, unanswered)
  // After a NO, "Keep stopped and lock account" moves the story on. M1039's story ends on this
  // answer, so the button locks the case here instead.
  const api = useMemo(() => (stage === 'not-me' ? { ...story, next: lock } : story), [stage, story, lock])
  return (
    <StoryContext.Provider value={api}>
      <TakeoverCase member="M1039" stage={stage} />
    </StoryContext.Provider>
  )
}
