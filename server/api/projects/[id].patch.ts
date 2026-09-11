import { defineEventHandler, getRouterParam } from 'h3'
import type { Project } from '#shared/types/project'
import { findProject, updateProject } from '../../database/projects'
import { internalError, isApiError, notFound } from '../../utils/api-error'
import { removeCover, type StoredCover, uploadCover } from '../../utils/cover-storage'
import { readProjectMultipart } from '../../utils/multipart'
import { assertProjectId, assertValidProject, toProject } from '../../utils/project-validation'

export default defineEventHandler(async (event): Promise<Project> => {
  const id = assertProjectId(getRouterParam(event, 'id'))
  const { values, cover, removeCover: shouldRemoveCover } = await readProjectMultipart(event)

  let stored: StoredCover | null = null

  try {
    const existing = await findProject(id)

    if (!existing) throw notFound()

    const validated = assertValidProject(values, { originalStartDate: existing.startDate })

    if (cover) {
      stored = await uploadCover(id, cover)
    }

    const keepsCover = !cover && !shouldRemoveCover
    const row = await updateProject(id, {
      ...validated,
      coverUrl: keepsCover ? existing.coverUrl : (stored?.url ?? null),
      coverPathname: keepsCover ? existing.coverPathname : (stored?.pathname ?? null)
    })

    if (!row) throw notFound()

    if (!keepsCover && existing.coverPathname !== stored?.pathname) {
      await removeCover(existing.coverPathname)
    }

    return toProject(row)
  } catch (error) {
    await removeCover(stored?.pathname)

    if (isApiError(error)) throw error
    throw internalError(`PATCH /api/projects/${id}`, error)
  }
})
