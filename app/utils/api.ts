import type { ApiErrorBody } from '#shared/types/project'

const FALLBACK_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

function errorBody(error: unknown): ApiErrorBody | null {
  const data = (error as { data?: unknown })?.data

  if (typeof data === 'object' && data !== null && 'message' in data) {
    return data as ApiErrorBody
  }

  return null
}

export function apiErrorMessage(error: unknown): string {
  return errorBody(error)?.message ?? FALLBACK_MESSAGE
}

export function apiFieldErrors(error: unknown): NonNullable<ApiErrorBody['fieldErrors']> {
  return errorBody(error)?.fieldErrors ?? {}
}
