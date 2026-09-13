import type { Project, ProjectSort } from '../types/project'
import { toIsoDate } from '../validation/project'

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

/** Lowercases and strips diacritics so "Projeto" matches "projéto". */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function matchesQuery(project: Project, query: string): boolean {
  return normalizeForSearch(project.name).includes(normalizeForSearch(query))
}

function byNameThenId(a: Project, b: Project): number {
  const byName = collator.compare(a.name, b.name)

  return byName !== 0 ? byName : a.id.localeCompare(b.id)
}

/** Civil `YYYY-MM-DD` from ISO, BR or Date-like strings — never createdAt. */
export function civilDate(value: string): string {
  return toIsoDate(value) ?? value.slice(0, 10)
}

function utcDay(value: string): number {
  const [year = 0, month = 1, day = 1] = civilDate(value).split('-').map(Number)

  return Date.UTC(year, month - 1, day)
}

function distanceFromToday(value: string, today: string): number {
  return Math.abs(utcDay(value) - utcDay(today))
}

function byNearestStart(today: string) {
  return (a: Project, b: Project): number => {
    const byDistance = distanceFromToday(a.startDate, today) - distanceFromToday(b.startDate, today)

    return byDistance !== 0 ? byDistance : byNameThenId(a, b)
  }
}

/**
 * Sorts a copy of the list. Deadlines that have not passed come first in
 * ascending order; overdue projects follow, most recent first.
 */
export function sortProjects(items: Project[], sort: ProjectSort, today: string): Project[] {
  const sorted = [...items]

  if (sort === 'recent-start') {
    return sorted.sort(byNearestStart(today))
  }

  if (sort === 'nearest-deadline') {
    return sorted.sort((a, b) => {
      const aOverdue = civilDate(a.endDate) < today
      const bOverdue = civilDate(b.endDate) < today

      if (aOverdue !== bOverdue) return aOverdue ? 1 : -1

      if (a.endDate !== b.endDate) {
        if (aOverdue) return civilDate(a.endDate) < civilDate(b.endDate) ? 1 : -1
        return civilDate(a.endDate) < civilDate(b.endDate) ? -1 : 1
      }

      return byNameThenId(a, b)
    })
  }

  return sorted.sort(byNameThenId)
}

export interface ProjectListOptions {
  query?: string
  favoritesOnly?: boolean
  sort: ProjectSort
  today: string
}

export function buildProjectList(items: Project[], options: ProjectListOptions): Project[] {
  let result = items

  if (options.favoritesOnly) {
    result = result.filter((project) => project.isFavorite)
  }

  if (options.query) {
    result = result.filter((project) => matchesQuery(project, options.query as string))
  }

  return sortProjects(result, options.sort, options.today)
}
