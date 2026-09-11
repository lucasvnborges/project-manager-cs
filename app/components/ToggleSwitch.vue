<script setup lang="ts">
defineProps<{ modelValue: boolean; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="flex cursor-pointer items-center gap-2 text-[11px] text-ink">
    <span class="relative inline-flex h-[18px] w-[34px] shrink-0 items-center">
      <input
        type="checkbox"
        class="peer sr-only"
        :checked="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span
        class="h-[18px] w-[34px] rounded-full bg-line-strong transition peer-checked:bg-star peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
      />
      <span
        class="absolute left-[3px] h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-4"
      />
    </span>
    {{ label }}
  </label>
</template>
