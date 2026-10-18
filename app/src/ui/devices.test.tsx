/** Kit row IDs are for staff and judges: a member's phone or the branch tablet never shows one. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Phone, StaffWindow, Tablet } from './devices'
import { Source } from './primitives'

const ID = 'E00074'

describe('kit row IDs', () => {
  it('show on a kit card and in the staff console', () => {
    expect(renderToStaticMarkup(<Source ids={ID} />)).toContain(ID)
    expect(renderToStaticMarkup(<StaffWindow title="Case"><Source ids={ID} /></StaffWindow>)).toContain(ID)
  })

  it('never show on a phone or a tablet', () => {
    const nested = (
      <p>
        Your payment <Source ids={[ID, 'E00076']} />
      </p>
    )
    expect(renderToStaticMarkup(<Phone time="1:47 PM">{nested}</Phone>)).not.toMatch(/E000\d\d/)
    expect(renderToStaticMarkup(<Tablet>{nested}</Tablet>)).not.toMatch(/E000\d\d/)
  })
})
