import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, sep } from 'node:path'
import { randomBytes } from 'node:crypto'
import { del, put } from '@vercel/blob'
import type { CoverUpload } from './multipart'

export interface StoredCover {
  url: string
  pathname: string
}

const COVER_DIR = join(process.cwd(), '.data', 'covers')

function extensionFor(type: string): string {
  return type === 'image/png' ? 'png' : 'jpg'
}

function useFileCovers(): boolean {
  return process.env.COVER_STORAGE === 'fs'
}

export function coverFilePath(pathname: string): string {
  const normalized = normalize(pathname).replace(/^[/\\]+/, '')

  if (normalized.includes('..') || normalized.split(sep).some((part) => part === '..')) {
    throw new Error('Invalid cover path')
  }

  return join(COVER_DIR, normalized)
}

async function uploadCoverToDisk(projectId: string, cover: CoverUpload): Promise<StoredCover> {
  const pathname = `projects/${projectId}-${randomBytes(4).toString('hex')}.${extensionFor(cover.type)}`
  const fullPath = coverFilePath(pathname)

  await mkdir(dirname(fullPath), { recursive: true })
  await writeFile(fullPath, cover.data)

  return { url: `/covers/${pathname}`, pathname }
}

async function removeCoverFromDisk(pathname: string): Promise<void> {
  await unlink(coverFilePath(pathname))
}

export async function uploadCover(projectId: string, cover: CoverUpload): Promise<StoredCover> {
  if (useFileCovers()) {
    return uploadCoverToDisk(projectId, cover)
  }

  const blob = await put(`projects/${projectId}.${extensionFor(cover.type)}`, cover.data, {
    access: 'public',
    contentType: cover.type,
    addRandomSuffix: true
  })

  return { url: blob.url, pathname: blob.pathname }
}

/**
 * Best-effort cleanup. A failed delete leaves an orphan file/blob but must
 * never fail the request that already succeeded in the database.
 */
export async function removeCover(pathname: string | null | undefined): Promise<void> {
  if (!pathname) return

  try {
    if (useFileCovers()) {
      await removeCoverFromDisk(pathname)
      return
    }

    await del(pathname)
  } catch (error) {
    console.error('[blob] failed to delete cover', { pathname, error })
  }
}
