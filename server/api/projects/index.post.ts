import { randomUUID } from 'node:crypto'
import { defineEventHandler, setResponseStatus } from 'h3'
import type { Project } from '../../../shared/types/project'
import { insertProject } from '../../database/projects'
import { internalError, isApiError } from '../../utils/api-error'
import { removeCover, type StoredCover, uploadCover } from '../../utils/cover-storage'
import { readProjectMultipart } from '../../utils/multipart'
import { assertValidProject, toProject } from '../../utils/project-validation'

export default defineEventHandler(async (event): Promise<Project> => {
  const { values, cover } = await readProjectMultipart(event)
  const validated = assertValidProject(values)
  const id = randomUUID()

  let stored: StoredCover | null = null

  try {
    if (cover) {
      stored = await uploadCover(id, cover)
    }

    const row = await insertProject({
      id,
      ...validated,
      coverUrl: stored?.url ?? null,
      coverPathname: stored?.pathname ?? null
    })

    setResponseStatus(event, 201)

    return toProject(row)
  } catch (error) {
    // The upload succeeded but persistence failed, so drop the orphan blob.
    await removeCover(stored?.pathname)

    if (isApiError(error)) throw error
    throw internalError('POST /api/projects', error)
  }
})
