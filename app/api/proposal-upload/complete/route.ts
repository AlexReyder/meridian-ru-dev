import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const assetId = body?.assetId
    const token = typeof body?.token === 'string' ? body.token : ''

    if ((typeof assetId !== 'string' && typeof assetId !== 'number') || !token) {
      return NextResponse.json(
        { ok: false, error: 'Некорректные параметры завершения загрузки' },
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

    const updatedDoc = await payload.update({
      collection: 'proposal-upload-assets',
      id: assetId,
      overrideAccess: true,
      data: {
        status: 'uploaded',
      },
    })

    return NextResponse.json({
      ok: true,
      asset: {
        id: updatedDoc.id,
        filename: updatedDoc.filename,
        downloadUrl: updatedDoc.downloadUrl,
        status: updatedDoc.status,
      },
    })
  } catch (error) {
    console.error('Proposal upload complete error:', error)

    return NextResponse.json(
      { ok: false, error: 'Не удалось завершить загрузку файла' },
      { status: 500 },
    )
  }
}