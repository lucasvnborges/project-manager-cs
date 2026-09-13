import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProjectListResponse } from '../../shared/types/project'
import type { ProjectRow } from '../../server/database/schema'

const db = vi.hoisted(() => ({
  listProjects: vi.fn(),
  findProject: vi.fn(),
  insertProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}))

const blob = vi.hoisted(() => ({
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../../server/database/projects', () => db)
vi.mock('@vercel/blob', () => blob)

const { default: listHandler } = await import('../../server/api/projects/index.get')
const { default: createHandler } = await import('../../server/api/projects/index.post')
const { default: detailHandler } = await import('../../server/api/projects/[id].get')
const { default: updateHandler } = await import('../../server/api/projects/[id].patch')
const { default: favoriteHandler } = await import('../../server/api/projects/[id]/favorite.patch')
const { default: deleteHandler } = await import('../../server/api/projects/[id].delete')

const VALID_ID = '11111111-1111-4111-8111-111111111111'

function row(overrides: Partial<ProjectRow> = {}): ProjectRow {
  return {
    id: VALID_ID,
    name: 'Portal Interno',
    client: 'Clicksign',
    startDate: '2030-01-01',
    endDate: '2030-12-31',
    isFavorite: false,
    coverUrl: null,
    coverPathname: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  }
}

interface EventOptions {
  query?: Record<string, string>
  params?: Record<string, string>
  body?: unknown
  multipart?: Array<{ name: string; data: Buffer; filename?: string; type?: string }>
}

/**
 * Minimal H3 event stub. The handlers only use the query, router params and
 * body helpers, so this keeps the tests focused on handler behaviour.
 */
function createEvent(options: EventOptions = {}) {
  return {
    node: { req: { method: 'GET' }, res: {} },
    context: { params: options.params ?? {} },
    path: `/api/projects?${new URLSearchParams(options.query ?? {}).toString()}`,
    _body: options.body,
    _multipart: options.multipart,
    _responseStatus: 0
  } as unknown as Parameters<typeof listHandler>[0]
}

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()

  return {
    ...actual,
    getQuery: (event: { path: string }) =>
      Object.fromEntries(new URL(event.path, 'http://test').searchParams),
    getRouterParam: (event: { context: { params: Record<string, string> } }, name: string) =>
      event.context.params[name],
    readBody: async (event: { _body: unknown }) => event._body,
    readMultipartFormData: async (event: { _multipart?: unknown }) => event._multipart,
    setResponseStatus: (event: { _responseStatus: number }, status: number) => {
      event._responseStatus = status
    }
  }
})

async function expectStatus(promise: Promise<unknown>, statusCode: number) {
  await expect(promise).rejects.toMatchObject({ statusCode })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/projects', () => {
  it('returns totals separately from the filtered result', async () => {
    db.listProjects.mockResolvedValue([
      row({ id: VALID_ID, name: 'Portal Interno', isFavorite: true }),
      row({ id: '22222222-2222-4222-8222-222222222222', name: 'App Externo' })
    ])

    const result = await listHandler(createEvent({ query: { favorites: 'true' } }))

    expect(result.total).toBe(2)
    expect(result.filteredTotal).toBe(1)
    expect(result.items[0]?.name).toBe('Portal Interno')
  })

  it('returns an empty list for an empty database', async () => {
    db.listProjects.mockResolvedValue([])

    const result = await listHandler(createEvent())

    expect(result).toEqual({ items: [], total: 0, filteredTotal: 0 })
  })

  it('rejects a query shorter than three characters', async () => {
    await expectStatus(listHandler(createEvent({ query: { q: 'ab' } })), 400)
    expect(db.listProjects).not.toHaveBeenCalled()
  })

  it('rejects an unknown sort option', async () => {
    await expectStatus(listHandler(createEvent({ query: { sort: 'random' } })), 400)
  })

  it('sorts recent-start by startDate, not createdAt', async () => {
    db.listProjects.mockResolvedValue([
      row({
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Criado por último',
        startDate: '2026-01-01',
        createdAt: new Date('2026-09-11T23:00:00.000Z')
      }),
      row({
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Criado primeiro',
        startDate: '2026-08-01',
        createdAt: new Date('2026-01-01T00:00:00.000Z')
      })
    ])

    const result: ProjectListResponse = await listHandler(
      createEvent({ query: { sort: 'recent-start' } })
    )

    expect(result.items.map((item) => item.id)).toEqual([
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111'
    ])
  })

  it('hides database failures behind a generic 500', async () => {
    db.listProjects.mockRejectedValue(new Error('connection to postgres://secret failed'))

    await expect(listHandler(createEvent())).rejects.toMatchObject({
      statusCode: 500,
      data: { message: 'Não foi possível concluir a operação. Tente novamente.' }
    })
  })
})

