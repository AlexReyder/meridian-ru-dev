import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getHrefForPageKey, type Locale, type PageKey } from '@/lib/routes'

type LinkType = 'page' | 'url'

type HeroDemoBlockData = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  supportingText?: string | null

  primaryButtonLabel?: string | null
  primaryLinkType?: LinkType | null
  primaryPageKey?: PageKey | null
  primaryUrl?: string | null

  secondaryButtonLabel?: string | null
  secondaryLinkType?: LinkType | null
  secondaryPageKey?: PageKey | null
  secondaryUrl?: string | null
}

type Props = {
  block: HeroDemoBlockData
  locale: Locale
}

function resolveHref(
  linkType: LinkType | null | undefined,
  pageKey: PageKey | null | undefined,
  url: string | null | undefined,
  locale: Locale,
) {
  if (linkType === 'url') {
    const normalized = url?.trim()
    return normalized || null
  }

  return getHrefForPageKey(pageKey ?? 'get-proposal', locale)
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href)
}

function renderButton(
  href: string | null,
  label: string | null | undefined,
  className: string,
  withArrow = false,
) {
  if (!href || !label) return null

  const content = (
    <>
      {label}
      {withArrow ? <ArrowRight className="h-4 w-4" /> : null}
    </>
  )

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

export function HeroDemoBlockComponent({ block, locale }: Props) {
  const primaryHref = resolveHref(
    block.primaryLinkType,
    block.primaryPageKey,
    block.primaryUrl,
    locale,
  )

  const secondaryHref = resolveHref(
    block.secondaryLinkType,
    block.secondaryPageKey,
    block.secondaryUrl,
    locale,
  )

  return (
    <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex gap-1">
              <div className="h-4 w-1 rounded-full bg-signature-cobalt" />
              <div className="mt-1 h-3 w-1 rounded-full bg-signature-brass" />
            </div>

            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {block.eyebrow}
            </span>
          </div>

          <h1 className="mb-6 font-serif text-4xl font-medium leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {block.title}
          </h1>

          <p className="mb-6 max-w-3xl text-xl leading-relaxed text-foreground/80 md:text-2xl">
            {block.description}
          </p>

          <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {block.supportingText}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            {renderButton(
              primaryHref,
              block.primaryButtonLabel,
              'inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90',
              true,
            )}

            {renderButton(
              secondaryHref,
              block.secondaryButtonLabel,
              'inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50',
            )}
          </div>
        </div>
      </div>
    </section>
  )
}