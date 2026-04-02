'use client'

import { useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  Clock,
  FileText,
  Home,
  Layers,
  Link as LinkIcon,
  Plus,
  Target,
  Upload,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  getHrefForPageKey,
  isRTL,
  type Locale,
  type PageKey,
} from '@/lib/routes'
import {
  getFirstZodError,
  MAX_PROPOSAL_FILES,
  proposalUploadSchema,
  proposalWizardSchema,
  validateProposalFileMeta,
} from '@/lib/validation/proposal-request'
import { cn } from '@/lib/utils'

type CopyItem = {
  key?: string | null
  value?: string | null
}

type TextOption = {
  value?: string | null
  label?: string | null
}

type TextOptionWithDescription = TextOption & {
  description?: string | null
}

type ProcessStep = {
  icon?: 'target' | 'users' | 'layers' | 'arrowUpRight' | 'arrowUpLeft' | null
  title?: string | null
  description?: string | null
}

type SuccessStep = {
  number?: string | null
  title?: string | null
  description?: string | null
}

type SupportPoint = {
  label?: string | null
}

type ProposalFlowProposalBlockData = {
  introCopy?: CopyItem[] | null
  introProcessSteps?: ProcessStep[] | null

  wizardCopy?: CopyItem[] | null
  wizardStepLabels?: { value?: string | null }[] | null
  referenceLinksMode?: 'enabled' | 'disabled' | null

  projectTypes?: TextOptionWithDescription[] | null
  projectGoals?: TextOption[] | null
  teamTypes?: TextOption[] | null
  complexityFlags?: { value?: string | null }[] | null
  materialsOptions?: TextOption[] | null
  timelineOptions?: TextOption[] | null
  budgetOptions?: TextOption[] | null
  summaryResults?: { value?: string | null }[] | null

  uploadCopy?: CopyItem[] | null

  successCopy?: CopyItem[] | null
  successHomePageKey?: PageKey | null
  successPricingPageKey?: PageKey | null
  successSteps?: SuccessStep[] | null
  supportPoints?: SupportPoint[] | null
}

type Props = {
  block: ProposalFlowProposalBlockData
  locale: Locale
}

type ViewState = 'intro' | 'wizard' | 'upload' | 'success'

type WizardData = {
  projectType?: string
  projectGoal?: string
  teamType?: string

  teamField1?: string
  teamField2?: string
  teamField3?: string

  rolesCount?: string
  screenCount?: string
  complexityFlags: string[]

  materials: string[]
  referenceLinks: string[]

  timeline?: string
  budget?: string

  name?: string
  email?: string
  company?: string
  role?: string
  region?: string
  phone?: string
  comment?: string

  noCallFirst?: boolean
  expertReview?: boolean
  nda?: boolean
}

type UploadedAssetRef = {
  id: string | number
  token: string
}

type UploadedAssetItem = {
  localId: string
  filename: string
  mimeType: string
  filesize: number
  progress: number
  status: 'uploading' | 'uploaded' | 'error'
  assetId?: string | number
  token?: string
  downloadUrl?: string
  error?: string
}

type PresignResponse = {
  ok: true
  uploadUrl: string
  asset: {
    id: string | number
    token: string
    filename: string
    mimeType: string
    filesize: number
    downloadUrl: string
  }
}

const PROCESS_ICONS: Record<string, LucideIcon> = {
  target: Target,
  users: Users,
  layers: Layers,
  arrowUpRight: ArrowUpRight,
  arrowUpLeft: ArrowUpLeft,
}

function getCopyValue(
  items: CopyItem[] | null | undefined,
  key: string,
  fallback = '',
) {
  return items?.find((item) => item?.key === key)?.value ?? fallback
}

function appendString(formData: FormData, key: string, value?: string | null) {
  formData.append(key, value ?? '')
}

function appendBoolean(formData: FormData, key: string, value?: boolean) {
  formData.append(key, value ? 'true' : 'false')
}

function appendJson(formData: FormData, key: string, value: unknown) {
  formData.append(key, JSON.stringify(value))
}

function getOptionLabel(
  options: (TextOption | TextOptionWithDescription | { value?: string | null })[] | null | undefined,
  value?: string,
) {
  if (!value) return null
  const found = options?.find((item) => item?.value === value)
  if (!found) return null
  return 'label' in found ? found.label ?? null : found.value ?? null
}

function validateWizardStep(step: number, data: WizardData) {
  switch (step) {
    case 1:
      if (!data.projectType?.trim()) return 'Выберите тип проекта'
      return null

    case 2:
      if (!data.projectGoal?.trim()) return 'Выберите цель проекта'
      return null

    case 3:
      if (!data.teamType?.trim()) return 'Выберите формат команды'
      return null

    case 4:
      if (!data.rolesCount?.trim()) return 'Укажите количество ролей'
      if (!data.screenCount?.trim()) return 'Укажите количество экранов'
      return null

    case 5:
      if (!data.materials.length) {
        return 'Укажите материалы'
      }
      return null

    case 6:
      if (!data.timeline?.trim()) return 'Выберите сроки'
      if (!data.budget?.trim()) return 'Выберите бюджет'
      return null

    case 7:
      if (!data.name?.trim()) return 'Введите ваше имя'
      if (!data.email?.trim()) return 'Введите email'
      if (!/\S+@\S+\.\S+/.test(data.email)) return 'Введите корректный email'
      return null

    default:
      return null
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function requestUploadSlot(file: File) {
  const response = await fetch('/api/proposal-upload/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      filesize: file.size,
    }),
  })

  const result = (await response.json()) as
    | PresignResponse
    | { ok: false; error?: string }

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || 'Не удалось подготовить загрузку файла')
  }

  return result
}

function uploadFileWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) return
      const progress = Math.round((event.loaded / event.total) * 100)
      onProgress(progress)
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
        return
      }

      reject(new Error('Не удалось загрузить файл в хранилище'))
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Ошибка сети при загрузке файла'))
    })

    xhr.open('PUT', uploadUrl)

    if (file.type) {
      xhr.setRequestHeader('Content-Type', file.type)
    }

    xhr.send(file)
  })
}

async function completeUpload(assetId: string | number, token: string) {
  const response = await fetch('/api/proposal-upload/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assetId,
      token,
    }),
  })

  const result = (await response.json()) as
    | {
        ok: true
        asset: {
          id: string | number
          filename: string
          downloadUrl: string
          status: string
        }
      }
    | { ok: false; error?: string }

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || 'Не удалось завершить загрузку файла')
  }

  return result.asset
}

async function deleteUploadedAsset(assetId: string | number, token: string) {
  const response = await fetch('/api/proposal-upload/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assetId,
      token,
    }),
  })

  const result = (await response.json()) as
    | { ok: true }
    | { ok: false; error?: string }

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || 'Не удалось удалить файл')
  }
}

