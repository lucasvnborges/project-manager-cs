<script setup lang="ts">
import type { Project } from '#shared/types/project'

defineProps<{
  projects: Project[]
  favoritePendingId?: string | null
  highlight?: string
}>()

const emit = defineEmits<{
  toggleFavorite: [project: Project, next: boolean]
  remove: [project: Project]
}>()
</script>

<template>
  <ul class="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
    <li v-for="project in projects" :key="project.id">
      <ProjectCard
        :project="project"
        :favorite-pending="favoritePendingId === project.id"
        :highlight="highlight"
        @toggle-favorite="emit('toggleFavorite', project, $event)"
        @remove="emit('remove', project)"
      />
    </li>
  </ul>
</template>