describe('GET /api/projects/:id', () => {
  it('returns the project', async () => {
    db.findProject.mockResolvedValue(row())

    const result = await detailHandler(createEvent({ params: { id: VALID_ID } }))

    expect(result.id).toBe(VALID_ID)
  })

  it('rejects an invalid id', async () => {
    await expectStatus(detailHandler(createEvent({ params: { id: 'not-a-uuid' } })), 400)
    expect(db.findProject).not.toHaveBeenCalled()
  })

  it('returns 404 for a missing project', async () => {
    db.findProject.mockResolvedValue(null)

    await expectStatus(detailHandler(createEvent({ params: { id: VALID_ID } })), 404)
  })
})

describe('POST /api/projects', () => {
  const fields = [
    { name: 'name', data: Buffer.from('Portal Interno') },
    { name: 'client', data: Buffer.from('Clicksign') },
    { name: 'startDate', data: Buffer.from('2030-01-01') },
    { name: 'endDate', data: Buffer.from('2030-12-31') }
  ]

  it('persists a valid project without a cover', async () => {
    db.insertProject.mockImplementation(async (values: { id: string }) => row({ id: values.id }))

    const result = await createHandler(createEvent({ multipart: fields }))

    expect(db.insertProject).toHaveBeenCalledOnce()
    expect(result.name).toBe('Portal Interno')
    expect(blob.put).not.toHaveBeenCalled()
  })

  it('does not persist a project without a title', async () => {
    const invalid = [{ name: 'name', data: Buffer.from('   ') }, ...fields.slice(1)]

    await expect(createHandler(createEvent({ multipart: invalid }))).rejects.toMatchObject({
      statusCode: 400,
      data: { fieldErrors: { name: 'Por favor, digite o título do projeto' } }
    })
    expect(db.insertProject).not.toHaveBeenCalled()
  })

  it('persists a single-word title', async () => {
    db.insertProject.mockImplementation(async (values: { id: string }) =>
      row({ id: values.id, name: 'Iridium' })
    )

    const multipart = [{ name: 'name', data: Buffer.from('Iridium') }, ...fields.slice(1)]
    const result = await createHandler(createEvent({ multipart }))

    expect(db.insertProject).toHaveBeenCalledOnce()
    expect(result.name).toBe('Iridium')
  })

  it('rejects an unsupported cover type', async () => {
    const multipart = [
      ...fields,
      { name: 'cover', data: Buffer.from('gif'), filename: 'a.gif', type: 'image/gif' }
    ]

    await expectStatus(createHandler(createEvent({ multipart })), 415)
    expect(blob.put).not.toHaveBeenCalled()
  })

  it('rejects a cover above the size limit', async () => {
    const multipart = [
      ...fields,
      {
        name: 'cover',
        data: Buffer.alloc(4 * 1024 * 1024 + 1),
        filename: 'big.png',
        type: 'image/png'
      }
    ]

    await expectStatus(createHandler(createEvent({ multipart })), 413)
    expect(blob.put).not.toHaveBeenCalled()
  })

  it('deletes the uploaded blob when persistence fails', async () => {
    blob.put.mockResolvedValue({ url: 'https://blob/cover.png', pathname: 'projects/cover.png' })
    db.insertProject.mockRejectedValue(new Error('insert failed'))

    const multipart = [
      ...fields,
      { name: 'cover', data: Buffer.from('png'), filename: 'a.png', type: 'image/png' }
    ]

    await expectStatus(createHandler(createEvent({ multipart })), 500)
    expect(blob.del).toHaveBeenCalledWith('projects/cover.png')
  })
})

