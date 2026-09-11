export const SEARCH_HISTORY_KEY = 'gerenciador-projetos:search-history'
export const SEARCH_HISTORY_LIMIT = 5

export function parseSearchHistory(raw: string | null): string[] {
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((entry): entry is string => typeof entry === 'string')
      .slice(0, SEARCH_HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function addSearchHistoryEntry(entries: string[], term: string): string[] {
  const normalized = term.trim()

  if (!normalized) return entries

  const withoutDuplicate = entries.filter(
    (entry) => entry.toLowerCase() !== normalized.toLowerCase()
  )

  return [normalized, ...withoutDuplicate].slice(0, SEARCH_HISTORY_LIMIT)
}

export function removeSearchHistoryEntry(entries: string[], term: string): string[] {
  return entries.filter((entry) => entry !== term)
}

function readStorage(): string[] {
  try {
    return parseSearchHistory(window.localStorage.getItem(SEARCH_HISTORY_KEY))
  } catch {
    return []
  }
}

function writeStorage(entries: string[]): void {
  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(entries))
  } catch {
    // Ignore quota or privacy-mode failures.
  }
}

export function useSearchHistory() {
  const entries = useState<string[]>('search-history', () => [])
  const hydrated = useState<boolean>('search-history-hydrated', () => false)

  /** Client-only so server rendering and hydration stay identical. */
  function load(): void {
    if (import.meta.server || hydrated.value) return

    entries.value = readStorage()
    hydrated.value = true
  }

  function add(term: string): void {
    entries.value = addSearchHistoryEntry(entries.value, term)
    writeStorage(entries.value)
  }

  function remove(term: string): void {
    entries.value = removeSearchHistoryEntry(entries.value, term)
    writeStorage(entries.value)
  }

  function clear(): void {
    entries.value = []
    writeStorage(entries.value)
  }

  return { entries, load, add, remove, clear }
}
