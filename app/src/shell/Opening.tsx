type Props = { line: string; className?: string }

/** The human line a story opens with, set apart as something someone said or saw. */
export function Opening({ line, className = '' }: Props) {
  return (
    <blockquote
      className={`max-w-3xl border-l-2 border-warn/50 pl-3 font-display leading-snug text-ink-2 italic ${className}`}
    >
      {line}
    </blockquote>
  )
}
