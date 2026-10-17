import { useCallback, useEffect, useState } from 'react'
import { ADMIN_EMAIL, isSupabaseConfigured } from '../lib/env'
import { getSupabaseClient } from '../lib/supabase'
import { STORAGE_KEYS } from '../lib/storage-keys'

/**
 * Autenticación del panel. Se elige por entorno:
 *
 * - Con Supabase configurado (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`): usa
 *   Supabase Auth con email fijo (`VITE_ADMIN_EMAIL`); el Login sólo pide la
 *   contraseña.
 * - Sin credenciales: gate LOCAL (SHA-256 en localStorage). Candado del lado del
 *   cliente, NO es seguridad real; existe sólo para el modo local-first.
 *
 * Ambas implementaciones exponen la misma interfaz: isAuthed / loading / login /
 * logout / changePassword / hasCustomPassword.
 */

export const DEFAULT_PASSWORD = 'trama'

export type LoginResult = { ok: boolean; error?: string }

export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (normalized.includes('email not confirmed')) return 'El email no está confirmado en Supabase.'
  if (normalized.includes('invalid api key')) return 'Configuración de Supabase inválida (API key).'
  return message
}

const HASH_KEY = STORAGE_KEYS.adminHash
const SESSION_KEY = STORAGE_KEYS.adminSession

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function storedHash(): string | null {
  return localStorage.getItem(HASH_KEY)
}

export type Auth = {
  isAuthed: boolean
  /** true mientras se resuelve la sesión inicial (sólo con Supabase). */
  loading: boolean
  login: (password: string) => Promise<LoginResult>
  logout: () => void
  changePassword: (current: string, next: string) => Promise<boolean>
  /** false invita a mostrar la pista de la contraseña inicial (modo local). */
  hasCustomPassword: boolean
}

function useLocalAuth(): Auth {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem(SESSION_KEY) === '1')

  const login = useCallback(async (password: string): Promise<LoginResult> => {
    const hash = storedHash()
    const ok = hash ? (await sha256(password)) === hash : password === DEFAULT_PASSWORD
    if (!ok) return { ok: false, error: 'Contraseña incorrecta.' }
    localStorage.setItem(SESSION_KEY, '1')
    setIsAuthed(true)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setIsAuthed(false)
  }, [])

  const changePassword = useCallback(async (current: string, next: string) => {
    const hash = storedHash()
    const ok = hash ? (await sha256(current)) === hash : current === DEFAULT_PASSWORD
    if (!ok) return false
    localStorage.setItem(HASH_KEY, await sha256(next))
    return true
  }, [])

  return { isAuthed, loading: false, login, logout, changePassword, hasCustomPassword: storedHash() !== null }
}

function useSupabaseAuth(): Auth {
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined

    void getSupabaseClient().then((client) => {
      if (!active || !client) return

      void client.auth.getSession().then(({ data }) => {
        if (!active) return
        setIsAuthed(data.session !== null)
        setLoading(false)
      })

      const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
        setIsAuthed(session !== null)
        setLoading(false)
      })
      unsubscribe = () => subscription.subscription.unsubscribe()
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const login = useCallback(async (password: string): Promise<LoginResult> => {
    const client = await getSupabaseClient()
    if (!client) return { ok: false, error: 'No se pudo conectar con Supabase.' }
    const { error } = await client.auth.signInWithPassword({ email: ADMIN_EMAIL, password })
    if (error) return { ok: false, error: mapAuthError(error.message) }
    setIsAuthed(true)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    void getSupabaseClient().then((client) => client?.auth.signOut())
    setIsAuthed(false)
  }, [])

  const changePassword = useCallback(async (current: string, next: string) => {
    const client = await getSupabaseClient()
    if (!client) return false
    const { error: signInError } = await client.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: current,
    })
    if (signInError) return false
    const { error } = await client.auth.updateUser({ password: next })
    return !error
  }, [])

  return { isAuthed, loading, login, logout, changePassword, hasCustomPassword: true }
}

export const useAuth: () => Auth = isSupabaseConfigured() ? useSupabaseAuth : useLocalAuth
