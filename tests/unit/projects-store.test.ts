// @vitest-environment nuxt
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Project } from '../../shared/types/project'
import { useProjectsStore } from '../../app/stores/projects'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn()
}))

mockNuxtImport('$fetch', () => fetchMock)

const project: Project = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Portal Interno',
  client: 'Clicksign',
  startDate: '2024-09-01',
  endDate: '2024-12-12',
  isFavorite: false,
  coverUrl: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

describe('useProjectsStore favorites', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
  })

  it('updates the star before the request resolves and does not refetch the list', async () => {
    const store = useProjectsStore()
    store.items = [{ ...project }]
    store.total = 1
    store.filteredTotal = 1

    let resolvePatch: (value: Project) => void = () => undefined
    fetchMock.mockImplementation((url: string) => {
      if (String(url).includes('/favorite')) {
        return new Promise<Project>((resolve) => {
          resolvePatch = resolve
        })
      }

      throw new Error(`unexpected fetch ${url}`)
    })

    const pending = store.setFavorite(store.items[0]!, true, {})

    expect(store.items[0]?.isFavorite).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/favorite')

    resolvePatch({ ...project, isFavorite: true })
    await pending

    expect(store.items[0]?.isFavorite).toBe(true)
    expect(store.pending).toBe(false)
  })

  it('removes the card immediately when unfavoriting a favorites-only list', async () => {
    const store = useProjectsStore()
    store.items = [{ ...project, isFavorite: true }]
    store.total = 1
    store.filteredTotal = 1

    fetchMock.mockResolvedValue({ ...project, isFavorite: false })

    await store.setFavorite(store.items[0]!, false, { favorites: true })

    expect(store.items).toHaveLength(0)
    expect(store.filteredTotal).toBe(0)
    expect(store.hasNoMatches).toBe(true)
  })

  it('restores the previous favorite state when the request fails', async () => {
    const store = useProjectsStore()
    store.items = [{ ...project }]
    store.total = 1
    store.filteredTotal = 1

    fetchMock.mockRejectedValue(
      Object.assign(new Error('fail'), {
        data: { statusCode: 500, code: 'INTERNAL', message: 'Falha ao favoritar.' }
      })
    )

    await store.setFavorite(store.items[0]!, true, {})

    expect(store.items[0]?.isFavorite).toBe(false)
    expect(store.error).toBe('Falha ao favoritar.')
  })

  it('puts the card back when unfavoriting a filtered list fails', async () => {
    const store = useProjectsStore()
    store.items = [{ ...project, isFavorite: true }]
    store.total = 1
    store.filteredTotal = 1

    fetchMock.mockRejectedValue(
      Object.assign(new Error('fail'), {
        data: { statusCode: 500, code: 'INTERNAL', message: 'Falha ao favoritar.' }
      })
    )

    await store.setFavorite(store.items[0]!, false, { favorites: true })

    expect(store.items).toHaveLength(1)
    expect(store.items[0]?.isFavorite).toBe(true)
    expect(store.filteredTotal).toBe(1)
  })
})
