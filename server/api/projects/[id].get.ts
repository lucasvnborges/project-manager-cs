import { defineEventHandler, getRouterParam } from 'h3'
import type { Project } from '../../../shared/types/project'
import { findProject } from '../../database/projects'
import { internalError, isApiError, notFound } from '../../utils/api-error'
import { assertProjectId, toProject } from '../../utils/project-validation'

export default defineEventHandler(async (event): Promise<Project> => {
  const id = assertProjectId(getRouterParam(event, 'id'))

  try {
    const row = await findProject(id)

    if (!row) throw notFound()

    return toProject(row)
  } catch (error) {
    if (isApiError(error)) throw error
    throw internalError(`GET /api/projects/${id}`, error)
  }
})
