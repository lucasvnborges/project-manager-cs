import type { ProjectFormValues } from '../types/project'

export type ProjectFieldErrors = Partial<Record<keyof ProjectFormValues, string>>

export const VALIDATION_MESSAGES = {
  nameRequired: 'Por favor, digite ao menos duas palavras',
  clientRequired: 'Por favor, digite ao menos uma palavra',
  invalidDate: 'Selecione uma data válida'
} as const

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/

/** Trims and collapses inner whitespace so " Meu   Projeto " becomes "Meu Projeto". */
export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function countWords(value: string): number {
  const normalized = normalizeText(value)
  return normalized.length === 0 ? 0 : normalized.split(' ').length
}

/** Keeps only digits and slashes in the `DD/MM/YYYY` shape, never more than 10 characters. */
export function maskBrDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  if (digits.length <= 2) return day
  if (digits.length <= 4) return `${day}/${month}`
  return `${day}/${month}/${year}`
}

export function isoDateToBr(value: string): string {
  if (!ISO_DATE.test(value)) return value

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

/** Accepts `DD/MM/YYYY` or `YYYY-MM-DD`. Returns ISO when the shape is complete. */
export function toIsoDate(value: string): string | null {
  const trimmed = value.trim()
  const br = BR_DATE.exec(trimmed)

  if (br) return `${br[3]}-${br[2]}-${br[1]}`
  if (ISO_DATE.test(trimmed)) return trimmed
  return null
}

/** Validates the civil date and rejects impossible days such as 31/02/2025. */
export function isValidCivilDate(value: string): boolean {
  const iso = toIsoDate(value)

  if (!iso) return false

  const [year, month, day] = iso.split('-').map(Number) as [number, number, number]
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

/** Today as a civil date in America/Sao_Paulo, matching the product locale. */
export function todayCivilDate(reference: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(reference)
}

export function validateProject(values: ProjectFormValues): ProjectFieldErrors {
  const errors: ProjectFieldErrors = {}
  const startIso = toIsoDate(values.startDate)
  const endIso = toIsoDate(values.endDate)
  const startValid = isValidCivilDate(values.startDate)
  const endValid = isValidCivilDate(values.endDate)

  if (countWords(values.name) < 2) {
    errors.name = VALIDATION_MESSAGES.nameRequired
  }

  if (countWords(values.client) < 1) {
    errors.client = VALIDATION_MESSAGES.clientRequired
  }

  if (!startValid) {
    errors.startDate = VALIDATION_MESSAGES.invalidDate
  }

  if (!endValid) {
    errors.endDate = VALIDATION_MESSAGES.invalidDate
  } else if (startValid && startIso && endIso && endIso < startIso) {
    errors.endDate = VALIDATION_MESSAGES.invalidDate
  }

  return errors
}

export function hasErrors(errors: ProjectFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
