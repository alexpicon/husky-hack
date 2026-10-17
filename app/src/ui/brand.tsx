import logoUrl from '../assets/brand/sound-logo.svg'
import markUrl from '../assets/brand/sound-mark.svg'

/** Sound's "sound credit union" wordmark, as published on soundcu.com. */
export function SoundLogo({ height = 18, inverted = false }: { height?: number; inverted?: boolean }) {
  return (
    <img
      src={logoUrl}
      alt="Sound Credit Union"
      style={{ height, filter: inverted ? 'brightness(0) invert(1)' : undefined }}
      className="w-auto select-none"
      draggable={false}
    />
  )
}

/** Sound's fish mark on a white tile: the avatar on texts and notifications. */
export function SoundMark({ size = 28, round = false }: { size?: number; round?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center bg-white shadow-sm ring-1 ring-black/5 ${round ? 'rounded-full' : 'rounded-[28%]'}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <img src={markUrl} alt="" style={{ width: size * 0.74 }} draggable={false} />
    </span>
  )
}
