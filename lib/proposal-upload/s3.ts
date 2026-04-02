import { S3Client } from '@aws-sdk/client-s3'

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function trimSlashes(value: string) {
  return value.replace(/\/+$/, '')
}

function sanitizeFilename(filename: string) {
  const normalized = filename.normalize('NFKD')
  const safe = normalized
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return safe || 'file'
}

export function getProposalUploadsBucket() {
  return requireEnv(process.env.S3_BUCKET, 'S3_BUCKET')
}

export function getProposalUploadsS3Client() {
  return new S3Client({
    region: requireEnv(process.env.S3_REGION, 'S3_REGION'),
    endpoint: requireEnv(process.env.S3_ENDPOINT, 'S3_ENDPOINT'),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: requireEnv(process.env.S3_ACCESS_KEY_ID, 'S3_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv(
        process.env.S3_SECRET_ACCESS_KEY,
        'S3_SECRET_ACCESS_KEY',
      ),
    },
  })
}

export function buildProposalUploadKey(filename: string) {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const safeFilename = sanitizeFilename(filename)

  return `proposal-uploads/${year}/${month}/${crypto.randomUUID()}-${safeFilename}`
}

export function buildProposalUploadPublicUrl(storageKey: string) {
  const publicBase = process.env.S3_PUBLIC_BASE_URL
  if (publicBase) {
    return `${trimSlashes(publicBase)}/${storageKey}`
  }

  const endpoint = process.env.S3_ENDPOINT
  const bucket = process.env.S3_BUCKET

  if (!endpoint || !bucket) {
    throw new Error('Missing S3_PUBLIC_BASE_URL or S3_ENDPOINT/S3_BUCKET')
  }

  return `${trimSlashes(endpoint)}/${bucket}/${storageKey}`
}