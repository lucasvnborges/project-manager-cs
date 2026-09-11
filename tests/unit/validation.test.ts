import { describe, expect, it } from 'vitest'
import {
  countWords,
  isValidCivilDate,
  normalizeText,
  todayCivilDate,
  VALIDATION_MESSAGES,
  validateProject
} from '../../shared/validation/project'

const TODAY = '2026-09-11'

const baseValues = {
  name: 'Portal Interno',
  client: 'Clicksign',
  startDate: TODAY,
  endDate: '2026-12-12'
}

describe('normalizeText', () => {
  it('trims and collapses inner whitespace', () => {
    expect(normalizeText('  Meu   Projeto  ')).toBe('Meu Projeto')
  })
})

describe('countWords', () => {
  it('counts words after normalization', () => {
    expect(countWords('  ')).toBe(0)
    expect(countWords('Iridium')).toBe(1)
    expect(countWords('Portal   Interno')).toBe(2)
  })
})

describe('isValidCivilDate', () => {
  it('accepts a real ISO date', () => {
    expect(isValidCivilDate('2026-02-28')).toBe(true)
  })

  it('rejects malformed and impossible dates', () => {
    expect(isValidCivilDate('11/09/2026')).toBe(false)
    expect(isValidCivilDate('2026-02-31')).toBe(false)
    expect(isValidCivilDate('')).toBe(false)
  })
})

describe('todayCivilDate', () => {
  it('uses America/Sao_Paulo so client and server share the same calendar day', () => {
    expect(todayCivilDate(new Date('2026-09-12T02:30:00.000Z'))).toBe('2026-09-11')
    expect(todayCivilDate(new Date('2026-09-12T03:30:00.000Z'))).toBe('2026-09-12')
  })
})

describe('validateProject', () => {
  it('accepts valid values', () => {
    expect(validateProject(baseValues, { today: TODAY })).toEqual({})
  })

  it('requires at least two words in the name', () => {
    const errors = validateProject({ ...baseValues, name: 'Iridium' }, { today: TODAY })

    expect(errors.name).toBe(VALIDATION_MESSAGES.nameRequired)
  })

  it('requires a non-empty client', () => {
    const errors = validateProject({ ...baseValues, client: '   ' }, { today: TODAY })

    expect(errors.client).toBe(VALIDATION_MESSAGES.clientRequired)
  })

  it('rejects a start date in the past', () => {
    const errors = validateProject({ ...baseValues, startDate: '2000-01-01' }, { today: TODAY })

    expect(errors.startDate).toBe(VALIDATION_MESSAGES.invalidDate)
  })

  it('keeps an unchanged historical start date valid while editing', () => {
    const errors = validateProject(
      { ...baseValues, startDate: '2024-09-01' },
      { today: TODAY, originalStartDate: '2024-09-01' }
    )

    expect(errors.startDate).toBeUndefined()
  })

  it('rejects an end date before the start date', () => {
    const errors = validateProject(
      { ...baseValues, startDate: '2026-12-12', endDate: '2026-12-11' },
      { today: TODAY }
    )

    expect(errors.endDate).toBe(VALIDATION_MESSAGES.invalidDate)
  })

  it('accepts an end date equal to the start date', () => {
    const errors = validateProject(
      { ...baseValues, startDate: TODAY, endDate: TODAY },
      { today: TODAY }
    )

    expect(errors.endDate).toBeUndefined()
  })
})
