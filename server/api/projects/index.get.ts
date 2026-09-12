import { defineEventHandler } from 'h3'
import type { ProjectListResponse } from '#shared/types/project'
import { todayCivilDate } from '#shared/validation/project'
import { listProjects } from '../../database/projects'
import { internalError, isApiError } from '../../utils/api-error'
import { buildProjectList } from '#shared/utils/project-list'
import { parseListQuery, toProject } from '../../utils/project-validation'

export default defineEventHandler(async (event): Promise<ProjectListResponse> => {
  const { q, favorites, sort } = parseListQuery(event)

  try {
    const all = (await listProjects()).map(toProject)
    const items = buildProjectList(all, {
      query: q,
      favoritesOnly: favorites === true,
      sort,
      today: todayCivilDate()
    })

    return { items, total: all.length, filteredTotal: items.length }
  } catch (error) {
    if (isApiError(error)) throw error
    throw internalError('GET /api/projects', error)
  }
})
