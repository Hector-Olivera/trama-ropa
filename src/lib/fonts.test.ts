import { describe, expect, it } from 'vitest'
import { FONT_OPTIONS, konvaFontStyle } from './fonts'

describe('fonts', () => {
  it('ofrece tipografías con nombre real y sin duplicados', () => {
    expect(FONT_OPTIONS).toHaveLength(8)
    expect(new Set(FONT_OPTIONS.map((font) => font.stack)).size).toBe(FONT_OPTIONS.length)
    expect(FONT_OPTIONS.map((font) => font.label)).toEqual([
      'Arial',
      'Segoe UI',
      'Verdana',
      'Trebuchet MS',
      'Georgia',
      'Times New Roman',
      'Courier New',
      'Impact',
    ])
    expect(FONT_OPTIONS.some((font) => font.label === 'Display')).toBe(false)
  })

  it('arma el fontStyle que entiende Konva', () => {
    expect(konvaFontStyle('normal', 400)).toBe('normal')
    expect(konvaFontStyle('normal', 700)).toBe('bold')
    expect(konvaFontStyle('italic', 400)).toBe('italic normal')
    expect(konvaFontStyle('italic', 700)).toBe('italic bold')
  })
})
