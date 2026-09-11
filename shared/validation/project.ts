import type { ProjectFormValues } from '../types/project'

export type ProjectFieldErrors = Partial<Record<keyof ProjectFormValues, string>>

export const VALIDATION_MESSAGES = {
  nameRequired: 'Por favor, digite ao menos duas palavras',
  clientRequired: 'Por favor, digite ao menos uma palavra',
  invalidDate: 'Selecione uma data válida'
} as const

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Trims and collapses inner whitespace so " Meu   Projeto " becomes "Meu Projeto". */
export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function countWords(value: string): number {
  const normalized = normalizeText(value)
  return normalized.length === 0 ? 0 : normalized.split(' ').length
}

/** Validates the `YYYY-MM-DD` shape and rejects impossible days such as 2025-02-31. */
export function isValidCivilDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false

  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

/** Today as a civil date, so comparisons never cross a timezone boundary. */
export function todayCivilDate(reference: Date = new Date()): string {
  const year = reference.getFullYear()
  const month = String(reference.getMonth() + 1).padStart(2, '0')
  const day = String(reference.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export interface ProjectValidationContext {
  /** Start date already stored, letting an edit keep a past date it did not change. */
  originalStartDate?: string
  today?: string
}

export function validateProject(
  values: ProjectFormValues,
  context: ProjectValidationContext = {}
): ProjectFieldErrors {
  const errors: ProjectFieldErrors = {}
  const today = context.today ?? todayCivilDate()

  if (countWords(values.name) < 2) {
    errors.name = VALIDATION_MESSAGES.nameRequired
  }

  if (countWords(values.client) < 1) {
    errors.client = VALIDATION_MESSAGES.clientRequired
  }

  const startValid = isValidCivilDate(values.startDate)
  const endValid = isValidCivilDate(values.endDate)

  if (!startValid) {
    errors.startDate = VALIDATION_MESSAGES.invalidDate
  } else if (values.startDate < today && values.startDate !== context.originalStartDate) {
    errors.startDate = VALIDATION_MESSAGES.invalidDate
  }

  if (!endValid) {
    errors.endDate = VALIDATION_MESSAGES.invalidDate
  } else if (startValid && values.endDate < values.startDate) {
    errors.endDate = VALIDATION_MESSAGES.invalidDate
  }

  return errors
}

export function hasErrors(errors: ProjectFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
