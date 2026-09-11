import { describe, expect, it } from 'vitest'
import {
  addSearchHistoryEntry,
  parseSearchHistory,
  removeSearchHistoryEntry,
  SEARCH_HISTORY_LIMIT
} from '../../app/composables/useSearchHistory'

describe('parseSearchHistory', () => {
  it('returns an empty list when storage is missing', () => {
    expect(parseSearchHistory(null)).toEqual([])
  })

  it('returns an empty list when storage is corrupted', () => {
    expect(parseSearchHistory('{not json')).toEqual([])
    expect(parseSearchHistory('{"oops":true}')).toEqual([])
    expect(parseSearchHistory('[1,2,3]')).toEqual([])
  })

  it('keeps only the first five string entries', () => {
    const raw = JSON.stringify(['a', 'b', 'c', 'd', 'e', 'f', 7])

    expect(parseSearchHistory(raw)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

describe('addSearchHistoryEntry', () => {
  it('ignores blank terms', () => {
    expect(addSearchHistoryEntry(['Portal'], '   ')).toEqual(['Portal'])
  })

  it('puts a new term at the top and caps the list at five', () => {
    const next = addSearchHistoryEntry(['um', 'dois', 'tres', 'quatro', 'cinco'], 'seis')

    expect(next).toEqual(['seis', 'um', 'dois', 'tres', 'quatro'])
    expect(next).toHaveLength(SEARCH_HISTORY_LIMIT)
  })

  it('moves a case-insensitive duplicate to the top', () => {
    expect(addSearchHistoryEntry(['Portal Interno', 'App Externo'], '  portal interno  ')).toEqual([
      'portal interno',
      'App Externo'
    ])
  })
})

describe('removeSearchHistoryEntry', () => {
  it('removes a single matching term', () => {
    expect(removeSearchHistoryEntry(['Portal', 'App'], 'Portal')).toEqual(['App'])
  })

  it('leaves the list unchanged when the term is absent', () => {
    expect(removeSearchHistoryEntry(['Portal'], 'App')).toEqual(['Portal'])
  })
})
