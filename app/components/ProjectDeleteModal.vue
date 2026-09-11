<script setup lang="ts">
const props = defineProps<{ projectName: string; pending?: boolean }>()

const emit = defineEmits<{ cancel: []; confirm: [] }>()

const dialog = ref<HTMLElement | null>(null)
const confirmButton = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.pending) {
    emit('cancel')
    return
  }

  if (event.key !== 'Tab') return

  const focusable = dialog.value?.querySelectorAll<HTMLElement>('button:not([disabled])')

  if (!focusable || focusable.length === 0) return

  const first = focusable[0] as HTMLElement
  const last = focusable[focusable.length - 1] as HTMLElement

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(async () => {
  previouslyFocused = document.activeElement as HTMLElement | null
  await nextTick()
  confirmButton.value?.focus()
})

onBeforeUnmount(() => previouslyFocused?.focus())
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-header/70 px-4"
      @click.self="!pending && emit('cancel')"
    >
      <div
        ref="dialog"
        class="relative w-full max-w-[320px] rounded-lg bg-surface px-6 pt-9 pb-6 text-center shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        @keydown="onKeydown"
      >
        <span
          class="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-white"
          aria-hidden="true"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 9.5h6.4L14 6" stroke-linejoin="round" />
          </svg>
        </span>

        <h2 id="delete-modal-title" class="text-[13px] font-semibold text-ink">Remover projeto</h2>

        <hr class="my-3 border-line" />

        <p class="text-[11px] text-ink-muted">Essa ação removerá definitivamente o projeto:</p>
        <p class="mt-1 text-[13px] font-medium text-ink">{{ projectName }}</p>

        <div class="mt-5 flex flex-col-reverse gap-3 min-[360px]:flex-row min-[360px]:items-center">
          <button
            type="button"
            class="h-10 min-[360px]:h-8 flex-1 rounded-full border border-brand text-[11px] text-ink-muted transition hover:bg-brand-tint disabled:opacity-60"
            :disabled="pending"
            @click="emit('cancel')"
          >
            Cancelar
          </button>
          <button
            ref="confirmButton"
            type="button"
            class="h-10 min-[360px]:h-8 flex-1 rounded-full bg-brand text-[11px] font-medium text-white transition hover:bg-brand-strong disabled:opacity-60"
            :disabled="pending"
            @click="emit('confirm')"
          >
            {{ pending ? 'Removendo...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
