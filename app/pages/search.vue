<script setup lang="ts">
import {
  PROJECT_SORTS,
  type Project,
  type ProjectSort,
  SEARCH_MIN_LENGTH
} from '#shared/types/project'
import { useProjectsStore } from '../stores/projects'

const route = useRoute()
const store = useProjectsStore()

const term = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))
const favoritesOnly = computed(() => route.query.favorites === 'true')
const sort = computed<ProjectSort>(() => {
  const value = route.query.sort

  return typeof value === 'string' && PROJECT_SORTS.includes(value as ProjectSort)
    ? (value as ProjectSort)
    : 'alphabetical'
})

const isSearchable = computed(() => term.value.length >= SEARCH_MIN_LENGTH)
const listQuery = computed(() => ({
  q: term.value,
  favorites: favoritesOnly.value,
  sort: sort.value
}))

const backTarget = computed(() => ({
  path: '/',
  query: {
    favorites: favoritesOnly.value ? 'true' : undefined,
    sort: sort.value === 'alphabetical' ? undefined : sort.value
  }
}))

if (isSearchable.value) {
  await store.load(listQuery.value)
}

watch(listQuery, (next) => {
  if (isSearchable.value) store.load(next)
})

function onToggleFavorite(project: Project, next: boolean) {
  store.setFavorite(project, next, listQuery.value)
}

const projectToRemove = ref<Project | null>(null)

async function confirmRemoval() {
  const target = projectToRemove.value

  if (!target) return

  const removed = await store.remove(target.id, listQuery.value)

  if (removed) projectToRemove.value = null
}
</script>

<template>
  <div class="mx-auto w-full max-w-360">
    <BackLink :to="backTarget" />
    <h1 class="mt-2 text-[15px] font-semibold text-ink">Resultado da busca</h1>

    <p
      v-if="!isSearchable"
      class="mt-6 rounded-lg bg-surface p-10 text-center text-[12px] text-ink-muted"
    >
      Digite ao menos {{ SEARCH_MIN_LENGTH }} caracteres para buscar um projeto.
    </p>

    <p
      v-else-if="store.error"
      class="mt-6 rounded-lg bg-surface p-6 text-center text-[12px] text-danger"
      role="alert"
    >
      {{ store.error }}
      <button
        type="button"
        class="ml-2 font-semibold text-brand underline"
        @click="store.reload(listQuery)"
      >
        Tentar novamente
      </button>
    </p>

    <p
      v-else-if="store.pending"
      class="mt-6 rounded-lg bg-surface p-10 text-center text-[12px] text-ink-muted"
      aria-live="polite"
    >
      Buscando projetos...
    </p>

    <p
      v-else-if="store.items.length === 0"
      class="mt-6 rounded-lg bg-surface p-10 text-center text-[12px] text-ink-muted"
      aria-live="polite"
    >
      Nenhum projeto encontrado para “{{ term }}”.
    </p>

    <ProjectGrid
      v-else
      class="mt-4"
      :projects="store.items"
      :favorite-pending-id="store.favoritePendingId"
      :highlight="term"
      @toggle-favorite="onToggleFavorite"
      @remove="projectToRemove = $event"
    />

    <ProjectDeleteModal
      v-if="projectToRemove"
      :project-name="projectToRemove.name"
      :pending="store.deletePendingId === projectToRemove.id"
      @cancel="projectToRemove = null"
      @confirm="confirmRemoval"
    />
  </div>
</template>