describe('PATCH /api/projects/:id', () => {
  const fields = [
    { name: 'name', data: Buffer.from('Portal Atualizado') },
    { name: 'client', data: Buffer.from('Clicksign') },
    { name: 'startDate', data: Buffer.from('2030-01-01') },
    { name: 'endDate', data: Buffer.from('2030-12-31') }
  ]

  it('updates an existing project', async () => {
    db.findProject.mockResolvedValue(row())
    db.updateProject.mockResolvedValue(row({ name: 'Portal Atualizado' }))

    const result = await updateHandler(createEvent({ params: { id: VALID_ID }, multipart: fields }))

    expect(result.name).toBe('Portal Atualizado')
    expect(blob.put).not.toHaveBeenCalled()
  })

  it('returns 404 when the project does not exist', async () => {
    db.findProject.mockResolvedValue(null)

    await expectStatus(
      updateHandler(createEvent({ params: { id: VALID_ID }, multipart: fields })),
      404
    )
    expect(db.updateProject).not.toHaveBeenCalled()
  })

  it('does not persist a project without a title', async () => {
    db.findProject.mockResolvedValue(row())
    const invalid = [{ name: 'name', data: Buffer.from('   ') }, ...fields.slice(1)]

    await expect(
      updateHandler(createEvent({ params: { id: VALID_ID }, multipart: invalid }))
    ).rejects.toMatchObject({
      statusCode: 400,
      data: { fieldErrors: { name: 'Por favor, digite o título do projeto' } }
    })
    expect(db.updateProject).not.toHaveBeenCalled()
  })

  it('deletes the new blob when the database update fails', async () => {
    db.findProject.mockResolvedValue(row({ coverPathname: 'projects/old.png' }))
    blob.put.mockResolvedValue({ url: 'https://blob/new.png', pathname: 'projects/new.png' })
    db.updateProject.mockRejectedValue(new Error('update failed'))

    const multipart = [
      ...fields,
      { name: 'cover', data: Buffer.from('png'), filename: 'a.png', type: 'image/png' }
    ]

    await expectStatus(updateHandler(createEvent({ params: { id: VALID_ID }, multipart })), 500)
    expect(blob.del).toHaveBeenCalledWith('projects/new.png')
  })
})

describe('PATCH /api/projects/:id/favorite', () => {
  it('stores the explicit value', async () => {
    db.updateProject.mockResolvedValue(row({ isFavorite: true }))

    const result = await favoriteHandler(
      createEvent({ params: { id: VALID_ID }, body: { isFavorite: true } })
    )

    expect(db.updateProject).toHaveBeenCalledWith(VALID_ID, { isFavorite: true })
    expect(result.isFavorite).toBe(true)
  })

  it('rejects a non-boolean payload', async () => {
    await expectStatus(
      favoriteHandler(createEvent({ params: { id: VALID_ID }, body: { isFavorite: 'yes' } })),
      400
    )
    expect(db.updateProject).not.toHaveBeenCalled()
  })

  it('returns 404 when the project is gone', async () => {
    db.updateProject.mockResolvedValue(null)

    await expectStatus(
      favoriteHandler(createEvent({ params: { id: VALID_ID }, body: { isFavorite: false } })),
      404
    )
  })
})

describe('DELETE /api/projects/:id', () => {
  it('removes the project and its cover', async () => {
    db.deleteProject.mockResolvedValue(row({ coverPathname: 'projects/cover.png' }))

    await deleteHandler(createEvent({ params: { id: VALID_ID } }))

    expect(db.deleteProject).toHaveBeenCalledWith(VALID_ID)
    expect(blob.del).toHaveBeenCalledWith('projects/cover.png')
  })

  it('returns 404 when nothing was removed', async () => {
    db.deleteProject.mockResolvedValue(null)

    await expectStatus(deleteHandler(createEvent({ params: { id: VALID_ID } })), 404)
  })

  it('still succeeds when the blob cleanup fails', async () => {
    db.deleteProject.mockResolvedValue(row({ coverPathname: 'projects/cover.png' }))
    blob.del.mockRejectedValue(new Error('blob unavailable'))

    await expect(deleteHandler(createEvent({ params: { id: VALID_ID } }))).resolves.toBeNull()
  })
})
