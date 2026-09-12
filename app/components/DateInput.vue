<script setup lang="ts">
import { maskBrDate } from '#shared/validation/project'

defineProps<{
  id: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}>()

const model = defineModel<string>({ default: '' })

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const masked = maskBrDate(input.value)

  input.value = masked
  model.value = masked
}
</script>

<template>
  <input
    :id="id"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    placeholder="DD/MM/AAAA"
    maxlength="10"
    :value="model"
    :disabled="disabled"
    :aria-invalid="invalid"
    :aria-describedby="describedBy"
    class="h-9 w-full rounded-md border bg-surface px-3 text-[12px] text-ink outline-none"
    :class="invalid ? 'border-danger' : 'border-line-strong'"
    @input="onInput"
  />
</template>
