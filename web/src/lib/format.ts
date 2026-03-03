import { ethers } from 'ethers'

export function shortenAddress(addr: string, chars = 4): string {
  if (!addr) return ''
  if (addr.startsWith('0x')) {
    return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`
  }
  // X/P chain addresses: X-lux1abc...xyz
  const parts = addr.split('-')
  if (parts.length === 2) {
    const chain = parts[0]
    const hash = parts[1]
    return `${chain}-${hash.slice(0, chars + 4)}...${hash.slice(-chars)}`
  }
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

export function formatLux(wei: string | bigint): string {
  try {
    return parseFloat(ethers.utils.formatEther(wei.toString())).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  } catch {
    return '0.00'
  }
}

export function formatNanoLux(nanoLux: string | bigint): string {
  try {
    const lux = Number(nanoLux) / 1e9
    return lux.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  } catch {
    return '0.00'
  }
}

export function formatUSD(amount: number): string {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function timeAgo(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
