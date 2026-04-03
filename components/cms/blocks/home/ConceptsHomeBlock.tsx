'use client'

import Link from 'next/link'
import { ArrowUpLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getHrefForPageKey, isRTL, type Locale, type PageKey } from '@/lib/routes'
import { cn } from '@/lib/utils'

type ConceptItem = {
  title?: string | null
  badge?: string | null
  challenge?: string | null
  structured?: string | null
  delivered?: string | null
  imageSource?: 'url' | 'upload' | null
  imageUrl?: string | null
  imageMedia?: any
  imageAlt?: string | null
}

type ConceptsHomeBlockData = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  challengeLabel?: string | null
  structuredLabel?: string | null
  deliveredLabel?: string | null
  viewConceptsLabel?: string | null
  conceptsPageKey?: PageKey | null
  previousAriaLabel?: string | null
  nextAriaLabel?: string | null
  items?: ConceptItem[] | null
}

type Props = {
  block: ConceptsHomeBlockData
  locale: Locale
}

function resolveConceptImage(concept: ConceptItem) {
  const media = concept.imageMedia

  const resolvedImageUrl =
    concept.imageSource === 'upload'
      ? typeof media === 'object'
        ? media?.url
        : concept.imageUrl
      : concept.imageUrl

  const resolvedImageAlt =
    concept.imageSource === 'upload'
      ? typeof media === 'object'
        ? concept.imageAlt || media?.alt || concept.title
        : concept.imageAlt || concept.title
      : concept.imageAlt || concept.title

  return {
    finalUrl: resolvedImageUrl ?? '',
    finalAlt: resolvedImageAlt ?? concept.title ?? '',
  }
}

