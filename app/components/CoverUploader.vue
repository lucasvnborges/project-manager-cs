<script setup lang="ts">
import { COVER_ALLOWED_TYPES, COVER_MAX_BYTES } from '#shared/types/project'

const props = defineProps<{
  previewUrl: string | null
  error?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [file: File]
  clear: []
  invalid: [message: string]
}>()

const input = ref<HTMLInputElement | null>(null)

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!COVER_ALLOWED_TYPES.includes(file.type as (typeof COVER_ALLOWED_TYPES)[number])) {
    emit('invalid', 'Escolha uma imagem .jpg ou .png.')
    target.value = ''
    return
  }

  if (file.size > COVER_MAX_BYTES) {
    emit('invalid', 'A imagem deve ter no máximo 4 MB.')
    target.value = ''
    return
  }

  emit('select', file)
  target.value = ''
}

function clear() {
  emit('clear')
}

watch(
  () => props.previewUrl,
  () => {
    if (input.value) input.value.value = ''
  }
)
</script>

<template>
  <div>
    <input
      ref="input"
      type="file"
      class="sr-only"
      accept="image/jpeg,image/png"
      :disabled="disabled"
      aria-label="Escolher a capa do projeto"
      @change="onChange"
    />

    <div v-if="previewUrl" class="relative overflow-hidden rounded-md">
      <img :src="previewUrl" alt="Capa selecionada" class="aspect-video w-full object-cover" />
      <button
        type="button"
        class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand shadow-sm transition hover:bg-white/90"
        aria-label="Remover capa do projeto"
        :disabled="disabled"
        @click="clear"
      >
        <svg
          class="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 9.5h6.4L14 6" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-center"
      :class="error ? 'border-danger' : 'border-line-strong'"
    >
      <svg
        class="h-5 w-5 text-brand"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        aria-hidden="true"
      >
        <path d="M10 13V4m0 0L7 7m3-3 3 3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 13v2.5h12V13" stroke-linecap="round" />
      </svg>

      <p class="text-[11px] text-ink-muted">Escolha uma imagem .jpg ou .png no seu dispositivo</p>

      <button
        type="button"
        class="rounded-full border border-line-strong px-4 py-1.5 text-[11px] text-ink-muted transition hover:bg-brand-tint"
        :disabled="disabled"
        @click="input?.click()"
      >
        Selecionar
      </button>
    </div>
  </div>
</template>
