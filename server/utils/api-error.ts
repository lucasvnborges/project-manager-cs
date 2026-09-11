import { createError, H3Error } from 'h3'
import type { ApiErrorBody } from '#shared/types/project'

type FieldErrors = ApiErrorBody['fieldErrors']

export function apiError(
  statusCode: number,
  code: string,
  message: string,
  fieldErrors?: FieldErrors
): H3Error {
  return createError({
    statusCode,
    statusMessage: message,
    data: { statusCode, code, message, fieldErrors } satisfies ApiErrorBody
  })
}

export const badRequest = (message: string, fieldErrors?: FieldErrors) =>
  apiError(400, 'BAD_REQUEST', message, fieldErrors)

export const notFound = (message = 'Projeto não encontrado.') => apiError(404, 'NOT_FOUND', message)

export const payloadTooLarge = (message: string, fieldErrors?: FieldErrors) =>
  apiError(413, 'PAYLOAD_TOO_LARGE', message, fieldErrors)

export const unsupportedMediaType = (message: string, fieldErrors?: FieldErrors) =>
  apiError(415, 'UNSUPPORTED_MEDIA_TYPE', message, fieldErrors)

/**
 * Logs the real cause on the server and returns a generic 500 so connection
 * strings and driver messages never reach the client.
 */
export function internalError(context: string, cause: unknown): H3Error {
  console.error(`[api] ${context}`, cause)

  return apiError(500, 'INTERNAL_ERROR', 'Não foi possível concluir a operação. Tente novamente.')
}

export function isApiError(error: unknown): error is H3Error {
  return error instanceof H3Error
}
