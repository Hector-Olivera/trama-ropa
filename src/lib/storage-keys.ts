export const STORAGE_KEYS = {
  content: 'trama:content',
  adminHash: 'trama:admin:hash',
  adminSession: 'trama:admin:session',
  blobPrefix: 'trama:blob:',
} as const

export const BLOB_PREFIX = STORAGE_KEYS.blobPrefix
