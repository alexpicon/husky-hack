import type { ReactNode } from 'react'
import { ArrowRightLeft, Banknote, Camera, ChevronLeft, CircleDollarSign, Ellipsis, ShieldAlert } from 'lucide-react'
import { reportLinkShown } from '../report/report'
import { useReportSheet } from '../report/useReportSheet'
import { useZoneTone } from '../story/engine'

/** Colors sampled from Sound's current mobile app. */
export const SOUND = {
  navy: '#0b1f5c',
  navyLight: '#16307a',
  canvas: '#eef0f5',
  text: '#1c1c1e',
  muted: '#6b6f7a',
  link: '#2f6fd1',
  action: '#3f78a8',
  tabIdle: '#8e8e93',
} as const

export const soundFont = {
  fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Inter, ui-sans-serif, sans-serif",
}

export type SoundTab = 'accounts' | 'move' | 'payments' | 'deposit' | 'more'

const TABS: { id: SoundTab; label: string; Icon: typeof CircleDollarSign }[] = [
  { id: 'accounts', label: 'Accounts', Icon: CircleDollarSign },
  { id: 'move', label: 'Move Money', Icon: ArrowRightLeft },
  { id: 'payments', label: 'Payments', Icon: Banknote },
  { id: 'deposit', label: 'Mobile Deposit', Icon: Camera },
  { id: 'more', label: 'More', Icon: Ellipsis },
]

export function SoundTabBar({ active }: { active?: SoundTab }) {
  return (
    <nav
      className="grid h-[62px] shrink-0 grid-cols-5 border-t border-black/10 bg-[#f7f7f9]"
      aria-label="Sound app tabs"
    >
      {TABS.map(({ id, label, Icon }) => (
        <span
          key={id}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px]"
          style={{ color: id === active ? SOUND.navy : SOUND.tabIdle }}
        >
          <Icon size={22} strokeWidth={id === active ? 2.4 : 1.9} aria-hidden />
          <span className="truncate px-0.5">{label}</span>
        </span>
      ))}
    </nav>
  )
}

type ScreenProps = {
  title: string
  tab?: SoundTab
  back?: boolean
  right?: ReactNode
  /** Shows "I think I've been scammed" under the title. Unset, POLICY.reportLink decides. */
  report?: boolean
  children: ReactNode
}

/**
 * A full Sound app screen for the 340 x 652 phone body: navy title bar, grey canvas, tab bar.
 * Pair it with <Phone statusBar="navy"> so the status bar matches.
 */
export function SoundAppScreen({ title, tab, back = false, right, report, children }: ScreenProps) {
  const zone = useZoneTone()
  const sheet = useReportSheet()
  const linked = sheet.available && (report ?? reportLinkShown(zone))
  return (
    <div className="flex h-full flex-col" style={{ ...soundFont, background: SOUND.canvas, color: SOUND.text }}>
      <header
        className="shrink-0 shadow-[0_2px_6px_rgb(0_0_0/0.18)]"
        style={{ background: `linear-gradient(180deg, ${SOUND.navy}, ${SOUND.navyLight})` }}
      >
        <div className={`relative flex items-center justify-center px-12 ${linked ? 'h-9' : 'h-[52px]'}`}>
          {back && <ChevronLeft size={24} className="absolute left-3 text-white" aria-hidden />}
          <h2 className="truncate text-[19px] font-semibold text-white">{title}</h2>
          {right && <div className="absolute right-4 text-[15px] text-white">{right}</div>}
        </div>
        {linked && (
          <div className="flex justify-center pb-1">
            <button
              type="button"
              onClick={sheet.open}
              className="flex h-5 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-semibold text-white transition hover:bg-white/25"
            >
              <ShieldAlert size={14} aria-hidden />
              I think I've been scammed
            </button>
          </div>
        )}
      </header>
      {/* The link adds 8px to the title bar, so the content gives 8px back and every screen keeps its height. */}
      <div className={`min-h-0 flex-1 overflow-y-auto px-3.5 pb-4 ${linked ? 'pt-2' : 'pt-4'}`}>{children}</div>
      <SoundTabBar active={tab} />
      {sheet.sheet}
    </div>
  )
}

export function SoundCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgb(15_23_42/0.07)] ${className}`}>
      {children}
    </div>
  )
}

export function SoundRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-black/[0.07] py-2.5 last:border-0">
      <span className="text-[15px]" style={{ color: SOUND.muted }}>
        {label}
      </span>
      <span className="text-right text-[15px] font-medium">{value}</span>
    </div>
  )
}

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'link'
  disabled?: boolean
}

/** Sound's pill button: steel-blue fill, navy outline, or a blue text link. */
export function SoundButton({ children, onClick, variant = 'primary', disabled }: ButtonProps) {
  const look = {
    primary: 'h-12 w-full rounded-[18px] text-[17px] text-white shadow-[0_3px_8px_rgb(31_77_120/0.35)]',
    outline: 'h-12 w-full rounded-[14px] border-2 bg-white text-[17px]',
    link: 'h-10 w-full text-[16px]',
  }[variant]
  const style =
    variant === 'primary'
      ? { background: `linear-gradient(180deg, #5b92c2, ${SOUND.action})` }
      : variant === 'outline'
        ? { borderColor: SOUND.action, color: SOUND.action }
        : { color: SOUND.link }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 font-medium transition active:scale-[0.98] disabled:opacity-40 ${look}`}
      style={style}
    >
      {children}
    </button>
  )
}
