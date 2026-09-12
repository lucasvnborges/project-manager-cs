<script setup lang="ts">
import type { ProjectSort } from '#shared/types/project'

defineProps<{ total: number; favoritesOnly: boolean; sort: ProjectSort }>()

const emit = defineEmits<{
  'update:favoritesOnly': [value: boolean]
  'update:sort': [value: ProjectSort]
}>()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h1 class="text-[15px] font-semibold text-[#1F1283]">
      Projetos
      <span class="text-[13px] font-normal">({{ total }})</span>
    </h1>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <ToggleSwitch
        :model-value="favoritesOnly"
        label="Apenas Favoritos"
        @update:model-value="emit('update:favoritesOnly', $event)"
      />
      <SortSelect :model-value="sort" @update:model-value="emit('update:sort', $event)" />
      <NewProjectButton class="w-full sm:w-auto" />
    </div>
  </div>
</template>
