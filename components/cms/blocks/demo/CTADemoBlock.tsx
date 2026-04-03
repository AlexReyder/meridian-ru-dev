import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getHrefForPageKey, type Locale, type PageKey } from '@/lib/routes'

type LinkType = 'page' | 'url'

type CTADemoBlockData = {
  title?: string | null
  description?: string | null

  primaryButtonLabel?: string | null
  primaryLinkType?: LinkType | null
  primaryPageKey?: PageKey | null
  primaryUrl?: string | null

  secondaryButtonLabel?: string | null
  secondaryLinkType?: LinkType | null
  secondaryPageKey?: PageKey | null
  secondaryUrl?: string | null

  supportText?: string | null
}

type Props = {
  block: CTADemoBlockData
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

export function CTADemoBlockComponent({ block, locale }: Props) {
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
    <section className="bg-foreground py-20 text-background lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center gap-1.5">
            <div className="h-5 w-1 rounded-full bg-signature-cobalt-soft" />
            <div className="mt-1 h-4 w-1 rounded-full bg-signature-brass-soft" />
          </div>

          <h2 className="mb-6 font-serif text-3xl font-medium leading-tight tracking-tight text-background md:text-4xl lg:text-5xl">
            {block.title}
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-background/70">
            {block.description}
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            {renderButton(
              primaryHref,
              block.primaryButtonLabel,
              'inline-flex items-center justify-center gap-2 rounded-md bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background/90',
              true,
            )}

            {renderButton(
              secondaryHref,
              block.secondaryButtonLabel,
              'inline-flex items-center justify-center gap-2 rounded-md border border-background/30 px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background/10',
            )}
          </div>

          <p className="mx-auto max-w-xl text-sm text-background/50">
            {block.supportText}
          </p>
        </div>
      </div>
    </section>
  )
}