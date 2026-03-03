'use client'

// Encrypt/decrypt wallet keys with AES-256-GCM + PBKDF2 password derivation
// Uses Web Crypto API (SubtleCrypto) — native browser crypto, no dependencies

const PBKDF2_ITERATIONS = 200_000
const SALT_BYTES = 16
const IV_BYTES = 12

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(password, salt)
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext),
  )
  // Pack: salt (16) + iv (12) + ciphertext → base64
  const packed = new Uint8Array(salt.length + iv.length + new Uint8Array(ciphertext).length)
  packed.set(salt, 0)
  packed.set(iv, salt.length)
  packed.set(new Uint8Array(ciphertext), salt.length + iv.length)
  return btoa(String.fromCharCode(...packed))
}

export async function decrypt(encoded: string, password: string): Promise<string> {
  const packed = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
  const salt = packed.slice(0, SALT_BYTES)
  const iv = packed.slice(SALT_BYTES, SALT_BYTES + IV_BYTES)
  const ciphertext = packed.slice(SALT_BYTES + IV_BYTES)
  const key = await deriveKey(password, salt)
  try {
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return new TextDecoder().decode(plainBuf)
  } catch {
    throw new Error('Incorrect password')
  }
}

// Hash password for quick verification without full decryption
export async function hashPassword(password: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
  const s = salt || crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const key = await deriveKey(password, s)
  // Export key and hash it
  const enc = new TextEncoder()
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(password + btoa(String.fromCharCode(...s))))
  return {
    hash: btoa(String.fromCharCode(...new Uint8Array(hashBuf))),
    salt: btoa(String.fromCharCode(...s)),
  }
}

export async function verifyPassword(password: string, hash: string, saltB64: string): Promise<boolean> {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
  const result = await hashPassword(password, salt)
  return result.hash === hash
}
