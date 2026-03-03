'use client'

import { ethers } from 'ethers'
import { getRpcEndpoint, type NetworkConfig } from './networks'
import { encrypt, decrypt, hashPassword, verifyPassword } from './crypto'

// ---- Encrypted Key Vault ----
// Keys are AES-256-GCM encrypted with user password and stored in localStorage
// Decrypted keys are held in-memory Map during the session only

const VAULT_KEY = 'lux-wallet-vault'
const VAULT_HASH_KEY = 'lux-wallet-vault-hash'

interface VaultEntry {
  addressC: string
  privateKey: string // plaintext (only in memory)
  mnemonic?: string  // plaintext (only in memory)
}

interface EncryptedVault {
  entries: { addressC: string; encrypted: string }[]
}

// In-memory decrypted keys (NEVER persisted)
let _decrypted: Map<string, VaultEntry> = new Map()
let _sessionPassword: string | null = null

// ---- Password Management ----

export function isVaultInitialized(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(VAULT_HASH_KEY)
}

export function isUnlocked(): boolean {
  return _sessionPassword !== null
}

export async function initializeVault(password: string): Promise<void> {
  const { hash, salt } = await hashPassword(password)
  localStorage.setItem(VAULT_HASH_KEY, JSON.stringify({ hash, salt }))
  localStorage.setItem(VAULT_KEY, JSON.stringify({ entries: [] } as EncryptedVault))
  _sessionPassword = password
}

export async function unlockVault(password: string): Promise<boolean> {
  const stored = localStorage.getItem(VAULT_HASH_KEY)
  if (!stored) throw new Error('No vault found. Create a wallet first.')

  const { hash, salt } = JSON.parse(stored)
  const valid = await verifyPassword(password, hash, salt)
  if (!valid) return false

  _sessionPassword = password

  // Decrypt all stored keys
  const vaultStr = localStorage.getItem(VAULT_KEY)
  if (vaultStr) {
    const vault: EncryptedVault = JSON.parse(vaultStr)
    for (const entry of vault.entries) {
      try {
        const json = await decrypt(entry.encrypted, password)
        const data = JSON.parse(json)
        _decrypted.set(entry.addressC.toLowerCase(), {
          addressC: entry.addressC,
          privateKey: data.privateKey,
          mnemonic: data.mnemonic,
        })
      } catch {
        // Skip corrupt entries
      }
    }
  }

  return true
}

export function lockVault(): void {
  _decrypted.clear()
  _sessionPassword = null
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
  const stored = localStorage.getItem(VAULT_HASH_KEY)
  if (!stored) return false

  const { hash, salt } = JSON.parse(stored)
  const valid = await verifyPassword(oldPassword, hash, salt)
  if (!valid) return false

  // Re-encrypt all entries with new password
  const vaultStr = localStorage.getItem(VAULT_KEY)
  if (vaultStr) {
    const vault: EncryptedVault = JSON.parse(vaultStr)
    const newEntries: { addressC: string; encrypted: string }[] = []
    for (const entry of vault.entries) {
      const json = await decrypt(entry.encrypted, oldPassword)
      const reEncrypted = await encrypt(json, newPassword)
      newEntries.push({ addressC: entry.addressC, encrypted: reEncrypted })
    }
    localStorage.setItem(VAULT_KEY, JSON.stringify({ entries: newEntries }))
  }

  const newHash = await hashPassword(newPassword)
  localStorage.setItem(VAULT_HASH_KEY, JSON.stringify(newHash))
  _sessionPassword = newPassword
  return true
}

// ---- Key Storage ----

export async function storeKey(addressC: string, opts: { mnemonic?: string; privateKey: string }): Promise<void> {
  const addr = addressC.toLowerCase()

  // Store in memory
  _decrypted.set(addr, { addressC: addr, ...opts })

  // Encrypt and store in localStorage
  if (_sessionPassword) {
    const json = JSON.stringify({ privateKey: opts.privateKey, mnemonic: opts.mnemonic })
    const encrypted = await encrypt(json, _sessionPassword)

    const vaultStr = localStorage.getItem(VAULT_KEY)
    const vault: EncryptedVault = vaultStr ? JSON.parse(vaultStr) : { entries: [] }

    // Update or append
    const existing = vault.entries.findIndex((e) => e.addressC.toLowerCase() === addr)
    if (existing >= 0) {
      vault.entries[existing].encrypted = encrypted
    } else {
      vault.entries.push({ addressC: addr, encrypted })
    }
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
  }
}

export function removeKey(addressC: string): void {
  const addr = addressC.toLowerCase()
  _decrypted.delete(addr)

  const vaultStr = localStorage.getItem(VAULT_KEY)
  if (vaultStr) {
    const vault: EncryptedVault = JSON.parse(vaultStr)
    vault.entries = vault.entries.filter((e) => e.addressC.toLowerCase() !== addr)
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
  }
}

export function getKey(addressC: string): VaultEntry | undefined {
  return _decrypted.get(addressC.toLowerCase())
}

export function hasKey(addressC: string): boolean {
  return _decrypted.has(addressC.toLowerCase())
}

export function clearKeys(): void {
  lockVault()
}

// ---- C-Chain EVM Signing ----

export async function sendCChainTx(
  network: NetworkConfig,
  fromAddress: string,
  to: string,
  amountLux: string,
): Promise<string> {
  const keyInfo = getKey(fromAddress)
  if (!keyInfo) throw new Error('Wallet locked. Enter your password to unlock.')

  const provider = new ethers.providers.JsonRpcProvider(getRpcEndpoint(network, 'C'))
  const wallet = new ethers.Wallet(keyInfo.privateKey, provider)

  const tx = await wallet.sendTransaction({
    to,
    value: ethers.utils.parseEther(amountLux),
  })

  const receipt = await tx.wait()
  return receipt.transactionHash
}

