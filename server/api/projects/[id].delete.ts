import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { deleteProject } from '../../database/projects'
import { internalError, isApiError, notFound } from '../../utils/api-error'
import { removeCover } from '../../utils/cover-storage'
import { assertProjectId } from '../../utils/project-validation'

export default defineEventHandler(async (event): Promise<null> => {
  const id = assertProjectId(getRouterParam(event, 'id'))

  try {
    const removed = await deleteProject(id)

    if (!removed) throw notFound()

    await removeCover(removed.coverPathname)

    setResponseStatus(event, 204)

    return null
  } catch (error) {
    if (isApiError(error)) throw error
    throw internalError(`DELETE /api/projects/${id}`, error)
  }
})
