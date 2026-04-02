import { after, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import {
  getFirstZodError,
  proposalUploadSchema,
  proposalWizardSchema,
} from '@/lib/validation/proposal-request'

type UploadedAssetRef = {
  id: string | number
  token: string
}

type UploadedAssetDoc = {
  id: string | number
  filename: string
  downloadUrl: string
  uploadToken: string
  status: string
  request?: string | number | null
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function getBoolean(formData: FormData, key: string) {
  return getString(formData, key) === 'true'
}

function getJsonValue(formData: FormData, key: string): unknown {
  const value = formData.get(key)

  if (typeof value !== 'string' || !value.trim()) return undefined

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function getJsonStringArray(formData: FormData, key: string): string[] {
  const parsed = getJsonValue(formData, key)

  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === 'string')
    : []
}

function getUploadedAssetRefs(formData: FormData, key: string): UploadedAssetRef[] {
  const parsed = getJsonValue(formData, key)

  if (!Array.isArray(parsed)) return []

  return parsed.filter((item): item is UploadedAssetRef => {
    if (!item || typeof item !== 'object') return false

    const maybeId = (item as Record<string, unknown>).id
    const maybeToken = (item as Record<string, unknown>).token

    return (
      (typeof maybeId === 'string' || typeof maybeId === 'number') &&
      typeof maybeToken === 'string' &&
      maybeToken.length > 0
    )
  })
}

function buildUploadedAssetsEmailLines(
  uploadedAssets: Array<{ filename: string; downloadUrl: string }>,
) {
  if (!uploadedAssets.length) {
    return ['—']
  }

  return uploadedAssets.flatMap((asset, index) => [
    `${index + 1}. ${asset.filename}`,
    asset.downloadUrl,
  ])
}

function buildWizardEmailText(
  requestId: string | number,
  data: Record<string, unknown>,
  uploadedAssets: Array<{ filename: string; downloadUrl: string }>,
) {
  const referenceLinks =
    Array.isArray(data.referenceLinks) && data.referenceLinks.length
      ? data.referenceLinks.map((item) => `- ${String(item)}`)
      : ['—']

  return [
    'Новая заявка на предложение',
    `ID заявки: ${requestId}`,
    '',
    'Режим: wizard',
    `Локаль: ${String(data.locale ?? '')}`,
    '',
    `Имя: ${String(data.name ?? '')}`,
    `Email: ${String(data.email ?? '')}`,
    `Компания: ${String(data.company ?? '')}`,
    `Роль: ${String(data.role ?? '')}`,
    `Регион: ${String(data.region ?? '')}`,
    `Телефон: ${String(data.phone ?? '')}`,
    '',
    `Тип проекта: ${String(data.projectType ?? '')}`,
    `Цель проекта: ${String(data.projectGoal ?? '')}`,
    `Формат команды: ${String(data.teamType ?? '')}`,
    `Название компании: ${String(data.companyName ?? '')}`,
    `Сайт: ${String(data.website ?? '')}`,
    `Размер команды: ${String(data.teamSize ?? '')}`,
    `Количество ролей: ${String(data.rolesCount ?? '')}`,
    `Количество экранов: ${String(data.screenCount ?? '')}`,
    `Сроки: ${String(data.timeline ?? '')}`,
    `Бюджет: ${String(data.budget ?? '')}`,
    '',
    `Флаги сложности: ${
      Array.isArray(data.complexityFlags) ? data.complexityFlags.join(', ') : ''
    }`,
    `Материалы: ${
      Array.isArray(data.materials) ? data.materials.join(', ') : ''
    }`,
    '',
    'Референсы:',
    ...referenceLinks,
    '',
    'Файлы:',
    ...buildUploadedAssetsEmailLines(uploadedAssets),
    '',
    `Комментарий к brief: ${String(data.briefNotes ?? '')}`,
    `Дополнительный комментарий: ${String(data.comment ?? '')}`,
    '',
    `Без звонка сначала: ${String(Boolean(data.noCallFirst))}`,
    `Экспертный разбор: ${String(Boolean(data.expertReview))}`,
    `NDA: ${String(Boolean(data.nda))}`,
  ].join('\n')
}

function buildUploadEmailText(
  requestId: string | number,
  data: {
    locale: string
    name: string
    email: string
    description: string
    links: string[]
  },
  uploadedAssets: Array<{ filename: string; downloadUrl: string }>,
) {
  return [
    'Новая загрузка материалов',
    `ID заявки: ${requestId}`,
    '',
    'Режим: upload',
    `Локаль: ${data.locale}`,
    '',
    `Имя: ${data.name}`,
    `Email: ${data.email}`,
    '',
    'Описание:',
    data.description,
    '',
    'Ссылки:',
    ...(data.links.length ? data.links : ['—']),
    '',
    'Файлы:',
    ...buildUploadedAssetsEmailLines(uploadedAssets),
    '',
  ].join('\n')
}

async function resolveUploadedAssets(
  payload: Awaited<ReturnType<typeof getPayload>>,
  refs: UploadedAssetRef[],
): Promise<UploadedAssetDoc[]> {
  const docs = await Promise.all(
    refs.map(async (ref) => {
      const doc = await payload.findByID({
        collection: 'proposal-upload-assets',
        id: ref.id,
        overrideAccess: true,
      })

      if (!doc) {
        throw new Error('Один из файлов не найден')
      }

      if (doc.uploadToken !== ref.token) {
        throw new Error('Некорректный токен одного из файлов')
      }

      if (doc.request) {
        throw new Error('Один из файлов уже привязан к другой заявке')
      }

      if (doc.status !== 'uploaded' && doc.status !== 'attached') {
        throw new Error('Один из файлов ещё не завершил загрузку')
      }

      return {
        id: doc.id,
        filename: doc.filename,
        downloadUrl: doc.downloadUrl,
        uploadToken: doc.uploadToken,
        status: doc.status,
        request: doc.request,
      }
    }),
  )

  return docs
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const formData = await req.formData()
    const mode = getString(formData, 'mode')

    if (mode === 'wizard') {
      const uploadedAssets = getUploadedAssetRefs(formData, 'uploadedAssets')

      const parsed = proposalWizardSchema.safeParse({
        mode: 'wizard',
        locale: getString(formData, 'locale'),

        projectType: getString(formData, 'projectType'),
        projectGoal: getString(formData, 'projectGoal'),
        teamType: getString(formData, 'teamType'),

        companyName: getString(formData, 'companyName'),
        website: getString(formData, 'website'),
        teamSize: getString(formData, 'teamSize'),
        rolesCount: getString(formData, 'rolesCount'),
        screenCount: getString(formData, 'screenCount'),

        complexityFlags: getJsonStringArray(formData, 'complexityFlags'),
        materials: getJsonStringArray(formData, 'materials'),
        referenceLinks: getJsonStringArray(formData, 'referenceLinks'),
        uploadedAssets,

        timeline: getString(formData, 'timeline'),
        budget: getString(formData, 'budget'),
        briefNotes: getString(formData, 'briefNotes'),

        name: getString(formData, 'name'),
        email: getString(formData, 'email'),
        company: getString(formData, 'company'),
        role: getString(formData, 'role'),
        region: getString(formData, 'region'),
        phone: getString(formData, 'phone'),
        comment: getString(formData, 'comment'),

        noCallFirst: getBoolean(formData, 'noCallFirst'),
        expertReview: getBoolean(formData, 'expertReview'),
        nda: getBoolean(formData, 'nda'),
      })

      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: getFirstZodError(parsed.error) },
          { status: 400 },
        )
      }

      let uploadedAssetDocs: UploadedAssetDoc[] = []

      try {
        uploadedAssetDocs = await resolveUploadedAssets(payload, parsed.data.uploadedAssets)
      } catch (assetError) {
        return NextResponse.json(
          {
            ok: false,
            error:
              assetError instanceof Error
                ? assetError.message
                : 'Не удалось проверить загруженные файлы',
          },
          { status: 400 },
        )
      }

      const requestDoc = await payload.create({
        collection: 'proposal-requests',
        overrideAccess: true,
        data: {
          mode: 'wizard',
          locale: parsed.data.locale,
          name: parsed.data.name,
          email: parsed.data.email,
          company: parsed.data.company,
          role: parsed.data.role,
          region: parsed.data.region,
          phone: parsed.data.phone,
          payload: parsed.data,
          links: parsed.data.referenceLinks.map((value) => ({ url: value })),
          uploadedAssets: uploadedAssetDocs.map((asset) => asset.id),
          files: [],
        },
      })

      after(async () => {
        try {
          await Promise.all(
            uploadedAssetDocs.map((asset) =>
              payload.update({
                collection: 'proposal-upload-assets',
                id: asset.id,
                overrideAccess: true,
                data: {
                  request: requestDoc.id,
                  status: 'attached',
                },
              }),
            ),
          )

          try {
            await payload.sendEmail({
              to:
                process.env.PROPOSAL_NOTIFICATION_EMAIL ||
                process.env.SMTP_USER ||
                'mail@anx-studio.ru',
              subject: `[Новая заявка][Бриф][${parsed.data.locale.toUpperCase()}] ${parsed.data.name}`,
              text: buildWizardEmailText(requestDoc.id, parsed.data, uploadedAssetDocs),
            })
          } catch (emailError) {
            console.error('Proposal wizard email error:', emailError)
          }
        } catch (backgroundError) {
          console.error('Proposal wizard background processing error:', backgroundError)
        }
      })

      return NextResponse.json({
        ok: true,
        requestId: requestDoc.id,
      })
    }

    if (mode === 'upload') {
      const uploadedAssets = getUploadedAssetRefs(formData, 'uploadedAssets')

      const parsed = proposalUploadSchema.safeParse({
        mode: 'upload',
        locale: getString(formData, 'locale'),
        name: getString(formData, 'name'),
        email: getString(formData, 'email'),
        description: getString(formData, 'description'),
        links: getJsonStringArray(formData, 'links'),
        uploadedAssets,
      })

      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: getFirstZodError(parsed.error) },
          { status: 400 },
        )
      }

      let uploadedAssetDocs: UploadedAssetDoc[] = []

      try {
        uploadedAssetDocs = await resolveUploadedAssets(payload, parsed.data.uploadedAssets)
      } catch (assetError) {
        return NextResponse.json(
          {
            ok: false,
            error:
              assetError instanceof Error
                ? assetError.message
                : 'Не удалось проверить загруженные файлы',
          },
          { status: 400 },
        )
      }

      const requestDoc = await payload.create({
        collection: 'proposal-requests',
        overrideAccess: true,
        data: {
          mode: 'upload',
          locale: parsed.data.locale,
          name: parsed.data.name,
          email: parsed.data.email,
          payload: {
            description: parsed.data.description,
          },
          links: parsed.data.links.map((url) => ({ url })),
          uploadedAssets: uploadedAssetDocs.map((asset) => asset.id),
          files: [],
        },
      })

      after(async () => {
        try {
          await Promise.all(
            uploadedAssetDocs.map((asset) =>
              payload.update({
                collection: 'proposal-upload-assets',
                id: asset.id,
                overrideAccess: true,
                data: {
                  request: requestDoc.id,
                  status: 'attached',
                },
              }),
            ),
          )

          try {
            await payload.sendEmail({
              to:
                process.env.PROPOSAL_NOTIFICATION_EMAIL ||
                process.env.SMTP_USER ||
                'mail@anx-studio.ru',
              subject: `[Новая заявка][Материалы][${parsed.data.locale.toUpperCase()}] ${parsed.data.name}`,
              text: buildUploadEmailText(
                requestDoc.id,
                {
                  locale: parsed.data.locale,
                  name: parsed.data.name,
                  email: parsed.data.email,
                  description: parsed.data.description,
                  links: parsed.data.links,
                },
                uploadedAssetDocs,
              ),
            })
          } catch (emailError) {
            console.error('Proposal upload email error:', emailError)
          }
        } catch (backgroundError) {
          console.error('Proposal upload background processing error:', backgroundError)
        }
      })

      return NextResponse.json({
        ok: true,
        requestId: requestDoc.id,
      })
    }

    return NextResponse.json(
      { ok: false, error: 'Неподдерживаемый режим отправки' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Proposal request route error:', error)

    return NextResponse.json(
      { ok: false, error: 'Внутренняя ошибка.' },
      { status: 500 },
    )
  }
}