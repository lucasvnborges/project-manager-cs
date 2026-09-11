import { describe, expect, it } from 'vitest'
import { highlightSegments } from '../../app/utils/highlight'

describe('highlightSegments', () => {
  it('returns a single plain segment without a query', () => {
    expect(highlightSegments('Projeto 01', '')).toEqual([{ text: 'Projeto 01', match: false }])
  })

  it('marks the matching slice of the original text', () => {
    expect(highlightSegments('Projeto 01', 'projet')).toEqual([
      { text: 'Projet', match: true },
      { text: 'o 01', match: false }
    ])
  })

  it('marks every occurrence', () => {
    expect(highlightSegments('Portal do Portal', 'portal')).toEqual([
      { text: 'Portal', match: true },
      { text: ' do ', match: false },
      { text: 'Portal', match: true }
    ])
  })

  it('matches accented text and keeps the original characters', () => {
    expect(highlightSegments('Projéto Álfa', 'projeto')).toEqual([
      { text: 'Projéto', match: true },
      { text: ' Álfa', match: false }
    ])
  })

  it('treats regex metacharacters as literal text', () => {
    expect(highlightSegments('Projeto 01', '.*')).toEqual([{ text: 'Projeto 01', match: false }])
    expect(highlightSegments('Projeto (01)', '(01)')).toEqual([
      { text: 'Projeto ', match: false },
      { text: '(01)', match: true }
    ])
  })

  it('never emits HTML, only text segments', () => {
    const segments = highlightSegments('<img src=x onerror=alert(1)>', 'img')

    expect(segments.map((segment) => segment.text).join('')).toBe('<img src=x onerror=alert(1)>')
    expect(segments.some((segment) => segment.match)).toBe(true)
  })
})