function ChoiceCard({
  active,
  title,
  description,
  rtl,
  onClick,
}: {
  active: boolean
  title: string
  description?: string | null
  rtl: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-sm border p-4 transition-all',
        active
          ? 'border-foreground bg-foreground/5'
          : 'border-border hover:border-foreground/30',
        rtl ? 'text-right' : 'text-left',
      )}
    >
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description ? (
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </div>
      ) : null}
    </button>
  )
}

function WizardStepHeader({
  currentStep,
  totalSteps,
  wizardCopy,
  rtl,
}: {
  currentStep: number
  totalSteps: number
  wizardCopy?: CopyItem[] | null
  rtl: boolean
}) {
  const counter = `${getCopyValue(wizardCopy, 'stepCounterPrefix', 'Шаг')} ${currentStep} ${getCopyValue(
    wizardCopy,
    'stepCounterConnector',
    'из',
  )} ${totalSteps}`

  return (
    <div className="border-b border-border px-8 py-6">
      <div className={cn('mb-4 flex items-center justify-between', rtl && 'flex-row-reverse')}>
        <div
          className={cn(
            'flex items-center gap-2 text-sm text-muted-foreground',
            rtl && 'flex-row-reverse',
          )}
        >
          {rtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {getCopyValue(
            wizardCopy,
            currentStep === 1 ? 'firstBackLabel' : 'backStepLabel',
            currentStep === 1 ? 'Назад' : 'Предыдущий шаг',
          )}
        </div>

        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {counter}
        </span>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1

          return (
            <div
              key={step}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                step < currentStep
                  ? 'bg-signature-cobalt'
                  : step === currentStep
                    ? rtl
                      ? 'bg-gradient-to-l from-signature-cobalt to-signature-brass'
                      : 'bg-gradient-to-r from-signature-cobalt to-signature-brass'
                    : 'bg-border',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

function DirectUploadItem({
  item,
  rtl,
  onRemove,
}: {
  item: UploadedAssetItem
  rtl: boolean
  onRemove: () => void
}) {
  const statusLabel =
    item.status === 'uploading'
      ? `Загрузка ${item.progress}%`
      : item.status === 'uploaded'
        ? 'Загружен'
        : 'Ошибка'

  return (
    <div className="rounded-sm bg-secondary/30 p-3">
      <div
        className={cn(
          'flex items-start justify-between gap-3',
          rtl && 'flex-row-reverse',
        )}
      >
        <div className={cn('flex items-start gap-3', rtl && 'flex-row-reverse')}>
          <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div className={rtl ? 'text-right' : 'text-left'}>
            <div className="max-w-[420px] truncate text-sm text-foreground" dir="ltr">
              {item.filename}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatFileSize(item.filesize)} · {statusLabel}
            </div>
            {item.status === 'uploaded' && item.downloadUrl ? (
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-foreground/80 hover:underline"
              >
                Открыть файл
              </a>
            ) : null}
            {item.status === 'error' && item.error ? (
              <div className="mt-1 text-xs text-destructive">{item.error}</div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={item.status === 'uploading'}
          className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {item.status === 'uploading' ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${Math.max(item.progress, 4)}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function DirectUploadSection({
  label,
  title,
  hint,
  rtl,
  items,
  onFilesSelected,
  onRemove,
  uploadingCount,
}: {
  label?: string
  title: string
  hint: string
  rtl: boolean
  items: UploadedAssetItem[]
  onFilesSelected: (files: File[]) => Promise<void> | void
  onRemove: (localId: string) => Promise<void> | void
  uploadingCount: number
}) {
  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''

    if (!files.length) return
    await onFilesSelected(files)
  }

  return (
    <div>
      {label ? (
        <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      ) : null}

      <label className="block cursor-pointer">
        <input type="file" multiple className="hidden" onChange={handleFileInput} />

        <div className="rounded-sm border-2 border-dashed border-border p-8 text-center transition-colors hover:border-foreground/30">
          <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="mb-1 text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
          {uploadingCount > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Загружается файлов: {uploadingCount}
            </p>
          ) : null}
        </div>
      </label>

      {items.length ? (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <DirectUploadItem
              key={item.localId}
              item={item}
              rtl={rtl}
              onRemove={() => onRemove(item.localId)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function useProposalDirectUploads() {
  const [items, setItems] = useState<UploadedAssetItem[]>([])

  const patchItem = (localId: string, patch: Partial<UploadedAssetItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item)),
    )
  }

  const uploadFiles = async (files: File[]) => {
    const nextCount = items.length + files.length

    if (nextCount > MAX_PROPOSAL_FILES) {
      throw new Error(`Можно загрузить не более ${MAX_PROPOSAL_FILES} файлов`)
    }

    for (const file of files) {
      const validationError = validateProposalFileMeta({
        name: file.name,
        size: file.size,
        type: file.type,
      })

      if (validationError) {
        throw new Error(`${file.name}: ${validationError}`)
      }
    }

    const draftItems = files.map((file) => ({
      localId: crypto.randomUUID(),
      filename: file.name,
      mimeType: file.type,
      filesize: file.size,
      progress: 0,
      status: 'uploading' as const,
    }))

    setItems((prev) => [...prev, ...draftItems])

    await Promise.all(
      draftItems.map(async (draft, index) => {
        const file = files[index]

        try {
          const presign = await requestUploadSlot(file)

          patchItem(draft.localId, {
            assetId: presign.asset.id,
            token: presign.asset.token,
            downloadUrl: presign.asset.downloadUrl,
          })

          await uploadFileWithProgress(presign.uploadUrl, file, (progress) => {
            patchItem(draft.localId, { progress })
          })

          await completeUpload(presign.asset.id, presign.asset.token)

          patchItem(draft.localId, {
            status: 'uploaded',
            progress: 100,
          })
        } catch (error) {
          patchItem(draft.localId, {
            status: 'error',
            error:
              error instanceof Error ? error.message : 'Не удалось загрузить файл',
          })
        }
      }),
    )
  }

  const removeItem = async (localId: string) => {
    const current = items.find((item) => item.localId === localId)
    if (!current) return

    if (current.status !== 'uploading' && current.assetId && current.token) {
      await deleteUploadedAsset(current.assetId, current.token)
    }

    setItems((prev) => prev.filter((item) => item.localId !== localId))
  }

  const uploadedAssetRefs: UploadedAssetRef[] = items
    .filter(
      (item) =>
        item.status === 'uploaded' &&
        item.assetId !== undefined &&
        item.token,
    )
    .map((item) => ({
      id: item.assetId!,
      token: item.token!,
    }))

  const uploadingCount = items.filter((item) => item.status === 'uploading').length
  const hasUploading = uploadingCount > 0
  const hasFailedUploads = items.some((item) => item.status === 'error')

  return {
    items,
    uploadFiles,
    removeItem,
    uploadedAssetRefs,
    uploadingCount,
    hasUploading,
    hasFailedUploads,
  }
}

function IntroView({
  block,
  locale,
  onStartWizard,
  onStartUpload,
}: {
  block: ProposalFlowProposalBlockData
  locale: Locale
  onStartWizard: () => void
  onStartUpload: () => void
}) {
  const rtl = isRTL(locale)

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div
            className={cn(
              'group relative rounded-sm border border-border bg-card p-8 transition-colors hover:border-accent/40',
              rtl && 'text-right',
            )}
          >
            <div className={cn('absolute top-6', rtl ? 'left-6' : 'right-6')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <FileText className="h-5 w-5 text-accent" />
              </div>
            </div>

            <div className={rtl ? 'pl-14' : 'pr-14'}>
              <h3 className="mb-3 font-serif text-xl font-medium text-foreground">
                {getCopyValue(block.introCopy, 'briefCardTitle')}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {getCopyValue(block.introCopy, 'briefCardDescription')}
              </p>
            </div>

            <Button
              type="button"
              onClick={onStartWizard}
              className="h-10 bg-foreground px-6 text-[11px] uppercase tracking-[0.12em] text-background hover:bg-foreground/90"
            >
              {getCopyValue(block.introCopy, 'briefButtonLabel')}
              {rtl ? (
                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          <div
            className={cn(
              'group relative rounded-sm border border-border bg-card p-8 transition-colors hover:border-accent/40',
              rtl && 'text-right',
            )}
          >
            <div className={cn('absolute top-6', rtl ? 'left-6' : 'right-6')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className={rtl ? 'pl-14' : 'pr-14'}>
              <h3 className="mb-3 font-serif text-xl font-medium text-foreground">
                {getCopyValue(block.introCopy, 'uploadCardTitle')}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {getCopyValue(block.introCopy, 'uploadCardDescription')}
              </p>
            </div>

            <Button
              type="button"
              onClick={onStartUpload}
              variant="outline"
              className="h-10 border-foreground/20 px-6 text-[11px] uppercase tracking-[0.12em] text-foreground hover:bg-foreground/5"
              data-proposal-upload-trigger
            >
              {getCopyValue(block.introCopy, 'uploadButtonLabel')}
              {rtl ? (
                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-16 lg:mt-20">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
              {getCopyValue(block.introCopy, 'processEyebrow')}
            </span>
            <span className="h-px flex-1 bg-border/60" />
          </div>

          <div className="mb-10 text-center">
            <h3 className="mb-4 font-serif text-2xl font-light text-foreground lg:text-[1.75rem]">
              {getCopyValue(block.introCopy, 'processTitle')}
            </h3>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
              {getCopyValue(block.introCopy, 'processDescription')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {block.introProcessSteps?.map((step, index) => {
              if (!step?.title || !step?.description) return null

              const iconKey = step.icon ?? 'target'
              const Icon = PROCESS_ICONS[iconKey] ?? Target

              return (
                <div
                  key={`${step.title}-${index}`}
                  className={cn(
                    'relative rounded-sm border border-border/50 bg-secondary/30 p-5',
                    rtl && 'text-right',
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-4 text-[10px] font-medium text-muted-foreground/40',
                      rtl ? 'left-4' : 'right-4',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
                    <Icon className="h-4 w-4 text-foreground/70" />
                  </div>

                  <h4 className="mb-2 text-sm font-medium text-foreground">{step.title}</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function WizardSidebar({
  block,
  locale,
  currentStep,
  data,
}: {
  block: ProposalFlowProposalBlockData
  locale: Locale
  currentStep: number
  data: WizardData
}) {
  const rtl = isRTL(locale)

  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 rounded-sm border border-border bg-card p-6">
        <h3 className="mb-4 font-serif text-lg font-medium text-foreground">
          {getCopyValue(block.wizardCopy, 'sidebarTitle', 'Ваш brief')}
        </h3>

        <div className="space-y-4 text-sm">
          <div className={cn('flex items-start gap-3', rtl && 'flex-row-reverse')}>
            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                {getCopyValue(block.wizardCopy, 'sidebarProjectTypeLabel', 'Тип проекта')}
              </div>
              <div className="text-foreground">
                {getOptionLabel(block.projectTypes, data.projectType) ??
                  getCopyValue(block.wizardCopy, 'sidebarEmptyValue', 'Не выбрано')}
              </div>
            </div>
          </div>

          <div className={cn('flex items-start gap-3', rtl && 'flex-row-reverse')}>
            <Target className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                {getCopyValue(block.wizardCopy, 'sidebarGoalLabel', 'Цель')}
              </div>
              <div className="text-foreground">
                {getOptionLabel(block.projectGoals, data.projectGoal) ??
                  getCopyValue(block.wizardCopy, 'sidebarEmptyValue', 'Не выбрано')}
              </div>
            </div>
          </div>

          <div className={cn('flex items-start gap-3', rtl && 'flex-row-reverse')}>
            <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                {getCopyValue(block.wizardCopy, 'sidebarTeamLabel', 'Команда')}
              </div>
              <div className="text-foreground">
                {getOptionLabel(block.teamTypes, data.teamType) ??
                  getCopyValue(block.wizardCopy, 'sidebarEmptyValue', 'Не выбрано')}
              </div>
            </div>
          </div>

          <div className={cn('flex items-start gap-3', rtl && 'flex-row-reverse')}>
            <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                {getCopyValue(block.wizardCopy, 'sidebarTimelineLabel', 'Сроки')}
              </div>
              <div className="text-foreground">
                {getOptionLabel(block.timelineOptions, data.timeline) ??
                  getCopyValue(block.wizardCopy, 'sidebarEmptyValue', 'Не выбрано')}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
            {getCopyValue(
              block.wizardCopy,
              'sidebarResultsTitle',
              'После отправки вы получите',
            )}
          </div>

          <ul className="space-y-2 text-sm text-foreground">
            {block.summaryResults?.map((item) =>
              item?.value ? (
                <li
                  key={item.value}
                  className={cn('flex items-center gap-2', rtl && 'flex-row-reverse')}
                >
                  <Check className="h-3.5 w-3.5 text-accent" />
                  {item.value}
                </li>
              ) : null,
            )}
          </ul>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {getCopyValue(block.wizardCopy, 'sidebarFooter')}
          </p>
        </div>
      </div>
    </div>
  )
}

function ProposalWizard({
  block,
  locale,
  onBack,
  onSuccess,
}: {
  block: ProposalFlowProposalBlockData
  locale: Locale
  onBack: () => void
  onSuccess: () => void
}) {
  const rtl = isRTL(locale)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [data, setData] = useState<WizardData>({
    complexityFlags: [],
    materials: [],
    referenceLinks: [],
  })
  const [newReferenceLink, setNewReferenceLink] = useState('')

  const {
    items: uploadedItems,
    uploadFiles,
    removeItem,
    uploadedAssetRefs,
    uploadingCount,
    hasUploading,
    hasFailedUploads,
  } = useProposalDirectUploads()

  const totalSteps = block.wizardStepLabels?.length || 7
  const referencesEnabled = (block.referenceLinksMode ?? 'enabled') === 'enabled'

  const showNoCall = Boolean(getCopyValue(block.wizardCopy, 'noCallLabel'))
  const showExpert = Boolean(getCopyValue(block.wizardCopy, 'expertReviewLabel'))
  const showNda = Boolean(getCopyValue(block.wizardCopy, 'ndaLabel'))

  const clearError = () => setSubmitError(null)

  const toggleArrayValue = (key: 'complexityFlags' | 'materials', value: string) => {
    setData((prev) => {
      const current = prev[key] ?? []

      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      }
    })
  }

  const addReferenceLink = () => {
    const candidate = newReferenceLink.trim()
    if (!candidate) return

    clearError()
    setData((prev) => ({
      ...prev,
      referenceLinks: [...prev.referenceLinks, candidate],
    }))
    setNewReferenceLink('')
  }

  const removeReferenceLink = (index: number) => {
    clearError()
    setData((prev) => ({
      ...prev,
      referenceLinks: prev.referenceLinks.filter((_, i) => i !== index),
    }))
  }

  const handleUploadFiles = async (files: File[]) => {
    clearError()

    try {
      await uploadFiles(files)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось загрузить файлы',
      )
    }
  }

  const handleRemoveUploadedItem = async (localId: string) => {
    clearError()

    try {
      await removeItem(localId)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось удалить файл',
      )
    }
  }

  const handlePrev = () => {
    setSubmitError(null)

    if (currentStep === 1) {
      onBack()
      return
    }

    setCurrentStep((prev) => prev - 1)
  }

  const handleNext = async () => {
    const stepError = validateWizardStep(currentStep, data)

    if (stepError) {
      setSubmitError(stepError)
      return
    }

    if (hasUploading) {
      setSubmitError('Дождитесь завершения загрузки файлов')
      return
    }

    if (hasFailedUploads) {
      setSubmitError('Удалите файлы с ошибкой загрузки или попробуйте загрузить их заново')
      return
    }

    setSubmitError(null)

    if (currentStep !== totalSteps) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    const parsed = proposalWizardSchema.safeParse({
      mode: 'wizard',
      locale,
      projectType: data.projectType ?? '',
      projectGoal: data.projectGoal ?? '',
      teamType: data.teamType ?? '',
      companyName: data.teamField1 ?? '',
      website: data.teamField2 ?? '',
      teamSize: data.teamField3 ?? '',
      rolesCount: data.rolesCount ?? '',
      screenCount: data.screenCount ?? '',
      complexityFlags: data.complexityFlags,
      materials: data.materials,
      referenceLinks: data.referenceLinks,
      uploadedAssets: uploadedAssetRefs,
      timeline: data.timeline ?? '',
      budget: data.budget ?? '',
      briefNotes: '',
      name: data.name ?? '',
      email: data.email ?? '',
      company: data.company ?? '',
      role: data.role ?? '',
      region: data.region ?? '',
      phone: data.phone ?? '',
      comment: data.comment ?? '',
      noCallFirst: Boolean(data.noCallFirst),
      expertReview: Boolean(data.expertReview),
      nda: Boolean(data.nda),
    })

    if (!parsed.success) {
      setSubmitError(getFirstZodError(parsed.error))
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      const formData = new FormData()

      appendString(formData, 'mode', 'wizard')
      appendString(formData, 'locale', locale)

      appendString(formData, 'projectType', parsed.data.projectType)
      appendString(formData, 'projectGoal', parsed.data.projectGoal)
      appendString(formData, 'teamType', parsed.data.teamType)

      appendString(formData, 'companyName', parsed.data.companyName)
      appendString(formData, 'website', parsed.data.website)
      appendString(formData, 'teamSize', parsed.data.teamSize)

      appendString(formData, 'rolesCount', parsed.data.rolesCount)
      appendString(formData, 'screenCount', parsed.data.screenCount)
      appendJson(formData, 'complexityFlags', parsed.data.complexityFlags)

      appendJson(formData, 'materials', parsed.data.materials)
      appendJson(formData, 'referenceLinks', parsed.data.referenceLinks)
      appendJson(formData, 'uploadedAssets', parsed.data.uploadedAssets)

      appendString(formData, 'timeline', parsed.data.timeline)
      appendString(formData, 'budget', parsed.data.budget)

      appendString(formData, 'name', parsed.data.name)
      appendString(formData, 'email', parsed.data.email)
      appendString(formData, 'company', parsed.data.company)
      appendString(formData, 'role', parsed.data.role)
      appendString(formData, 'region', parsed.data.region)
      appendString(formData, 'phone', parsed.data.phone)
      appendString(formData, 'comment', parsed.data.comment)

      appendBoolean(formData, 'noCallFirst', parsed.data.noCallFirst)
      appendBoolean(formData, 'expertReview', parsed.data.expertReview)
      appendBoolean(formData, 'nda', parsed.data.nda)

      const response = await fetch('/api/proposal-request', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result?.ok) {
        setSubmitError(result?.error || 'Не удалось отправить заявку')
        return
      }

      onSuccess()
    } catch (error) {
      console.error(error)
      setSubmitError('Не удалось отправить заявку')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:gap-12">
          <div className="rounded-sm border border-border bg-card">
            <WizardStepHeader
              currentStep={currentStep}
              totalSteps={totalSteps}
              wizardCopy={block.wizardCopy}
              rtl={rtl}
            />

            <div className="p-8">
              {currentStep === 1 ? (
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                    {getCopyValue(block.wizardCopy, 'projectTypeTitle')}
                  </h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    {getCopyValue(block.wizardCopy, 'projectTypeDescription')}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {block.projectTypes?.map((type) =>
                      type?.value && type?.label ? (
                        <ChoiceCard
                          key={type.value}
                          active={data.projectType === type.value}
                          title={type.label}
                          description={type.description}
                          rtl={rtl}
                          onClick={() => {
                            clearError()
                            setData((prev) => ({
                              ...prev,
                              projectType: type.value!,
                            }))
                          }}
                        />
                      ) : null,
                    )}
                  </div>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                    {getCopyValue(block.wizardCopy, 'goalTitle')}
                  </h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    {getCopyValue(block.wizardCopy, 'goalDescription')}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {block.projectGoals?.map((goal) =>
                      goal?.value && goal?.label ? (
                        <ChoiceCard
                          key={goal.value}
                          active={data.projectGoal === goal.value}
                          title={goal.label}
                          rtl={rtl}
                          onClick={() => {
                            clearError()
                            setData((prev) => ({
                              ...prev,
                              projectGoal: goal.value!,
                            }))
                          }}
                        />
                      ) : null,
                    )}
                  </div>
                </div>
              ) : null}

              {currentStep === 3 ? (
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                    {getCopyValue(block.wizardCopy, 'teamTitle')}
                  </h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    {getCopyValue(block.wizardCopy, 'teamDescription')}
                  </p>

                  <div className="mb-8 grid gap-3 sm:grid-cols-2">
                    {block.teamTypes?.map((team) =>
                      team?.value && team?.label ? (
                        <ChoiceCard
                          key={team.value}
                          active={data.teamType === team.value}
                          title={team.label}
                          rtl={rtl}
                          onClick={() => {
                            clearError()
                            setData((prev) => ({
                              ...prev,
                              teamType: team.value!,
                            }))
                          }}
                        />
                      ) : null,
                    )}
                  </div>

                  <div className="grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                        {getCopyValue(block.wizardCopy, 'teamField1Label')}
                      </label>
                      <Input
                        value={data.teamField1 ?? ''}
                        onChange={(e) => {
                          clearError()
                          setData((prev) => ({ ...prev, teamField1: e.target.value }))
                        }}
                        placeholder={getCopyValue(block.wizardCopy, 'teamField1Placeholder')}
                        className={cn('h-10', rtl && 'text-right')}
                        dir={rtl ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                        {getCopyValue(block.wizardCopy, 'teamField2Label')}
                      </label>
                      <Input
                        value={data.teamField2 ?? ''}
                        onChange={(e) => {
                          clearError()
                          setData((prev) => ({ ...prev, teamField2: e.target.value }))
                        }}
                        placeholder={getCopyValue(block.wizardCopy, 'teamField2Placeholder')}
                        className="h-10"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                        {getCopyValue(block.wizardCopy, 'teamField3Label')}
                      </label>
                      <Input
                        value={data.teamField3 ?? ''}
                        onChange={(e) => {
                          clearError()
                          setData((prev) => ({ ...prev, teamField3: e.target.value }))
                        }}
                        placeholder={getCopyValue(block.wizardCopy, 'teamField3Placeholder')}
                        className={cn('h-10', rtl && 'text-right')}
                        dir={rtl ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 4 ? (
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                    {getCopyValue(block.wizardCopy, 'complexityTitle')}
                  </h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    {getCopyValue(block.wizardCopy, 'complexityDescription')}
                  </p>

                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                          {getCopyValue(block.wizardCopy, 'rolesCountLabel')}
                        </label>
                        <Input
                          value={data.rolesCount ?? ''}
                          onChange={(e) => {
                            clearError()
                            setData((prev) => ({ ...prev, rolesCount: e.target.value }))
                          }}
                          placeholder={getCopyValue(block.wizardCopy, 'rolesCountPlaceholder')}
                          className={cn('h-10', rtl && 'text-right')}
                          dir={rtl ? 'rtl' : 'ltr'}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                          {getCopyValue(block.wizardCopy, 'screenCountLabel')}
                        </label>
                        <Input
                          value={data.screenCount ?? ''}
                          onChange={(e) => {
                            clearError()
                            setData((prev) => ({ ...prev, screenCount: e.target.value }))
                          }}
                          placeholder={getCopyValue(block.wizardCopy, 'screenCountPlaceholder')}
                          className={cn('h-10', rtl && 'text-right')}
                          dir={rtl ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                      {block.complexityFlags?.map((flag) =>
                        flag?.value ? (
                          <label
                            key={flag.value}
                            className={cn(
                              'flex cursor-pointer items-center gap-3 rounded-sm border border-border p-3 transition-colors hover:border-foreground/30',
                              rtl && 'flex-row-reverse',
                            )}
                          >
                            <Checkbox
                              checked={data.complexityFlags.includes(flag.value)}
                              onCheckedChange={() => {
                                clearError()
                                toggleArrayValue('complexityFlags', flag.value!)
                              }}
                            />
                            <span className="text-sm text-foreground">{flag.value}</span>
                          </label>
                        ) : null,
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 5 ? (
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                    {getCopyValue(block.wizardCopy, 'materialsTitle')}
                  </h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    {getCopyValue(block.wizardCopy, 'materialsDescription')}
                  </p>

                  <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {block.materialsOptions?.map((material) =>
                      material?.value && material?.label ? (
                        <button
                          key={material.value}
                          type="button"
                          onClick={() => {
                            clearError()
                            toggleArrayValue('materials', material.value!)
                          }}
                          className={cn(
                            'rounded-sm border p-4 transition-all',
                            data.materials.includes(material.value)
                              ? 'border-foreground bg-foreground/5'
                              : 'border-border hover:border-foreground/30',
                            rtl ? 'text-right' : 'text-left',
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center gap-2',
                              rtl ? 'justify-end flex-row-reverse' : '',
                            )}
                          >
                            {data.materials.includes(material.value) ? (
                              <Check className="h-4 w-4 text-foreground" />
                            ) : null}
                            <span className="text-sm font-medium text-foreground">
                              {material.label}
                            </span>
                          </div>
                        </button>
                      ) : null,
                    )}
                  </div>

                  <DirectUploadSection
                    rtl={rtl}
                    label={getCopyValue(
                      block.wizardCopy,
                      'wizardUploadLabel',
                      'Дополнительные файлы',
                    )}
                    title={getCopyValue(
                      block.wizardCopy,
                      'wizardUploadLabel',
                      'Дополнительные файлы',
                    )}
                    hint={getCopyValue(block.wizardCopy, 'wizardUploadHint')}
                    items={uploadedItems}
                    uploadingCount={uploadingCount}
                    onFilesSelected={handleUploadFiles}
                    onRemove={handleRemoveUploadedItem}
                  />

                  {referencesEnabled ? (
                    <div className="mt-8 border-t border-border pt-6">
                      <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                        {getCopyValue(
                          block.wizardCopy,
                          'referenceLinksLabel',
                          'Укажите ссылки на референсы',
                        )}
                      </label>

                      <div className={cn('flex gap-3', rtl && 'flex-row-reverse')}>
                        <Input
                          value={newReferenceLink}
                          onChange={(e) => {
                            clearError()
                            setNewReferenceLink(e.target.value)
                          }}
                          placeholder={getCopyValue(
                            block.wizardCopy,
                            'referenceLinksPlaceholder',
                            'что Вам нравится в качестве примера',
                          )}
                          className={cn('h-10 flex-1', rtl && 'text-right')}
                          dir={rtl ? 'rtl' : 'ltr'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addReferenceLink()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addReferenceLink}
                          variant="outline"
                          className="h-10 px-4"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      {data.referenceLinks.length ? (
                        <div className="mt-4 space-y-2">
                          {data.referenceLinks.map((reference, index) => (
                            <div
                              key={`${reference}-${index}`}
                              className={cn(
                                'flex items-center justify-between rounded-sm bg-secondary/30 p-3',
                                rtl && 'flex-row-reverse',
                              )}
                            >
                              <div className={cn('flex items-center gap-3', rtl && 'flex-row-reverse')}>
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="max-w-[420px] truncate text-sm text-foreground">
                                  {reference}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeReferenceLink(index)}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {currentStep === 6 ? (
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                    {getCopyValue(block.wizardCopy, 'timelineTitle')}
                  </h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    {getCopyValue(block.wizardCopy, 'timelineDescription')}
                  </p>

                  <div className="space-y-8">
                    <div>
                      <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                        {getCopyValue(block.wizardCopy, 'timelineLabel')}
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {block.timelineOptions?.map((option) =>
                          option?.value && option?.label ? (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                clearError()
                                setData((prev) => ({ ...prev, timeline: option.value! }))
                              }}
                              className={cn(
                                'rounded-sm border px-4 py-2 text-sm transition-all',
                                data.timeline === option.value
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border text-foreground hover:border-foreground/30',
                              )}
                            >
                              {option.label}
                            </button>
                          ) : null,
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                        {getCopyValue(block.wizardCopy, 'budgetLabel')}
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {block.budgetOptions?.map((option) =>
                          option?.value && option?.label ? (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                clearError()
                                setData((prev) => ({ ...prev, budget: option.value! }))
                              }}
                              className={cn(
                                'rounded-sm border px-4 py-2 text-sm transition-all',
                                data.budget === option.value
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border text-foreground hover:border-foreground/30',
                              )}
                            >
                              {option.label}
                            </button>
                          ) : null,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 7 ? (
                <div>
                  <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                    {getCopyValue(block.wizardCopy, 'contactTitle')}
                  </h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    {getCopyValue(block.wizardCopy, 'contactDescription')}
                  </p>

                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                          {getCopyValue(block.wizardCopy, 'nameLabel')}
                        </label>
                        <Input
                          value={data.name ?? ''}
                          onChange={(e) => {
                            clearError()
                            setData((prev) => ({ ...prev, name: e.target.value }))
                          }}
                          placeholder={getCopyValue(block.wizardCopy, 'namePlaceholder')}
                          className={cn('h-10', rtl && 'text-right')}
                          dir={rtl ? 'rtl' : 'ltr'}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                          {getCopyValue(block.wizardCopy, 'emailLabel')}
                        </label>
                        <Input
                          type="email"
                          value={data.email ?? ''}
                          onChange={(e) => {
                            clearError()
                            setData((prev) => ({ ...prev, email: e.target.value }))
                          }}
                          placeholder={getCopyValue(block.wizardCopy, 'emailPlaceholder')}
                          className="h-10"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {getCopyValue(block.wizardCopy, 'companyLabel') ? (
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                            {getCopyValue(block.wizardCopy, 'companyLabel')}
                          </label>
                          <Input
                            value={data.company ?? ''}
                            onChange={(e) => {
                              clearError()
                              setData((prev) => ({ ...prev, company: e.target.value }))
                            }}
                            placeholder={getCopyValue(block.wizardCopy, 'companyPlaceholder')}
                            className={cn('h-10', rtl && 'text-right')}
                            dir={rtl ? 'rtl' : 'ltr'}
                          />
                        </div>
                      ) : null}

                      {getCopyValue(block.wizardCopy, 'roleLabel') ? (
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                            {getCopyValue(block.wizardCopy, 'roleLabel')}
                          </label>
                          <Input
                            value={data.role ?? ''}
                            onChange={(e) => {
                              clearError()
                              setData((prev) => ({ ...prev, role: e.target.value }))
                            }}
                            placeholder={getCopyValue(block.wizardCopy, 'rolePlaceholder')}
                            className={cn('h-10', rtl && 'text-right')}
                            dir={rtl ? 'rtl' : 'ltr'}
                          />
                        </div>
                      ) : null}

                      {getCopyValue(block.wizardCopy, 'regionLabel') ? (
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                            {getCopyValue(block.wizardCopy, 'regionLabel')}
                          </label>
                          <Input
                            value={data.region ?? ''}
                            onChange={(e) => {
                              clearError()
                              setData((prev) => ({ ...prev, region: e.target.value }))
                            }}
                            placeholder={getCopyValue(block.wizardCopy, 'regionPlaceholder')}
                            className={cn('h-10', rtl && 'text-right')}
                            dir={rtl ? 'rtl' : 'ltr'}
                          />
                        </div>
                      ) : null}

                      {!getCopyValue(block.wizardCopy, 'regionLabel') &&
                      getCopyValue(block.wizardCopy, 'phoneLabelInline') ? (
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                            {getCopyValue(block.wizardCopy, 'phoneLabelInline')}
                          </label>
                          <Input
                            value={data.phone ?? ''}
                            onChange={(e) => {
                              clearError()
                              setData((prev) => ({ ...prev, phone: e.target.value }))
                            }}
                            placeholder={getCopyValue(block.wizardCopy, 'phonePlaceholder')}
                            className="h-10"
                            dir="ltr"
                          />
                        </div>
                      ) : null}
                    </div>

                    {getCopyValue(block.wizardCopy, 'phoneLabel') ? (
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                          {getCopyValue(block.wizardCopy, 'phoneLabel')}
                        </label>
                        <Input
                          value={data.phone ?? ''}
                          onChange={(e) => {
                            clearError()
                            setData((prev) => ({ ...prev, phone: e.target.value }))
                          }}
                          placeholder={getCopyValue(block.wizardCopy, 'phonePlaceholder')}
                          className="h-10"
                          dir="ltr"
                        />
                      </div>
                    ) : null}

                    {getCopyValue(block.wizardCopy, 'commentLabel') ? (
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                          {getCopyValue(block.wizardCopy, 'commentLabel')}
                        </label>
                        <Textarea
                          value={data.comment ?? ''}
                          onChange={(e) => {
                            clearError()
                            setData((prev) => ({ ...prev, comment: e.target.value }))
                          }}
                          placeholder={getCopyValue(block.wizardCopy, 'commentPlaceholder')}
                          rows={3}
                          className={rtl ? 'text-right' : undefined}
                          dir={rtl ? 'rtl' : 'ltr'}
                        />
                      </div>
                    ) : null}

                    {showNoCall || showExpert || showNda ? (
                      <div className="space-y-3 border-t border-border pt-4">
                        {showNoCall ? (
                          <label
                            className={cn(
                              'flex cursor-pointer items-start gap-3',
                              rtl && 'flex-row-reverse',
                            )}
                          >
                            <Checkbox
                              checked={Boolean(data.noCallFirst)}
                              onCheckedChange={(checked) => {
                                clearError()
                                setData((prev) => ({
                                  ...prev,
                                  noCallFirst: Boolean(checked),
                                }))
                              }}
                              className="mt-0.5"
                            />
                            <span className="text-sm text-foreground">
                              {getCopyValue(block.wizardCopy, 'noCallLabel')}
                            </span>
                          </label>
                        ) : null}

                        {showExpert ? (
                          <label
                            className={cn(
                              'flex cursor-pointer items-start gap-3',
                              rtl && 'flex-row-reverse',
                            )}
                          >
                            <Checkbox
                              checked={Boolean(data.expertReview)}
                              onCheckedChange={(checked) => {
                                clearError()
                                setData((prev) => ({
                                  ...prev,
                                  expertReview: Boolean(checked),
                                }))
                              }}
                              className="mt-0.5"
                            />
                            <span className="text-sm text-foreground">
                              {getCopyValue(block.wizardCopy, 'expertReviewLabel')}
                            </span>
                          </label>
                        ) : null}

                        {showNda ? (
                          <label
                            className={cn(
                              'flex cursor-pointer items-start gap-3',
                              rtl && 'flex-row-reverse',
                            )}
                          >
                            <Checkbox
                              checked={Boolean(data.nda)}
                              onCheckedChange={(checked) => {
                                clearError()
                                setData((prev) => ({
                                  ...prev,
                                  nda: Boolean(checked),
                                }))
                              }}
                              className="mt-0.5"
                            />

                            <div>
                              <span className="text-sm text-foreground">
                                {getCopyValue(block.wizardCopy, 'ndaLabel')}
                              </span>
                              {getCopyValue(block.wizardCopy, 'ndaDescription') ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {getCopyValue(block.wizardCopy, 'ndaDescription')}
                                </p>
                              ) : null}
                            </div>
                          </label>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {submitError ? (
                <div className="mt-6 rounded-sm border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </div>
              ) : null}

              <div
                className={cn(
                  'mt-10 flex items-center justify-between border-t border-border pt-6',
                  rtl && 'flex-row-reverse',
                )}
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={submitting}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {getCopyValue(
                    block.wizardCopy,
                    currentStep === 1 ? 'cancelLabel' : 'backLabel',
                    currentStep === 1 ? 'Отмена' : 'Назад',
                  )}
                </button>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                  className="h-10 bg-foreground px-6 text-[11px] uppercase tracking-[0.12em] text-background hover:bg-foreground/90 disabled:opacity-50"
                >
                  {submitting
                    ? '...'
                    : getCopyValue(
                        block.wizardCopy,
                        currentStep === totalSteps ? 'submitLabel' : 'nextLabel',
                        currentStep === totalSteps ? 'Отправить' : 'Продолжить',
                      )}
                  {rtl ? (
                    <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  ) : (
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <WizardSidebar
            block={block}
            locale={locale}
            currentStep={currentStep}
            data={data}
          />
        </div>
      </div>
    </section>
  )
}

function UploadMaterialsView({
  block,
  locale,
  onBack,
  onSuccess,
}: {
  block: ProposalFlowProposalBlockData
  locale: Locale
  onBack: () => void
  onSuccess: () => void
}) {
  const rtl = isRTL(locale)
  const [links, setLinks] = useState<string[]>([])
  const [newLink, setNewLink] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    items: uploadedItems,
    uploadFiles,
    removeItem,
    uploadedAssetRefs,
    uploadingCount,
    hasUploading,
    hasFailedUploads,
  } = useProposalDirectUploads()

  const clearError = () => setSubmitError(null)

  const addLink = () => {
    const candidate = newLink.trim()
    if (!candidate) return
    clearError()
    setLinks((prev) => [...prev, candidate])
    setNewLink('')
  }

  const removeLink = (index: number) => {
    clearError()
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadFiles = async (files: File[]) => {
    clearError()

    try {
      await uploadFiles(files)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось загрузить файлы',
      )
    }
  }

  const handleRemoveUploadedItem = async (localId: string) => {
    clearError()

    try {
      await removeItem(localId)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось удалить файл',
      )
    }
  }

  const handleSubmit = async () => {
    if (hasUploading) {
      setSubmitError('Дождитесь завершения загрузки файлов')
      return
    }

    if (hasFailedUploads) {
      setSubmitError('Удалите файлы с ошибкой загрузки или попробуйте загрузить их заново')
      return
    }

    const parsed = proposalUploadSchema.safeParse({
      mode: 'upload',
      locale,
      name,
      email,
      description,
      links,
      uploadedAssets: uploadedAssetRefs,
    })

    if (!parsed.success) {
      setSubmitError(getFirstZodError(parsed.error))
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      const formData = new FormData()

      appendString(formData, 'mode', 'upload')
      appendString(formData, 'locale', locale)
      appendString(formData, 'name', parsed.data.name)
      appendString(formData, 'email', parsed.data.email)
      appendString(formData, 'description', parsed.data.description)
      appendJson(formData, 'links', parsed.data.links)
      appendJson(formData, 'uploadedAssets', parsed.data.uploadedAssets)

      const response = await fetch('/api/proposal-request', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result?.ok) {
        setSubmitError(result?.error || 'Не удалось отправить материалы')
        return
      }

      onSuccess()
    } catch (error) {
      console.error(error)
      setSubmitError('Не удалось отправить материалы')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="rounded-sm border border-border bg-card">
          <div className="border-b border-border px-8 py-6">
            <button
              type="button"
              onClick={onBack}
              className={cn(
                'mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
                rtl && 'flex-row-reverse',
              )}
            >
              {rtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              {getCopyValue(block.uploadCopy, 'backLabel', 'Назад')}
            </button>

            <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
              {getCopyValue(block.uploadCopy, 'title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {getCopyValue(block.uploadCopy, 'description')}
            </p>
          </div>

          <div className="space-y-8 p-8">
            <DirectUploadSection
              rtl={rtl}
              label={getCopyValue(block.uploadCopy, 'filesLabel')}
              title={getCopyValue(block.uploadCopy, 'filesTitle')}
              hint={getCopyValue(block.uploadCopy, 'filesHint')}
              items={uploadedItems}
              uploadingCount={uploadingCount}
              onFilesSelected={handleUploadFiles}
              onRemove={handleRemoveUploadedItem}
            />

            <div>
              <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                {getCopyValue(block.uploadCopy, 'linksLabel')}
              </label>

              <div className={cn('flex gap-3', rtl && 'flex-row-reverse')}>
                <Input
                  value={newLink}
                  onChange={(e) => {
                    clearError()
                    setNewLink(e.target.value)
                  }}
                  placeholder={getCopyValue(block.uploadCopy, 'linksPlaceholder')}
                  className="h-10 flex-1"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && addLink()}
                />
                <Button type="button" onClick={addLink} variant="outline" className="h-10 px-4">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>

              {links.length ? (
                <div className="mt-4 space-y-2">
                  {links.map((link, index) => (
                    <div
                      key={`${link}-${index}`}
                      className={cn(
                        'flex items-center justify-between rounded-sm bg-secondary/30 p-3',
                        rtl && 'flex-row-reverse',
                      )}
                    >
                      <div className={cn('flex items-center gap-3', rtl && 'flex-row-reverse')}>
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <span
                          className="max-w-[420px] truncate text-sm text-foreground"
                          dir="ltr"
                        >
                          {link}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                {getCopyValue(block.uploadCopy, 'descriptionLabel')}
              </label>
              <Textarea
                value={description}
                onChange={(e) => {
                  clearError()
                  setDescription(e.target.value)
                }}
                placeholder={getCopyValue(block.uploadCopy, 'descriptionPlaceholder')}
                rows={5}
                dir={rtl ? 'rtl' : 'ltr'}
                className={rtl ? 'text-right' : undefined}
              />
            </div>

            <div className="border-t border-border pt-6">
              <label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                {getCopyValue(block.uploadCopy, 'contactLabel')}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={name}
                  onChange={(e) => {
                    clearError()
                    setName(e.target.value)
                  }}
                  placeholder={getCopyValue(block.uploadCopy, 'namePlaceholder')}
                  className={cn('h-10', rtl && 'text-right')}
                  dir={rtl ? 'rtl' : 'ltr'}
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    clearError()
                    setEmail(e.target.value)
                  }}
                  placeholder={getCopyValue(block.uploadCopy, 'emailPlaceholder')}
                  className="h-10"
                  dir="ltr"
                />
              </div>
            </div>

            {submitError ? (
              <div className="rounded-sm border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}

            <div
              className={cn(
                'flex items-center justify-between border-t border-border pt-6',
                rtl && 'flex-row-reverse',
              )}
            >
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                {getCopyValue(block.uploadCopy, 'cancelLabel', 'Отмена')}
              </button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="h-10 bg-foreground px-6 text-[11px] uppercase tracking-[0.12em] text-background hover:bg-foreground/90 disabled:opacity-50"
              >
                {submitting ? '...' : getCopyValue(block.uploadCopy, 'submitLabel', 'Отправить')}
                {rtl ? (
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SuccessView({
  block,
  locale,
  onUploadMore,
}: {
  block: ProposalFlowProposalBlockData
  locale: Locale
  onUploadMore: () => void
}) {
  const rtl = isRTL(locale)

  return (
    <section className="pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/15">
            <Check className="h-10 w-10 text-accent" />
          </div>
        </div>

        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
            {getCopyValue(block.successCopy, 'title')}
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            {getCopyValue(block.successCopy, 'description')}
          </p>
        </div>

        <div className="mb-12 rounded-sm border border-border bg-card p-8">
          <h3 className="mb-6 text-center text-xs uppercase tracking-wider text-muted-foreground">
            {getCopyValue(block.successCopy, 'stepsTitle')}
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            {block.successSteps?.map((step) =>
              step?.number && step?.title && step?.description ? (
                <div
                  key={step.number}
                  className={cn('flex gap-4', rtl && 'flex-row-reverse text-right')}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <span className="text-xs font-medium text-foreground">{step.number}</span>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-medium text-foreground">
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4 sm:flex-row',
            rtl && 'sm:flex-row-reverse',
          )}
        >
          <Button
            asChild
            className="h-11 bg-foreground px-6 text-[11px] uppercase tracking-[0.12em] text-background hover:bg-foreground/90"
          >
            <Link href={getHrefForPageKey(block.successHomePageKey ?? 'home', locale)}>
              {rtl ? <Home className="ml-2 h-4 w-4" /> : <Home className="mr-2 h-4 w-4" />}
              {getCopyValue(block.successCopy, 'homeLabel')}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 border-foreground/20 px-6 text-[11px] uppercase tracking-[0.12em] text-foreground hover:bg-foreground/5"
          >
            <Link href={getHrefForPageKey(block.successPricingPageKey ?? 'pricing', locale)}>
              {rtl ? (
                <Layers className="ml-2 h-4 w-4" />
              ) : (
                <Layers className="mr-2 h-4 w-4" />
              )}
              {getCopyValue(block.successCopy, 'pricingLabel')}
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="h-11 px-6 text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
            onClick={onUploadMore}
          >
            {rtl ? (
              <Upload className="ml-2 h-4 w-4" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {getCopyValue(block.successCopy, 'uploadMoreLabel')}
          </Button>
        </div>

        {block.supportPoints?.length ? (
          <div className="mt-12 border-t border-border/50 pt-8">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {block.supportPoints.map((point, index) =>
                point?.label ? (
                  <span key={`${point.label}-${index}`} className="text-sm text-muted-foreground">
                    {point.label}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {getCopyValue(block.successCopy, 'supportNotePrefix')}{' '}
            <a
              href={`mailto:${getCopyValue(block.successCopy, 'supportEmail')}`}
              className="text-foreground hover:underline"
              dir="ltr"
            >
              {getCopyValue(block.successCopy, 'supportEmail')}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export function ProposalFlowProposalBlockComponent({ block, locale }: Props) {
  const rtl = isRTL(locale)
  const [activeView, setActiveView] = useState<ViewState>('intro')

  return (
    <section dir={rtl ? 'rtl' : 'ltr'}>
      {activeView === 'success' ? (
        <SuccessView
          block={block}
          locale={locale}
          onUploadMore={() => setActiveView('upload')}
        />
      ) : (
        <>
          {activeView === 'intro' ? (
            <IntroView
              block={block}
              locale={locale}
              onStartWizard={() => setActiveView('wizard')}
              onStartUpload={() => setActiveView('upload')}
            />
          ) : null}

          {activeView === 'wizard' ? (
            <ProposalWizard
              block={block}
              locale={locale}
              onBack={() => setActiveView('intro')}
              onSuccess={() => setActiveView('success')}
            />
          ) : null}

          {activeView === 'upload' ? (
            <UploadMaterialsView
              block={block}
              locale={locale}
              onBack={() => setActiveView('intro')}
              onSuccess={() => setActiveView('success')}
            />
          ) : null}
        </>
      )}
    </section>
  )
}