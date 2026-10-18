import { motion } from 'motion/react'
import { ArrowRight, Plus } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { renderSVG } from 'uqr'
import { judgeName, PHONE_ASK, PHONE_TITLE } from './copy'
import { NO_PATTERN, type PanelEntry } from './results'
import { SkipperEntry } from './SkipperEntry'
import { panelLink, useWallEntries, type WallStatus } from './wallClient'

const STATUS: Record<WallStatus, { dot: string; text: string }> = {
  connecting: { dot: 'bg-amber-400', text: 'text-warn' },
  live: { dot: 'bg-teal-500', text: 'text-safe' },
  offline: { dot: 'bg-rose-500', text: 'text-danger' },
}

function WallQr({ text }: { text: string }) {
  const svg = useMemo(() => renderSVG(text, { pixelSize: 8, whiteColor: '#ffffff', blackColor: '#0b1220' }), [text])
  return <div className="size-[260px] [&>svg]:size-full" role="img" aria-label="QR code for the phone page" dangerouslySetInnerHTML={{ __html: svg }} />
}

/** One judge's line: who, their words cut to 40 characters, and the result. */
export function WallRow({ entry }: { entry: PanelEntry }) {
  const named = entry.result !== NO_PATTERN
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-[9rem_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1 rounded-2xl bg-white px-5 py-3.5 ring-1 ring-line xl:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1.1fr)]"
    >
      <span className="text-lg font-semibold text-ink-3">{judgeName(entry)}</span>
      <span className="truncate text-xl font-medium">“{entry.quote}”</span>
      <span
        className={`col-start-2 flex items-center gap-2 text-lg font-semibold xl:col-start-3 ${named ? 'text-warn' : 'text-ink-2'}`}
      >
        <ArrowRight size={18} className="shrink-0" aria-hidden /> {entry.result}
      </span>
    </motion.li>
  )
}

/** The laptop's live list of every judge's result, with the QR that brings more judges in. */
export function PanelWall({ code }: { code: string }) {
  const { entries, status, refresh } = useWallEntries(code)
  const phone = panelLink('panel', code)
  const end = useRef<HTMLLIElement>(null)
  const latest = entries.at(-1)?.n

  useEffect(() => {
    end.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
  }, [latest])

  return (
    <main className="mx-auto grid min-h-dvh max-w-[1680px] grid-cols-1 gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex min-h-0 flex-col gap-5">
        <h1 className="flex items-center gap-4 text-[44px] leading-none font-bold tracking-tight">
          PANEL RESULTS ·{' '}
          <span className={`flex items-center gap-2.5 ${STATUS[status].text}`}>
            <span className={`size-4 rounded-full ${STATUS[status].dot}`} aria-hidden />
            {status}
          </span>
        </h1>
        {status === 'offline' && (
          <p className="text-danger">Can't reach the wall server. Results will appear when it's back.</p>
        )}
        {entries.length === 0 ? (
          <p className="rounded-3xl bg-white/70 px-6 py-10 text-center text-2xl text-ink-2 ring-1 ring-line">
            Waiting for the first judge. Scan the code to play.
          </p>
        ) : (
          <ol className="flex max-h-[78vh] flex-col gap-2.5 overflow-y-auto pr-1" aria-live="polite">
            {entries.map((e) => (
              <WallRow key={e.n} entry={e} />
            ))}
            <li ref={end} aria-hidden />
          </ol>
        )}
      </section>

      <aside className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col items-center rounded-3xl bg-white p-5 shadow-float ring-1 ring-line">
          <p className="text-center font-display text-[28px] leading-tight">{PHONE_TITLE}</p>
          <p className="mt-1 text-center text-ink-2">{PHONE_ASK}</p>
          <div className="mt-3">
            <WallQr text={phone} />
          </div>
          <div className="mt-2 font-mono text-5xl font-semibold tracking-[0.25em]">{code}</div>
          <div className="mt-1 max-w-full truncate text-xs text-ink-3">{phone}</div>
        </div>

        <details className="w-full rounded-3xl bg-white p-4 ring-1 ring-line">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-2">
            <Plus size={14} aria-hidden /> Add one yourself
          </summary>
          <div className="mt-3">
            <SkipperEntry code={code} judge="Presenter" onPosted={() => void refresh()} />
          </div>
        </details>
      </aside>
    </main>
  )
}
