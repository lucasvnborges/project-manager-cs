<script setup lang="ts">
defineProps<{ projectId: string; name: string }>()
const emit = defineEmits<{ remove: [] }>()

const open = ref(false)
const container = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

function close(refocus = false) {
  open.value = false
  if (refocus) trigger.value?.focus()
}

function updateMenuPosition() {
  const rect = trigger.value?.getBoundingClientRect()

  if (!rect) return

  const width = 128
  const estimatedHeight = 88
  const gap = 4
  let top = rect.bottom + gap
  let left = rect.right - width

  if (top + estimatedHeight > window.innerHeight - 8 && rect.top - gap - estimatedHeight > 8) {
    top = rect.top - gap - estimatedHeight
  }

  if (left < 8) left = 8
  if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

async function toggle() {
  open.value = !open.value

  if (!open.value) return

  updateMenuPosition()
  await nextTick()
  updateMenuPosition()
  menu.value?.querySelector<HTMLElement>('[data-menu-item]')?.focus()
}

function onRemove() {
  close()
  emit('remove')
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node

  if (container.value?.contains(target) || menu.value?.contains(target)) return

  close()
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
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown)
    window.removeEventListener('resize', updateMenuPosition)
    window.removeEventListener('scroll', updateMenuPosition, true)
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return

  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<template>
  <div ref="container" class="relative" @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm transition hover:bg-white/90"
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

    <Teleport to="body">
      <div
        v-if="open"
        ref="menu"
        role="menu"
        :aria-label="`Opções do projeto ${name}`"
        class="fixed z-50 w-32 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg"
        :style="menuStyle"
        @keydown="onKeydown"
        @pointerdown.stop
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
    </Teleport>
  </div>
</template>
