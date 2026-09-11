import { defineEventHandler, getRouterParam, readBody } from 'h3'
import type { Project } from '../../../../shared/types/project'
import { updateProject } from '../../../database/projects'
import { internalError, isApiError, notFound } from '../../../utils/api-error'
import {
  assertFavoritePayload,
  assertProjectId,
  toProject
} from '../../../utils/project-validation'

export default defineEventHandler(async (event): Promise<Project> => {
  const id = assertProjectId(getRouterParam(event, 'id'))
  const isFavorite = assertFavoritePayload(await readBody(event))

  try {
    const row = await updateProject(id, { isFavorite })

    if (!row) throw notFound()

    return toProject(row)
  } catch (error) {
    if (isApiError(error)) throw error
    throw internalError(`PATCH /api/projects/${id}/favorite`, error)
  }
})