export async function sendCChainERC20(
  network: NetworkConfig,
  fromAddress: string,
  tokenContract: string,
  to: string,
  amount: string,
  decimals: number,
): Promise<string> {
  const keyInfo = getKey(fromAddress)
  if (!keyInfo) throw new Error('Wallet locked.')

  const provider = new ethers.providers.JsonRpcProvider(getRpcEndpoint(network, 'C'))
  const wallet = new ethers.Wallet(keyInfo.privateKey, provider)

  const erc20 = new ethers.Contract(
    tokenContract,
    ['function transfer(address to, uint256 amount) returns (bool)'],
    wallet,
  )

  const tx = await erc20.transfer(to, ethers.utils.parseUnits(amount, decimals))
  const receipt = await tx.wait()
  return receipt.transactionHash
}

// ---- Q-Chain EVM Signing ----

export async function sendQChainTx(
  network: NetworkConfig,
  fromAddress: string,
  to: string,
  amountLux: string,
): Promise<string> {
  const keyInfo = getKey(fromAddress)
  if (!keyInfo) throw new Error('Wallet locked. Enter your password to unlock.')

  const provider = new ethers.providers.JsonRpcProvider(getRpcEndpoint(network, 'Q'))
  const wallet = new ethers.Wallet(keyInfo.privateKey, provider)

  const tx = await wallet.sendTransaction({
    to,
    value: ethers.utils.parseEther(amountLux),
  })

  const receipt = await tx.wait()
  return receipt.transactionHash
}

// ---- Keystore File ----

export async function exportKeystore(addressC: string, password: string): Promise<string> {
  const keyInfo = getKey(addressC)
  if (!keyInfo) throw new Error('No key available for this wallet.')

  const wallet = new ethers.Wallet(keyInfo.privateKey)
  return wallet.encrypt(password)
}

export async function importKeystore(
  json: string,
  password: string,
): Promise<{ address: string; privateKey: string }> {
  const wallet = await ethers.Wallet.fromEncryptedJson(json, password)
  return { address: wallet.address, privateKey: wallet.privateKey }
}

// ---- Wallet Creation Helpers ----

export function createFromMnemonic(mnemonic: string): {
  address: string
  privateKey: string
  mnemonic: string
} {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic)
  return { address: wallet.address, privateKey: wallet.privateKey, mnemonic }
}

export function createFromPrivateKey(pk: string): {
  address: string
  privateKey: string
} {
  const wallet = new ethers.Wallet(pk)
  return { address: wallet.address, privateKey: wallet.privateKey }
}

export function generateMnemonic(): string {
  const wallet = ethers.Wallet.createRandom()
  return wallet.mnemonic.phrase
}

// ---- Derive P/X/Q addresses from private key ----
// Derives real bech32 P/X addresses using SHA256 → RIPEMD160 → bech32
// Same algorithm as the Lux node: compressed secp256k1 pubkey → Hash160 → bech32("lux")

export function deriveAddresses(address: string, privateKey?: string): {
  addressC: string
  addressP: string
  addressX: string
  addressQ: string
} {
  if (privateKey) {
    const bech32Addr = deriveBech32FromPrivateKey(privateKey)
    return {
      addressC: address,
      addressP: `P-${bech32Addr}`,
      addressX: `X-${bech32Addr}`,
      addressQ: address,
    }
  }
  // Fallback: display-only approximation when no private key available
  return {
    addressC: address,
    addressP: `P-lux1${address.slice(2, 42).toLowerCase()}`,
    addressX: `X-lux1${address.slice(2, 42).toLowerCase()}`,
    addressQ: address,
  }
}

// Derive bech32 address from private key using secp256k1 compressed pubkey
function deriveBech32FromPrivateKey(privateKey: string): string {
  const signingKey = new ethers.utils.SigningKey(privateKey)
  const compressedPubKey = ethers.utils.arrayify(signingKey.compressedPublicKey)

  // SHA256 → RIPEMD160 (Hash160)
  const sha256Hash = ethers.utils.sha256(compressedPubKey)
  const ripemd160Hash = ethers.utils.ripemd160(sha256Hash)
  const hashBytes = ethers.utils.arrayify(ripemd160Hash)

  // bech32 encode with "lux" HRP
  const words = convertBits(hashBytes, 8, 5, true)
  return bech32Encode('lux', words)
}

// ---- bech32 encoding helpers ----

function convertBits(data: Uint8Array, fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0
  let bits = 0
  const ret: number[] = []
  const maxv = (1 << toBits) - 1
  for (const value of data) {
    acc = (acc << fromBits) | value
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxv)
    }
  }
  if (pad && bits > 0) {
    ret.push((acc << (toBits - bits)) & maxv)
  }
  return ret
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const v of values) {
    const b = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) {
      chk ^= (b >> i) & 1 ? GEN[i] : 0
    }
  }
  return chk
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = []
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5)
  ret.push(0)
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31)
  return ret
}

function bech32Encode(hrp: string, data: number[]): string {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0])
  const polymod = bech32Polymod(values) ^ 1
  const checksum: number[] = []
  for (let i = 0; i < 6; i++) {
    checksum.push((polymod >> (5 * (5 - i))) & 31)
  }
  const combined = data.concat(checksum)
  let ret = hrp + '1'
  for (const d of combined) {
    ret += BECH32_CHARSET[d]
  }
  return ret
}
