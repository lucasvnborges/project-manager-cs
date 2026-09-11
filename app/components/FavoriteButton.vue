<script setup lang="ts">
const props = defineProps<{
  isFavorite: boolean
  name: string
  pending?: boolean
}>()

const emit = defineEmits<{ toggle: [next: boolean] }>()

const label = computed(() =>
  props.isFavorite ? `Remover ${props.name} dos favoritos` : `Adicionar ${props.name} aos favoritos`
)
</script>

<template>
  <button
    type="button"
    class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10 disabled:opacity-60"
    :aria-label="label"
    :aria-pressed="isFavorite"
    :disabled="pending"
    @click="emit('toggle', !isFavorite)"
  >
    <svg
      class="h-[18px] w-[18px]"
      :class="isFavorite ? 'text-star' : 'text-white'"
      viewBox="0 0 24 24"
      :fill="isFavorite ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <path
        d="m12 3.5 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 17.3l-5.3 2.9 1.1-6.1L3.4 9.9l6-.8z"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>
