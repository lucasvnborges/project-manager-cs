<script setup lang="ts">
import type { ApiErrorBody, Project } from '#shared/types/project'
import { apiErrorMessage, apiFieldErrors } from '../../utils/api'
import { useProjectsStore } from '../../stores/projects'

const router = useRouter()
const store = useProjectsStore()

const submitting = ref(false)
const serverError = ref<string | null>(null)
const serverFieldErrors = ref<NonNullable<ApiErrorBody['fieldErrors']>>({})

useHead({ title: 'Novo projeto | Gerenciador de Projetos' })

async function onSubmit(payload: FormData) {
  submitting.value = true
  serverError.value = null
  serverFieldErrors.value = {}

  try {
    await $fetch<Project>('/api/projects', { method: 'POST', body: payload })

    // Force the listing to refetch so the new project and total are current.
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
    <h1 class="mt-2 mb-5 text-[15px] font-semibold text-ink">Novo projeto</h1>

    <ProjectForm
      :submitting="submitting"
      :server-error="serverError"
      :server-field-errors="serverFieldErrors"
      @submit="onSubmit"
    />
  </div>
</template>
