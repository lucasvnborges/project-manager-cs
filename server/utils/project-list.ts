import type { Project, ProjectSort } from '../../shared/types/project'

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

/**
 * Sorts a copy of the list. Deadlines that have not passed come first in
 * ascending order; overdue projects follow, most recent first.
 */
export function sortProjects(items: Project[], sort: ProjectSort, today: string): Project[] {
  const sorted = [...items]

  if (sort === 'recent-start') {
    return sorted.sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate < b.startDate ? 1 : -1
      return byNameThenId(a, b)
    })
  }

  if (sort === 'nearest-deadline') {
    return sorted.sort((a, b) => {
      const aOverdue = a.endDate < today
      const bOverdue = b.endDate < today

      if (aOverdue !== bOverdue) return aOverdue ? 1 : -1

      if (a.endDate !== b.endDate) {
        if (aOverdue) return a.endDate < b.endDate ? 1 : -1
        return a.endDate < b.endDate ? -1 : 1
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
