'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { useWalletStore, type WalletAccount } from '@/lib/wallet-store'
import { storeKey, initializeVault, deriveAddresses } from '@/lib/wallet-signer'

type Step = 'welcome' | 'create' | 'import' | 'show-phrase' | 'set-password'

export default function OnboardPage() {
  const router = useRouter()
  const { addAccount, unlock } = useWalletStore()
  const [step, setStep] = useState<Step>('welcome')
  const [mnemonic, setMnemonic] = useState('')
  const [importInput, setImportInput] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [pendingWallet, setPendingWallet] = useState<{ address: string; privateKey: string; mnemonic?: string; type: 'mnemonic' | 'singleton' } | null>(null)

  const handleCreate = () => {
    const wallet = ethers.Wallet.createRandom()
    setMnemonic(wallet.mnemonic.phrase)
    setStep('show-phrase')
  }

  const onPhraseSaved = () => {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic)
    setPendingWallet({ address: wallet.address, privateKey: wallet.privateKey, mnemonic, type: 'mnemonic' })
    setStep('set-password')
  }

  const handleImportSubmit = () => {
    setError('')
    try {
      const trimmed = importInput.trim()
      let wallet: ethers.Wallet
      const isMnemonic = trimmed.includes(' ')
      if (isMnemonic) {
        wallet = ethers.Wallet.fromMnemonic(trimmed)
      } else {
        wallet = new ethers.Wallet(trimmed)
      }
      setPendingWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: isMnemonic ? trimmed : undefined,
        type: isMnemonic ? 'mnemonic' : 'singleton',
      })
      setStep('set-password')
    } catch (e: any) {
      setError('Invalid mnemonic phrase or private key')
    }
  }

  const handleSetPassword = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!pendingWallet) return
    setError('')

    try {
      // Initialize encrypted vault with password
      await initializeVault(password)

      // Store key encrypted
      await storeKey(pendingWallet.address, {
        privateKey: pendingWallet.privateKey,
        mnemonic: pendingWallet.mnemonic,
      })

      // Add account to store — derive real bech32 P/X addresses from private key
      const addrs = deriveAddresses(pendingWallet.address, pendingWallet.privateKey)
      const acc: WalletAccount = {
        name: pendingWallet.type === 'mnemonic' ? 'Wallet 1' : 'Imported Wallet',
        ...addrs,
        type: pendingWallet.type,
      }
      addAccount(acc)
      unlock()
      router.replace('/portfolio')
    } catch (e: any) {
      setError(e.message || 'Failed to create vault')
    }
  }

  return (
    <div className="onboard-container">
      <div className="onboard-card">
        {/* Logo */}
        <div className="onboard-logo">
          <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
            <path d="M50 85 L15 25 L85 25 Z" fill="#ffffff"/>
          </svg>
          <h1 className="onboard-title">Lux Wallet</h1>
          <p className="onboard-subtitle">
            Manage your LUX across C, P, X, and Q chains
          </p>
        </div>

        {step === 'welcome' && (
          <div className="onboard-actions">
            <button className="btn btn-primary btn-lg onboard-btn" onClick={handleCreate}>
              Create New Wallet
            </button>
            <button className="btn btn-secondary btn-lg onboard-btn" onClick={() => setStep('import')}>
              Import Existing Wallet
            </button>
          </div>
        )}

        {step === 'show-phrase' && (
          <div className="onboard-phrase">
            <h2 className="onboard-step-title">Recovery Phrase</h2>
            <p className="onboard-step-desc">
              Write these words down and store them securely. This is the only way to recover your wallet.
            </p>
            <div className="mnemonic-grid">
              {mnemonic.split(' ').map((word, i) => (
                <div key={i} className="mnemonic-word">
                  <span className="mnemonic-num">{i + 1}</span>
                  {word}
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg onboard-btn" onClick={onPhraseSaved}>
              I Saved My Recovery Phrase
            </button>
          </div>
        )}

        {step === 'import' && (
          <div className="onboard-import">
            <h2 className="onboard-step-title">Import Wallet</h2>
            <p className="onboard-step-desc">
              Enter your 12 or 24-word recovery phrase, or a private key.
            </p>
            <textarea
              className="input textarea"
              rows={4}
              placeholder="Enter recovery phrase or private key..."
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
            />
            {error && <div className="form-error">{error}</div>}
            <div className="onboard-import-actions">
              <button className="btn btn-ghost btn-lg" onClick={() => setStep('welcome')}>
                Back
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleImportSubmit} disabled={!importInput.trim()}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'set-password' && (
          <div className="onboard-import">
            <h2 className="onboard-step-title">Set Wallet Password</h2>
            <p className="onboard-step-desc">
              Your password encrypts your private keys locally. You'll need it every time you open the wallet.
            </p>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="input"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary btn-lg send-btn" onClick={handleSetPassword} disabled={!password || !confirmPassword}>
              Create Encrypted Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
