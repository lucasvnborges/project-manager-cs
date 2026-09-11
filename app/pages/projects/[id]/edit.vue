<script setup lang="ts">
import type { ApiErrorBody, Project, ProjectFormValues } from '#shared/types/project'
import { apiErrorMessage, apiFieldErrors } from '../../../utils/api'
import { useProjectsStore } from '../../../stores/projects'

const route = useRoute()
const router = useRouter()
const store = useProjectsStore()

const id = computed(() => String(route.params.id))

const {
  data: project,
  status,
  error: loadError
} = await useFetch<Project>(() => `/api/projects/${id.value}`)

const submitting = ref(false)
const serverError = ref<string | null>(null)
const serverFieldErrors = ref<NonNullable<ApiErrorBody['fieldErrors']>>({})

const initialValues = computed<ProjectFormValues | undefined>(() =>
  project.value
    ? {
        name: project.value.name,
        client: project.value.client,
        startDate: project.value.startDate,
        endDate: project.value.endDate
      }
    : undefined
)

useHead({ title: 'Editar projeto | Gerenciador de Projetos' })

async function onSubmit(payload: FormData) {
  submitting.value = true
  serverError.value = null
  serverFieldErrors.value = {}

  try {
    await $fetch<Project>(`/api/projects/${id.value}`, { method: 'PATCH', body: payload })

    store.invalidate()
    await router.push('/')
  } catch (error) {
    serverError.value = apiErrorMessage(error)
    serverFieldErrors.value = apiFieldErrors(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1440px]">
    <BackLink to="/" />
    <h1 class="mt-2 mb-5 text-[15px] font-semibold text-ink">Editar projeto</h1>

    <p
      v-if="status === 'pending'"
      class="rounded-lg bg-surface p-10 text-center text-[12px] text-ink-muted"
      aria-live="polite"
    >
      Carregando projeto...
    </p>

    <p
      v-else-if="loadError || !project"
      class="rounded-lg bg-surface p-10 text-center text-[12px] text-danger"
      role="alert"
    >
      {{ apiErrorMessage(loadError) }}
    </p>

    <ProjectForm
      v-else
      :initial-values="initialValues"
      :initial-cover-url="project.coverUrl"
      :submitting="submitting"
      :server-error="serverError"
      :server-field-errors="serverFieldErrors"
      @submit="onSubmit"
    />
  </div>
</template>
