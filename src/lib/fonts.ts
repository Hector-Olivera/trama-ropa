import type { TextLayer } from '../types'

export const ARIAL_FONT_STACK = 'Arial, Helvetica, sans-serif'
export const LEGACY_DISPLAY_FONT_STACK = 'Arial Black, Arial, sans-serif'

export type FontOption = {
  id: string
  label: string
  stack: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'arial', label: 'Arial', stack: ARIAL_FONT_STACK },
  {
    id: 'segoe-ui',
    label: 'Segoe UI',
    stack: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  { id: 'verdana', label: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  {
    id: 'trebuchet-ms',
    label: 'Trebuchet MS',
    stack: '"Trebuchet MS", "Lucida Grande", sans-serif',
  },
  { id: 'georgia', label: 'Georgia', stack: 'Georgia, "Times New Roman", serif' },
  {
    id: 'times-new-roman',
    label: 'Times New Roman',
    stack: '"Times New Roman", Times, serif',
  },
  {
    id: 'courier-new',
    label: 'Courier New',
    stack: '"Courier New", Courier, monospace',
  },
  { id: 'impact', label: 'Impact', stack: 'Impact, "Arial Black", sans-serif' },
]

const WEIGHT_TOKEN: Record<TextLayer['fontWeight'], string> = {
  400: 'normal',
  700: 'bold',
}

export function konvaFontStyle(
  style: TextLayer['fontStyle'],
  weight: TextLayer['fontWeight'],
): string {
  const token = WEIGHT_TOKEN[weight]
  return style === 'italic' ? `italic ${token}` : token
}
