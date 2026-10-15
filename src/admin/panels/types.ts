import type { SiteContent } from '../../content/types'

export type PanelProps = {
  draft: SiteContent
  update: (mutate: (current: SiteContent) => SiteContent) => void
}
