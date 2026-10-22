import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { uploadDesign } from './designUpload'
import { getSupabaseClient } from './supabase'

vi.mock('./supabase', () => ({ getSupabaseClient: vi.fn() }))

const getClient = vi.mocked(getSupabaseClient)

type Options = { uploadError?: unknown; signError?: unknown; signedUrl?: string }

function buildClient(options: Options = {}) {
  const upload = vi.fn().mockResolvedValue({ error: options.uploadError ?? null })
  const createSignedUrl = vi.fn().mockResolvedValue({
    data: { signedUrl: options.signedUrl ?? 'https://supabase.test/signed' },
    error: options.signError ?? null,
  })
  const from = vi.fn(() => ({ upload, createSignedUrl }))
  const client = { storage: { from } } as unknown as SupabaseClient
  return { client, from, upload, createSignedUrl }
}

const blob = () => new Blob(['png'], { type: 'image/png' })

describe('uploadDesign', () => {
  beforeEach(() => {
    getClient.mockReset()
  })

  it('sube el archivo al bucket disenos y devuelve la URL firmada', async () => {
    const { client, from, upload } = buildClient()
    getClient.mockResolvedValue(client)

    const url = await uploadDesign(blob())

    expect(url).toBe('https://supabase.test/signed')
    expect(from).toHaveBeenCalledWith('disenos')
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^diseno-.+\.png$/),
      expect.any(Blob),
      { contentType: 'image/png', upsert: false },
    )
  })

  it('firma el enlace por 7 días', async () => {
    const { client, createSignedUrl } = buildClient()
    getClient.mockResolvedValue(client)

    await uploadDesign(blob())

    expect(createSignedUrl).toHaveBeenCalledWith(expect.stringMatching(/^diseno-.+\.png$/), 604800)
  })

  it('tira si no hay credenciales de Supabase', async () => {
    getClient.mockResolvedValue(null)

    await expect(uploadDesign(blob())).rejects.toThrow('Supabase no esta configurado.')
  })

  it('tira si la subida al bucket falla', async () => {
    const { client } = buildClient({ uploadError: { message: 'bucket lleno' } })
    getClient.mockResolvedValue(client)

    await expect(uploadDesign(blob())).rejects.toEqual({ message: 'bucket lleno' })
  })

  it('tira si no se pudo firmar el enlace', async () => {
    const { client } = buildClient({ signError: { message: 'no autorizado' } })
    getClient.mockResolvedValue(client)

    await expect(uploadDesign(blob())).rejects.toEqual({ message: 'no autorizado' })
  })
})
