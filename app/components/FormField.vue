<script setup lang="ts">
defineProps<{
  label: string
  inputId: string
  required?: boolean
  requiredLabel?: string
  error?: string
}>()
</script>

<template>
  <div>
    <label
      :for="inputId"
      class="flex items-center gap-1.5 text-[11px] font-semibold"
      :class="error ? 'text-danger' : 'text-brand'"
    >
      {{ label }}
      <span v-if="required" class="text-[9px] font-normal text-ink-subtle">
        ({{ requiredLabel ?? 'Obrigatório' }})
      </span>
    </label>

    <div class="mt-1.5">
      <slot :has-error="Boolean(error)" />
    </div>

    <p v-if="error" class="mt-1 text-[10px] text-danger">{{ error }}</p>
  </div>
</template>
