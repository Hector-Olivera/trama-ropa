import { getSupabaseClient } from './supabase'

const BUCKET = 'disenos'
const SIGNED_TTL_SECONDS = 7 * 24 * 3600

/**
 * Sube el diseño a un bucket privado y devuelve una URL firmada de 7 dias.
 *
 * Web3Forms no admite adjuntos en el plan gratuito, asi que en vez de mandar el
 * archivo le mandamos este enlace al mail. El bucket es privado: sin la firma,
 * nadie conoce la URL puede abrirlo.
 */
export async function uploadDesign(blob: Blob): Promise<string> {
  const client = await getSupabaseClient()
  if (!client) throw new Error('Supabase no esta configurado.')

  const path = `diseno-${crypto.randomUUID()}.png`
  const { error } = await client.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/png',
    upsert: false,
  })
  if (error) throw error

  const { data, error: signError } = await client.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_TTL_SECONDS)
  if (signError) throw signError
  if (!data?.signedUrl) throw new Error('No se pudo generar el enlace del diseño.')

  return data.signedUrl
}
