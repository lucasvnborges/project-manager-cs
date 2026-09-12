// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import type { Project } from '../../shared/types/project'
import EmptyProjects from '../../app/components/EmptyProjects.vue'
import ProjectCard from '../../app/components/ProjectCard.vue'
import ProjectDeleteModal from '../../app/components/ProjectDeleteModal.vue'
import ProjectForm from '../../app/components/ProjectForm.vue'
import ProjectGrid from '../../app/components/ProjectGrid.vue'
import ProjectToolbar from '../../app/components/ProjectToolbar.vue'
import SearchHistory from '../../app/components/SearchHistory.vue'

const project: Project = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Portal Interno',
  client: 'Clicksign',
  startDate: '2024-09-01',
  endDate: '2024-12-12',
  isFavorite: false,
  coverUrl: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

describe('EmptyProjects', () => {
  it('shows the reference copy and the create call to action', async () => {
    const wrapper = await mountSuspended(EmptyProjects)

    expect(wrapper.text()).toContain('Nenhum projeto')
    expect(wrapper.text()).toContain('Clique no botão abaixo para criar o primeiro e gerenciá-lo.')
    expect(wrapper.find('a[href="/projects/new"]').exists()).toBe(true)
  })
})

describe('ProjectToolbar', () => {
  it('shows the stored total, not the filtered count', async () => {
    const wrapper = await mountSuspended(ProjectToolbar, {
      props: { total: 9, favoritesOnly: true, sort: 'alphabetical' }
    })

    expect(wrapper.text()).toContain('Projetos')
    expect(wrapper.text()).toContain('(9)')
  })

  it('emits the favorites filter and the chosen sort', async () => {
    const wrapper = await mountSuspended(ProjectToolbar, {
      props: { total: 2, favoritesOnly: false, sort: 'alphabetical' }
    })

    await wrapper.find('input[type="checkbox"]').setValue(true)
    await wrapper.find('select').setValue('nearest-deadline')

    expect(wrapper.emitted('update:favoritesOnly')?.[0]).toEqual([true])
    expect(wrapper.emitted('update:sort')?.[0]).toEqual(['nearest-deadline'])
  })
})

describe('ProjectCard', () => {
  it('renders the name, client and both dates in pt-BR', async () => {
    const wrapper = await mountSuspended(ProjectCard, { props: { project } })

    expect(wrapper.text()).toContain('Portal Interno')
    expect(wrapper.text()).toContain('Clicksign')
    expect(wrapper.text()).toContain('01 de setembro de 2024')
    expect(wrapper.text()).toContain('12 de dezembro de 2024')
  })

  it('exposes the favorite state to assistive technology', async () => {
    const wrapper = await mountSuspended(ProjectCard, {
      props: { project: { ...project, isFavorite: true } }
    })

    const button = wrapper.get('button[aria-pressed]')

    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('aria-label')).toContain('Remover Portal Interno dos favoritos')
  })

  it('emits the next favorite value on click', async () => {
    const wrapper = await mountSuspended(ProjectCard, { props: { project } })

    await wrapper.get('button[aria-pressed]').trigger('click')

    expect(wrapper.emitted('toggleFavorite')?.[0]).toEqual([true])
  })

  it('marks the searched term without rendering raw HTML', async () => {
    const wrapper = await mountSuspended(ProjectCard, {
      props: { project: { ...project, name: '<b>Portal</b> Interno' }, highlight: 'portal' }
    })

    expect(wrapper.find('mark').text()).toBe('Portal')
    expect(wrapper.find('h3 b').exists()).toBe(false)
  })

  it('opens the actions menu and emits removal', async () => {
    const wrapper = await mountSuspended(ProjectCard, { props: { project } })

    await wrapper.get('button[aria-haspopup="menu"]').trigger('click')
    await nextTick()

    const removeButton = [...document.querySelectorAll('[role="menuitem"]')].find(
      (item) => item.textContent?.trim() === 'Remover'
    ) as HTMLButtonElement | undefined

    expect(removeButton).toBeDefined()
    removeButton?.click()
    await nextTick()

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })
})

