import { useCallback, useState } from 'react'
import { STORAGE_KEYS } from '../lib/storage-keys'

/**
 * Gate de admin LOCAL (sin backend). Guarda el hash SHA-256 de la contraseña y
 * una marca de sesión en localStorage.
 *
 * LIMITE: es un candado del lado del cliente, no seguridad real. Cualquiera con
 * acceso al navegador puede saltearlo. Se reemplaza por Supabase Auth en la
 * migración (misma interfaz: isAuthed / login / logout).
 */

const HASH_KEY = STORAGE_KEYS.adminHash
const SESSION_KEY = STORAGE_KEYS.adminSession

/** Contraseña inicial hasta que se cambie desde el panel. */
export const DEFAULT_PASSWORD = 'trama'

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

export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem(SESSION_KEY) === '1')

  const login = useCallback(async (password: string) => {
    const hash = storedHash()
    const ok = hash ? (await sha256(password)) === hash : password === DEFAULT_PASSWORD
    if (ok) {
      localStorage.setItem(SESSION_KEY, '1')
      setIsAuthed(true)
    }
    return ok
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

  return { isAuthed, login, logout, changePassword, hasCustomPassword: storedHash() !== null }
}
