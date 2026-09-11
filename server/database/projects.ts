import { eq } from 'drizzle-orm'
import { useDatabase } from './client'
import { type ProjectInsert, type ProjectRow, projects } from './schema'

export function listProjects(): Promise<ProjectRow[]> {
  return useDatabase().select().from(projects)
}

export async function findProject(id: string): Promise<ProjectRow | null> {
  const rows = await useDatabase().select().from(projects).where(eq(projects.id, id)).limit(1)

  return rows[0] ?? null
}

export async function insertProject(values: ProjectInsert): Promise<ProjectRow> {
  const [row] = await useDatabase().insert(projects).values(values).returning()

  if (!row) {
    throw new Error('Project insert returned no row')
  }

  return row
}

export async function updateProject(
  id: string,
  values: Partial<Omit<ProjectInsert, 'id' | 'createdAt'>>
): Promise<ProjectRow | null> {
  const rows = await useDatabase()
    .update(projects)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()

  return rows[0] ?? null
}

export async function deleteProject(id: string): Promise<ProjectRow | null> {
  const rows = await useDatabase().delete(projects).where(eq(projects.id, id)).returning()

  return rows[0] ?? null
}
