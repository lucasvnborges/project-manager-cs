import { describe, expect, it } from 'vitest'
import {
  countWords,
  isValidCivilDate,
  isoDateToBr,
  maskBrDate,
  normalizeText,
  todayCivilDate,
  toIsoDate,
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
  it('accepts a real ISO or BR date', () => {
    expect(isValidCivilDate('2026-02-28')).toBe(true)
    expect(isValidCivilDate('28/02/2026')).toBe(true)
  })

  it('rejects malformed and impossible dates', () => {
    expect(isValidCivilDate('11-09-2026')).toBe(false)
    expect(isValidCivilDate('31/02/2026')).toBe(false)
    expect(isValidCivilDate('2026-02-31')).toBe(false)
    expect(isValidCivilDate('')).toBe(false)
  })
})

describe('maskBrDate', () => {
  it('caps input at DD/MM/YYYY', () => {
    expect(maskBrDate('11092026extra')).toBe('11/09/2026')
    expect(maskBrDate('11/09/2026/99')).toBe('11/09/2026')
    expect(maskBrDate('11a09b2026')).toBe('11/09/2026')
  })
})

describe('date format conversion', () => {
  it('converts between ISO and DD/MM/YYYY', () => {
    expect(isoDateToBr('2026-09-11')).toBe('11/09/2026')
    expect(toIsoDate('11/09/2026')).toBe('2026-09-11')
    expect(toIsoDate('2026-09-11')).toBe('2026-09-11')
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
    expect(validateProject(baseValues)).toEqual({})
  })

  it('requires at least two words in the name', () => {
    const errors = validateProject({ ...baseValues, name: 'Iridium' })

    expect(errors.name).toBe(VALIDATION_MESSAGES.nameRequired)
  })

  it('requires a non-empty client', () => {
    const errors = validateProject({ ...baseValues, client: '   ' })

    expect(errors.client).toBe(VALIDATION_MESSAGES.clientRequired)
  })

  it('accepts a start date in the past', () => {
    const errors = validateProject({ ...baseValues, startDate: '2000-01-01', endDate: '2000-01-02' })

    expect(errors.startDate).toBeUndefined()
    expect(errors.endDate).toBeUndefined()
  })

  it('accepts dates typed as DD/MM/YYYY', () => {
    const errors = validateProject({
      ...baseValues,
      startDate: '01/01/2000',
      endDate: '02/01/2000'
    })

    expect(errors).toEqual({})
  })

  it('rejects an end date before the start date', () => {
    const errors = validateProject({
      ...baseValues,
      startDate: '12/12/2026',
      endDate: '11/12/2026'
    })

    expect(errors.endDate).toBe(VALIDATION_MESSAGES.invalidDate)
  })

  it('accepts an end date equal to the start date', () => {
    const errors = validateProject({ ...baseValues, startDate: TODAY, endDate: TODAY })

    expect(errors.endDate).toBeUndefined()
  })
})
