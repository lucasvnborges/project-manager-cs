<script setup lang="ts">
import { PROJECT_SORTS, type Project, type ProjectSort } from '#shared/types/project'
import { useProjectsStore } from '../stores/projects'

const route = useRoute()
const router = useRouter()
const store = useProjectsStore()

const favoritesOnly = computed(() => route.query.favorites === 'true')
const sort = computed<ProjectSort>(() => {
  const value = route.query.sort

  return typeof value === 'string' && PROJECT_SORTS.includes(value as ProjectSort)
    ? (value as ProjectSort)
    : 'alphabetical'
})

const listQuery = computed(() => ({ favorites: favoritesOnly.value, sort: sort.value }))

await store.load(listQuery.value)
watch(listQuery, (next) => store.load(next))

function setFavoritesOnly(value: boolean) {
  router.replace({
    query: { ...route.query, favorites: value ? 'true' : undefined }
  })
}

function setSort(value: ProjectSort) {
  router.replace({
    query: { ...route.query, sort: value === 'alphabetical' ? undefined : value }
  })
}

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
  <div class="mx-auto w-full max-w-[1440px]">
    <template v-if="store.isEmptyCollection && !store.pending && !store.error">
      <EmptyProjects />
    </template>

    <template v-else>
      <ProjectToolbar
        :total="store.total"
        :favorites-only="favoritesOnly"
        :sort="sort"
        @update:favorites-only="setFavoritesOnly"
        @update:sort="setSort"
      />

      <p
        v-if="store.error"
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
        v-else-if="store.pending && store.items.length === 0"
        class="mt-6 rounded-lg bg-surface p-10 text-center text-[12px] text-ink-muted"
        aria-live="polite"
      >
        Carregando projetos...
      </p>

      <p
        v-else-if="store.hasNoMatches"
        class="mt-6 rounded-lg bg-surface p-10 text-center text-[12px] text-ink-muted"
      >
        Nenhum projeto favorito por aqui. Marque um projeto com a estrela para vê-lo nesta lista.
      </p>

      <ProjectGrid
        v-else
        class="mt-6"
        :projects="store.items"
        :favorite-pending-id="store.favoritePendingId"
        @toggle-favorite="onToggleFavorite"
        @remove="projectToRemove = $event"
      />
    </template>

    <ProjectDeleteModal
      v-if="projectToRemove"
      :project-name="projectToRemove.name"
      :pending="store.deletePendingId === projectToRemove.id"
      @cancel="projectToRemove = null"
      @confirm="confirmRemoval"
    />
  </div>
</template>
