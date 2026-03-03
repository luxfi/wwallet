'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { useWalletStore } from '@/lib/wallet-store'
import { useRouter } from 'next/navigation'
import { isVaultInitialized, isUnlocked as isVaultUnlocked, unlockVault } from '@/lib/wallet-signer'

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  const { accounts, isUnlocked, unlock } = useWalletStore()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsUnlock, setNeedsUnlock] = useState(false)

  useEffect(() => {
    if (accounts.length === 0) {
      router.replace('/onboard')
      return
    }
    // If vault exists but not unlocked, show password screen
    if (typeof window !== 'undefined' && isVaultInitialized() && !isVaultUnlocked()) {
      setNeedsUnlock(true)
    }
  }, [accounts.length, router])

  const handleUnlock = async () => {
    setError('')
    setLoading(true)
    try {
      const success = await unlockVault(password)
      if (success) {
        setNeedsUnlock(false)
        unlock()
      } else {
        setError('Incorrect password')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to unlock')
    } finally {
      setLoading(false)
    }
  }

  if (accounts.length === 0) return null

  if (needsUnlock) {
    return (
      <div className="onboard-container">
        <div className="onboard-card">
          <div className="onboard-logo">
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
              <path d="M50 85 L15 25 L85 25 Z" fill="#ffffff"/>
            </svg>
            <h1 className="onboard-title">Lux Wallet</h1>
            <p className="onboard-subtitle">Enter your password to unlock</p>
          </div>
          <div className="form-group">
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button
            className="btn btn-primary btn-lg send-btn"
            onClick={handleUnlock}
            disabled={!password || loading}
          >
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  )
}
