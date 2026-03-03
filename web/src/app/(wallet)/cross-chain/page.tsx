'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { useWalletStore, getActiveAccount } from '@/lib/wallet-store'
import { formatLux, formatNanoLux } from '@/lib/format'
import { CHAIN_INFO, type ChainType } from '@/lib/networks'
import { hasKey } from '@/lib/wallet-signer'
import { crossChainTransfer } from '@/lib/wallet-sdk'

type Chain = ChainType

const CHAIN_LABELS: Record<Chain, string> = {
  C: CHAIN_INFO.C.subtitle,
  P: CHAIN_INFO.P.subtitle,
  X: CHAIN_INFO.X.subtitle,
  Q: CHAIN_INFO.Q.subtitle,
}

export default function CrossChainPage() {
  const store = useWalletStore()
  const { balances } = store

  const [from, setFrom] = useState<Chain>('X')
  const [to, setTo] = useState<Chain>('C')
  const [amount, setAmount] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ exportTxId: string; importTxId: string } | null>(null)
  const account = getActiveAccount(store)

  const availableTargets = (src: Chain): Chain[] => {
    // Valid cross-chain routes
    const routes: Record<Chain, Chain[]> = {
      X: ['C', 'P', 'Q'],
      C: ['X', 'P', 'Q'],
      P: ['X', 'C'],
      Q: ['C', 'X'],
    }
    return routes[src]
  }

  const handleSwap = () => {
    setFrom(to)
    setTo(from)
  }

  const getBalance = (chain: Chain) => {
    if (chain === 'C') return formatLux(balances.C)
    if (chain === 'P') return formatNanoLux(balances.P)
    if (chain === 'Q') return formatLux(balances.Q)
    return formatNanoLux(balances.X)
  }

  const handleTransfer = async () => {
    setError('')
    setResult(null)
    setTransferring(true)
    try {
      if (!account || !hasKey(account.addressC)) {
        throw new Error('Wallet not unlocked. Import or create a wallet in Manage Keys.')
      }
      // Q-chain transfers route through C-chain
      const src = from === 'Q' ? 'C' : from
      const dst = to === 'Q' ? 'C' : to
      if (src === dst) throw new Error('Source and destination chains cannot be the same.')

      const nanoLux = Math.floor(parseFloat(amount) * 1e9).toString()
      const res = await crossChainTransfer(store.network, account.addressC, src, dst, nanoLux)
      setResult(res)
    } catch (e: any) {
      setError(e.message || 'Transfer failed')
    } finally {
      setTransferring(false)
    }
  }

  return (
    <>
      <Header title="Cross Chain Transfer" />

      <div className="page-content-narrow">
        <div className="card">
          {/* Source chain */}
          <div className="form-group">
            <label className="form-label">Source Chain</label>
            <div className="chain-select-row">
              <select
                className="input chain-select"
                value={from}
                onChange={(e) => {
                  const v = e.target.value as Chain
                  setFrom(v)
                  if (v === to) setTo(availableTargets(v)[0])
                }}
              >
                {(['X', 'C', 'P', 'Q'] as Chain[]).map((c) => (
                  <option key={c} value={c}>{CHAIN_LABELS[c]}</option>
                ))}
              </select>
              <span className="chain-select-balance">
                Balance: {getBalance(from)} LUX
              </span>
            </div>
          </div>

          {/* Swap button */}
          <div className="cross-chain-swap">
            <button className="btn btn-ghost" onClick={handleSwap} title="Swap direction">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 14L10 19L15 14" />
                <path d="M15 6L10 1L5 6" />
                <path d="M10 19V1" />
              </svg>
            </button>
          </div>

          {/* Destination chain */}
          <div className="form-group">
            <label className="form-label">Destination Chain</label>
            <select
              className="input chain-select"
              value={to}
              onChange={(e) => setTo(e.target.value as Chain)}
            >
              {availableTargets(from).map((c) => (
                <option key={c} value={c}>{CHAIN_LABELS[c]}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount (LUX)</label>
            <input
              className="input"
              type="number"
              placeholder="0.00"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Fee info */}
          <div className="cross-chain-fee">
            <span>Estimated Fee</span>
            <span>0.001 LUX</span>
          </div>

          {error && <div className="form-error">{error}</div>}
          {result && (
            <div className="form-success">
              Transfer complete! Export: {result.exportTxId.slice(0, 12)}... Import: {result.importTxId.slice(0, 12)}...
            </div>
          )}

          <button
            className="btn btn-primary btn-lg send-btn"
            disabled={!amount || transferring}
            onClick={handleTransfer}
          >
            {transferring ? 'Transferring...' : `Transfer ${from} → ${to}`}
          </button>
        </div>
      </div>
    </>
  )
}
