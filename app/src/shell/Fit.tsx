import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** 'contain' fits width and the rest of the viewport height; 'width' fits width only. */
  mode?: 'contain' | 'width'
  maxScale?: number
  /** Space to keep free under the content, in px. */
  bottom?: number
  align?: 'center' | 'start'
}

/** Scales its content up or down to use the screen it is presented on. */
export function Fit({ children, mode = 'contain', maxScale = 1.6, bottom = 32, align = 'center' }: Props) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ scale: 1, w: 0, h: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      const o = outer.current
      const i = inner.current
      if (!o || !i) return
      const w = i.offsetWidth
      const h = i.offsetHeight
      if (!w || !h) return
      const byWidth = o.clientWidth / w
      const top = o.getBoundingClientRect().top + window.scrollY
      const byHeight = (window.innerHeight - top - bottom) / h
      const raw = mode === 'width' ? byWidth : Math.min(byWidth, byHeight)
      const scale = Math.max(0.5, Math.min(maxScale, raw))
      setBox((b) => (b.scale === scale && b.w === w && b.h === h ? b : { scale, w, h }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (inner.current) ro.observe(inner.current)
    if (outer.current) ro.observe(outer.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [mode, maxScale, bottom])

  return (
    <div ref={outer} className={`flex w-full ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
      <div style={{ width: box.w * box.scale || undefined, height: box.h * box.scale || undefined }}>
        <div
          ref={inner}
          className="w-max origin-top-left"
          style={{ transform: `scale(${box.scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
