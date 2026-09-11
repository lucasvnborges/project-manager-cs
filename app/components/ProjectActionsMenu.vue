<script setup lang="ts">
defineProps<{ projectId: string; name: string }>()
const emit = defineEmits<{ remove: [] }>()

const open = ref(false)
const container = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)

function close(refocus = false) {
  open.value = false
  if (refocus) trigger.value?.focus()
}

async function toggle() {
  open.value = !open.value

  if (open.value) {
    await nextTick()
    menu.value?.querySelector<HTMLElement>('[data-menu-item]')?.focus()
  }
}

function onRemove() {
  close()
  emit('remove')
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!container.value?.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.stopPropagation()
    close(true)
  }
}

watch(open, (isOpen) => {
  if (import.meta.server) return

  if (isOpen) {
    document.addEventListener('pointerdown', onDocumentPointerDown)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div ref="container" class="relative" @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm transition hover:bg-white/90"
      :aria-label="`Opções do projeto ${name}`"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="10" r="1.5" />
        <circle cx="10" cy="10" r="1.5" />
        <circle cx="15" cy="10" r="1.5" />
      </svg>
    </button>

    <div
      v-if="open"
      ref="menu"
      role="menu"
      :aria-label="`Opções do projeto ${name}`"
      class="absolute top-9 right-0 z-20 w-32 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg"
    >
      <NuxtLink
        :to="`/projects/${projectId}/edit`"
        role="menuitem"
        data-menu-item
        class="flex items-center gap-2 px-3 py-2 text-[11px] text-ink-muted transition hover:bg-brand-tint"
      >
        <svg
          class="h-3.5 w-3.5 text-brand"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M4 13.5 13 4.5l2.5 2.5-9 9H4z" stroke-linejoin="round" />
        </svg>
        Editar
      </NuxtLink>

      <button
        type="button"
        role="menuitem"
        data-menu-item
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-ink-muted transition hover:bg-brand-tint"
        @click="onRemove"
      >
        <svg
          class="h-3.5 w-3.5 text-brand"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 9.5h6.4L14 6" stroke-linejoin="round" />
        </svg>
        Remover
      </button>
    </div>
  </div>
</template>
