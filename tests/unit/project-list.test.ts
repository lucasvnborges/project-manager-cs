import { describe, expect, it } from 'vitest'
import type { Project } from '../../shared/types/project'
import { buildProjectList, matchesQuery, sortProjects } from '../../shared/utils/project-list'

const TODAY = '2026-09-11'

function project(overrides: Partial<Project> & { id: string; name: string }): Project {
  return {
    client: 'Clicksign',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isFavorite: false,
    coverUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('matchesQuery', () => {
  it('ignores case and accents', () => {
    const item = project({ id: '1', name: 'Projéto Álfa' })

    expect(matchesQuery(item, 'projeto')).toBe(true)
    expect(matchesQuery(item, 'ALFA')).toBe(true)
    expect(matchesQuery(item, 'beta')).toBe(false)
  })

  it('treats special characters as plain text', () => {
    const item = project({ id: '1', name: 'Projeto (2026)' })

    expect(matchesQuery(item, '(2026)')).toBe(true)
    expect(matchesQuery(item, '.*')).toBe(false)
  })
})

describe('sortProjects', () => {
  it('sorts alphabetically using pt-BR rules', () => {
    const items = [
      project({ id: 'b', name: 'Zebra Dois' }),
      project({ id: 'a', name: 'Água Viva' }),
      project({ id: 'c', name: 'Banco Central' })
    ]

    expect(sortProjects(items, 'alphabetical', TODAY).map((item) => item.id)).toEqual([
      'a',
      'c',
      'b'
    ])
  })

  it('breaks alphabetical ties by id', () => {
    const items = [
      project({ id: 'b2', name: 'Projeto Igual' }),
      project({ id: 'a1', name: 'Projeto Igual' })
    ]

    expect(sortProjects(items, 'alphabetical', TODAY).map((item) => item.id)).toEqual(['a1', 'b2'])
  })

  it('sorts start dates from closest to today to farthest', () => {
    const items = [
      project({ id: 'far-future', name: 'A Projeto', startDate: '2026-12-12' }),
      project({ id: 'yesterday', name: 'B Projeto', startDate: '2026-09-10' }),
      project({ id: 'next-week', name: 'C Projeto', startDate: '2026-09-20' })
    ]

    expect(sortProjects(items, 'recent-start', TODAY).map((item) => item.id)).toEqual([
      'yesterday',
      'next-week',
      'far-future'
    ])
  })

  it('ignores createdAt when sorting by most recent start', () => {
    const items = [
      project({
        id: 'created-last',
        name: 'Criado por último',
        startDate: '2026-01-01',
        createdAt: '2026-09-11T23:00:00.000Z'
      }),
      project({
        id: 'created-first',
        name: 'Criado primeiro',
        startDate: '2026-08-01',
        createdAt: '2026-01-01T00:00:00.000Z'
      })
    ]

    expect(sortProjects(items, 'recent-start', TODAY).map((item) => item.id)).toEqual([
      'created-first',
      'created-last'
    ])
  })

  it('treats a past start and a future start by distance to today', () => {
    const items = [
      project({ id: 'far-past', name: 'A Projeto', startDate: '2020-01-01' }),
      project({ id: 'near-future', name: 'B Projeto', startDate: '2026-09-20' })
    ]

    expect(sortProjects(items, 'recent-start', TODAY).map((item) => item.id)).toEqual([
      'near-future',
      'far-past'
    ])
  })

  it('puts upcoming deadlines first and overdue ones last', () => {
    const items = [
      project({ id: 'overdue-old', name: 'A Projeto', endDate: '2020-01-01' }),
      project({ id: 'far', name: 'B Projeto', endDate: '2027-01-01' }),
      project({ id: 'soon', name: 'C Projeto', endDate: '2026-09-20' }),
      project({ id: 'overdue-recent', name: 'D Projeto', endDate: '2026-09-01' })
    ]

    expect(sortProjects(items, 'nearest-deadline', TODAY).map((item) => item.id)).toEqual([
      'soon',
      'far',
      'overdue-recent',
      'overdue-old'
    ])
  })

  it('does not mutate the input list', () => {
    const items = [project({ id: 'b', name: 'B Projeto' }), project({ id: 'a', name: 'A Projeto' })]

    sortProjects(items, 'alphabetical', TODAY)

    expect(items.map((item) => item.id)).toEqual(['b', 'a'])
  })
})

describe('buildProjectList', () => {
  const items = [
    project({ id: '1', name: 'Portal Interno', isFavorite: true }),
    project({ id: '2', name: 'App Externo' }),
    project({ id: '3', name: 'Portal Externo', isFavorite: true })
  ]

  it('filters favorites', () => {
    const result = buildProjectList(items, {
      favoritesOnly: true,
      sort: 'alphabetical',
      today: TODAY
    })

    expect(result.map((item) => item.id)).toEqual(['3', '1'])
  })

  it('combines search, favorites and sorting', () => {
    const result = buildProjectList(items, {
      query: 'portal',
      favoritesOnly: true,
      sort: 'alphabetical',
      today: TODAY
    })

    expect(result.map((item) => item.id)).toEqual(['3', '1'])
  })

  it('returns an empty list when nothing matches', () => {
    const result = buildProjectList(items, {
      query: 'inexistente',
      sort: 'alphabetical',
      today: TODAY
    })

    expect(result).toEqual([])
  })
})
