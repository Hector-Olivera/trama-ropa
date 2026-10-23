import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'
import { RichTitle } from './RichTitle'

export function HowItWorks() {
  const { content } = useContent()
  const { howItWorks } = content

  return (
    <section id="como-funciona" className="scroll-mt-20 border-t border-brand-line py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-cyan">
            {howItWorks.eyebrow}
          </p>
          <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
            <RichTitle value={howItWorks.title} />
          </h2>
        </header>

        <ol className="grid grid-cols-3 gap-2 md:gap-4">
          {howItWorks.steps.map((step, index) => (
            <li
              key={`${step.title}-${index}`}
              className="relative rounded-lg border border-brand-line bg-brand-surface p-3 md:p-5"
            >
              <span className="font-display text-3xl text-brand-cyan/30 md:text-4xl">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-1 text-[11px] font-bold uppercase tracking-wide md:mt-2 md:text-sm">
                {step.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-brand-muted md:text-sm">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-4 grid grid-cols-3 gap-2 md:gap-4">
          {howItWorks.features.map((feature, index) => (
            <div
              key={`${feature.title}-${index}`}
              className="rounded-lg border border-brand-line bg-brand-black/40 p-3 md:p-5"
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 text-base md:mb-3 md:h-10 md:w-10 md:text-lg ${
                  index === 0
                    ? 'border-brand-cyan text-brand-cyan'
                    : index === 1
                      ? 'border-white text-white'
                      : 'border-brand-pink text-brand-pink'
                }`}
              >
                {index === 0 ? '✓' : index === 1 ? '✎' : '→'}
              </div>
              <h3 className="text-[11px] font-bold uppercase tracking-wide md:text-sm">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-brand-muted md:text-sm">
                {feature.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
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
