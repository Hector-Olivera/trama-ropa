/**
 * Configuracion leida del entorno (Vite). Ver `.env.example`. Las claves son publicas
 * (la anon key de Supabase va al cliente a proposito): la seguridad real vive en las
 * RLS del proyecto.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const CONTACT_ACCESS_KEY = import.meta.env.VITE_CONTACT_ACCESS_KEY?.trim() ?? ''

/** Email del unico admin; el Login solo pide la contrasena. */
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim() ?? ''

/** Sin credenciales, la app corre en modo local-first (localStorage/IndexedDB). */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0
}
