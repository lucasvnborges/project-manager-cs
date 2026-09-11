<script setup lang="ts">
import type { Project } from '#shared/types/project'

const props = defineProps<{
  project: Project
  favoritePending?: boolean
  highlight?: string
}>()

const emit = defineEmits<{
  toggleFavorite: [next: boolean]
  remove: []
}>()

const nameSegments = computed(() => highlightSegments(props.project.name, props.highlight ?? ''))
</script>

<template>
  <article
    class="relative z-0 rounded-lg bg-surface shadow-[0_1px_3px_rgba(31,27,77,0.08)] focus-within:z-30"
  >
    <div class="relative">
      <ProjectCover class="rounded-t-lg" :url="project.coverUrl" :name="project.name" />
      <div class="absolute right-2 bottom-2 z-20 flex items-center gap-1">
        <FavoriteButton
          :is-favorite="project.isFavorite"
          :name="project.name"
          :pending="favoritePending"
          @toggle="emit('toggleFavorite', $event)"
        />
        <ProjectActionsMenu
          :project-id="project.id"
          :name="project.name"
          @remove="emit('remove')"
        />
      </div>
    </div>

    <div class="p-3">
      <h3 class="text-[13px] font-semibold text-ink">
        <template v-for="(segment, index) in nameSegments" :key="index">
          <mark v-if="segment.match" class="bg-mark text-ink">{{ segment.text }}</mark>
          <template v-else>{{ segment.text }}</template>
        </template>
      </h3>

      <p class="mt-1 text-[11px] text-ink-muted">
        <span class="font-semibold text-ink">Cliente:</span>
        {{ project.client }}
      </p>

      <hr class="my-2.5 border-line" />

      <dl class="space-y-1.5 text-[11px] text-ink-muted">
        <div class="flex items-center gap-2">
          <dt class="sr-only">Data de início</dt>
          <svg
            class="h-3.5 w-3.5 shrink-0 text-brand"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
          >
            <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" />
            <path d="M3 8h14M7 3v3M13 3v3" />
          </svg>
          <dd>{{ formatLongDate(project.startDate) }}</dd>
        </div>

        <div class="flex items-center gap-2">
          <dt class="sr-only">Data final</dt>
          <svg
            class="h-3.5 w-3.5 shrink-0 text-brand"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
          >
            <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" />
            <path d="M3 8h14M7 3v3M13 3v3M7.5 12l2 2 3.5-3.5" stroke-linecap="round" />
          </svg>
          <dd>{{ formatLongDate(project.endDate) }}</dd>
        </div>
      </dl>
    </div>
  </article>
</template>
