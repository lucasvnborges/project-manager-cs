<script setup lang="ts">
defineProps<{ url: string | null; name: string }>()
</script>

<template>
  <div class="relative h-[122px] w-full overflow-hidden bg-brand">
    <img
      v-if="url"
      :src="url"
      :alt="`Capa do projeto ${name}`"
      class="h-full w-full object-cover"
      loading="lazy"
    />
    <div v-else class="flex h-full w-full items-center justify-center" aria-hidden="true">
      <svg
        class="h-12 w-12 text-white/60"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="6" y="16" width="24" height="18" rx="2" />
        <path d="M12 12h24v18M18 8h24v18" />
      </svg>
    </div>

    <slot />
  </div>
</template>
