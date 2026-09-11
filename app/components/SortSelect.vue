<script setup lang="ts">
import { PROJECT_SORTS, PROJECT_SORT_LABELS, type ProjectSort } from '#shared/types/project'

defineProps<{ modelValue: ProjectSort }>()
const emit = defineEmits<{ 'update:modelValue': [value: ProjectSort] }>()
</script>

<template>
  <div class="relative">
    <label class="sr-only" for="sort-select">Ordenar projetos</label>
    <select
      id="sort-select"
      class="w-full appearance-none rounded-md border border-line-strong bg-surface py-1.5 pr-8 pl-3 text-[11px] text-ink sm:w-[155px]"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as ProjectSort)"
    >
      <option v-for="sort in PROJECT_SORTS" :key="sort" :value="sort">
        {{ PROJECT_SORT_LABELS[sort] }}
      </option>
    </select>
    <svg
      class="pointer-events-none absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 text-ink-muted"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke-linecap="round" />
    </svg>
  </div>
</template>