describe('ProjectGrid', () => {
  it('renders one card per project', async () => {
    const wrapper = await mountSuspended(ProjectGrid, {
      props: {
        projects: [project, { ...project, id: '2', name: 'App Externo' }]
      }
    })

    expect(wrapper.findAll('article')).toHaveLength(2)
  })
})

describe('ProjectForm', () => {
  it('keeps save disabled until the required fields are valid', async () => {
    const wrapper = await mountSuspended(ProjectForm)
    const submit = wrapper.get('button[type="submit"]')

    expect(submit.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Nome do projeto')
    expect(wrapper.text()).toContain('Cliente')
  })

  it('loads existing values when editing', async () => {
    const wrapper = await mountSuspended(ProjectForm, {
      props: {
        initialValues: {
          name: 'Portal Interno',
          client: 'Clicksign',
          startDate: '2030-01-01',
          endDate: '2030-12-31'
        }
      }
    })

    expect((wrapper.get('#project-name').element as HTMLInputElement).value).toBe('Portal Interno')
    expect((wrapper.get('#project-client').element as HTMLInputElement).value).toBe('Clicksign')
    expect((wrapper.get('#project-start').element as HTMLInputElement).value).toBe('01/01/2030')
    expect((wrapper.get('#project-end').element as HTMLInputElement).value).toBe('31/12/2030')
    expect((wrapper.get('#project-start').element as HTMLInputElement).maxLength).toBe(10)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})

describe('SearchHistory', () => {
  it('lists recent terms and can remove one of them', async () => {
    const wrapper = await mountSuspended(SearchHistory, {
      props: { entries: ['Portal Interno', 'App Externo'] }
    })

    expect(wrapper.text()).toContain('Portal Interno')
    await wrapper.get('button[aria-label="Remover Portal Interno do histórico"]').trigger('click')

    expect(wrapper.emitted('remove')?.[0]).toEqual(['Portal Interno'])
  })
})

describe('ProjectDeleteModal', () => {
  const mounted: Array<{ unmount: () => void }> = []

  afterEach(() => {
    while (mounted.length > 0) mounted.pop()?.unmount()
  })

  function dialog() {
    const nodes = document.querySelectorAll('[role="dialog"]')
    return nodes[nodes.length - 1]
  }

  it('names the project and asks for confirmation', async () => {
    mounted.push(
      await mountSuspended(ProjectDeleteModal, {
        props: { projectName: 'Portal Interno' }
      })
    )

    const node = dialog()

    expect(node?.getAttribute('aria-modal')).toBe('true')
    expect(node?.textContent).toContain('Essa ação removerá definitivamente o projeto:')
    expect(node?.textContent).toContain('Portal Interno')
  })

  it('emits cancel without confirming', async () => {
    const wrapper = await mountSuspended(ProjectDeleteModal, {
      props: { projectName: 'Portal Interno' }
    })
    mounted.push(wrapper)

    const cancel = [...(dialog()?.querySelectorAll('button') ?? [])].find(
      (button) => button.textContent?.trim() === 'Cancelar'
    )

    cancel?.click()
    await nextTick()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('emits confirm and blocks both buttons while pending', async () => {
    const wrapper = await mountSuspended(ProjectDeleteModal, {
      props: { projectName: 'Portal Interno' }
    })
    mounted.push(wrapper)

    const confirm = [...(dialog()?.querySelectorAll('button') ?? [])].find(
      (button) => button.textContent?.trim() === 'Confirmar'
    )

    confirm?.click()
    await nextTick()

    expect(wrapper.emitted('confirm')).toHaveLength(1)

    await wrapper.setProps({ pending: true })
    await nextTick()

    expect(dialog()?.querySelectorAll('button[disabled]')).toHaveLength(2)
    expect(dialog()?.textContent).toContain('Removendo...')
  })
})
