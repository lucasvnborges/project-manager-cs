<script setup lang="ts">
import { useForm } from 'vee-validate'
import type { ApiErrorBody, ProjectFormValues } from '#shared/types/project'
import { hasErrors, isoDateToBr, toIsoDate, validateProject } from '#shared/validation/project'

const props = defineProps<{
  initialValues?: ProjectFormValues
  initialCoverUrl?: string | null
  submitting?: boolean
  serverError?: string | null
  serverFieldErrors?: NonNullable<ApiErrorBody['fieldErrors']>
}>()

const emit = defineEmits<{ submit: [payload: FormData] }>()

const EMPTY_VALUES: ProjectFormValues = { name: '', client: '', startDate: '', endDate: '' }

function toDisplayValues(values?: ProjectFormValues): ProjectFormValues {
  if (!values) return EMPTY_VALUES

  return {
    name: values.name,
    client: values.client,
    startDate: isoDateToBr(values.startDate),
    endDate: isoDateToBr(values.endDate)
  }
}

type FieldContext = { form: Partial<ProjectFormValues> }

function fieldValidator(field: keyof ProjectFormValues) {
  return (value: unknown, context: FieldContext) => {
    const candidate: ProjectFormValues = {
      ...EMPTY_VALUES,
      ...context.form,
      [field]: typeof value === 'string' ? value : ''
    }

    return validateProject(candidate)[field] ?? true
  }
}

const { defineField, errors, values, handleSubmit } = useForm<ProjectFormValues>({
  initialValues: toDisplayValues(props.initialValues),
  validationSchema: {
    name: fieldValidator('name'),
    client: fieldValidator('client'),
    startDate: fieldValidator('startDate'),
    endDate: fieldValidator('endDate')
  }
})

const [name, nameAttrs] = defineField('name')
const [client, clientAttrs] = defineField('client')
const [startDate] = defineField('startDate')
const [endDate] = defineField('endDate')

const coverFile = ref<File | null>(null)
const coverPreview = ref<string | null>(props.initialCoverUrl ?? null)
const coverRemoved = ref(false)
const coverError = ref<string | null>(null)
let objectUrl: string | null = null

/** Deterministic gate for the submit button, independent of touched state. */
const isValid = computed(() => !hasErrors(validateProject(values as ProjectFormValues)))

const fieldError = (field: keyof ProjectFormValues) =>
  errors.value[field] ?? props.serverFieldErrors?.[field]

function releaseObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

function onSelectCover(file: File) {
  coverError.value = null
  coverFile.value = file
  coverRemoved.value = false

  releaseObjectUrl()
  objectUrl = URL.createObjectURL(file)
  coverPreview.value = objectUrl
}

function onClearCover() {
  coverError.value = null
  coverFile.value = null
  coverRemoved.value = true

  releaseObjectUrl()
  coverPreview.value = null
}

const onSubmit = handleSubmit((formValues) => {
  const payload = new FormData()

  payload.set('name', formValues.name)
  payload.set('client', formValues.client)
  payload.set('startDate', toIsoDate(formValues.startDate) ?? formValues.startDate)
  payload.set('endDate', toIsoDate(formValues.endDate) ?? formValues.endDate)

  if (coverFile.value) payload.set('cover', coverFile.value)
  if (coverRemoved.value && !coverFile.value) payload.set('removeCover', 'true')

  emit('submit', payload)
})

onBeforeUnmount(releaseObjectUrl)
</script>

<template>
  <form
    class="rounded-lg border border-line bg-surface/60 px-4 py-8 sm:px-8"
    novalidate
    @submit="onSubmit"
  >
    <div class="mx-auto flex w-full max-w-[370px] flex-col gap-5">
      <FormField
        label="Nome do projeto"
        input-id="project-name"
        required
        :error="fieldError('name')"
      >
        <template #default="{ hasError, errorId }">
          <input
            id="project-name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            class="h-9 w-full rounded-md border bg-surface px-3 text-[12px] text-ink outline-none"
            :class="hasError ? 'border-danger' : 'border-line-strong'"
            :aria-invalid="hasError"
            :aria-describedby="hasError ? errorId : undefined"
            :disabled="submitting"
          />
        </template>
      </FormField>

      <FormField
        label="Cliente"
        input-id="project-client"
        required
        required-label="Obrigatório"
        :error="fieldError('client')"
      >
        <template #default="{ hasError, errorId }">
          <input
            id="project-client"
            v-model="client"
            v-bind="clientAttrs"
            type="text"
            class="h-9 w-full rounded-md border bg-surface px-3 text-[12px] text-ink outline-none"
            :class="hasError ? 'border-danger' : 'border-line-strong'"
            :aria-invalid="hasError"
            :aria-describedby="hasError ? errorId : undefined"
            :disabled="submitting"
          />
        </template>
      </FormField>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Data de Início"
          input-id="project-start"
          required
          :error="fieldError('startDate')"
        >
          <template #default="{ hasError, errorId }">
            <DateInput
              id="project-start"
              v-model="startDate"
              :invalid="hasError"
              :described-by="hasError ? errorId : undefined"
              :disabled="submitting"
            />
          </template>
        </FormField>

        <FormField
          label="Data Final"
          input-id="project-end"
          required
          :error="fieldError('endDate')"
        >
          <template #default="{ hasError, errorId }">
            <DateInput
              id="project-end"
              v-model="endDate"
              :invalid="hasError"
              :described-by="hasError ? errorId : undefined"
              :disabled="submitting"
            />
          </template>
        </FormField>
      </div>

      <div>
        <p class="text-[11px] font-semibold text-brand">Capa do projeto</p>
        <div class="mt-1.5">
          <CoverUploader
            :preview-url="coverPreview"
            :error="coverError ?? serverFieldErrors?.cover"
            :disabled="submitting"
            @select="onSelectCover"
            @clear="onClearCover"
            @invalid="coverError = $event"
          />
        </div>
        <p v-if="coverError ?? serverFieldErrors?.cover" class="mt-1 text-[10px] text-danger">
          {{ coverError ?? serverFieldErrors?.cover }}
        </p>
      </div>

      <p v-if="serverError" class="text-[11px] text-danger" role="alert">{{ serverError }}</p>

      <button
        type="submit"
        class="h-9 w-full rounded-full text-[12px] font-medium text-white transition"
        :class="isValid && !submitting ? 'bg-brand hover:bg-brand-strong' : 'bg-brand-soft'"
        :disabled="!isValid || submitting"
      >
        {{ submitting ? 'Salvando...' : 'Salvar projeto' }}
      </button>
    </div>
  </form>
</template>
