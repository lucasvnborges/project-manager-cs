import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import { extname } from 'node:path'
import { coverFilePath } from '../../utils/cover-storage'

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
}

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, 'pathname')
  const pathname = Array.isArray(raw) ? raw.join('/') : raw

  if (!pathname) {
    throw createError({ statusCode: 404, statusMessage: 'Capa não encontrada.' })
  }

  const fullPath = coverFilePath(pathname)

  try {
    await access(fullPath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Capa não encontrada.' })
  }

  const type = TYPES[extname(fullPath).toLowerCase()] ?? 'application/octet-stream'
  setHeader(event, 'Content-Type', type)
  return sendStream(event, createReadStream(fullPath))
})
