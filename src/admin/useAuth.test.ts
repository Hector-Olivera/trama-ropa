import { describe, expect, it } from 'vitest'
import { mapAuthError } from './useAuth'

describe('mapAuthError', () => {
  it('traduce credenciales inválidas', () => {
    expect(mapAuthError('Invalid login credentials')).toBe('Email o contraseña incorrectos.')
  })

  it('traduce email no confirmado', () => {
    expect(mapAuthError('Email not confirmed')).toBe('El email no está confirmado en Supabase.')
  })

  it('traduce API key inválida', () => {
    expect(mapAuthError('Invalid API key')).toBe('Configuración de Supabase inválida (API key).')
  })

  it('no distingue mayúsculas ni minúsculas', () => {
    expect(mapAuthError('INVALID LOGIN CREDENTIALS')).toBe('Email o contraseña incorrectos.')
  })

  it('deja pasar el mensaje original si no lo reconoce', () => {
    expect(mapAuthError('Something else')).toBe('Something else')
  })
})
