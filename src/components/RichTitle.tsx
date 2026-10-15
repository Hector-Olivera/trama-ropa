import type { RichTitle as RichTitleValue } from '../content/types'

/** Titulo de seccion: `before` normal, `highlight` en degradé, `after` opcional. */
export function RichTitle({ value }: { value: RichTitleValue }) {
  return (
    <>
      {value.before}
      {value.breakBefore ? <br /> : ' '}
      <span className="trama-gradient-text">{value.highlight}</span>
      {value.after ? <> {value.after}</> : null}
    </>
  )
}
