import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import config from '@payload-config'
import {
  buildProposalUploadKey,
  buildProposalUploadPublicUrl,
  getProposalUploadsBucket,
  getProposalUploadsS3Client,
} from '@/lib/proposal-upload/s3'
import { validateProposalFileMeta } from '@/lib/validation/proposal-request'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const filename =
      typeof body?.filename === 'string' ? body.filename.trim() : ''
    const mimeType =
      typeof body?.mimeType === 'string' ? body.mimeType.trim() : ''
    const filesize = Number(body?.filesize ?? 0)

    if (!filename || !mimeType || !Number.isFinite(filesize) || filesize <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Некорректные параметры файла' },
        { status: 400 },
      )
    }

    const fileError = validateProposalFileMeta({
      name: filename,
      size: filesize,
      type: mimeType,
    })

    if (fileError) {
      return NextResponse.json(
        { ok: false, error: fileError },
        { status: 400 },
      )
    }

    const storageKey = buildProposalUploadKey(filename)
    const downloadUrl = buildProposalUploadPublicUrl(storageKey)
    const uploadToken = crypto.randomUUID()

    const payload = await getPayload({ config })

    const assetDoc = await payload.create({
      collection: 'proposal-upload-assets',
      overrideAccess: true,
      data: {
        filename,
        mimeType,
        filesize,
        storageKey,
        downloadUrl,
        uploadToken,
        status: 'pending',
      },
    })

    const command = new PutObjectCommand({
      Bucket: getProposalUploadsBucket(),
      Key: storageKey,
      ContentType: mimeType,
    })

    const uploadUrl = await getSignedUrl(
      getProposalUploadsS3Client(),
      command,
      { expiresIn: 60 * 15 },
    )

    return NextResponse.json({
      ok: true,
      uploadUrl,
      asset: {
        id: assetDoc.id,
        token: uploadToken,
        filename,
        mimeType,
        filesize,
        downloadUrl,
      },
    })
  } catch (error) {
    console.error('Proposal upload presign error:', error)

    return NextResponse.json(
      { ok: false, error: 'Не удалось подготовить загрузку файла' },
      { status: 500 },
    )
  }
}