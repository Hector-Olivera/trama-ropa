import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'

export function Hero() {
  const { content } = useContent()
  const { hero } = content

  return (
    <section
      id="inicio"
      className="relative overflow-hidden scroll-mt-20 py-12 sm:py-28 lg:flex lg:h-[calc(100dvh-var(--nav-height))] lg:scroll-mt-[var(--nav-height)] lg:items-center lg:py-6"
    >
      <div className="trama-glow-cyan -top-64 -left-56" />
      <div className="trama-glow-pink -right-56 -bottom-64" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:h-full lg:min-h-0 lg:grid-cols-2 lg:gap-10 xl:gap-14">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-cyan lg:mb-3">
            {hero.eyebrow}
          </p>

          <h1 className="font-display text-4xl uppercase leading-[1.05] tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
            {hero.titleLines.map((line, index) => (
              <span key={`${line.text}-${index}`}>
                {index > 0 && <br />}
                {line.highlight ? (
                  <span className="text-brand-cyan">{line.text}</span>
                ) : (
                  line.text
                )}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-lg text-base text-brand-muted lg:mt-4 lg:max-w-md lg:text-sm xl:max-w-lg xl:text-base">
            {hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 lg:mt-6">
            <a
              href={hero.primary.href}
              className="rounded-md bg-brand-cyan px-5 py-2.5 text-sm font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
            >
              {hero.primary.label}
            </a>
            <a
              href={hero.secondary.href}
              className="rounded-md border border-brand-line px-5 py-2.5 text-sm font-bold text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan"
            >
              {hero.secondary.label}
            </a>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-brand-line pt-6 lg:mt-6 lg:pt-5">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl text-brand-cyan lg:text-xl xl:text-2xl">
                  {stat.value}
                </dt>
                <dd className="mt-0.5 text-[11px] uppercase tracking-wider text-brand-muted lg:text-[10px] xl:text-[11px]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative grid grid-cols-2 gap-3 lg:h-full lg:max-h-[36rem] lg:min-h-0 lg:grid-rows-2 lg:self-center xl:gap-4">
          {hero.images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={`overflow-hidden rounded-lg ring-1 ring-brand-line lg:min-h-0 ${
                index % 3 === 0 ? 'translate-y-4 lg:translate-y-0' : ''
              }`}
            >
              <MediaImage
                src={src}
                alt={`Trama ${index + 1}`}
                loading={index < 2 ? 'eager' : 'lazy'}
                className="aspect-[3/4] w-full object-cover transition duration-500 hover:scale-105 lg:h-full lg:aspect-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
