'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Eye } from 'lucide-react'

import type { Locale } from '@/lib/routes'

type FilterItem = {
  id?: string | null
  label?: string | null
}

type ValueItem = {
  value?: string | null
}

type LabelItem = {
  label?: string | null
}

type DemoProjectItem = {
  id?: string | null
  title?: string | null
  category?: string | null
  subtitle?: string | null
  description?: string | null
  tags?: LabelItem[] | null
  whatToShow?: LabelItem[] | null
  demoUrl?: string | null
  imageSource?: 'url' | 'upload' | null
  imageUrl?: string | null
  imageMedia?: any
  alt?: string | null
  label?: string | null
  filterIds?: ValueItem[] | null
}

type ProjectsGridDemoBlockData = {
  filters?: FilterItem[] | null
  resultsLabelOne?: string | null
  resultsLabelFew?: string | null
  resultsLabelMany?: string | null
  whatToShowLabel?: string | null
  openDemoLabel?: string | null
  projects?: DemoProjectItem[] | null
}

type Props = {
  block: ProjectsGridDemoBlockData
  locale: Locale
}

function getRussianPlural(
  count: number,
  one: string,
  few: string,
  many: string,
) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

function resolveImageUrl(project: DemoProjectItem) {
  if (project.imageSource === 'upload') {
    return typeof project.imageMedia === 'object'
      ? project.imageMedia?.url || project.imageUrl
      : project.imageUrl
  }

  return project.imageUrl
}

function resolveImageAlt(project: DemoProjectItem) {
  if (project.imageSource === 'upload') {
    if (typeof project.imageMedia === 'object') {
      return project.alt || project.imageMedia?.alt || project.title || ''
    }

    return project.alt || project.title || ''
  }

  return project.alt || project.title || ''
}

export function ProjectsGridDemoBlockComponent({ block }: Props) {
  const filters = block.filters ?? []
  const projects = block.projects ?? []

  const initialFilter = filters[0]?.id || 'all'
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  useEffect(() => {
    const availableIds = new Set(filters.map((item) => item.id).filter(Boolean))
    if (!availableIds.has(activeFilter)) {
      setActiveFilter(filters[0]?.id || 'all')
    }
  }, [filters, activeFilter])

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects

    return projects.filter((project) =>
      (project.filterIds ?? []).some((item) => item?.value === activeFilter),
    )
  }, [activeFilter, projects])

  const one = block.resultsLabelOne || 'проект'
  const few = block.resultsLabelFew || 'проекта'
  const many = block.resultsLabelMany || 'проектов'
  const whatToShowLabel = block.whatToShowLabel || 'Что можно посмотреть'
  const openDemoLabel = block.openDemoLabel || 'Открыть демо'

  return (
    <>
      <section className="border-b border-border/50 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) =>
              filter?.id && filter?.label ? (
                <button
                  key={`${filter.id}-${index}`}
                  type="button"
                  onClick={() => setActiveFilter(filter.id!)}
                  className={`rounded-md px-4 py-2 text-sm transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-foreground text-background'
                      : 'border border-border/50 bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ) : null,
            )}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-8 text-sm text-muted-foreground">
            {filteredProjects.length}{' '}
            {getRussianPlural(filteredProjects.length, one, few, many)}
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filteredProjects.map((project, index) => {
              const imageUrl = resolveImageUrl(project)
              const imageAlt = resolveImageAlt(project)

              return (
                <article
                  key={`${project.id || project.title || 'project'}-${index}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary/30">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : null}

                    <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/5" />

                    {project.label ? (
                      <div className="absolute bottom-3 left-3 rounded bg-background/90 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                        {project.label}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-grow flex-col p-6">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {project.category}
                    </p>

                    <h3 className="mb-2 font-serif text-xl font-medium leading-tight text-foreground">
                      {project.title}
                    </h3>

                    <p className="mb-3 text-sm leading-relaxed text-foreground/80">
                      {project.subtitle}
                    </p>

                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>

                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {(project.tags ?? []).map((tag, tagIndex) =>
                        tag?.label ? (
                          <span
                            key={`${tag.label}-${tagIndex}`}
                            className="rounded border border-border/50 bg-secondary/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                          >
                            {tag.label}
                          </span>
                        ) : null,
                      )}
                    </div>

                    <div className="mt-auto mb-5 rounded-md border border-border/30 bg-secondary/30 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                          {whatToShowLabel}
                        </span>
                      </div>

                      <ul className="space-y-1.5 pl-0.5">
                        {(project.whatToShow ?? []).slice(0, 5).map((item, itemIndex) =>
                          item?.label ? (
                            <li
                              key={`${item.label}-${itemIndex}`}
                              className="text-xs leading-relaxed text-foreground/70"
                            >
                              • {item.label}
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </div>

                    <a
                      href={project.demoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {openDemoLabel}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}