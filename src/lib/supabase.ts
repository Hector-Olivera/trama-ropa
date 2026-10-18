import type { SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

let cached: SupabaseClient | null = null
let pending: Promise<SupabaseClient | null> | null = null

/**
 * Cliente Supabase, o `null` si faltan credenciales (modo local-first).
 *
 * El SDK se importa de forma **dinámica**: sin credenciales nunca se carga, así
 * el modo local no paga su peso (ni en el bundle ni en los tests). Se crea una
 * sola vez y se reusa.
 */
export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return Promise.resolve(null)
  if (cached) return Promise.resolve(cached)
  if (!pending) {
    pending = import('@supabase/supabase-js').then(({ createClient }) => {
      cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      return cached
    })
  }
  return pending
}
