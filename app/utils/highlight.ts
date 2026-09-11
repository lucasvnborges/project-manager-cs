export interface HighlightSegment {
  text: string
  match: boolean
}

interface NormalizedText {
  value: string
  /** Maps each normalized index back to its index in the original string. */
  origin: number[]
}

function normalizeWithMap(text: string): NormalizedText {
  let value = ''
  const origin: number[] = []

  for (let index = 0; index < text.length; index += 1) {
    const normalized = (text[index] as string)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()

    for (const character of normalized) {
      value += character
      origin.push(index)
    }
  }

  return { value, origin }
}

/**
 * Splits text into matched and unmatched segments so the template can render
 * `<mark>` through interpolation. The query is compared as plain text, never as
 * a regular expression, which keeps special characters and HTML inert.
 */
export function highlightSegments(text: string, query: string): HighlightSegment[] {
  const trimmed = query.trim()

  if (!trimmed) return [{ text, match: false }]

  const haystack = normalizeWithMap(text)
  const needle = normalizeWithMap(trimmed).value

  if (!needle) return [{ text, match: false }]

  const segments: HighlightSegment[] = []
  let cursor = 0
  let searchFrom = 0

  while (searchFrom <= haystack.value.length) {
    const found = haystack.value.indexOf(needle, searchFrom)

    if (found === -1) break

    const start = haystack.origin[found] as number
    const end = (haystack.origin[found + needle.length - 1] as number) + 1

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), match: false })
    }

    segments.push({ text: text.slice(start, end), match: true })
    cursor = end
    searchFrom = found + needle.length
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false })
  }

  return segments.length > 0 ? segments : [{ text, match: false }]
}
