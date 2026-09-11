import { type H3Event, readMultipartFormData } from 'h3'
import {
  COVER_ALLOWED_TYPES,
  COVER_MAX_BYTES,
  type ProjectFormValues
} from '#shared/types/project'
import { badRequest, payloadTooLarge, unsupportedMediaType } from './api-error'

export interface CoverUpload {
  data: Buffer
  filename: string
  type: string
}

export interface ProjectMultipartBody {
  values: ProjectFormValues
  cover: CoverUpload | null
  removeCover: boolean
}

function readField(parts: Awaited<ReturnType<typeof readMultipartFormData>>, name: string): string {
  const part = parts?.find((entry) => entry.name === name && entry.filename === undefined)

  return part ? part.data.toString('utf8') : ''
}

export async function readProjectMultipart(event: H3Event): Promise<ProjectMultipartBody> {
  const parts = await readMultipartFormData(event)

  if (!parts) {
    throw badRequest('Envie os dados do projeto como multipart/form-data.')
  }

  const coverPart = parts.find((entry) => entry.name === 'cover' && entry.filename !== undefined)
  let cover: CoverUpload | null = null

  if (coverPart && coverPart.data.length > 0) {
    const type = coverPart.type ?? ''

    if (!COVER_ALLOWED_TYPES.includes(type as (typeof COVER_ALLOWED_TYPES)[number])) {
      throw unsupportedMediaType('Escolha uma imagem .jpg ou .png.', {
        cover: 'Escolha uma imagem .jpg ou .png.'
      })
    }

    if (coverPart.data.length > COVER_MAX_BYTES) {
      throw payloadTooLarge('A imagem deve ter no máximo 4 MB.', {
        cover: 'A imagem deve ter no máximo 4 MB.'
      })
    }

    cover = {
      data: coverPart.data,
      filename: coverPart.filename ?? 'cover',
      type
    }
  }

  return {
    values: {
      name: readField(parts, 'name'),
      client: readField(parts, 'client'),
      startDate: readField(parts, 'startDate'),
      endDate: readField(parts, 'endDate')
    },
    cover,
    removeCover: readField(parts, 'removeCover') === 'true'
  }
}
