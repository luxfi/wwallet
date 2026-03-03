'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Header } from '@/components/layout/header'
import { useWalletStore, getActiveAccount } from '@/lib/wallet-store'
import { getRpcEndpoint } from '@/lib/networks'
import { sendCChainTx, sendQChainTx, hasKey } from '@/lib/wallet-signer'
import { sendXChainTx } from '@/lib/wallet-sdk'

type Chain = 'C' | 'P' | 'X' | 'Q'

export default function SendPage() {
  const store = useWalletStore()
  const account = getActiveAccount(store)
  const { network } = store

  const [chain, setChain] = useState<Chain>('C')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [sending, setSending] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!account || !to || !amount) return
    setError('')
    setTxHash('')
    setSending(true)

    try {
      if (!account || !hasKey(account.addressC)) {
        throw new Error('Wallet not unlocked. Import or create a wallet in Manage Keys.')
      }

      if (chain === 'C') {
        const hash = await sendCChainTx(network, account.addressC, to, amount)
        setTxHash(hash)
      } else if (chain === 'Q') {
        const hash = await sendQChainTx(network, account.addressC, to, amount)
        setTxHash(hash)
      } else if (chain === 'X') {
        // X-chain: convert LUX to nanoLUX (9 decimals)
        const nanoLux = Math.floor(parseFloat(amount) * 1e9).toString()
        const txId = await sendXChainTx(network, account.addressC, to, nanoLux)
        setTxHash(txId)
      } else {
        throw new Error('P-chain does not support direct transfers. Use staking on the Earn page.')
      }
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Header title="Send" />

      <div className="page-content-narrow">
        <div className="card">
          {/* Chain selector */}
          <div className="form-group">
            <label className="form-label">Chain</label>
            <div className="chain-selector">
              {(['C', 'P', 'X', 'Q'] as Chain[]).map((c) => (
                <button
                  key={c}
                  className={`chain-selector-btn ${chain === c ? 'chain-selector-btn-active' : ''}`}
                  onClick={() => setChain(c)}
                >
                  {c}-Chain
                </button>
              ))}
            </div>
          </div>

          {/* To address */}
          <div className="form-group">
            <label className="form-label">To Address</label>
            <input
              className="input"
              placeholder={chain === 'C' || chain === 'Q' ? '0x...' : `${chain}-lux1...`}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
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

          {/* Error / success */}
          {error && <div className="form-error">{error}</div>}
          {txHash && (
            <div className="form-success">
              Transaction sent:{' '}
              <a
                href={`${network.explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {txHash.slice(0, 12)}...
              </a>
            </div>
          )}

          {/* Submit */}
          <button
            className="btn btn-primary btn-lg send-btn"
            disabled={!to || !amount || sending}
            onClick={handleSend}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </>
  )
}
