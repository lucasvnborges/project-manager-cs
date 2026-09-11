<script setup lang="ts">
import { SEARCH_MIN_LENGTH } from '#shared/types/project'

const props = defineProps<{
  initialQuery?: string
  autofocus?: boolean
  enableHistory?: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const DEBOUNCE_MS = 300

const route = useRoute()
const router = useRouter()
const { entries, load, add, remove } = useSearchHistory()

const term = ref(props.initialQuery ?? '')
const input = ref<HTMLInputElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.initialQuery,
  (value) => {
    term.value = value ?? ''
  }
)

function goToResults(value: string) {
  const trimmed = value.trim()

  if (trimmed.length < SEARCH_MIN_LENGTH) return

  add(trimmed)

  const query = { ...route.query, q: trimmed }

  if (route.path === '/search') {
    router.replace({ path: '/search', query })
  } else {
    router.push({ path: '/search', query })
  }
}

/** Waits for a pause in typing so a request is not sent per keystroke. */
function onInput() {
  clearTimeout(timer)
  timer = setTimeout(() => goToResults(term.value), DEBOUNCE_MS)
}

function onSubmit() {
  clearTimeout(timer)
  goToResults(term.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

function applyTerm(value: string) {
  term.value = value
  onSubmit()
}

onMounted(async () => {
  load()

  if (!props.autofocus) return

  await nextTick()
  input.value?.focus()
})

onBeforeUnmount(() => clearTimeout(timer))

defineExpose({ applyTerm })
</script>

<template>
  <div>
    <form
      class="flex h-[52px] items-center gap-3 bg-surface px-4 shadow-sm sm:px-6"
      role="search"
      @submit.prevent="onSubmit"
    >
      <label class="sr-only" for="search-input">Buscar projetos pelo nome</label>
      <svg
        class="h-[18px] w-[18px] shrink-0 text-brand"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="m12.8 12.8 4.2 4.2" stroke-linecap="round" />
      </svg>

      <input
        id="search-input"
        ref="input"
        v-model="term"
        type="search"
        class="h-full flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-subtle"
        placeholder="Digite o nome do projeto..."
        autocomplete="off"
        @input="onInput"
        @keydown="onKeydown"
      />

      <button type="submit" class="sr-only">Buscar</button>
    </form>

    <SearchHistory v-if="enableHistory" :entries="entries" @select="applyTerm" @remove="remove" />
  </div>
</template>
