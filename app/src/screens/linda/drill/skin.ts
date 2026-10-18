import type { CSSProperties } from 'react'
import { SOUND } from '../../../ui/soundApp'

/** The drill draws in the Sound app's look on Linda's phone, and in the concept look elsewhere. */
export type Skin = { sound: boolean }

type Text = { className: string; style?: CSSProperties }

export const mutedText = ({ sound }: Skin): Text =>
  sound ? { className: '', style: { color: SOUND.muted } } : { className: 'text-ink-2' }

export const titleText = ({ sound }: Skin): Text =>
  sound ? { className: '', style: { color: SOUND.navy } } : { className: 'text-ink' }
