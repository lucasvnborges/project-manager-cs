<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ to: RouteLocationRaw }>()
</script>

<template>
  <NuxtLink :to="to" class="inline-flex items-center gap-1.5 text-[11px] text-brand">
    <svg
      class="h-3 w-3"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path d="M7.5 2.5 4 6l3.5 3.5M4 6h6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    Voltar
  </NuxtLink>
</template>
