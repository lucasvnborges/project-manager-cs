import { defineStore } from 'pinia'
import type {
  Project,
  ProjectListQuery,
  ProjectListResponse,
  ProjectSort
} from '#shared/types/project'
import { sortProjects } from '#shared/utils/project-list'
import { todayCivilDate } from '#shared/validation/project'
import { apiErrorMessage } from '../utils/api'

function queryKey(query: ProjectListQuery): string {
  return JSON.stringify({
    q: query.q ?? '',
    favorites: query.favorites === true,
    sort: query.sort ?? 'alphabetical'
  })
}

export const useProjectsStore = defineStore('projects', () => {
  const items = ref<Project[]>([])
  const total = ref(0)
  const filteredTotal = ref(0)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const favoritePendingId = ref<string | null>(null)
  const deletePendingId = ref<string | null>(null)
  /** Serialized query already loaded, so hydration does not refetch. */
  const loadedKey = ref<string | null>(null)

  const isEmptyCollection = computed(() => total.value === 0)
  const hasNoMatches = computed(() => total.value > 0 && filteredTotal.value === 0)

  async function fetchList(query: ProjectListQuery): Promise<void> {
    pending.value = true
    error.value = null

    try {
      const response = await $fetch<ProjectListResponse>('/api/projects', {
        query: {
          q: query.q || undefined,
          favorites: query.favorites === true ? 'true' : undefined,
          sort: query.sort ?? 'alphabetical'
        }
      })

      const sort = query.sort ?? 'alphabetical'
      items.value = sortProjects(response.items, sort, todayCivilDate())
      total.value = response.total
      filteredTotal.value = response.filteredTotal
      loadedKey.value = queryKey(query)
    } catch (requestError) {
      error.value = apiErrorMessage(requestError)
      items.value = []
      filteredTotal.value = 0
      loadedKey.value = null
    } finally {
      pending.value = false
    }
  }

  /** Skips the request when the same query is already in state. */
  async function load(query: ProjectListQuery): Promise<void> {
    if (loadedKey.value === queryKey(query)) return

    await fetchList(query)
  }

  async function reload(query: ProjectListQuery): Promise<void> {
    await fetchList(query)
  }

  function applyFavoriteState(
    id: string,
    isFavorite: boolean,
    query: ProjectListQuery,
    restore?: Project
  ): void {
    const favoritesOnly = query.favorites === true

    if (favoritesOnly && !isFavorite) {
      items.value = items.value.filter((item) => item.id !== id)
      filteredTotal.value = Math.max(0, filteredTotal.value - 1)
      return
    }

    if (restore && favoritesOnly && isFavorite) {
      if (!items.value.some((item) => item.id === restore.id)) {
        items.value = sortProjects(
          [...items.value, restore],
          query.sort ?? 'alphabetical',
          todayCivilDate()
        )
        filteredTotal.value += 1
      }

      return
    }

    const item = items.value.find((entry) => entry.id === id)
    if (item) item.isFavorite = isFavorite
  }

  async function setFavorite(
    project: Project,
    isFavorite: boolean,
    query: ProjectListQuery
  ): Promise<void> {
    if (favoritePendingId.value === project.id) return

    const current = items.value.find((item) => item.id === project.id)
    if (!current) return

    const snapshot = { ...current }

    favoritePendingId.value = project.id
    error.value = null
    applyFavoriteState(project.id, isFavorite, query)

    try {
      await $fetch(`/api/projects/${project.id}/favorite`, {
        method: 'PATCH',
        body: { isFavorite }
      })
    } catch (requestError) {
      applyFavoriteState(project.id, snapshot.isFavorite, query, snapshot)
      error.value = apiErrorMessage(requestError)
    } finally {
      if (favoritePendingId.value === project.id) {
        favoritePendingId.value = null
      }
    }
  }

  async function remove(id: string, query: ProjectListQuery): Promise<boolean> {
    deletePendingId.value = id
    error.value = null

    try {
      await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
      await fetchList(query)

      return true
    } catch (requestError) {
      error.value = apiErrorMessage(requestError)

      return false
    } finally {
      deletePendingId.value = null
    }
  }

  function invalidate(): void {
    loadedKey.value = null
  }

  return {
    items,
    total,
    filteredTotal,
    pending,
    error,
    favoritePendingId,
    deletePendingId,
    isEmptyCollection,
    hasNoMatches,
    load,
    reload,
    setFavorite,
    remove,
    invalidate
  }
})

export type { ProjectSort }
