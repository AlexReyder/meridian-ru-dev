import { Layers, Play, Target } from 'lucide-react'

import type { Locale } from '@/lib/routes'

const ICONS = {
  play: Play,
  layers: Layers,
  target: Target,
}

type PointItem = {
  icon?: keyof typeof ICONS | null
  text?: string | null
}

type ExplanationDemoBlockData = {
  title?: string | null
  description?: string | null
  points?: PointItem[] | null
}

type Props = {
  block: ExplanationDemoBlockData
  locale: Locale
}

export function ExplanationDemoBlockComponent({ block }: Props) {
  return (
    <section className="border-t border-border/50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mb-4 font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              {block.title}
            </h2>

            <p className="leading-relaxed text-muted-foreground">
              {block.description}
            </p>
          </div>

          <div className="space-y-4">
            {(block.points ?? []).map((point, index) => {
              const Icon = ICONS[point.icon || 'play']

              return (
                <div
                  key={`${point.text || 'point'}-${index}`}
                  className="flex items-start gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-border/50 bg-background">
                    <Icon className="h-5 w-5 text-foreground/70" />
                  </div>

                  <p className="pt-2 text-sm leading-relaxed text-foreground">
                    {point.text}
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