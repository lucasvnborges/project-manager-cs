<script setup lang="ts">
defineProps<{ entries: string[] }>()

const emit = defineEmits<{ select: [term: string]; remove: [term: string] }>()
</script>

<template>
  <div
    v-if="entries.length > 0"
    class="max-h-60 overflow-y-auto border-x border-b border-brand/30 bg-surface shadow-md"
    role="group"
    aria-label="Buscas recentes"
  >
    <ul>
      <li
        v-for="entry in entries"
        :key="entry"
        class="flex items-center gap-3 border-b border-line px-4 last:border-b-0 sm:px-6"
      >
        <button
          type="button"
          class="flex flex-1 items-center gap-3 py-2.5 text-left text-[11px] text-ink-muted"
          @click="emit('select', entry)"
        >
          <svg
            class="h-3.5 w-3.5 shrink-0 text-ink-subtle"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
          >
            <path d="M10 5.5V10l3 1.8" stroke-linecap="round" />
            <path d="M3.5 10a6.5 6.5 0 1 0 1.9-4.6" stroke-linecap="round" />
            <path d="M3.5 4.5V8h3.5" stroke-linecap="round" />
          </svg>
          {{ entry }}
        </button>

        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-subtle transition hover:bg-brand-tint"
          :aria-label="`Remover ${entry} do histórico`"
          @click="emit('remove', entry)"
        >
          <svg
            class="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
          >
            <path d="m4 4 8 8M12 4l-8 8" stroke-linecap="round" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
