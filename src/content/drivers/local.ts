import {
  cleanupBlobs,
  deleteBlobRef,
  putLogoBlob,
  resolveDrawableSrc,
} from '../../lib/storage'
import { STORAGE_KEYS } from '../../lib/storage-keys'
import type { ContentDriver } from '../driver'
import type { SiteContent } from '../types'

const CONTENT_KEY = STORAGE_KEYS.content

export const localDriver: ContentDriver = {
  async readContent() {
    const raw = localStorage.getItem(CONTENT_KEY)
    return raw ? JSON.parse(raw) : null
  },

  async writeContent(content: SiteContent) {
    try {
      localStorage.setItem(CONTENT_KEY, JSON.stringify(content))
    } catch (error) {
      console.warn('No se pudo guardar el contenido:', error)
      throw new Error('No se pudo guardar. Puede que el almacenamiento esté lleno.', {
        cause: error,
      })
    }
  },

  async clearContent() {
    localStorage.removeItem(CONTENT_KEY)
  },

  async uploadMedia(file) {
    return putLogoBlob(file)
  },

  async removeMedia(ref) {
    await deleteBlobRef(ref)
  },

  resolveMediaSrc(ref) {
    return resolveDrawableSrc(ref)
  },

  cleanupMedia() {
    return cleanupBlobs()
  },
}
