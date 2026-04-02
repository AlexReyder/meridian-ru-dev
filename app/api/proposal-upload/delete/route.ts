import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'
import {
  getProposalUploadsBucket,
  getProposalUploadsS3Client,
} from '@/lib/proposal-upload/s3'

export async function DELETE(req: Request) {
  try {
    const body = await req.json()

    const assetId = body?.assetId
    const token = typeof body?.token === 'string' ? body.token : ''

    if ((typeof assetId !== 'string' && typeof assetId !== 'number') || !token) {
      return NextResponse.json(
        { ok: false, error: 'Некорректные параметры удаления файла' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const assetDoc = await payload.findByID({
      collection: 'proposal-upload-assets',
      id: assetId,
      overrideAccess: true,
    })

    if (!assetDoc || assetDoc.uploadToken !== token) {
      return NextResponse.json(
        { ok: false, error: 'Файл не найден или токен не совпадает' },
        { status: 404 },
      )
    }

    if (assetDoc.request) {
      return NextResponse.json(
        { ok: false, error: 'Нельзя удалить файл, уже привязанный к заявке' },
        { status: 400 },
      )
    }

    try {
      await getProposalUploadsS3Client().send(
        new DeleteObjectCommand({
          Bucket: getProposalUploadsBucket(),
          Key: assetDoc.storageKey,
        }),
      )
    } catch (s3Error) {
      console.error('Proposal upload S3 delete error:', s3Error)
    }

    await payload.delete({
      collection: 'proposal-upload-assets',
      id: assetId,
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Proposal upload delete error:', error)

    return NextResponse.json(
      { ok: false, error: 'Не удалось удалить файл' },
      { status: 500 },
    )
  }
}