function ConceptCard({
  concept,
  locale,
  challengeLabel,
  structuredLabel,
  deliveredLabel,
  viewConceptsLabel,
  conceptsHref,
}: {
  concept: ConceptItem
  locale: Locale
  challengeLabel: string
  structuredLabel: string
  deliveredLabel: string
  viewConceptsLabel: string
  conceptsHref: string
}) {
  const rtl = isRTL(locale)
  const { finalUrl, finalAlt } = resolveConceptImage(concept)

  return (
    <div className="group relative flex h-[680px] w-[calc(100vw-48px)] max-w-[400px] flex-shrink-0 flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:border-foreground/20 sm:w-[380px] lg:h-[720px] lg:w-[400px]">
      <div className={cn('absolute top-0 z-10', rtl ? 'right-0' : 'left-0')}>
        <div
          className={cn(
            'absolute top-0 h-[2px] w-4 bg-signature-cobalt',
            rtl ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full',
          )}
        />
        <div
          className={cn(
            'absolute top-0 h-4 w-[2px] rounded-b-full bg-signature-cobalt',
            rtl ? 'right-0' : 'left-0',
          )}
        />
        <div
          className={cn(
            'absolute top-[2px] h-[1.5px] w-2 rounded-full bg-signature-brass/70',
            rtl ? 'right-4' : 'left-4',
          )}
        />
      </div>

      <div className="relative h-[200px] flex-shrink-0 overflow-hidden bg-[#1a1816] sm:h-[220px] lg:h-[240px]">
        <img
          src={finalUrl}
          alt={finalAlt}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1816]/20 to-transparent" />
      </div>

      <div className={cn('flex flex-grow flex-col p-6 lg:p-8', rtl && 'text-right')}>
        <span
          className={cn(
            'self-start rounded-sm border border-signature-cobalt/25 px-2 py-1 text-[10px] text-signature-cobalt',
            rtl ? 'tracking-[0.1em]' : 'uppercase tracking-[0.15em]',
          )}
        >
          {concept.badge}
        </span>

        <h3 className="mt-4 mb-5 min-h-[56px] font-serif text-xl font-light text-foreground lg:min-h-[64px] lg:text-2xl">
          {concept.title}
        </h3>

        <div className="flex-grow space-y-4">
          <div>
            <div
              className={cn(
                'mb-1.5 text-[10px] text-muted-foreground',
                rtl ? 'tracking-[0.1em]' : 'uppercase tracking-[0.15em]',
              )}
            >
              {challengeLabel}
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
              {concept.challenge}
            </p>
          </div>

          <div>
            <div
              className={cn(
                'mb-1.5 text-[10px] text-muted-foreground',
                rtl ? 'tracking-[0.1em]' : 'uppercase tracking-[0.15em]',
              )}
            >
              {structuredLabel}
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
              {concept.structured}
            </p>
          </div>

          <div>
            <div
              className={cn(
                'mb-1.5 text-[10px] text-muted-foreground',
                rtl ? 'tracking-[0.1em]' : 'uppercase tracking-[0.15em]',
              )}
            >
              {deliveredLabel}
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
              {concept.delivered}
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-border/60 pt-5">
          <Link
            href={conceptsHref}
            className={cn(
              'inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-signature-cobalt',
              rtl && 'flex-row-reverse',
            )}
          >
            {rtl ? (
              <>
                <ArrowUpLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                {viewConceptsLabel}
              </>
            ) : (
              <>
                {viewConceptsLabel}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ConceptsHomeBlockComponent({ block, locale }: Props) {
  const rtl = isRTL(locale)
  const items = useMemo(() => block.items ?? [], [block.items])

  const sliderRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentIndexRef = useRef(0)

  const [currentIndex, setCurrentIndex] = useState(0)

  const totalSlides = items.length
  const conceptsHref = getHrefForPageKey(block.conceptsPageKey ?? 'concepts', locale)

  const setIndex = useCallback((index: number) => {
    currentIndexRef.current = index
    setCurrentIndex(index)
  }, [])

  const getTargetScrollLeft = useCallback(
    (index: number) => {
      const slider = sliderRef.current
      if (!slider || !totalSlides) return null

      const normalized = ((index % totalSlides) + totalSlides) % totalSlides
      const targetNode = itemRefs.current[normalized]
      if (!targetNode) return null

      const sliderRect = slider.getBoundingClientRect()
      const targetRect = targetNode.getBoundingClientRect()
      const styles = window.getComputedStyle(slider)
      const paddingLeft = Number.parseFloat(styles.paddingLeft || '0')

      return slider.scrollLeft + (targetRect.left - sliderRect.left) - paddingLeft
    },
    [totalSlides],
  )

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const slider = sliderRef.current
      if (!slider || !totalSlides) return

      const normalized = ((index % totalSlides) + totalSlides) % totalSlides
      const nextLeft = getTargetScrollLeft(normalized)
      if (nextLeft === null) return

      slider.scrollTo({
        left: nextLeft,
        behavior,
      })

      setIndex(normalized)
    },
    [getTargetScrollLeft, setIndex, totalSlides],
  )

  const clearAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
      autoplayRef.current = null
    }
  }, [])

  const startAutoplay = useCallback(() => {
    clearAutoplay()

    if (totalSlides <= 1) return

    autoplayRef.current = setInterval(() => {
      const next = currentIndexRef.current + 1
      scrollToIndex(next)
    }, 3000)
  }, [clearAutoplay, scrollToIndex, totalSlides])

  const nextSlide = useCallback(() => {
    scrollToIndex(currentIndexRef.current + 1)
    startAutoplay()
  }, [scrollToIndex, startAutoplay])

  const prevSlide = useCallback(() => {
    scrollToIndex(currentIndexRef.current - 1)
    startAutoplay()
  }, [scrollToIndex, startAutoplay])

  useEffect(() => {
    startAutoplay()
    return () => clearAutoplay()
  }, [clearAutoplay, startAutoplay])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider || !totalSlides) return

    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const sliderRect = slider.getBoundingClientRect()
        const styles = window.getComputedStyle(slider)
        const paddingLeft = Number.parseFloat(styles.paddingLeft || '0')
        const targetLeft = sliderRect.left + paddingLeft

        let bestIndex = 0
        let bestDistance = Number.POSITIVE_INFINITY

        itemRefs.current.forEach((node, index) => {
          if (!node) return

          const rect = node.getBoundingClientRect()
          const distance = Math.abs(rect.left - targetLeft)

          if (distance < bestDistance) {
            bestDistance = distance
            bestIndex = index
          }
        })

        setIndex(bestIndex)
        ticking = false
      })
    }

    slider.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      slider.removeEventListener('scroll', onScroll)
    }
  }, [setIndex, totalSlides])

  if (!items.length) return null

  return (
    <section
      dir={rtl ? 'rtl' : 'ltr'}
      className="overflow-hidden bg-secondary/30 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className={cn(
            'mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between',
            rtl && 'lg:flex-row-reverse',
          )}
        >
          <div className={cn('max-w-3xl', rtl && 'text-right')}>
            <div className={cn('mb-4 flex items-center gap-3', rtl && 'flex-row-reverse')}>
              <div className={cn('flex items-center', rtl && 'flex-row-reverse')}>
                {rtl ? (
                  <>
                    <span className="h-[2px] w-2 rounded-full bg-signature-brass" />
                    <span className="mr-0.5 h-[2px] w-3 rounded-full bg-signature-cobalt" />
                  </>
                ) : (
                  <>
                    <span className="h-[2px] w-3 rounded-full bg-signature-cobalt" />
                    <span className="ml-0.5 h-[2px] w-2 rounded-full bg-signature-brass" />
                  </>
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] text-muted-foreground',
                  rtl ? 'tracking-[0.15em]' : 'uppercase tracking-[0.2em]',
                )}
              >
                {block.eyebrow}
              </span>
            </div>

            <h2 className="font-serif text-3xl font-light leading-tight text-foreground text-balance lg:text-4xl xl:text-5xl">
              {block.title}
            </h2>

            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              {block.description}
            </p>
          </div>

          <div className={cn('hidden items-center gap-3 lg:flex', rtl && 'flex-row-reverse')}>
            <button
              type="button"
              onClick={rtl ? nextSlide : prevSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-foreground/30 hover:text-foreground"
              aria-label={
                rtl
                  ? block.nextAriaLabel ?? 'Next concept'
                  : block.previousAriaLabel ?? 'Previous concept'
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={rtl ? prevSlide : nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-foreground/30 hover:text-foreground"
              aria-label={
                rtl
                  ? block.previousAriaLabel ?? 'Previous concept'
                  : block.nextAriaLabel ?? 'Next concept'
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={sliderRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 scroll-smooth lg:px-[calc((100vw-1280px)/2+32px)]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((concept, index) => (
            <div
              key={`${concept.title}-${index}`}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              className="snap-start flex-shrink-0"
            >
              <ConceptCard
                concept={concept}
                locale={locale}
                challengeLabel={block.challengeLabel ?? 'Challenge'}
                structuredLabel={block.structuredLabel ?? 'Structured'}
                deliveredLabel={block.deliveredLabel ?? 'Delivered'}
                viewConceptsLabel={block.viewConceptsLabel ?? 'View Concepts'}
                conceptsHref={conceptsHref}
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-secondary/30 to-transparent lg:block" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 hidden w-16 bg-gradient-to-l from-secondary/30 to-transparent lg:block" />
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-6 lg:px-8">
        <div className={cn('flex items-center justify-between', rtl && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-3 lg:hidden', rtl && 'flex-row-reverse')}>
            <button
              type="button"
              onClick={rtl ? nextSlide : prevSlide}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                rtl
                  ? block.nextAriaLabel ?? 'Next concept'
                  : block.previousAriaLabel ?? 'Previous concept'
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={rtl ? prevSlide : nextSlide}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                rtl
                  ? block.previousAriaLabel ?? 'Previous concept'
                  : block.nextAriaLabel ?? 'Next concept'
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className={cn('flex items-center gap-2', rtl ? 'mr-auto lg:mr-0' : 'ml-auto lg:ml-0')}>
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  scrollToIndex(index)
                  startAutoplay()
                }}
                className={cn(
                  'rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'h-1.5 w-6 bg-signature-cobalt'
                    : 'h-1.5 w-1.5 bg-border hover:bg-foreground/30',
                )}
                aria-label={`Go to concept ${index + 1}`}
              />
            ))}
          </div>

          <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
            {rtl ? (
              <>
                <span>{String(totalSlides).padStart(2, '0')}</span>
                <span>/</span>
                <span className="font-medium text-foreground">
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>
                <span>/</span>
                <span>{String(totalSlides).padStart(2, '0')}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}