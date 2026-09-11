const STORAGE_KEY = 'gerenciador-projetos:search-history'
const MAX_ENTRIES = 5

function readStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((entry): entry is string => typeof entry === 'string')
      .slice(0, MAX_ENTRIES)
  } catch {
    // Unavailable or corrupted storage must not break the search.
    return []
  }
}

function writeStorage(entries: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
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
    const normalized = term.trim()

    if (!normalized) return

    const withoutDuplicate = entries.value.filter(
      (entry) => entry.toLowerCase() !== normalized.toLowerCase()
    )

    entries.value = [normalized, ...withoutDuplicate].slice(0, MAX_ENTRIES)
    writeStorage(entries.value)
  }

  function remove(term: string): void {
    entries.value = entries.value.filter((entry) => entry !== term)
    writeStorage(entries.value)
  }

  function clear(): void {
    entries.value = []
    writeStorage(entries.value)
  }

  return { entries, load, add, remove, clear }
}
