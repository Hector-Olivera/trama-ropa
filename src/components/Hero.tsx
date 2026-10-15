import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'

export function Hero() {
  const { content } = useContent()
  const { hero } = content

  return (
    <section id="inicio" className="relative overflow-hidden py-20 sm:py-28">
      <div className="trama-glow-cyan -top-64 -left-56" />
      <div className="trama-glow-pink -right-56 -bottom-64" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-cyan">
            {hero.eyebrow}
          </p>

          <h1 className="font-display text-4xl uppercase leading-[1.05] tracking-tight sm:text-6xl">
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

          <p className="mt-5 max-w-lg text-base text-brand-muted">{hero.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
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

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-brand-line pt-6">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl text-brand-cyan">{stat.value}</dt>
                <dd className="mt-0.5 text-[11px] uppercase tracking-wider text-brand-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {hero.images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={`overflow-hidden rounded-lg ring-1 ring-brand-line ${
                index % 3 === 0 ? 'translate-y-4' : ''
              }`}
            >
              <MediaImage
                src={src}
                alt={`Trama ${index + 1}`}
                loading={index < 2 ? 'eager' : 'lazy'}
                className="aspect-[3/4] w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
