import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'
import { RichTitle } from './RichTitle'

export function HowItWorks() {
  const { content } = useContent()
  const { howItWorks } = content

  return (
    <section id="como-funciona" className="scroll-mt-20 border-t border-brand-line py-16">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-cyan">
            {howItWorks.eyebrow}
          </p>
          <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
            <RichTitle value={howItWorks.title} />
          </h2>
        </header>

        <ol className="grid gap-4 md:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li
              key={`${step.title}-${index}`}
              className="relative rounded-lg border border-brand-line bg-brand-surface p-5"
            >
              <span className="font-display text-4xl text-brand-cyan/30">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-sm font-bold uppercase tracking-wide">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {howItWorks.features.map((feature, index) => (
            <div
              key={`${feature.title}-${index}`}
              className="rounded-lg border border-brand-line bg-brand-black/40 p-5"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${
                  index === 0
                    ? 'border-brand-cyan text-brand-cyan'
                    : index === 1
                      ? 'border-white text-white'
                      : 'border-brand-pink text-brand-pink'
                }`}
              >
                {index === 0 ? '✓' : index === 1 ? '✎' : '→'}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-muted">{feature.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.images.map((src, index) => (
            <MediaImage
              key={`${src}-${index}`}
              src={src}
              alt={`Trama ${index + 1}`}
              loading="lazy"
              className="aspect-[3/4] w-full rounded-lg object-cover ring-1 ring-brand-line"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
