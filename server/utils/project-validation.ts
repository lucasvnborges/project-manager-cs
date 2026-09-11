import { getQuery, type H3Event } from 'h3'
import {
  PROJECT_SORTS,
  type Project,
  type ProjectFormValues,
  type ProjectListQuery,
  type ProjectSort,
  SEARCH_MIN_LENGTH
} from '../../shared/types/project'
import {
  hasErrors,
  normalizeText,
  type ProjectValidationContext,
  validateProject
} from '../../shared/validation/project'
import type { ProjectRow } from '../database/schema'
import { badRequest } from './api-error'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    startDate: row.startDate,
    endDate: row.endDate,
    isFavorite: row.isFavorite,
    coverUrl: row.coverUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  }
}

export function assertProjectId(id: string | undefined): string {
  if (!id || !UUID.test(id)) {
    throw badRequest('Identificador de projeto inválido.')
  }

  return id
}

/** Validates on the server regardless of what the client already checked. */
export function assertValidProject(
  values: ProjectFormValues,
  context: ProjectValidationContext = {}
): ProjectFormValues {
  const normalized: ProjectFormValues = {
    name: normalizeText(values.name),
    client: normalizeText(values.client),
    startDate: values.startDate.trim(),
    endDate: values.endDate.trim()
  }

  const errors = validateProject(normalized, context)

  if (hasErrors(errors)) {
    throw badRequest('Verifique os campos do formulário.', errors)
  }

  return normalized
}

function parseBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) return undefined
  if (value === 'true' || value === true) return true
  if (value === 'false' || value === false) return false

  throw badRequest(`O parâmetro "${field}" deve ser true ou false.`)
}

export function parseListQuery(
  event: H3Event
): Required<Pick<ProjectListQuery, 'sort'>> & ProjectListQuery {
  const query = getQuery(event)
  const rawQ = typeof query.q === 'string' ? query.q.trim() : ''
  const rawSort = query.sort

  if (rawQ.length > 0 && rawQ.length < SEARCH_MIN_LENGTH) {
    throw badRequest(`A busca exige ao menos ${SEARCH_MIN_LENGTH} caracteres.`)
  }

  let sort: ProjectSort = 'alphabetical'

  if (rawSort !== undefined) {
    if (typeof rawSort !== 'string' || !PROJECT_SORTS.includes(rawSort as ProjectSort)) {
      throw badRequest('Ordenação inválida.')
    }

    sort = rawSort as ProjectSort
  }

  return {
    q: rawQ.length > 0 ? rawQ : undefined,
    favorites: parseBoolean(query.favorites, 'favorites'),
    sort
  }
}

export function assertFavoritePayload(body: unknown): boolean {
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { isFavorite?: unknown }).isFavorite !== 'boolean'
  ) {
    throw badRequest('Informe "isFavorite" como booleano.')
  }

  return (body as { isFavorite: boolean }).isFavorite
}
