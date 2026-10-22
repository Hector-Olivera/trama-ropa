export const STORAGE_KEYS = {
  content: 'trama:content',
  designs: 'trama:designs',
  localProducts: 'trama:local-products',
  adminHash: 'trama:admin:hash',
  adminSession: 'trama:admin:session',
  blobPrefix: 'trama:blob:',
} as const

export const BLOB_PREFIX = STORAGE_KEYS.blobPrefix
