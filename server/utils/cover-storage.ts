import { del, put } from '@vercel/blob'
import type { CoverUpload } from './multipart'

export interface StoredCover {
  url: string
  pathname: string
}

function extensionFor(type: string): string {
  return type === 'image/png' ? 'png' : 'jpg'
}

export async function uploadCover(projectId: string, cover: CoverUpload): Promise<StoredCover> {
  const blob = await put(`projects/${projectId}.${extensionFor(cover.type)}`, cover.data, {
    access: 'public',
    contentType: cover.type,
    addRandomSuffix: true
  })

  return { url: blob.url, pathname: blob.pathname }
}

/**
 * Best-effort cleanup. A failed delete leaves an orphan blob but must never
 * fail the request that already succeeded in the database.
 */
export async function removeCover(pathname: string | null | undefined): Promise<void> {
  if (!pathname) return

  try {
    await del(pathname)
  } catch (error) {
    console.error('[blob] failed to delete cover', { pathname, error })
  }
}
