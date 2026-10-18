type View = Pick<Window, 'matchMedia'> | undefined

/** Smooth, unless the device asks for less motion. */
export function scrollBehavior(view: View = globalThis.window): ScrollBehavior {
  return view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

/**
 * Device screens scroll inside a fixed frame, so Skipper's newest line would land out of view.
 * `end` is the chat's last line: bringing it to the nearest edge shows that line and her next
 * choice above it, and moves the page only when the chat is off the page's own view.
 */
export function showLatest(end: Pick<Element, 'scrollIntoView'> | null, view?: View) {
  end?.scrollIntoView?.({ block: 'nearest', behavior: scrollBehavior(view) })
}
