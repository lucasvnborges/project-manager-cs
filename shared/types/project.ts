export type ProjectSort = 'alphabetical' | 'recent-start' | 'nearest-deadline'

export const PROJECT_SORTS: readonly ProjectSort[] = [
  'alphabetical',
  'recent-start',
  'nearest-deadline'
]

export const PROJECT_SORT_LABELS: Record<ProjectSort, string> = {
  alphabetical: 'Ordem alfabética',
  'recent-start': 'Iniciados mais recentes',
  'nearest-deadline': 'Prazo mais próximo'
}

/** Minimum query length before the search is dispatched. */
export const SEARCH_MIN_LENGTH = 3

/** Cover upload limit kept below the 4.5 MB Vercel Functions payload cap. */
export const COVER_MAX_BYTES = 4 * 1024 * 1024

export const COVER_ALLOWED_TYPES = ['image/jpeg', 'image/png'] as const

export interface Project {
  id: string
  name: string
  client: string
  /** Civil date as `YYYY-MM-DD`, never a timestamp. */
  startDate: string
  /** Civil date as `YYYY-MM-DD`, never a timestamp. */
  endDate: string
  isFavorite: boolean
  coverUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectListQuery {
  q?: string
  favorites?: boolean
  sort?: ProjectSort
}

export interface ProjectListResponse {
  items: Project[]
  /** Every project stored, regardless of search or filter. */
  total: number
  /** Projects remaining after search and filter. */
  filteredTotal: number
}

export interface ProjectFormValues {
  name: string
  client: string
  startDate: string
  endDate: string
}

export interface UpdateFavoritePayload {
  isFavorite: boolean
}

export interface ApiErrorBody {
  statusCode: number
  code: string
  message: string
  fieldErrors?: Partial<Record<keyof ProjectFormValues | 'cover', string>>
}
