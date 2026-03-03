'use client'

import { useState, useRef } from 'react'
import { ethers } from 'ethers'
import { Header } from '@/components/layout/header'
import { useWalletStore, type WalletAccount } from '@/lib/wallet-store'
import { shortenAddress } from '@/lib/format'
import {
  storeKey,
  hasKey,
  exportKeystore,
  importKeystore,
  deriveAddresses,
} from '@/lib/wallet-signer'

type Tab = 'wallets' | 'create' | 'import' | 'keystore'

export default function KeysPage() {
  const { accounts, activeAccountIndex, setActiveAccount, removeAccount } = useWalletStore()
  const [tab, setTab] = useState<Tab>('wallets')

  return (
    <>
      <Header title="Manage Keys" />

      <div className="tabs">
        <button className={`tab ${tab === 'wallets' ? 'tab-active' : ''}`} onClick={() => setTab('wallets')}>
          My Wallets
        </button>
        <button className={`tab ${tab === 'create' ? 'tab-active' : ''}`} onClick={() => setTab('create')}>
          Create New
        </button>
        <button className={`tab ${tab === 'import' ? 'tab-active' : ''}`} onClick={() => setTab('import')}>
          Import
        </button>
        <button className={`tab ${tab === 'keystore' ? 'tab-active' : ''}`} onClick={() => setTab('keystore')}>
          Keystore File
        </button>
      </div>

      {tab === 'wallets' && (
        <div className="wallet-list">
          {accounts.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-title">No wallets yet</div>
                <div className="empty-state-desc">Create or import a wallet to get started.</div>
                <button className="btn btn-primary btn-md" onClick={() => setTab('create')}>
                  Create Wallet
                </button>
              </div>
            </div>
          ) : (
            accounts.map((acc, i) => (
              <div key={i} className={`card wallet-card ${i === activeAccountIndex ? 'wallet-card-active' : ''}`}>
                <div className="wallet-card-header">
                  <div>
                    <div className="wallet-card-name">{acc.name}</div>
                    <div className="wallet-card-type">
                      <span className={`badge ${acc.type === 'ledger' ? 'badge-info' : 'badge-success'}`}>
                        {acc.type === 'mnemonic' ? 'HD Wallet' : acc.type === 'ledger' ? 'Ledger' : 'Single Key'}
                      </span>
                      {hasKey(acc.addressC) ? (
                        <span className="badge badge-success" style={{ marginLeft: 4 }}>Unlocked</span>
                      ) : (
                        <span className="badge badge-error" style={{ marginLeft: 4 }}>Locked</span>
                      )}
                    </div>
                  </div>
                  <div className="wallet-card-actions">
                    {i !== activeAccountIndex && (
                      <button className="btn btn-sm btn-secondary" onClick={() => setActiveAccount(i)}>
                        Activate
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        if (confirm('Remove this wallet? Make sure you have a backup.')) {
                          removeAccount(i)
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="wallet-card-addresses">
                  <div className="wallet-addr-row">
                    <span className="wallet-addr-chain">C</span>
                    <span className="mono">{acc.addressC}</span>
                  </div>
                  <div className="wallet-addr-row">
                    <span className="wallet-addr-chain">P</span>
                    <span className="mono">{shortenAddress(acc.addressP)}</span>
                  </div>
                  <div className="wallet-addr-row">
                    <span className="wallet-addr-chain">X</span>
                    <span className="mono">{shortenAddress(acc.addressX)}</span>
                  </div>
                  <div className="wallet-addr-row">
                    <span className="wallet-addr-chain">Q</span>
                    <span className="mono">{shortenAddress(acc.addressQ)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'create' && <CreateWallet onDone={() => setTab('wallets')} />}
      {tab === 'import' && <ImportWallet onDone={() => setTab('wallets')} />}
      {tab === 'keystore' && <KeystoreSection onDone={() => setTab('wallets')} />}
    </>
  )
}

function CreateWallet({ onDone }: { onDone: () => void }) {
  const { addAccount } = useWalletStore()
  const [name, setName] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [step, setStep] = useState<'name' | 'show' | 'confirm'>('name')

  const generate = () => {
    const wallet = ethers.Wallet.createRandom()
    setMnemonic(wallet.mnemonic.phrase)
    setStep('show')
  }

  const confirm = async () => {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic)
    const addrs = deriveAddresses(wallet.address, wallet.privateKey)
    const acc: WalletAccount = {
      name: name || `Wallet ${Date.now()}`,
      ...addrs,
      type: 'mnemonic',
    }
    await storeKey(wallet.address, { mnemonic, privateKey: wallet.privateKey })
    addAccount(acc)
    onDone()
  }

  if (step === 'name') {
    return (
      <div className="card">
        <h3 className="card-title">Create New Wallet</h3>
        <div className="form-group">
          <label className="form-label">Wallet Name</label>
          <input
            className="input"
            placeholder="My Wallet"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-lg send-btn" onClick={generate}>
          Generate Wallet
        </button>
      </div>
    )
  }

  if (step === 'show') {
    return (
      <div className="card">
        <h3 className="card-title">Recovery Phrase</h3>
        <p className="card-description">
          Write down these 12 words in order. Store them securely — anyone with this phrase can access your wallet.
        </p>
        <div className="mnemonic-grid">
          {mnemonic.split(' ').map((word, i) => (
            <div key={i} className="mnemonic-word">
              <span className="mnemonic-num">{i + 1}</span>
              {word}
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-lg send-btn" onClick={confirm}>
          I Saved My Recovery Phrase
        </button>
      </div>
    )
  }

  return null
}

function ImportWallet({ onDone }: { onDone: () => void }) {
  const { addAccount } = useWalletStore()
  const [method, setMethod] = useState<'mnemonic' | 'private-key'>('mnemonic')
  const [name, setName] = useState('')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleImport = async () => {
    setError('')
    try {
      let wallet: ethers.Wallet
      const isMnemonic = method === 'mnemonic'
      if (isMnemonic) {
        wallet = ethers.Wallet.fromMnemonic(input.trim())
      } else {
        wallet = new ethers.Wallet(input.trim())
      }

      const addrs = deriveAddresses(wallet.address, wallet.privateKey)
      const acc: WalletAccount = {
        name: name || `Imported ${Date.now()}`,
        ...addrs,
        type: isMnemonic ? 'mnemonic' : 'singleton',
      }
      await storeKey(wallet.address, {
        mnemonic: isMnemonic ? input.trim() : undefined,
        privateKey: wallet.privateKey,
      })
      addAccount(acc)
      onDone()
    } catch (e: any) {
      setError(`Invalid ${method === 'mnemonic' ? 'mnemonic phrase' : 'private key'}: ${e.message}`)
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">Import Wallet</h3>

      <div className="form-group">
        <label className="form-label">Import Method</label>
        <div className="chain-selector">
          <button
            className={`chain-selector-btn ${method === 'mnemonic' ? 'chain-selector-btn-active' : ''}`}
            onClick={() => setMethod('mnemonic')}
          >
            Mnemonic Phrase
          </button>
          <button
            className={`chain-selector-btn ${method === 'private-key' ? 'chain-selector-btn-active' : ''}`}
            onClick={() => setMethod('private-key')}
          >
            Private Key
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Wallet Name</label>
        <input
          className="input"
          placeholder="My Imported Wallet"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          {method === 'mnemonic' ? 'Recovery Phrase' : 'Private Key'}
        </label>
        {method === 'mnemonic' ? (
          <textarea
            className="input textarea"
            rows={3}
            placeholder="word1 word2 word3 ... word12"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        ) : (
          <input
            className="input"
            type="password"
            placeholder="0x..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <button className="btn btn-primary btn-lg send-btn" onClick={handleImport}>
        Import
      </button>
    </div>
  )
}

function KeystoreSection({ onDone }: { onDone: () => void }) {
  const { accounts, addAccount } = useWalletStore()
  const [mode, setMode] = useState<'import' | 'export'>('import')
  const [password, setPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportJson, setExportJson] = useState('')
  const [exportAddr, setExportAddr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImportKeystore = async () => {
    if (!file || !password) { setError('Select a keystore file and enter the password.'); return }
    setError('')
    setLoading(true)
    try {
      const text = await file.text()
      const { address, privateKey } = await importKeystore(text, password)
      const addrs = deriveAddresses(address, privateKey)
      await storeKey(address, { privateKey })
      addAccount({
        name: name || `Keystore ${address.slice(0, 8)}`,
        ...addrs,
        type: 'singleton',
      })
      onDone()
    } catch (e: any) {
      setError(e.message || 'Failed to decrypt keystore file.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!exportAddr || !password) { setError('Select a wallet and enter a password.'); return }
    setError('')
    setLoading(true)
    try {
      const json = await exportKeystore(exportAddr, password)
      setExportJson(json)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lux-wallet-${exportAddr.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">Keystore File</h3>

      <div className="form-group">
        <div className="chain-selector">
          <button
            className={`chain-selector-btn ${mode === 'import' ? 'chain-selector-btn-active' : ''}`}
            onClick={() => { setMode('import'); setError('') }}
          >
            Import Keystore
          </button>
          <button
            className={`chain-selector-btn ${mode === 'export' ? 'chain-selector-btn-active' : ''}`}
            onClick={() => { setMode('export'); setError('') }}
          >
            Export Keystore
          </button>
        </div>
      </div>

      {mode === 'import' ? (
        <>
          <div className="form-group">
            <label className="form-label">Wallet Name</label>
            <input className="input" placeholder="My Keystore Wallet" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Keystore File (JSON)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.keystore"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="Keystore password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-lg send-btn" onClick={handleImportKeystore} disabled={loading}>
            {loading ? 'Decrypting...' : 'Import Keystore'}
          </button>
        </>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">Select Wallet</label>
            <select className="input" value={exportAddr} onChange={(e) => setExportAddr(e.target.value)}>
              <option value="">Choose a wallet...</option>
              {accounts.filter((a) => hasKey(a.addressC)).map((a) => (
                <option key={a.addressC} value={a.addressC}>{a.name} ({a.addressC.slice(0, 10)}...)</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Encryption Password</label>
            <input className="input" type="password" placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-lg send-btn" onClick={handleExport} disabled={loading}>
            {loading ? 'Encrypting...' : 'Export Keystore'}
          </button>
        </>
      )}
    </div>
  )
}
