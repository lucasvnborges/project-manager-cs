<script setup lang="ts">
const emit = defineEmits<{ openSearch: [] }>()
</script>

<template>
  <header class="relative flex h-16 items-center justify-center bg-header px-4 shadow-sm">
    <NuxtLink to="/" class="rounded-sm" aria-label="Gerenciador de Projetos, ir para a listagem">
      <AppLogo />
    </NuxtLink>

    <button
      type="button"
      class="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 sm:right-8"
      aria-label="Buscar projetos"
      @click="emit('openSearch')"
    >
      <svg
        class="h-[18px] w-[18px]"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="m12.8 12.8 4.2 4.2" stroke-linecap="round" />
      </svg>
    </button>
  </header>
</template>
